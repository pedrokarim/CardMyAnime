import { chromium } from "playwright";

export async function GET() {
  try {
    // Lancer le navigateur avec Playwright
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 600, height: 300 });

    // Données de test en dur pour reproduire exactement mediumCard.ts
    const testData = {
      username: "TestUser123",
      avatarUrl: "https://via.placeholder.com/100x100/4f46e5/ffffff?text=👤",
      stats: {
        animesSeen: 247,
        mangasRead: 89,
        avgScore: 8.7,
      },
      lastAnimes: [
        {
          title: "One Piece",
          coverUrl: "https://via.placeholder.com/60x80/ef4444/ffffff?text=OP",
        },
        {
          title: "Naruto Shippuden",
          coverUrl: "https://via.placeholder.com/60x80/10b981/ffffff?text=NS",
        },
        {
          title: "Attack on Titan",
          coverUrl: "https://via.placeholder.com/60x80/3b82f6/ffffff?text=AoT",
        },
        {
          title: "Demon Slayer",
          coverUrl: "https://via.placeholder.com/60x80/8b5cf6/ffffff?text=DS",
        },
      ],
      lastMangas: [
        {
          title: "Berserk",
          coverUrl: "https://via.placeholder.com/60x80/059669/ffffff?text=B",
        },
        {
          title: "Vagabond",
          coverUrl: "https://via.placeholder.com/60x80/dc2626/ffffff?text=V",
        },
        {
          title: "Kingdom",
          coverUrl: "https://via.placeholder.com/60x80/ea580c/ffffff?text=K",
        },
        {
          title: "Vinland Saga",
          coverUrl: "https://via.placeholder.com/60x80/be185d/ffffff?text=VS",
        },
      ],
    };

    // Créer le HTML avec Canvas qui reproduit exactement mediumCard.ts
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              width: 600px;
              height: 300px;
              overflow: hidden;
              font-family: Arial, sans-serif;
            }
            
            canvas {
              display: block;
            }
          </style>
        </head>
        <body>
          <canvas id="cardCanvas" width="600" height="300"></canvas>
          
          <script>
            // Code Canvas qui reproduit EXACTEMENT mediumCard.ts
            const canvas = document.getElementById('cardCanvas');
            const ctx = canvas.getContext('2d');
            
            // Données de test
            const testData = ${JSON.stringify(testData)};
            
            // Fonction pour dessiner du texte (équivalent à drawText de ServerCanvasHelper)
            function drawText(x, y, text, fontSize, fontFamily, color, textAlign, maxWidth) {
              ctx.save();
              ctx.font = fontSize + 'px ' + (fontFamily || 'Arial, sans-serif');
              ctx.fillStyle = color || '#000000';
              ctx.textAlign = textAlign || 'left';
              
              if (maxWidth) {
                // Tronquer le texte avec ellipses (équivalent à drawTruncatedText)
                let truncatedText = text;
                while (ctx.measureText(truncatedText + '...').width > maxWidth && truncatedText.length > 0) {
                  truncatedText = truncatedText.slice(0, -1);
                }
                if (truncatedText !== text) {
                  truncatedText += '...';
                }
                ctx.fillText(truncatedText, x, y);
              } else {
                ctx.fillText(text, x, y);
              }
              
              ctx.restore();
            }
            
            // Fonction pour dessiner un rectangle (équivalent à drawRect)
            function drawRect(x, y, width, height, color) {
              ctx.fillStyle = color;
              ctx.fillRect(x, y, width, height);
            }
            
            // Fonction pour dessiner un rectangle arrondi (équivalent à drawRoundedRect)
            function drawRoundedRect(x, y, width, height, radius, color) {
              ctx.save();
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + width - radius, y);
              ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
              ctx.lineTo(x + width, y + height - radius);
              ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
              ctx.lineTo(x + radius, y + height);
              ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
            
            // Fonction pour dessiner une image arrondie (équivalent à drawRoundedImage)
            function drawRoundedImage(x, y, width, height, radius, imageUrl, shadow) {
              // Simuler l'image avec un rectangle coloré
              ctx.save();
              
              if (shadow) {
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
              }
              
              // Utiliser l'emoji comme fallback (comme dans mediumCard.ts)
              ctx.fillStyle = '#4f46e5';
              drawRoundedRect(x, y, width, height, radius, '#4f46e5');
              
              // Centrer l'emoji
              ctx.fillStyle = 'white';
              ctx.font = '48px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('👤', x + width/2, y + height/2);
              
              ctx.restore();
            }
            
            // REPRODUCTION EXACTE DE mediumCard.ts
            
            // 1. Créer l'arrière-plan selon le paramètre (comme dans mediumCard.ts)
            // Arrière-plan avec dégradé (simulé)
            const gradient = ctx.createLinearGradient(0, 0, 600, 300);
            gradient.addColorStop(0, '#1e293b');
            gradient.addColorStop(0.5, '#334155');
            gradient.addColorStop(1, '#475569');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 600, 300);
            
            // 2. Gros bloc noir transparent qui englobe tous les éléments (EXACTEMENT comme mediumCard.ts)
            drawRect(20, 20, 560, 260, 'rgba(0, 0, 0, 0.7)');
            
            // 3. Dessiner l'avatar (EXACTEMENT comme mediumCard.ts)
            try {
              drawRoundedImage(30, 30, 100, 100, 50, testData.avatarUrl, true);
            } catch (error) {
              // Fallback si l'image ne charge pas (EXACTEMENT comme mediumCard.ts)
              drawRoundedRect(30, 30, 100, 100, 50, '#ffffff');
              drawText(80, 80, '👤', 48, 'Arial, sans-serif', '#000000', 'center');
            }
            
            // 4. Nom d'utilisateur (EXACTEMENT comme mediumCard.ts)
            drawText(150, 60, testData.username, 32, 'Arial, sans-serif', '#ffffff', 'left');
            
            // 5. Stats détaillées (EXACTEMENT comme mediumCard.ts)
            drawText(150, 95, 'Animes vus: ' + testData.stats.animesSeen, 16, 'Arial, sans-serif', '#e0e0e0', 'left');
            drawText(150, 115, 'Mangas lus: ' + testData.stats.mangasRead, 16, 'Arial, sans-serif', '#e0e0e0', 'left');
            
            // 6. Note moyenne si disponible (EXACTEMENT comme mediumCard.ts)
            if (testData.stats.avgScore > 0) {
              drawText(150, 135, 'Note moyenne: ★ ' + testData.stats.avgScore, 16, 'Arial, sans-serif', '#ffd700', 'left');
            }
            
            // 7. Section des derniers animes (EXACTEMENT comme mediumCard.ts)
            drawText(30, 170, 'Derniers animes:', 18, 'Arial, sans-serif', '#ffffff', 'left');
            
            const recentAnimes = testData.lastAnimes.slice(0, 4);
            let animeY = 200;
            
            recentAnimes.forEach((anime, index) => {
              // Utiliser drawTruncatedText (EXACTEMENT comme mediumCard.ts)
              drawText(30, animeY + index * 20, (index + 1) + '. ' + anime.title, 16, 'Arial, sans-serif', '#e0e0e0', 'left', 250);
            });
            
            // 8. Section des derniers mangas (EXACTEMENT comme mediumCard.ts)
            drawText(320, 170, 'Derniers mangas:', 18, 'Arial, sans-serif', '#ffffff', 'left');
            
            const recentMangas = testData.lastMangas.slice(0, 4);
            let mangaY = 200;
            
            recentMangas.forEach((manga, index) => {
              // Utiliser drawTruncatedText (EXACTEMENT comme mediumCard.ts)
              drawText(320, mangaY + index * 20, (index + 1) + '. ' + manga.title, 16, 'Arial, sans-serif', '#e0e0e0', 'left', 250);
            });
            
            // 9. Watermark (EXACTEMENT comme mediumCard.ts)
            drawText(560, 280, 'CardMyAnime', 12, 'monospace', 'rgba(255,255,255,0.6)', 'right');
            drawText(560, 295, 'Test Canvas Playwright', 12, 'monospace', 'rgba(255,255,255,0.6)', 'right');
          </script>
        </body>
      </html>
    `;

    // Charger le HTML et attendre que le Canvas soit rendu
    await page.setContent(html);
    await page.waitForLoadState("networkidle");

    // Prendre la capture d'écran du Canvas
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width: 600, height: 300 },
    });

    await browser.close();

    // Retourner l'image
    return new Response(screenshot, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la génération avec Canvas + Playwright:",
      error
    );
    return new Response(`Erreur: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
