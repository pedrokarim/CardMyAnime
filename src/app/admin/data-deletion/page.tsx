"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  User,
  Mail,
  Calendar,
  Filter,
  Database,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  PageLoading,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    range.push(i);
  }
  return range;
}

export default function DataDeletionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<DataDeletionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] =
    useState<DataDeletionRequest | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null
  );
  const [adminNotes, setAdminNotes] = useState("");

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  const fetchRequests = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        status: statusFilter,
        platform: platformFilter,
      });

      const response = await fetch(`/api/admin/data-deletion?${params}`);
      const result = await response.json();

      if (response.ok) {
        setRequests(result.requests);
        setPagination(result.pagination);
        setStats(result.stats);
        setCurrentPage(result.pagination.currentPage);
      } else {
        console.error("Erreur API:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchRequests(page);
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setProcessingRequest(requestId);
    try {
      const response = await fetch("/api/admin/data-deletion", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus,
          notes: adminNotes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchRequests(currentPage);
        setSelectedRequest(null);
        setAdminNotes("");
        alert(
          `Demande ${
            newStatus === "completed" ? "traitée" : "mise à jour"
          } avec succès`
        );
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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "processing":
        return "En cours";
      case "completed":
        return "Terminée";
      case "rejected":
        return "Rejetée";
      default:
        return status;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case "privacy":
        return "Protection de la vie privée";
      case "no-longer-use":
        return "Je n'utilise plus le service";
      case "data-accuracy":
        return "Données incorrectes";
      case "legal":
        return "Obligation légale";
      case "other":
        return "Autre raison";
      default:
        return reason;
    }
  };

  useEffect(() => {
    if (session) {
      fetchRequests();
    }
  }, [session, statusFilter, platformFilter]);

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Demandes de suppression
        </h1>
        <p className="text-muted-foreground">
          Gérer les demandes de suppression de données utilisateur
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending || 0}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.processing || 0}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed || 0}</p>
                <p className="text-sm text-muted-foreground">Terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected || 0}</p>
                <p className="text-sm text-muted-foreground">Rejetées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Statut:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Plateforme:</label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="anilist">AniList</SelectItem>
                  <SelectItem value="mal">MyAnimeList</SelectItem>
                  <SelectItem value="nautiljon">Nautiljon</SelectItem>
                  <SelectItem value="all">Toutes les plateformes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => fetchRequests(1)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <ButtonLoading size="sm" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table des demandes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Demandes de suppression</CardTitle>
            <div className="text-sm text-muted-foreground">
              {pagination?.totalCount.toLocaleString()} demandes au total
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <InlineLoading />
              <p className="text-muted-foreground mt-4">
                Chargement des demandes...
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune demande trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Utilisateur
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Plateforme
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Raison
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Statut
                      </th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {request.requestId}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{request.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">{request.platform}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {getReasonText(request.reason)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className="text-sm">
                              {getStatusText(request.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(request.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Voir
                            </button>
                            {request.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(request.id, "processing")
                                  }
                                  disabled={processingRequest === request.id}
                                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm disabled:opacity-50"
                                >
                                  {processingRequest === request.id ? (
                                    <ButtonLoading size="sm" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4" />
                                  )}
                                  Traiter
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(request.id, "rejected")
                                  }
                                  disabled={processingRequest === request.id}
                                  className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Rejeter
                                </button>
                              </>
                            )}
                            {request.status === "processing" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(request.id, "completed")
                                }
                                disabled={processingRequest === request.id}
                                className="flex items-center gap-1 text-green-500 hover:text-green-600 text-sm disabled:opacity-50"
                              >
                                {processingRequest === request.id ? (
                                  <ButtonLoading size="sm" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Terminer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>

                  {generatePaginationRange(
                    currentPage,
                    pagination.totalPages
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-3 py-2 text-sm border rounded-lg ${
                        page === currentPage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      } disabled:opacity-50`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages || loading}
                    className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Détails de la demande</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID de demande
                  </label>
                  <p className="font-mono text-sm">
                    {selectedRequest.requestId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Statut
                  </label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRequest.status)}
                    <span>{getStatusText(selectedRequest.status)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Utilisateur
                  </label>
                  <p className="font-medium">{selectedRequest.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p>{selectedRequest.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Plateforme
                  </label>
                  <p className="capitalize">{selectedRequest.platform}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Raison
                  </label>
                  <p>{getReasonText(selectedRequest.reason)}</p>
                </div>
              </div>

              {selectedRequest.additionalInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Informations supplémentaires
                  </label>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {selectedRequest.additionalInfo}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date de création
                  </label>
                  <p className="text-sm">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedRequest.processedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date de traitement
                    </label>
                    <p className="text-sm">
                      {new Date(selectedRequest.processedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Adresse IP
                </label>
                <p className="font-mono text-sm">{selectedRequest.ipAddress}</p>
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Notes admin
                  </label>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {(selectedRequest.status === "pending" ||
                selectedRequest.status === "processing") && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Notes admin
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ajouter des notes pour cette demande..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Fermer
              </button>
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedRequest.id, "processing")
                    }
                    disabled={processingRequest === selectedRequest.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {processingRequest === selectedRequest.id ? (
                      <ButtonLoading size="sm" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Marquer en cours
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedRequest.id, "rejected")
                    }
                    disabled={processingRequest === selectedRequest.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </>
              )}
              {selectedRequest.status === "processing" && (
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedRequest.id, "completed")
                  }
                  disabled={processingRequest === selectedRequest.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {processingRequest === selectedRequest.id ? (
                    <ButtonLoading size="sm" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Marquer terminée
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
