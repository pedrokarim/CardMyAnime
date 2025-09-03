"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface TestImage {
  id: string;
  name: string;
  description: string;
  url: string;
  method: string;
  status: "loading" | "success" | "error";
}

export default function TestImagesPage() {
  const [images, setImages] = useState<TestImage[]>([
    {
      id: "vercel-og",
      name: "Vercel OG Simple",
      description: "Image générée avec @vercel/og - méthode de base",
      url: "/api/test-images",
      method: "@vercel/og",
      status: "loading",
    },
    {
      id: "vercel-og-advanced",
      name: "Vercel OG Avancé",
      description: "Image générée avec @vercel/og - styles avancés",
      url: "/api/test-images/vercel-og-advanced",
      method: "@vercel/og",
      status: "loading",
    },
    {
      id: "hybrid",
      name: "Vercel OG Hybride",
      description: "Image dynamique avec paramètres personnalisables",
      url: "/api/test-images/hybrid?text=Test%20Personnalisé&color=%23ff6b6b&size=large",
      method: "@vercel/og",
      status: "loading",
    },
    {
      id: "anime-card-sim",
      name: "Carte Anime Simulée",
      description: "Simulation d'une vraie carte d'anime avec @vercel/og",
      url: "/api/test-images/anime-card-sim?username=TestUser&anime=Naruto&score=9.0",
      method: "@vercel/og",
      status: "loading",
    },
    {
      id: "fonts-test",
      name: "Test des Polices",
      description: "Test complet des polices et styles de texte",
      url: "/api/test-images/fonts-test",
      method: "@vercel/og",
      status: "loading",
    },
    {
      id: "canvas",
      name: "Node Canvas",
      description: "Image générée avec node-canvas",
      url: "/api/test-images/canvas",
      method: "node-canvas",
      status: "loading",
    },
    {
      id: "napi-rs",
      name: "NAPI-RS Canvas",
      description: "Image générée avec @napi-rs/canvas",
      url: "/api/test-images/napi-rs",
      method: "@napi-rs/canvas",
      status: "loading",
    },
    {
      id: "svg",
      name: "SVG Direct",
      description: "Image SVG générée directement",
      url: "/api/test-images/svg",
      method: "SVG",
      status: "loading",
    },
    {
      id: "sharp",
      name: "Sharp + SVG",
      description: "Image générée avec Sharp à partir d'un SVG",
      url: "/api/test-images/sharp",
      method: "Sharp + SVG",
      status: "loading",
    },
  ]);

  const [overallStatus, setOverallStatus] = useState<
    "loading" | "success" | "partial" | "error"
  >("loading");

  useEffect(() => {
    // Tester chaque image
    const testImages = async () => {
      const updatedImages = [...images];

      for (let i = 0; i < updatedImages.length; i++) {
        const image = updatedImages[i];
        try {
          // Tester si l'image se charge
          const response = await fetch(image.url);
          if (response.ok) {
            updatedImages[i].status = "success";
          } else {
            updatedImages[i].status = "error";
          }
        } catch (error) {
          updatedImages[i].status = "error";
        }

        setImages([...updatedImages]);

        // Petit délai entre chaque test
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Déterminer le statut global
      const successCount = updatedImages.filter(
        (img) => img.status === "success"
      ).length;
      const errorCount = updatedImages.filter(
        (img) => img.status === "error"
      ).length;

      if (errorCount === 0) {
        setOverallStatus("success");
      } else if (successCount > 0) {
        setOverallStatus("partial");
      } else {
        setOverallStatus("error");
      }
    };

    testImages();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "loading":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case "success":
        return "text-green-600 bg-green-100";
      case "partial":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "loading":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case "success":
        return "Toutes les méthodes fonctionnent !";
      case "partial":
        return "Certaines méthodes fonctionnent";
      case "error":
        return "Aucune méthode ne fonctionne";
      case "loading":
        return "Test en cours...";
      default:
        return "Statut inconnu";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test des Méthodes de Génération d'Images
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Comparaison des différentes méthodes pour générer des images avec du
            texte valide sur Vercel
          </p>

          {/* Statut global */}
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getOverallStatusColor()}`}
          >
            <span className="mr-2">
              {overallStatus === "loading" && "⏳"}
              {overallStatus === "success" && "✅"}
              {overallStatus === "partial" && "⚠️"}
              {overallStatus === "error" && "❌"}
            </span>
            {getOverallStatusText()}
          </div>
        </div>

        {/* Grille des images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* En-tête de la carte */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {image.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      image.status
                    )}`}
                  >
                    {image.status === "loading" && "⏳"}
                    {image.status === "success" && "✅"}
                    {image.status === "error" && "❌"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {image.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">
                    {image.method}
                  </span>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir l'image →
                  </a>
                </div>
              </div>

              {/* Image */}
              <div className="p-6">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {image.status === "loading" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {image.status === "success" && (
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}

                  {image.status === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-red-500 text-4xl mb-2">❌</div>
                        <div className="text-red-600 text-sm">
                          Erreur de chargement
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(image.url, "_blank")}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Tester
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = image.url;
                      link.download = `${image.id}.png`;
                      link.click();
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions supplémentaires */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tests Avancés
            </h2>
            <p className="text-gray-600 mb-6">
              Testez les paramètres dynamiques et les fonctionnalités avancées
            </p>
            <a
              href="/test-images/interactive"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              🧪 Page de Test Interactif
            </a>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Informations sur les Méthodes de Test
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Méthodes Testées
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <strong>@vercel/og :</strong> Solution officielle Vercel,
                  optimisée pour le déploiement
                </li>
                <li>
                  <strong>node-canvas :</strong> Bibliothèque Canvas native,
                  peut poser problème sur Vercel
                </li>
                <li>
                  <strong>@napi-rs/canvas :</strong> Alternative Rust plus
                  performante
                </li>
                <li>
                  <strong>SVG :</strong> Format vectoriel, léger et compatible
                </li>
                <li>
                  <strong>Sharp :</strong> Traitement d'images haute performance
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Critères de Test
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ Génération d'image réussie</li>
                <li>✅ Affichage correct du texte</li>
                <li>✅ Support des accents français</li>
                <li>✅ Support des emojis</li>
                <li>✅ Performance et rapidité</li>
                <li>✅ Compatibilité Vercel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
