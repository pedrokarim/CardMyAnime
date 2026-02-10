"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Filter,
} from "lucide-react";
import {
  ButtonLoading,
  InlineLoading,
} from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DataDeletionRequest {
  id: string;
  platform: string;
  username: string;
  email: string;
  reason: string;
  additionalInfo?: string;
  requestId: string;
  ipAddress: string;
  userAgent: string;
  status: "pending" | "processing" | "completed" | "rejected";
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
}

interface Stats {
  pending?: number;
  processing?: number;
  completed?: number;
  rejected?: number;
}

const ITEMS_PER_PAGE = 20;

function generatePaginationRange(currentPage: number, totalPages: number) {
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    range.push(i);
  }
  return range;
}

export default function DataDeletionPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<DataDeletionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<DataDeletionRequest | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchRequests = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), status: statusFilter, platform: platformFilter });
      const response = await fetch(`/api/admin/data-deletion?${params}`);
      const result = await response.json();
      if (response.ok) {
        setRequests(result.requests);
        setPagination(result.pagination);
        setStats(result.stats);
        setCurrentPage(result.pagination.currentPage);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setProcessingRequest(requestId);
    try {
      const response = await fetch("/api/admin/data-deletion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status: newStatus, notes: adminNotes }),
      });
      if (response.ok) {
        await fetchRequests(currentPage);
        setSelectedRequest(null);
        setAdminNotes("");
        alert(`Demande ${newStatus === "completed" ? "traitée" : "mise à jour"} avec succès`);
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
      case "processing": return <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
      case "completed": return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case "rejected": return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "processing": return "En cours";
      case "completed": return "Terminée";
      case "rejected": return "Rejetée";
      default: return status;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case "privacy": return "Vie privée";
      case "no-longer-use": return "Plus utilisé";
      case "data-accuracy": return "Données incorrectes";
      case "legal": return "Obligation légale";
      case "other": return "Autre";
      default: return reason;
    }
  };

  useEffect(() => {
    if (session) fetchRequests();
  }, [session, statusFilter, platformFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suppressions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination?.totalCount.toLocaleString() || 0} demandes au total
          </p>
        </div>
        <Button onClick={() => fetchRequests(1)} disabled={loading} variant="outline" size="sm">
          {loading ? <ButtonLoading size="sm" /> : <RefreshCw className="w-4 h-4" />}
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">En attente</span>
          </div>
          <p className="text-2xl font-semibold">{stats.pending || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-medium">En cours</span>
          </div>
          <p className="text-2xl font-semibold">{stats.processing || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Terminées</span>
          </div>
          <p className="text-2xl font-semibold">{stats.completed || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Rejetées</span>
          </div>
          <p className="text-2xl font-semibold">{stats.rejected || 0}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="processing">En cours</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes plateformes</SelectItem>
            <SelectItem value="anilist">AniList</SelectItem>
            <SelectItem value="mal">MyAnimeList</SelectItem>
            <SelectItem value="nautiljon">Nautiljon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <InlineLoading />
            <p className="text-muted-foreground ml-3">Chargement...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aucune demande trouvée</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plateforme</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Raison</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{request.requestId}</code>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{request.username}</p>
                        <p className="text-xs text-muted-foreground">{request.email}</p>
                      </td>
                      <td className="py-3 px-4 capitalize">{request.platform}</td>
                      <td className="py-3 px-4">{getReasonText(request.reason)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(request.status)}
                          <span>{getStatusText(request.status)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedRequest(request)} className="text-primary hover:text-primary/80 text-xs flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Voir
                          </button>
                          {request.status === "pending" && (
                            <>
                              <button onClick={() => handleStatusUpdate(request.id, "processing")} disabled={processingRequest === request.id} className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1 disabled:opacity-50">
                                <RefreshCw className="w-3.5 h-3.5" /> Traiter
                              </button>
                              <button onClick={() => handleStatusUpdate(request.id, "rejected")} disabled={processingRequest === request.id} className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1 disabled:opacity-50">
                                <XCircle className="w-3.5 h-3.5" /> Rejeter
                              </button>
                            </>
                          )}
                          {request.status === "processing" && (
                            <button onClick={() => handleStatusUpdate(request.id, "completed")} disabled={processingRequest === request.id} className="text-green-500 hover:text-green-600 text-xs flex items-center gap-1 disabled:opacity-50">
                              <CheckCircle className="w-3.5 h-3.5" /> Terminer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                <Button onClick={() => fetchRequests(currentPage - 1)} disabled={currentPage === 1 || loading} variant="outline" size="sm">Précédent</Button>
                {generatePaginationRange(currentPage, pagination.totalPages).map((page) => (
                  <Button key={page} onClick={() => fetchRequests(page)} disabled={loading} variant={page === currentPage ? "default" : "outline"} size="sm">{page}</Button>
                ))}
                <Button onClick={() => fetchRequests(currentPage + 1)} disabled={currentPage === pagination.totalPages || loading} variant="outline" size="sm">Suivant</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal détails */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Détails de la demande</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">ID de demande</span>
                  <p className="font-mono">{selectedRequest.requestId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Statut</span>
                  <div className="flex items-center gap-1.5 mt-0.5">{getStatusIcon(selectedRequest.status)} {getStatusText(selectedRequest.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Utilisateur</span>
                  <p className="font-medium">{selectedRequest.username}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p>{selectedRequest.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Plateforme</span>
                  <p className="capitalize">{selectedRequest.platform}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Raison</span>
                  <p>{getReasonText(selectedRequest.reason)}</p>
                </div>
              </div>
              {selectedRequest.additionalInfo && (
                <div>
                  <span className="text-muted-foreground">Infos supplémentaires</span>
                  <p className="bg-muted p-3 rounded-lg mt-1">{selectedRequest.additionalInfo}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Créée le</span>
                  <p>{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                {selectedRequest.processedAt && (
                  <div>
                    <span className="text-muted-foreground">Traitée le</span>
                    <p>{new Date(selectedRequest.processedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">IP</span>
                <p className="font-mono">{selectedRequest.ipAddress}</p>
              </div>
              {selectedRequest.notes && (
                <div>
                  <span className="text-muted-foreground">Notes admin</span>
                  <p className="bg-muted p-3 rounded-lg mt-1">{selectedRequest.notes}</p>
                </div>
              )}
              {(selectedRequest.status === "pending" || selectedRequest.status === "processing") && (
                <div>
                  <span className="text-muted-foreground">Notes admin</span>
                  <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Ajouter des notes..." rows={3} className="mt-1" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>Fermer</Button>
              {selectedRequest.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedRequest.id, "processing")} disabled={processingRequest === selectedRequest.id}>
                    {processingRequest === selectedRequest.id ? <ButtonLoading size="sm" /> : <RefreshCw className="w-4 h-4" />}
                    En cours
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(selectedRequest.id, "rejected")} disabled={processingRequest === selectedRequest.id}>
                    <XCircle className="w-4 h-4" /> Rejeter
                  </Button>
                </>
              )}
              {selectedRequest.status === "processing" && (
                <Button size="sm" onClick={() => handleStatusUpdate(selectedRequest.id, "completed")} disabled={processingRequest === selectedRequest.id} className="bg-green-600 hover:bg-green-700 text-white">
                  {processingRequest === selectedRequest.id ? <ButtonLoading size="sm" /> : <CheckCircle className="w-4 h-4" />}
                  Terminer
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
