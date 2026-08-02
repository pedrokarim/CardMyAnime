import type { CronJob } from "@prisma/client";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { ensurePrismaConnection, prisma } from "@/lib/prisma";

// Global event emitter for SSE streaming
declare global {
  // eslint-disable-next-line no-var
  var __cardmyanimeCronEmitter: EventEmitter | undefined;
}
if (!globalThis.__cardmyanimeCronEmitter) {
  globalThis.__cardmyanimeCronEmitter = new EventEmitter();
  globalThis.__cardmyanimeCronEmitter.setMaxListeners(50);
}
export const cronEmitter = globalThis.__cardmyanimeCronEmitter;

const DEFAULT_COMMAND_TIMEOUT_MS = 120_000;
const DEFAULT_POLL_INTERVAL_MS = 30_000;
const MAX_OUTPUT_FOR_DB = 5000;
const MAX_OUTPUT_FOR_API = 2000;

const MONTH_ALIASES: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const WEEKDAY_ALIASES: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

type CronFieldMatch = {
  values: Set<number>;
  wildcard: boolean;
};

type ParsedCronExpression = {
  minute: CronFieldMatch;
  hour: CronFieldMatch;
  dayOfMonth: CronFieldMatch;
  month: CronFieldMatch;
  dayOfWeek: CronFieldMatch;
};

type FieldParseOptions = {
  min: number;
  max: number;
  aliases?: Record<string, number>;
  allowQuestionMark?: boolean;
  normalizeValue?: (value: number) => number;
};

type CronJobRunTarget = Pick<CronJob, "id" | "name" | "command">;
type CronSchedulerJob = Pick<
  CronJob,
  "id" | "name" | "command" | "schedule" | "lastRunAt"
>;
type CronExecutionStatus = "success" | "error";
type RunTrigger = "manual" | "scheduler";

export type RunCronJobResult = {
  success: boolean;
  status: CronExecutionStatus;
  output: string;
};

const parsedScheduleCache = new Map<string, ParsedCronExpression>();

export type SchedulerStatus = {
  alive: boolean;
  enabled: boolean;
  startedAt: string | null;
  lastTickAt: string | null;
  tickCount: number;
  jobsChecked: number;
  jobsExecuted: number;
  lastError: string | null;
  pollIntervalMs: number;
  uptimeSeconds: number | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerStarted: boolean | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerRunning: boolean | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerLastMinute: string | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerInterval: NodeJS.Timeout | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerStartedAt: string | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerLastTickAt: string | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerTickCount: number | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerJobsChecked: number | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerJobsExecuted: number | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerLastError: string | undefined;
  // eslint-disable-next-line no-var
  var __cardmyanimeCronSchedulerPollMs: number | undefined;
}

function parseNumberEnv(
  key: string,
  fallback: number,
  minValue: number
): number {
  const raw = process.env[key];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < minValue) {
    console.warn(`[CronScheduler] Valeur invalide pour ${key}: "${raw}"`);
    return fallback;
  }

  return parsed;
}

function resolveCommandShell(): string {
  if (process.env.CRON_SHELL?.trim()) {
    return process.env.CRON_SHELL.trim();
  }
  if (process.platform === "win32") {
    return process.env.ComSpec || "cmd.exe";
  }
  return "/bin/sh";
}

function parsePositiveInteger(token: string, fieldName: string): number {
  if (!/^\d+$/.test(token)) {
    throw new Error(`Valeur invalide "${token}" dans ${fieldName}`);
  }
  const value = Number.parseInt(token, 10);
  if (value <= 0) {
    throw new Error(`Le pas doit etre > 0 dans ${fieldName}`);
  }
  return value;
}

function parseFieldValue(
  token: string,
  options: FieldParseOptions,
  fieldName: string
): number {
  const normalizedToken = token.trim().toUpperCase();
  if (!normalizedToken) {
    throw new Error(`Valeur vide dans ${fieldName}`);
  }

  if (
    options.aliases &&
    Object.prototype.hasOwnProperty.call(options.aliases, normalizedToken)
  ) {
    return options.aliases[normalizedToken];
  }

  if (!/^\d+$/.test(normalizedToken)) {
    throw new Error(`Valeur invalide "${token}" dans ${fieldName}`);
  }

  const value = Number.parseInt(normalizedToken, 10);
  if (value < options.min || value > options.max) {
    throw new Error(
      `Valeur hors limites (${value}) dans ${fieldName}. Attendu: ${options.min}-${options.max}`
    );
  }

  return value;
}

function normalizeFieldValue(value: number, options: FieldParseOptions): number {
  return options.normalizeValue ? options.normalizeValue(value) : value;
}

function addRangeValues(
  set: Set<number>,
  start: number,
  end: number,
  step: number,
  options: FieldParseOptions,
  fieldName: string
): void {
  if (start > end) {
    throw new Error(`Intervalle invalide "${start}-${end}" dans ${fieldName}`);
  }

  if (step <= 0) {
    throw new Error(`Pas invalide (${step}) dans ${fieldName}`);
  }

  for (let value = start; value <= end; value += step) {
    set.add(normalizeFieldValue(value, options));
  }
}

function parseFieldSegment(
  segment: string,
  set: Set<number>,
  options: FieldParseOptions,
  fieldName: string
): void {
  const normalized = segment.trim();
  if (!normalized) {
    throw new Error(`Segment vide dans ${fieldName}`);
  }

  const splitByStep = normalized.split("/");
  if (splitByStep.length > 2) {
    throw new Error(`Segment invalide "${segment}" dans ${fieldName}`);
  }

  const [baseToken, stepToken] = splitByStep;
  const hasStep = stepToken !== undefined;
  const step = hasStep ? parsePositiveInteger(stepToken, fieldName) : 1;
  const isWildcard =
    baseToken === "*" || (options.allowQuestionMark && baseToken === "?");

  if (isWildcard) {
    addRangeValues(set, options.min, options.max, step, options, fieldName);
    return;
  }

  if (baseToken.includes("-")) {
    const rangeParts = baseToken.split("-");
    if (rangeParts.length !== 2 || !rangeParts[0] || !rangeParts[1]) {
      throw new Error(`Intervalle invalide "${baseToken}" dans ${fieldName}`);
    }

    const start = parseFieldValue(rangeParts[0], options, fieldName);
    const end = parseFieldValue(rangeParts[1], options, fieldName);
    addRangeValues(set, start, end, step, options, fieldName);
    return;
  }

  const value = parseFieldValue(baseToken, options, fieldName);
  if (hasStep) {
    addRangeValues(set, value, options.max, step, options, fieldName);
    return;
  }

  set.add(normalizeFieldValue(value, options));
}

function parseField(
  fieldValue: string,
  options: FieldParseOptions,
  fieldName: string
): CronFieldMatch {
  const normalized = fieldValue.trim();
  if (!normalized) {
    throw new Error(`Champ vide: ${fieldName}`);
  }

  const wildcard =
    normalized === "*" || (options.allowQuestionMark && normalized === "?");

  const values = new Set<number>();
  if (wildcard) {
    addRangeValues(values, options.min, options.max, 1, options, fieldName);
    return { values, wildcard: true };
  }

  for (const segment of normalized.split(",")) {
    parseFieldSegment(segment, values, options, fieldName);
  }

  return { values, wildcard: false };
}

function parseCronExpression(schedule: string): ParsedCronExpression {
  const expression = schedule.trim();
  if (!expression) {
    throw new Error("Expression cron vide");
  }

  const cached = parsedScheduleCache.get(expression);
  if (cached) return cached;

  const parts = expression.split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      "Une expression cron doit contenir 5 champs: minute heure jour mois jour-semaine"
    );
  }

  const parsed: ParsedCronExpression = {
    minute: parseField(parts[0], { min: 0, max: 59 }, "minute"),
    hour: parseField(parts[1], { min: 0, max: 23 }, "heure"),
    dayOfMonth: parseField(
      parts[2],
      { min: 1, max: 31, allowQuestionMark: true },
      "jour-du-mois"
    ),
    month: parseField(
      parts[3],
      { min: 1, max: 12, aliases: MONTH_ALIASES },
      "mois"
    ),
    dayOfWeek: parseField(
      parts[4],
      {
        min: 0,
        max: 7,
        aliases: WEEKDAY_ALIASES,
        allowQuestionMark: true,
        normalizeValue: (value) => (value === 7 ? 0 : value),
      },
      "jour-semaine"
    ),
  };

  parsedScheduleCache.set(expression, parsed);
  return parsed;
}

function shouldRunNow(schedule: string, now: Date): boolean {
  const parsed = parseCronExpression(schedule);

  const minuteMatch = parsed.minute.values.has(now.getMinutes());
  const hourMatch = parsed.hour.values.has(now.getHours());
  const monthMatch = parsed.month.values.has(now.getMonth() + 1);
  const dayOfMonthMatch = parsed.dayOfMonth.values.has(now.getDate());
  const dayOfWeekMatch = parsed.dayOfWeek.values.has(now.getDay());

  const dayMatch =
    parsed.dayOfMonth.wildcard && parsed.dayOfWeek.wildcard
      ? true
      : parsed.dayOfMonth.wildcard
      ? dayOfWeekMatch
      : parsed.dayOfWeek.wildcard
      ? dayOfMonthMatch
      : dayOfMonthMatch || dayOfWeekMatch;

  return minuteMatch && hourMatch && monthMatch && dayMatch;
}

export function validateCronExpression(schedule: string): {
  valid: boolean;
  error?: string;
} {
  try {
    parseCronExpression(schedule);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Expression cron invalide",
    };
  }
}

/** Find the next Date that matches a cron expression (searches up to 7 days ahead). */
export function getNextRunTime(schedule: string, from?: Date): Date | null {
  try {
    const parsed = parseCronExpression(schedule);
    const cursor = new Date(from ?? Date.now());
    // Start from the next full minute
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);

    const maxIterations = 7 * 24 * 60; // 7 days of minutes
    for (let i = 0; i < maxIterations; i++) {
      const minuteMatch = parsed.minute.values.has(cursor.getMinutes());
      const hourMatch = parsed.hour.values.has(cursor.getHours());
      const monthMatch = parsed.month.values.has(cursor.getMonth() + 1);
      const dayOfMonthMatch = parsed.dayOfMonth.values.has(cursor.getDate());
      const dayOfWeekMatch = parsed.dayOfWeek.values.has(cursor.getDay());

      const dayMatch =
        parsed.dayOfMonth.wildcard && parsed.dayOfWeek.wildcard
          ? true
          : parsed.dayOfMonth.wildcard
          ? dayOfWeekMatch
          : parsed.dayOfWeek.wildcard
          ? dayOfMonthMatch
          : dayOfMonthMatch || dayOfWeekMatch;

      if (minuteMatch && hourMatch && monthMatch && dayMatch) {
        return cursor;
      }
      cursor.setMinutes(cursor.getMinutes() + 1);
    }
    return null;
  } catch {
    return null;
  }
}

export async function runCronJob(
  job: CronJobRunTarget,
  trigger: RunTrigger = "manual"
): Promise<RunCronJobResult> {
  const startTimestamp = new Date().toISOString();

  cronEmitter.emit("job:start", {
    jobId: job.id,
    jobName: job.name,
    command: job.command,
    trigger,
    timestamp: startTimestamp,
  });

  const commandResult = await executeJobCommandStreaming(job.id, job.command);

  const decoratedOutput = [
    `[${startTimestamp}] [${trigger}] ${job.command}`,
    commandResult.output,
  ]
    .filter(Boolean)
    .join("\n");

  await ensurePrismaConnection();
  await prisma.cronJob.update({
    where: { id: job.id },
    data: {
      lastRunAt: new Date(),
      lastStatus: commandResult.status,
      lastOutput: decoratedOutput.slice(0, MAX_OUTPUT_FOR_DB),
    },
  });

  cronEmitter.emit("job:end", {
    jobId: job.id,
    jobName: job.name,
    status: commandResult.status,
    output: decoratedOutput.slice(0, MAX_OUTPUT_FOR_API),
    timestamp: new Date().toISOString(),
  });

  return {
    success: commandResult.status === "success",
    status: commandResult.status,
    output: decoratedOutput.slice(0, MAX_OUTPUT_FOR_API),
  };
}

/** Streaming execution using spawn — emits job:output events for SSE */
function executeJobCommandStreaming(
  jobId: string,
  command: string
): Promise<{ status: CronExecutionStatus; output: string }> {
  const timeoutMs = parseNumberEnv(
    "CRON_COMMAND_TIMEOUT_MS",
    DEFAULT_COMMAND_TIMEOUT_MS,
    1000
  );
  const shell = resolveCommandShell();

  return new Promise((resolve) => {
    const chunks: string[] = [];
    const args = process.platform === "win32" ? ["/c", command] : ["-c", command];
    const child = spawn(shell, args, {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      const output = chunks.join("") || "Timeout: commande tuee apres " + timeoutMs + "ms";
      resolve({ status: "error", output });
    }, timeoutMs);

    const onData = (stream: "stdout" | "stderr") => (data: Buffer) => {
      const text = data.toString();
      chunks.push(text);
      cronEmitter.emit("job:output", { jobId, stream, chunk: text });
    };

    child.stdout?.on("data", onData("stdout"));
    child.stderr?.on("data", onData("stderr"));

    child.on("close", (code) => {
      clearTimeout(timeout);
      const output = chunks.join("") || (code === 0 ? "" : `Exit code: ${code}`);
      resolve({ status: code === 0 ? "success" : "error", output });
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      const output = chunks.join("") || err.message;
      resolve({ status: "error", output });
    });
  });
}

function schedulerEnabled(): boolean {
  const envValue = process.env.CRON_SCHEDULER_ENABLED?.trim().toLowerCase();
  if (["false", "0", "no", "off"].includes(envValue || "")) return false;
  if (["true", "1", "yes", "on"].includes(envValue || "")) return true;
  return process.env.NODE_ENV === "production";
}

function getMinuteKey(date: Date): string {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ].join("-");
}

async function claimScheduledRun(jobId: string, minuteStart: Date): Promise<boolean> {
  const claimedAt = new Date();
  const claimMessage = `[${claimedAt.toISOString()}] [scheduler] Job programme detecte`;

  const result = await prisma.cronJob.updateMany({
    where: {
      id: jobId,
      enabled: true,
      OR: [{ lastRunAt: null }, { lastRunAt: { lt: minuteStart } }],
    },
    data: {
      lastRunAt: claimedAt,
      lastStatus: "running",
      lastOutput: claimMessage.slice(0, MAX_OUTPUT_FOR_DB),
    },
  });

  return result.count > 0;
}

async function runSchedulerTick(now: Date): Promise<void> {
  await ensurePrismaConnection();

  const jobs: CronSchedulerJob[] = await prisma.cronJob.findMany({
    where: { enabled: true },
    select: {
      id: true,
      name: true,
      command: true,
      schedule: true,
      lastRunAt: true,
    },
  });

  globalThis.__cardmyanimeCronSchedulerTickCount =
    (globalThis.__cardmyanimeCronSchedulerTickCount ?? 0) + 1;
  globalThis.__cardmyanimeCronSchedulerLastTickAt = now.toISOString();
  globalThis.__cardmyanimeCronSchedulerJobsChecked =
    (globalThis.__cardmyanimeCronSchedulerJobsChecked ?? 0) + jobs.length;

  if (jobs.length === 0) return;

  const minuteStart = new Date(now);
  minuteStart.setSeconds(0, 0);

  for (const job of jobs) {
    let dueNow = false;
    try {
      dueNow = shouldRunNow(job.schedule, now);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(
        `[CronScheduler] Schedule invalide pour "${job.name}" (${job.id}): ${job.schedule}`,
        error
      );
      globalThis.__cardmyanimeCronSchedulerLastError =
        `[${now.toISOString()}] Schedule invalide "${job.name}": ${msg}`;
      continue;
    }

    if (!dueNow) continue;

    const claimed = await claimScheduledRun(job.id, minuteStart);
    if (!claimed) continue;

    console.log(`[CronScheduler] Execution automatique: ${job.name}`);
    try {
      const result = await runCronJob(job, "scheduler");
      globalThis.__cardmyanimeCronSchedulerJobsExecuted =
        (globalThis.__cardmyanimeCronSchedulerJobsExecuted ?? 0) + 1;
      if (!result.success) {
        globalThis.__cardmyanimeCronSchedulerLastError =
          `[${now.toISOString()}] Echec "${job.name}": ${result.output.slice(0, 200)}`;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(
        `[CronScheduler] Echec de l'execution automatique pour "${job.name}" (${job.id})`,
        error
      );
      globalThis.__cardmyanimeCronSchedulerLastError =
        `[${now.toISOString()}] Exception "${job.name}": ${msg}`;
    }
  }
}

export function startCronScheduler(): void {
  if (!schedulerEnabled()) {
    console.info("[CronScheduler] Desactive (CRON_SCHEDULER_ENABLED)");
    return;
  }

  if (globalThis.__cardmyanimeCronSchedulerStarted) return;
  globalThis.__cardmyanimeCronSchedulerStarted = true;

  const pollIntervalMs = parseNumberEnv(
    "CRON_POLL_INTERVAL_MS",
    DEFAULT_POLL_INTERVAL_MS,
    5000
  );

  globalThis.__cardmyanimeCronSchedulerStartedAt = new Date().toISOString();
  globalThis.__cardmyanimeCronSchedulerPollMs = pollIntervalMs;
  globalThis.__cardmyanimeCronSchedulerTickCount = 0;
  globalThis.__cardmyanimeCronSchedulerJobsChecked = 0;
  globalThis.__cardmyanimeCronSchedulerJobsExecuted = 0;

  const tick = async () => {
    if (globalThis.__cardmyanimeCronSchedulerRunning) return;

    const now = new Date();
    const minuteKey = getMinuteKey(now);
    if (globalThis.__cardmyanimeCronSchedulerLastMinute === minuteKey) return;

    globalThis.__cardmyanimeCronSchedulerLastMinute = minuteKey;
    globalThis.__cardmyanimeCronSchedulerRunning = true;

    try {
      await runSchedulerTick(now);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[CronScheduler] Tick en erreur", error);
      globalThis.__cardmyanimeCronSchedulerLastError =
        `[${now.toISOString()}] Tick error: ${msg}`;
    } finally {
      globalThis.__cardmyanimeCronSchedulerRunning = false;
    }
  };

  void tick();

  const timer = setInterval(() => {
    void tick();
  }, pollIntervalMs);
  timer.unref?.();

  globalThis.__cardmyanimeCronSchedulerInterval = timer;
  console.info(
    `[CronScheduler] Demarre avec un poll toutes les ${pollIntervalMs}ms`
  );
}

export function stopCronScheduler(): void {
  if (globalThis.__cardmyanimeCronSchedulerInterval) {
    clearInterval(globalThis.__cardmyanimeCronSchedulerInterval);
    globalThis.__cardmyanimeCronSchedulerInterval = undefined;
  }
  globalThis.__cardmyanimeCronSchedulerStarted = false;
  globalThis.__cardmyanimeCronSchedulerRunning = false;
  globalThis.__cardmyanimeCronSchedulerLastMinute = undefined;
  globalThis.__cardmyanimeCronSchedulerStartedAt = undefined;
  globalThis.__cardmyanimeCronSchedulerLastTickAt = undefined;
}

export function getSchedulerStatus(): SchedulerStatus {
  const startedAt = globalThis.__cardmyanimeCronSchedulerStartedAt ?? null;
  let uptimeSeconds: number | null = null;
  if (startedAt) {
    uptimeSeconds = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
  }

  return {
    alive: !!globalThis.__cardmyanimeCronSchedulerStarted,
    enabled: schedulerEnabled(),
    startedAt,
    lastTickAt: globalThis.__cardmyanimeCronSchedulerLastTickAt ?? null,
    tickCount: globalThis.__cardmyanimeCronSchedulerTickCount ?? 0,
    jobsChecked: globalThis.__cardmyanimeCronSchedulerJobsChecked ?? 0,
    jobsExecuted: globalThis.__cardmyanimeCronSchedulerJobsExecuted ?? 0,
    lastError: globalThis.__cardmyanimeCronSchedulerLastError ?? null,
    pollIntervalMs: globalThis.__cardmyanimeCronSchedulerPollMs ?? DEFAULT_POLL_INTERVAL_MS,
    uptimeSeconds,
  };
}

/** Fallback: ensures the scheduler is started (safe to call multiple times) */
export function ensureSchedulerStarted(): void {
  if (!globalThis.__cardmyanimeCronSchedulerStarted) {
    console.info("[CronScheduler] Demarrage via fallback (API call)");
    startCronScheduler();
  }
}
