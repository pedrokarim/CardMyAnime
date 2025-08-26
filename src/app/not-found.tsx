import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Page non trouvée
            </h1>
            <p className="text-muted-foreground">
              La page que vous recherchez n'existe pas.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
