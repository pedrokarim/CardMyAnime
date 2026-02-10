"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
  createdAt: string;
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

export default function AdminCronPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formCommand, setFormCommand] = useState("");
  const [formSchedule, setFormSchedule] = useState("0 0 * * *");
  const [formCustomSchedule, setFormCustomSchedule] = useState("");
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);

  useEffect(() => {
    if (session) fetchJobs();
  }, [session]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cron");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormCommand("");
    setFormSchedule("0 0 * * *");
    setFormCustomSchedule("");
    setUseCustomSchedule(false);
    setEditingJob(null);
    setShowForm(false);
  };

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
        await fetchJobs();
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
        if (action === "run" && data.output) {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === id
                ? { ...j, lastRunAt: new Date().toISOString(), lastStatus: data.success ? "success" : "error", lastOutput: data.output }
                : j
            )
          );
          setExpandedOutput(id);
        } else {
          await fetchJobs();
        }
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
        <p className="text-muted-foreground ml-4">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs Cron</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion des tâches planifiées</p>
        </div>
        <Button
          size="sm"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="w-4 h-4" />
          Nouveau job
        </Button>
      </div>

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
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`rounded-lg border border-border bg-card p-4 ${!job.enabled ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{job.name}</h3>
                    {job.enabled ? (
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
                  <Button variant="ghost" size="icon" title="Exécuter" onClick={() => handleAction("run", job.id, job.name)} disabled={actionLoading !== null}>
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
                {job.lastRunAt && (
                  <div className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Dernier run : {new Date(job.lastRunAt).toLocaleString("fr-FR")}</span>
                    {job.lastStatus === "success" ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    ) : job.lastStatus === "error" ? (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>

              {job.lastOutput && (
                <div className="mt-2">
                  <button
                    onClick={() => setExpandedOutput(expandedOutput === job.id ? null : job.id)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Terminal className="w-3 h-3" />
                    {expandedOutput === job.id ? "Masquer la sortie" : "Voir la sortie"}
                  </button>
                  {expandedOutput === job.id && (
                    <pre className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap">
                      {job.lastOutput}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Les jobs servent de registre. Pour l&apos;exécution automatique, configurez un scheduler externe (crontab, Vercel Cron, GitHub Actions).
      </p>
    </div>
  );
}
