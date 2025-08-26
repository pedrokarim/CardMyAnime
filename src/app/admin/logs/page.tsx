"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Trash2,
  RefreshCw,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface ViewLog {
  id: string;
  cardId: string;
  fingerprint: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
}

interface LogsResponse {
  logs: ViewLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup-view-logs" }),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        fetchLogs(currentPage); // Recharger la page actuelle
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

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    if (session) {
      fetchLogs();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 bg-transparent border border-border hover:bg-accent text-foreground px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'admin
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Logs de Vues
              </h1>
              <p className="text-muted-foreground">
                Connecté en tant que {session.user?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-transparent border border-border hover:bg-accent text-foreground px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>

        {/* Statistiques */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Logs de Vues</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {totalCount.toLocaleString()} logs au total
              </div>
              <button
                onClick={() => fetchLogs(currentPage)}
                disabled={loading}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Actualiser
              </button>
              <button
                onClick={cleanupLogs}
                disabled={loading}
                className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-destructive-foreground px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Nettoyer les expirés
              </button>
            </div>
          </div>

          {/* Table des logs */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">ID Carte</th>
                    <th className="text-left p-3 font-semibold">IP</th>
                    <th className="text-left p-3 font-semibold">User Agent</th>
                    <th className="text-left p-3 font-semibold">Créé le</th>
                    <th className="text-left p-3 font-semibold">Expire le</th>
                    <th className="text-left p-3 font-semibold">Fingerprint</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border hover:bg-accent/50"
                    >
                      <td className="p-3 font-mono text-sm">{log.cardId}</td>
                      <td className="p-3 text-sm">{log.ip}</td>
                      <td
                        className="p-3 text-sm max-w-xs truncate"
                        title={log.userAgent}
                      >
                        {log.userAgent}
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(log.createdAt).toLocaleString("fr-FR")}
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(log.expiresAt).toLocaleString("fr-FR")}
                      </td>
                      <td
                        className="p-3 font-mono text-xs text-muted-foreground max-w-32 truncate"
                        title={log.fingerprint}
                      >
                        {log.fingerprint.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun log de vue trouvé</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {generatePaginationRange(currentPage, totalPages).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        page === currentPage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Informations de pagination */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} • {totalCount.toLocaleString()}{" "}
            logs au total
          </div>
        </div>
      </div>
    </div>
  );
}
