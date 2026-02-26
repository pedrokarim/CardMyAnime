"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Timer,
  Plus,
  Play,
  Pause,
  Trash2,
  Pencil,
  RotateCw,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  X,
  Save,
  Activity,
  AlertTriangle,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";
import { InlineLoading, ButtonLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CronJob {
  id: string;
  name: string;
  command: string;
  schedule: string;
  enabled: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastOutput: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

interface SchedulerStatus {
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
}

const SCHEDULE_PRESETS = [
  { label: "Toutes les minutes", value: "* * * * *" },
  { label: "Toutes les 5 minutes", value: "*/5 * * * *" },
  { label: "Toutes les 15 minutes", value: "*/15 * * * *" },
  { label: "Toutes les 30 minutes", value: "*/30 * * * *" },
  { label: "Toutes les heures", value: "0 * * * *" },
  { label: "Toutes les 6 heures", value: "0 */6 * * *" },
  { label: "Toutes les 12 heures", value: "0 */12 * * *" },
  { label: "Tous les jours (minuit)", value: "0 0 * * *" },
  { label: "Tous les jours (6h)", value: "0 6 * * *" },
  { label: "Tous les lundis (minuit)", value: "0 0 * * 1" },
  { label: "1er du mois (minuit)", value: "0 0 1 * *" },
];

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatCountdown(targetIso: string): string {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  if (diff === 0) return "maintenant";
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export default function AdminCronPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null);
  const [showSchedulerDetails, setShowSchedulerDetails] = useState(false);
  const [liveOutputs, setLiveOutputs] = useState<Record<string, string>>({});
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0); // force re-render for countdown

  const [formName, setFormName] = useState("");
  const [formCommand, setFormCommand] = useState("");
  const [formSchedule, setFormSchedule] = useState("0 0 * * *");
  const [formCustomSchedule, setFormCustomSchedule] = useState("");
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const outputEndRefs = useRef<Record<string, HTMLPreElement | null>>({});

  // 1-second tick for countdown
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // SSE connection
  useEffect(() => {
    if (!session) return;

    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      es = new EventSource("/api/admin/cron/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setSseConnected(true);
        setLoading(false);
      };

      es.addEventListener("status", (e) => {
        try {
          const data = JSON.parse(e.data);
          setScheduler(data.scheduler);
          setJobs(data.jobs);
          setLoading(false);
        } catch { /* ignore */ }
      });

      es.addEventListener("job:start", (e) => {
        try {
          const data = JSON.parse(e.data);
          setRunningJobs((prev) => new Set(prev).add(data.jobId));
          setLiveOutputs((prev) => ({
            ...prev,
            [data.jobId]: `[${data.timestamp}] [${data.trigger}] ${data.command}\n`,
          }));
          setExpandedOutput(data.jobId);
        } catch { /* ignore */ }
      });

      es.addEventListener("job:output", (e) => {
        try {
          const data = JSON.parse(e.data);
          setLiveOutputs((prev) => ({
            ...prev,
            [data.jobId]: (prev[data.jobId] ?? "") + data.chunk,
          }));
          // Auto-scroll
          const el = outputEndRefs.current[data.jobId];
          el?.scrollIntoView({ behavior: "smooth", block: "end" });
        } catch { /* ignore */ }
      });

      es.addEventListener("job:end", (e) => {
        try {
          const data = JSON.parse(e.data);
          setRunningJobs((prev) => {
            const next = new Set(prev);
            next.delete(data.jobId);
            return next;
          });
          // Update the job in the list with final output
          setJobs((prev) =>
            prev.map((j) =>
              j.id === data.jobId
                ? {
                    ...j,
                    lastRunAt: data.timestamp,
                    lastStatus: data.status,
                    lastOutput: data.output,
                  }
                : j
            )
          );
        } catch { /* ignore */ }
      });

      es.onerror = () => {
        setSseConnected(false);
        es?.close();
        // Reconnect after 5s
        reconnectTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      es?.close();
      eventSourceRef.current = null;
      setSseConnected(false);
    };
  }, [session]);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormCommand("");
    setFormSchedule("0 0 * * *");
    setFormCustomSchedule("");
    setUseCustomSchedule(false);
    setEditingJob(null);
    setShowForm(false);
  }, []);

  const openEditForm = (job: CronJob) => {
    setEditingJob(job);
    setFormName(job.name);
    setFormCommand(job.command);
    const isPreset = SCHEDULE_PRESETS.some((p) => p.value === job.schedule);
    if (isPreset) {
      setFormSchedule(job.schedule);
      setUseCustomSchedule(false);
    } else {
      setFormCustomSchedule(job.schedule);
      setUseCustomSchedule(true);
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const schedule = useCustomSchedule ? formCustomSchedule : formSchedule;
    if (!formName.trim() || !formCommand.trim() || !schedule.trim()) {
      alert("Tous les champs sont requis");
      return;
    }

    setActionLoading("submit");
    try {
      const res = await fetch("/api/admin/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingJob
            ? { action: "update", id: editingJob.id, name: formName.trim(), command: formCommand.trim(), schedule: schedule.trim() }
            : { action: "create", name: formName.trim(), command: formCommand.trim(), schedule: schedule.trim() }
        ),
      });
      if (res.ok) {
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur");
      }
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (action: string, id: string, jobName?: string) => {
    if (action === "delete" && !confirm(`Supprimer le job "${jobName}" ?`)) return;

    setActionLoading(`${action}-${id}`);
    try {
      const res = await fetch("/api/admin/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.message && action !== "run") alert(data.message);
      } else {
        alert(data.error || "Erreur");
      }
    } catch {
      alert("Erreur lors de l'action");
    } finally {
      setActionLoading(null);
    }
  };

  const getScheduleLabel = (schedule: string) => {
    const preset = SCHEDULE_PRESETS.find((p) => p.value === schedule);
    return preset ? preset.label : schedule;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <InlineLoading />
        <p className="text-muted-foreground ml-4">Connexion au scheduler...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Jobs Cron</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestion des tâches planifiées</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* SSE connection indicator */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
              sseConnected
                ? "text-green-600 bg-green-500/10"
                : "text-red-500 bg-red-500/10"
            }`}
          >
            {sseConnected ? (
              <><Wifi className="w-3 h-3" /> Live</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Déconnecté</>
            )}
          </span>
          <Button
            size="sm"
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            <Plus className="w-4 h-4" />
            Nouveau job
          </Button>
        </div>
      </div>

      {/* Scheduler Status Banner */}
      {scheduler && (
        <div
          className={`rounded-lg border p-4 ${
            scheduler.alive
              ? "border-green-500/30 bg-green-500/5"
              : scheduler.enabled
              ? "border-red-500/30 bg-red-500/5"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${
                scheduler.alive
                  ? "bg-green-500 animate-pulse"
                  : scheduler.enabled
                  ? "bg-red-500"
                  : "bg-muted-foreground"
              }`} />
              <div>
                <span className="text-sm font-medium">
                  Scheduler {scheduler.alive ? "actif" : scheduler.enabled ? "inactif" : "désactivé"}
                </span>
                {scheduler.alive && scheduler.uptimeSeconds != null && (
                  <span className="text-xs text-muted-foreground ml-2">
                    uptime {formatUptime(scheduler.uptimeSeconds)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {scheduler.alive && (
                <>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {scheduler.tickCount} ticks
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {scheduler.jobsExecuted} exécutions
                  </span>
                </>
              )}
              <button
                onClick={() => setShowSchedulerDetails(!showSchedulerDetails)}
                className="text-xs hover:text-foreground transition-colors underline"
              >
                {showSchedulerDetails ? "Masquer" : "Détails"}
              </button>
            </div>
          </div>

          {showSchedulerDetails && (
            <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Démarré le</span>
                <span className="font-mono">
                  {scheduler.startedAt
                    ? new Date(scheduler.startedAt).toLocaleString("fr-FR")
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Dernier tick</span>
                <span className="font-mono">
                  {scheduler.lastTickAt
                    ? new Date(scheduler.lastTickAt).toLocaleString("fr-FR")
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Jobs vérifiés</span>
                <span className="font-mono">{scheduler.jobsChecked}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Intervalle poll</span>
                <span className="font-mono">{scheduler.pollIntervalMs / 1000}s</span>
              </div>
              {scheduler.lastError && (
                <div className="col-span-full">
                  <span className="text-red-500 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    Dernière erreur
                  </span>
                  <pre className="p-2 bg-muted rounded text-[11px] font-mono whitespace-pre-wrap">
                    {scheduler.lastError}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              {editingJob ? "Modifier le job" : "Nouveau job cron"}
            </h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nom du job</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Snapshot tendances" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Planning</label>
                {useCustomSchedule ? (
                  <div className="flex gap-2">
                    <Input value={formCustomSchedule} onChange={(e) => setFormCustomSchedule(e.target.value)} placeholder="Ex: 0 */6 * * *" className="font-mono" />
                    <Button variant="outline" size="sm" onClick={() => setUseCustomSchedule(false)}>Presets</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select value={formSchedule} onValueChange={setFormSchedule}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_PRESETS.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>{preset.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setUseCustomSchedule(true)}>Custom</Button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Commande</label>
              <Input value={formCommand} onChange={(e) => setFormCommand(e.target.value)} placeholder="Ex: node scripts/snapshot-trends.js" className="font-mono" />
              <p className="text-xs text-muted-foreground">Exécutée depuis la racine du projet</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={actionLoading === "submit"}>
                {actionLoading === "submit" ? <ButtonLoading size="sm" /> : <Save className="w-4 h-4" />}
                {editingJob ? "Mettre à jour" : "Créer"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetForm}>Annuler</Button>
            </div>
          </div>
        </div>
      )}

      {/* Liste */}
      {jobs.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-border bg-card">
          <Timer className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Aucun job cron</p>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
            Créer un job
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const isRunning = runningJobs.has(job.id) || job.lastStatus === "running";
            const liveOutput = liveOutputs[job.id];
            const displayOutput = isRunning && liveOutput ? liveOutput : job.lastOutput;

            return (
              <div
                key={job.id}
                className={`rounded-lg border bg-card p-4 transition-colors ${
                  isRunning
                    ? "border-blue-500/40 bg-blue-500/5"
                    : !job.enabled
                    ? "border-border opacity-60"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{job.name}</h3>
                      {isRunning ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                          <Radio className="w-3 h-3 animate-pulse" /> En cours
                        </span>
                      ) : job.enabled ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Actif
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          <Pause className="w-3 h-3" /> Inactif
                        </span>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono block truncate">
                      {job.command}
                    </code>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" title="Exécuter" onClick={() => handleAction("run", job.id, job.name)} disabled={actionLoading !== null || isRunning}>
                      {actionLoading === `run-${job.id}` ? <ButtonLoading size="sm" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" title={job.enabled ? "Désactiver" : "Activer"} onClick={() => handleAction("toggle", job.id, job.name)} disabled={actionLoading !== null}>
                      {actionLoading === `toggle-${job.id}` ? <ButtonLoading size="sm" /> : job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEditForm(job)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Supprimer" onClick={() => handleAction("delete", job.id, job.name)} disabled={actionLoading !== null} className="text-destructive hover:text-destructive">
                      {actionLoading === `delete-${job.id}` ? <ButtonLoading size="sm" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getScheduleLabel(job.schedule)}</span>
                    {!SCHEDULE_PRESETS.some((p) => p.value === job.schedule) && (
                      <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono">{job.schedule}</code>
                    )}
                  </div>

                  {/* Countdown to next run */}
                  {job.enabled && job.nextRunAt && !isRunning && (
                    <div className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-mono text-blue-600">
                        {formatCountdown(job.nextRunAt)}
                      </span>
                    </div>
                  )}

                  {job.lastRunAt && (
                    <div className="flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Dernier : {new Date(job.lastRunAt).toLocaleString("fr-FR")}</span>
                      {job.lastStatus === "success" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : job.lastStatus === "error" ? (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Output section */}
                {displayOutput && (
                  <div className="mt-2">
                    <button
                      onClick={() => setExpandedOutput(expandedOutput === job.id ? null : job.id)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Terminal className="w-3 h-3" />
                      {expandedOutput === job.id ? "Masquer la sortie" : "Voir la sortie"}
                      {isRunning && (
                        <span className="ml-1 inline-flex items-center gap-1 text-blue-500">
                          <Radio className="w-2.5 h-2.5 animate-pulse" /> live
                        </span>
                      )}
                    </button>
                    {expandedOutput === job.id && (
                      <pre
                        className={`mt-2 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap ${
                          isRunning ? "bg-blue-950/30 border border-blue-500/20" : "bg-muted"
                        }`}
                      >
                        {displayOutput}
                        {isRunning && (
                          <span className="inline-block w-2 h-4 bg-foreground/70 animate-pulse ml-0.5" />
                        )}
                        <span ref={(el) => { outputEndRefs.current[job.id] = el as any; }} />
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
