"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, Eye, Database } from "lucide-react";
import {
  PageLoading,
  ButtonLoading,
  InlineLoading,
} from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ViewLog {
  id: string;
  cardId: string;
  fingerprint: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
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

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<ViewLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/logs?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      const result = await response.json();

      if (response.ok) {
        setLogs(result.logs);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
        setCurrentPage(result.currentPage);
      } else {
        console.error("Erreur API:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchLogs(page);
  };

  const cleanupLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cleanup-view-logs" }),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        fetchLogs(currentPage);
      } else {
        alert("Erreur lors du nettoyage des logs");
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage:", error);
      alert("Erreur lors du nettoyage des logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLogs();
    }
  }, [session]);

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Logs de Vues
        </h1>
        <p className="text-muted-foreground">
          Historique des vues des cartes générées
        </p>
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Statistiques des Logs
          </CardTitle>
          <CardDescription>
            Vue d'ensemble de l'activité et des logs enregistrés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {totalCount.toLocaleString()} logs au total
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fetchLogs(currentPage)}
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
              <Button
                onClick={cleanupLogs}
                disabled={loading}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Nettoyer les expirés
              </Button>
            </div>
          </div>

          {/* Table des logs */}
          {loading ? (
            <div className="text-center py-12">
              <InlineLoading />
              <p className="text-muted-foreground mt-4">
                Chargement des logs...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun log trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">
                        ID Carte
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Fingerprint
                      </th>
                      <th className="text-left py-3 px-4 font-medium">IP</th>
                      <th className="text-left py-3 px-4 font-medium">
                        User Agent
                      </th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.cardId}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.fingerprint}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{log.ip}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm truncate max-w-xs block">
                            {log.userAgent}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p>
                              {new Date(log.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    variant="outline"
                    size="sm"
                  >
                    Précédent
                  </Button>

                  {generatePaginationRange(currentPage, totalPages).map(
                    (page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    variant="outline"
                    size="sm"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
