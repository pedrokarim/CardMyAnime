"use client";

import { useState } from "react";
import Image from "next/image";

export default function InteractiveTestPage() {
  const [text, setText] = useState("Texte de test personnalisé");
  const [color, setColor] = useState("#667eea");
  const [size, setSize] = useState("medium");
  const [username, setUsername] = useState("TestUser");
  const [anime, setAnime] = useState("Naruto");
  const [score, setScore] = useState("8.5");

  const buildHybridUrl = () => {
    const params = new URLSearchParams({
      text: text,
      color: color,
      size: size,
    });
    return `/api/test-images/hybrid?${params.toString()}`;
  };

  const buildAnimeCardUrl = () => {
    const params = new URLSearchParams({
      username: username,
      anime: anime,
      score: score,
    });
    return `/api/test-images/anime-card-sim?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test Interactif des Images
          </h1>
          <p className="text-xl text-gray-600">
            Testez les paramètres dynamiques et voyez les résultats en temps
            réel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contrôles */}
          <div className="space-y-8">
            {/* Test Hybride */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Test Hybride @vercel/og
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte personnalisé
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez votre texte..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="#667eea"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille de la police
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Petite</option>
                    <option value="medium">Moyenne</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                <div className="pt-4">
                  <a
                    href={buildHybridUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center font-medium"
                  >
                    Tester l'Image Hybride
                  </a>
                </div>
              </div>
            </div>

            {/* Test Carte Anime */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Test Carte Anime Simulée
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom d'utilisateur..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de l'anime
                  </label>
                  <input
                    type="text"
                    value={anime}
                    onChange={(e) => setAnime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre de l'anime..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score moyen
                  </label>
                  <input
                    type="text"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8.5"
                  />
                </div>

                <div className="pt-4">
                  <a
                    href={buildAnimeCardUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-center font-medium"
                  >
                    Tester la Carte Anime
                  </a>
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                💡 Comment utiliser
              </h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Modifiez les paramètres ci-dessus</li>
                <li>• Cliquez sur "Tester" pour voir l'image</li>
                <li>• L'image se met à jour automatiquement</li>
                <li>• Testez avec des accents et des emojis</li>
                <li>• Comparez les performances des différentes méthodes</li>
              </ul>
            </div>
          </div>

          {/* Aperçu des images */}
          <div className="space-y-8">
            {/* Image Hybride */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Aperçu - Image Hybride
              </h3>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={buildHybridUrl()}
                  alt="Image hybride"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>URL :</strong> {buildHybridUrl()}
                </p>
              </div>
            </div>

            {/* Image Carte Anime */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Aperçu - Carte Anime
              </h3>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={buildAnimeCardUrl()}
                  alt="Carte anime"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>URL :</strong> {buildAnimeCardUrl()}
                </p>
              </div>
            </div>

            {/* Tests rapides */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Tests Rapides
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setText("🎌 Test avec Emojis 🍜");
                    setColor("#ff6b6b");
                    setSize("large");
                  }}
                  className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors text-sm"
                >
                  Test Emojis
                </button>
                <button
                  onClick={() => {
                    setText("Test avec accents : é è à ç ù");
                    setColor("#4ade80");
                    setSize("medium");
                  }}
                  className="px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                >
                  Test Accents
                </button>
                <button
                  onClick={() => {
                    setUsername("ユーザー名");
                    setAnime("アニメタイトル");
                    setScore("9.5");
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm"
                >
                  Test Japonais
                </button>
                <button
                  onClick={() => {
                    setText(
                      "Test très long avec beaucoup de texte pour tester le retour à la ligne automatique"
                    );
                    setColor("#f59e0b");
                    setSize("small");
                  }}
                  className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                >
                  Test Long Texte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
