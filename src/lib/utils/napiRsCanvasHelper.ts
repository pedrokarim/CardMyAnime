import {
  Canvas,
  CanvasRenderingContext2D,
  Image,
  loadImage,
} from "@napi-rs/canvas";
import path from "path";

interface TextConfig {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  textAlign?: CanvasTextAlign;
  maxWidth?: number;
}

interface RoundedImageConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  shadow?: boolean;
}

export class NapiRsCanvasHelper {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = new Canvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.registerFonts();
  }

  private registerFonts() {
    try {
      if (process.env.VERCEL) {
        console.log(
          "🚀 Environnement Vercel détecté - Utilisation des polices système"
        );
        return;
      }
      // En local, essayer d'enregistrer les polices TTF
      const notoSansPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "NotoSans-Regular.ttf"
      );
      const emojiPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "NotoColorEmoji-Regular.ttf"
      );

      // @napi-rs/canvas utilise registerFont différemment
      // Les polices système sont utilisées par défaut
      console.log("✅ Polices système utilisées avec @napi-rs/canvas");
    } catch (error) {
      console.warn("⚠️ Impossible d'enregistrer les polices:", error);
    }
  }

  createSimpleBackground() {
    // Créer un gradient de fond
    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      this.width,
      this.height
    );
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  async createLastAnimeBackground(imageUrl: string) {
    try {
      // Créer le gradient de fond d'abord
      this.createSimpleBackground();

      // Charger l'image de fond
      const image = await loadImage(imageUrl);

      // Calculer les dimensions pour couvrir tout le canvas
      const scale = Math.max(
        this.width / image.width,
        this.height / image.height
      );
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      // Centrer l'image
      const x = (this.width - scaledWidth) / 2;
      const y = (this.height - scaledHeight) / 2;

      // Ajouter un overlay sombre
      this.ctx.globalAlpha = 0.3;
      this.ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
      this.ctx.globalAlpha = 1.0;

      // Ajouter un overlay noir pour assurer la lisibilité
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, this.width, this.height);
    } catch (error) {
      console.warn("⚠️ Impossible de charger l'image de fond:", error);
      this.createSimpleBackground();
    }
  }

  drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string
  ) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawText(config: TextConfig) {
    this.ctx.save();
    let fontFamily = config.fontFamily || "Arial, sans-serif";

    if (process.env.VERCEL) {
      const hasEmojis = /\p{Emoji}/u.test(config.text);
      if (hasEmojis) {
        fontFamily =
          "Noto Color Emoji, Noto Sans, Liberation Sans, Arial, sans-serif";
      } else {
        fontFamily =
          "Noto Sans, Liberation Sans, DejaVu Sans, Arial, sans-serif";
      }
    } else {
      const hasEmojis = /\p{Emoji}/u.test(config.text);
      if (hasEmojis) {
        fontFamily = "Noto Color Emoji, Noto Sans, Arial, sans-serif";
      } else {
        fontFamily = "Noto Sans, Arial, sans-serif";
      }
    }

    this.ctx.font = `${config.fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = config.color || "#ffffff";
    this.ctx.textAlign = config.textAlign || "left";

    if (config.maxWidth) {
      this.drawTruncatedText(
        config.text,
        config.x,
        config.y,
        config.maxWidth,
        config.fontSize,
        config.color || "#ffffff"
      );
    } else {
      this.ctx.fillText(config.text, config.x, config.y);
    }

    this.ctx.restore();
  }

  drawTruncatedText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    color: string = "#ffffff"
  ) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px Arial, sans-serif`;

    if (this.ctx.measureText(text).width <= maxWidth) {
      this.ctx.fillText(text, x, y);
      return;
    }

    // Tronquer le texte avec "..."
    const ellipsis = "...";
    const ellipsisWidth = this.ctx.measureText(ellipsis).width;
    let truncatedText = text;

    while (
      this.ctx.measureText(truncatedText + ellipsis).width > maxWidth &&
      truncatedText.length > 0
    ) {
      truncatedText = truncatedText.slice(0, -1);
    }

    this.ctx.fillText(truncatedText + ellipsis, x, y);
  }

  async drawRoundedImage(config: RoundedImageConfig, imageUrl: string) {
    try {
      const image = await loadImage(imageUrl);

      // Créer un canvas temporaire pour le masque
      const tempCanvas = new Canvas(config.width, config.height);
      const tempCtx = tempCanvas.getContext("2d");

      // Créer le masque circulaire
      tempCtx.beginPath();
      tempCtx.arc(
        config.width / 2,
        config.height / 2,
        config.borderRadius,
        0,
        2 * Math.PI
      );
      tempCtx.clip();

      // Dessiner l'image dans le masque
      tempCtx.drawImage(image, 0, 0, config.width, config.height);

      // Ajouter une ombre si demandé
      if (config.shadow) {
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
      }

      // Dessiner le résultat sur le canvas principal
      this.ctx.drawImage(tempCanvas, config.x, config.y);

      // Réinitialiser les ombres
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    } catch (error) {
      console.warn("⚠️ Impossible de charger l'image:", error);
      // Fallback : dessiner un cercle blanc
      this.drawRoundedRect(
        config.x,
        config.y,
        config.width,
        config.height,
        config.borderRadius,
        "#ffffff"
      );
    }
  }

  toDataURL(): string {
    return this.canvas.toDataURL("image/png");
  }

  toBuffer(): Buffer {
    return this.canvas.toBuffer("image/png");
  }
}
