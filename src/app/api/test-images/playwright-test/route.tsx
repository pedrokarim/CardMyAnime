import { chromium } from "playwright";

export async function GET() {
  try {
    // Lancer le navigateur
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 600, height: 300 });

    // Données de test en dur pour reproduire exactement mediumCard.ts
    const testData = {
      username: "TestUser123",
      stats: {
        animesSeen: 247,
        mangasRead: 89,
        avgScore: 8.7,
      },
      lastAnimes: [
        { title: "One Piece" },
        { title: "Naruto Shippuden" },
        { title: "Attack on Titan" },
        { title: "Demon Slayer" },
      ],
      lastMangas: [
        { title: "Berserk" },
        { title: "Vagabond" },
        { title: "Kingdom" },
        { title: "Vinland Saga" },
      ],
    };

    // Créer le HTML de la carte
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              width: 600px;
              height: 300px;
              overflow: hidden;
            }
            
            .card-container {
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .main-block {
              width: 560px;
              height: 260px;
              background-color: rgba(0, 0, 0, 0.7);
              border-radius: 8px;
              padding: 20px;
              display: flex;
              flex-direction: column;
            }
            
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }
            
            .avatar {
              width: 100px;
              height: 100px;
              background-color: #4f46e5;
              border-radius: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 48px;
              margin-right: 20px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            
            .user-info {
              display: flex;
              flex-direction: column;
            }
            
            .username {
              font-size: 32px;
              font-weight: 900;
              color: white;
              margin-bottom: 8px;
            }
            
            .stat {
              font-size: 16px;
              color: #e0e0e0;
              margin-bottom: 4px;
            }
            
            .score {
              font-size: 16px;
              color: #ffd700;
              margin-bottom: 4px;
            }
            
            .content {
              display: flex;
              flex: 1;
              gap: 40px;
            }
            
            .section {
              display: flex;
              flex-direction: column;
              flex: 1;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: 700;
              color: white;
              margin-bottom: 15px;
            }
            
            .item {
              font-size: 16px;
              color: #e0e0e0;
              margin-bottom: 8px;
            }
            
            .watermark {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              font-size: 12px;
              color: rgba(255,255,255,0.6);
              margin-top: auto;
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="main-block">
              <div class="header">
                <div class="avatar">👤</div>
                <div class="user-info">
                  <div class="username">${testData.username}</div>
                  <div class="stat">Animes vus: ${
                    testData.stats.animesSeen
                  }</div>
                  <div class="stat">Mangas lus: ${
                    testData.stats.mangasRead
                  }</div>
                  <div class="score">Note moyenne: ★ ${
                    testData.stats.avgScore
                  }</div>
                </div>
              </div>
              
              <div class="content">
                <div class="section">
                  <div class="section-title">Derniers animes:</div>
                  ${testData.lastAnimes
                    .map(
                      (anime, index) =>
                        `<div class="item">${index + 1}. ${anime.title}</div>`
                    )
                    .join("")}
                </div>
                
                <div class="section">
                  <div class="section-title">Derniers mangas:</div>
                  ${testData.lastMangas
                    .map(
                      (manga, index) =>
                        `<div class="item">${index + 1}. ${manga.title}</div>`
                    )
                    .join("")}
                </div>
              </div>
              
              <div class="watermark">
                <div>CardMyAnime</div>
                <div>Test Playwright</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Charger le HTML et attendre que les polices soient chargées
    await page.setContent(html);
    await page.waitForLoadState("networkidle");

    // Prendre la capture d'écran
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
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
    console.error("Erreur lors de la génération avec Playwright:", error);
    return new Response(`Erreur: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
