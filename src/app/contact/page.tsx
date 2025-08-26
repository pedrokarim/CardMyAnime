import { Mail, MessageSquare, Github, Twitter } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <h1 className="text-6xl font-bold text-foreground mb-4 flex items-center justify-center gap-4">
              <Mail className="w-16 h-16 text-primary" />
              Contact
            </h1>
            <div className="h-1 bg-primary rounded-full w-32 mx-auto"></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Une question, une suggestion ou un bug à signaler ? N'hésitez pas à
            nous contacter !
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Méthodes de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Discord</h3>
                <p className="text-muted-foreground">
                  Rejoignez notre serveur Discord pour discuter avec la
                  communauté
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Rejoindre le serveur
                </a>
              </div>
            </div>

            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Github className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">GitHub</h3>
                <p className="text-muted-foreground">
                  Signalez des bugs ou proposez des améliorations sur GitHub
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Voir le projet
                </a>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Informations
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">CardMyAnime</strong> est un
                projet open-source qui permet de créer des cartes de profil
                dynamiques pour les plateformes d'anime.
              </p>
              <p>
                Le projet utilise les APIs publiques d'AniList et MyAnimeList,
                ainsi que le scraping pour Nautiljon. Toutes les données sont
                récupérées depuis des sources publiques.
              </p>
              <p>
                Si vous rencontrez des problèmes ou avez des suggestions,
                n'hésitez pas à nous contacter via Discord ou GitHub.
              </p>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Suivez-nous
            </h3>
            <div className="flex justify-center gap-6">
              <a
                href="#"
                className="p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors"
                title="Twitter"
              >
                <Twitter className="w-6 h-6 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors"
                title="GitHub"
              >
                <Github className="w-6 h-6 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
