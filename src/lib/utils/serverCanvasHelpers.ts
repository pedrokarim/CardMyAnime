import {
  createCanvas,
  loadImage,
  Canvas,
  CanvasRenderingContext2D,
} from "canvas";

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface TextConfig {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  textAlign?: CanvasTextAlign;
  maxWidth?: number;
}

export interface ImageConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
  shadow?: boolean;
}

export class ServerCanvasHelper {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.width = width;
    this.height = height;
  }

  // Configuration initiale du canvas
  setup(config: CanvasConfig) {
    this.canvas.width = config.width;
    this.canvas.height = config.height;

    if (config.backgroundColor) {
      this.fillBackground(config.backgroundColor);
    }
  }

  // Remplir le fond
  fillBackground(color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Remplir le fond avec un dégradé
  fillGradient(gradient: CanvasGradient) {
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Créer un dégradé
  createGradient(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    colors: string[]
  ) {
    const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  }

  // Dessiner du texte
  drawText(config: TextConfig) {
    this.ctx.save();

    this.ctx.font = `${config.fontSize}px ${
      config.fontFamily || "Arial, sans-serif"
    }`;
    this.ctx.fillStyle = config.color || "#000000";
    this.ctx.textAlign = config.textAlign || "left";

    if (config.maxWidth) {
      this.wrapText(
        config.text,
        config.x,
        config.y,
        config.maxWidth,
        config.fontSize
      );
    } else {
      this.ctx.fillText(config.text, config.x, config.y);
    }

    this.ctx.restore();
  }

  // Tronquer le texte avec ellipses
  truncateText(text: string, maxWidth: number): string {
    // D'abord vérifier si le texte original dépasse
    const originalWidth = this.ctx.measureText(text).width;

    // Si le texte ne dépasse pas, le retourner tel quel
    if (originalWidth <= maxWidth) {
      return text;
    }

    // Sinon, tronquer avec ellipses
    const ellipsis = "...";
    let truncated = text;

    while (
      this.ctx.measureText(truncated + ellipsis).width > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }

    return truncated + ellipsis;
  }

  // Dessiner du texte tronqué
  drawTruncatedText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    color: string = "#ffffff",
    fontFamily: string = "Arial, sans-serif"
  ) {
    this.ctx.save();

    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = "left";

    const truncatedText = this.truncateText(text, maxWidth);
    this.ctx.fillText(truncatedText, x, y);

    this.ctx.restore();
  }

  // Texte avec retour à la ligne automatique
  private wrapText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = this.ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        this.ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, currentY);
  }

  // Dessiner une image avec bordure arrondie
  async drawRoundedImage(config: ImageConfig, imageUrl: string) {
    try {
      // Vérifier si l'URL est valide
      if (!imageUrl || imageUrl.trim() === "") {
        throw new Error("URL d'image vide");
      }

      // Pour les images de Nautiljon, on va essayer avec des headers spécifiques
      let img;
      if (imageUrl.includes("nautiljon.com")) {
        try {
          // Essayer de charger l'image avec des headers pour contourner les protections
          const response = await fetch(imageUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              Referer: "https://www.nautiljon.com/",
              Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
              "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const buffer = await response.arrayBuffer();
          const imageBuffer = Buffer.from(new Uint8Array(buffer));

          // Convertir WebP en PNG si nécessaire (côté serveur uniquement)
          let processedBuffer = imageBuffer;
          if (imageUrl.includes(".webp") && typeof window === "undefined") {
            try {
              const { convertWebPToPNG } = await import("./imageConverter");
              console.log(`Conversion WebP vers PNG pour: ${imageUrl}`);
              processedBuffer = await convertWebPToPNG(imageBuffer);
            } catch (conversionError) {
              console.error(
                "Erreur lors de la conversion WebP:",
                conversionError
              );
              // Si la conversion échoue, essayer avec le buffer original
              processedBuffer = imageBuffer;
            }
          }

          img = await loadImage(processedBuffer);
        } catch (fetchError) {
          console.error(
            "Erreur lors du fetch de l'image Nautiljon:",
            fetchError
          );
          throw fetchError;
        }
      } else {
        // Pour les autres plateformes, utiliser la méthode normale
        img = await loadImage(imageUrl);
      }

      this.ctx.save();

      // Créer un chemin arrondi
      this.ctx.beginPath();
      const radius = config.borderRadius || 0;

      if (radius > 0) {
        this.ctx.roundRect(
          config.x,
          config.y,
          config.width,
          config.height,
          radius
        );
      } else {
        this.ctx.rect(config.x, config.y, config.width, config.height);
      }

      this.ctx.clip();

      // Ajouter une ombre si demandé
      if (config.shadow) {
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
      }

      this.ctx.drawImage(img, config.x, config.y, config.width, config.height);
      this.ctx.restore();
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
      // Fallback: dessiner un rectangle coloré avec une icône
      this.drawRoundedRect(
        config.x,
        config.y,
        config.width,
        config.height,
        config.borderRadius || 0,
        "#dc2626" // Rouge pour indiquer l'erreur
      );

      // Ajouter une icône de fallback
      const iconSize = Math.min(config.width, config.height) * 0.3;
      const iconX = config.x + (config.width - iconSize) / 2;
      const iconY = config.y + (config.height - iconSize) / 2;

      this.ctx.save();
      this.ctx.font = `${iconSize}px Arial`;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("🖼️", iconX + iconSize / 2, iconY + iconSize / 2);
      this.ctx.restore();
    }
  }

  /**
   * Dessine un rectangle avec une couleur et une transparence
   */
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Dessine un rectangle arrondi
   */
  drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string
  ) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.roundRect(x, y, width, height, radius);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Crée un arrière-plan avec l'image du dernier anime en arrière-plan flou
   */
  async createLastAnimeBackground(coverUrl: string): Promise<void> {
    try {
      // Charger l'image
      const image = await loadImage(coverUrl);

      // Calculer les dimensions pour couvrir tout le canvas
      const scale = Math.max(
        this.width / image.width,
        this.height / image.height
      );
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      // Position centrée
      const x = (this.width - scaledWidth) / 2;
      const y = (this.height - scaledHeight) / 2;

      // Dessiner l'image redimensionnée
      this.ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

      // Appliquer un flou en dessinant plusieurs fois l'image avec une transparence
      this.ctx.globalAlpha = 0.3;
      for (let i = 0; i < 3; i++) {
        this.ctx.drawImage(
          image,
          x + i * 2,
          y + i * 2,
          scaledWidth,
          scaledHeight
        );
      }
      this.ctx.globalAlpha = 1.0;

      // Ajouter un overlay dégradé noir vers transparent
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
      gradient.addColorStop(0.3, "rgba(0, 0, 0, 0.6)");
      gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de l'image d'arrière-plan:",
        error
      );
      // Fallback vers un arrière-plan simple
      this.createSimpleBackground();
    }
  }

  /**
   * Crée un arrière-plan simple (fallback)
   */
  createSimpleBackground(): void {
    // Dégradé noir vers transparent
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.7)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Exporter le canvas en buffer
  toBuffer(): any {
    return this.canvas.toBuffer("image/png");
  }

  // Exporter le canvas en data URL
  toDataURL(): string {
    return this.canvas.toDataURL("image/png");
  }
}
