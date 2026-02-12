import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

const unauthorized = () =>
  NextResponse.json({ error: "Non autorisé" }, { status: 401 });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

    await ensurePrismaConnection();

    const jobs = await prisma.cronJob.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Erreur récupération cron jobs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

    await ensurePrismaConnection();
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create": {
        const { name, command, schedule, enabled } = body;
        if (!name || !command || !schedule) {
          return NextResponse.json(
            { error: "Nom, commande et planning sont requis" },
            { status: 400 }
          );
        }

        const job = await prisma.cronJob.create({
          data: {
            name,
            command,
            schedule,
            enabled: enabled ?? true,
          },
        });

        return NextResponse.json({ success: true, job });
      }

      case "update": {
        const { id, ...updates } = body;
        if (!id) {
          return NextResponse.json(
            { error: "ID requis" },
            { status: 400 }
          );
        }

        // Only allow updating specific fields
        const allowedFields: Record<string, any> = {};
        if (updates.name !== undefined) allowedFields.name = updates.name;
        if (updates.command !== undefined) allowedFields.command = updates.command;
        if (updates.schedule !== undefined) allowedFields.schedule = updates.schedule;
        if (updates.enabled !== undefined) allowedFields.enabled = updates.enabled;

        const job = await prisma.cronJob.update({
          where: { id },
          data: allowedFields,
        });

        return NextResponse.json({ success: true, job });
      }

      case "toggle": {
        const { id: toggleId } = body;
        if (!toggleId) {
          return NextResponse.json(
            { error: "ID requis" },
            { status: 400 }
          );
        }

        const existing = await prisma.cronJob.findUnique({
          where: { id: toggleId },
        });
        if (!existing) {
          return NextResponse.json(
            { error: "Job non trouvé" },
            { status: 404 }
          );
        }

        const toggled = await prisma.cronJob.update({
          where: { id: toggleId },
          data: { enabled: !existing.enabled },
        });

        return NextResponse.json({
          success: true,
          job: toggled,
          message: `Job "${toggled.name}" ${toggled.enabled ? "activé" : "désactivé"}`,
        });
      }

      case "delete": {
        const { id: deleteId } = body;
        if (!deleteId) {
          return NextResponse.json(
            { error: "ID requis" },
            { status: 400 }
          );
        }

        await prisma.cronJob.delete({ where: { id: deleteId } });

        return NextResponse.json({
          success: true,
          message: "Job supprimé",
        });
      }

      case "run": {
        const { id: runId } = body;
        if (!runId) {
          return NextResponse.json(
            { error: "ID requis" },
            { status: 400 }
          );
        }

        const jobToRun = await prisma.cronJob.findUnique({
          where: { id: runId },
        });
        if (!jobToRun) {
          return NextResponse.json(
            { error: "Job non trouvé" },
            { status: 404 }
          );
        }

        // Execute the command via bash
        const { exec } = require("child_process");
        const projectRoot = process.cwd();

        const result = await new Promise<{ stdout: string; stderr: string; error: any }>((resolve) => {
          exec(
            jobToRun.command,
            {
              cwd: projectRoot,
              timeout: 120000, // 2 minutes for enrichment scripts
              shell: "/bin/bash",
              env: { ...process.env },
            },
            (error: any, stdout: string, stderr: string) => {
              resolve({ stdout, stderr, error });
            }
          );
        });

        const status = result.error ? "error" : "success";
        const output = (result.stdout || "") + (result.stderr ? `\n${result.stderr}` : "");

        await prisma.cronJob.update({
          where: { id: runId },
          data: {
            lastRunAt: new Date(),
            lastStatus: status,
            lastOutput: output.slice(0, 5000), // Limit output size
          },
        });

        return NextResponse.json({
          success: status === "success",
          message: status === "success"
            ? `Job "${jobToRun.name}" exécuté avec succès`
            : `Job "${jobToRun.name}" a échoué`,
          output: output.slice(0, 2000),
        });
      }

      default:
        return NextResponse.json(
          { error: "Action non reconnue" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erreur cron jobs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
