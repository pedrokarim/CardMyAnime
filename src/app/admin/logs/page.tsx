"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Trash2, RefreshCw, Eye, Database } from "lucide-react";
import { ButtonLoading, InlineLoading } from "@/components/ui/loading";
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
  const { data: session } = useSession();
  const [logs, setLogs] = useState<ViewLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    if (session) fetchLogs();
  }, [session]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs de Vues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount.toLocaleString()} logs au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchLogs(currentPage)}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? <ButtonLoading size="sm" /> : <RefreshCw className="w-4 h-4" />}
            Actualiser
          </Button>
          <Button
            onClick={cleanupLogs}
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
            Nettoyer les expirés
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <InlineLoading />
            <p className="text-muted-foreground ml-3">Chargement...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Database className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aucun log trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID Carte</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fingerprint</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">User Agent</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{log.cardId}</code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{log.fingerprint}</code>
                      </td>
                      <td className="py-3 px-4">{log.ip}</td>
                      <td className="py-3 px-4">
                        <span className="truncate max-w-xs block">{log.userAgent}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{new Date(log.createdAt).toLocaleDateString()}</p>
                          <p className="text-muted-foreground text-xs">
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
              <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                <Button
                  onClick={() => fetchLogs(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  variant="outline"
                  size="sm"
                >
                  Précédent
                </Button>
                {generatePaginationRange(currentPage, totalPages).map((page) => (
                  <Button
                    key={page}
                    onClick={() => fetchLogs(page)}
                    disabled={loading}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() => fetchLogs(currentPage + 1)}
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
      </div>
    </div>
  );
}
