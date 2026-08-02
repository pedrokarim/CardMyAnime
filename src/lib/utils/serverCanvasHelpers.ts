import {
  createCanvas,
  loadImage,
  Image,
  Canvas,
  CanvasRenderingContext2D,
} from "canvas";
import path from "path";

// --- Cache statique pour les assets locaux ---
const staticAssetCache = new Map<string, Image>();
let staticAssetsLoaded = false;
let staticAssetsLoading: Promise<void> | null = null;

const STATIC_ASSETS = {
  watermark: path.join(process.cwd(), "public", "images", "cma-logo-watermark.png"),
  background: path.join(process.cwd(), "public", "images", "thumbails-radial.png"),
  avatarFallback: path.join(process.cwd(), "public", "images", "avatar-fallback.png"),
  logoMal: path.join(process.cwd(), "public", "images", "MAL_Favicon_2020.png"),
  logoAnilist: path.join(process.cwd(), "public", "images", "anilist-android-chrome-512x512.png"),
  logoNautiljon: path.join(process.cwd(), "public", "images", "nautiljon-logo.jpg"),
} as const;

async function loadStaticAssets(): Promise<void> {
  if (staticAssetsLoaded) return;
  if (staticAssetsLoading) return staticAssetsLoading;

  staticAssetsLoading = (async () => {
    const entries = Object.entries(STATIC_ASSETS);
    const results = await Promise.allSettled(
      entries.map(async ([key, filePath]) => {
        const img = await loadImage(filePath);
        return { key, img };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        staticAssetCache.set(result.value.key, result.value.img);
      } else {
        console.error("Erreur chargement asset statique:", result.reason);
      }
    }

    staticAssetsLoaded = true;
    console.log(`Assets statiques pré-chargés: ${staticAssetCache.size}/${entries.length}`);
  })();

  return staticAssetsLoading;
}

/**
 * Récupère un asset statique pré-chargé.
 * Charge les assets si ce n'est pas encore fait.
 */
export async function getStaticAsset(key: keyof typeof STATIC_ASSETS): Promise<Image | null> {
  await loadStaticAssets();
  return staticAssetCache.get(key) ?? null;
}

/**
 * Tronque `text` avec une ellipse pour tenir dans `maxWidth`, en utilisant la
 * police deja posee sur `ctx`.
 *
 * Les titres d'animes et de mangas sont reguliement a rallonge, et un pseudo
 * n'a aucune limite de longueur : sans troncature le texte sort du canvas ou
 * passe sous les autres elements. Version utilisable par les cartes qui
 * dessinent directement sur le contexte plutot que via ServerCanvasHelper.
 */
export function truncateToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;

  const ellipsis = "...";
  let truncated = text;

  while (
    truncated.length > 0 &&
    ctx.measureText(truncated + ellipsis).width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }

  return truncated + ellipsis;
}

/**
 * Charge une image distante en gérant le WebP.
 *
 * node-canvas ne sait pas décoder le WebP : `loadImage` échoue et la jaquette
 * apparaît en trou gris. MyAnimeList sert une partie de ses jaquettes dans ce
 * format (`.../158846l.webp`), d'où des cases vides au milieu de cases
 * remplies sur une même carte.
 *
 * La conversion existait déjà mais n'était appliquée qu'aux URL Nautiljon.
 * Elle vaut ici pour toutes les sources, et sert aussi de filet quand
 * `loadImage` échoue sur un format inattendu.
 */
export async function loadRemoteImage(imageUrl: string): Promise<Image> {
  const isNautiljon = imageUrl.includes("nautiljon.com");
  const looksWebp = imageUrl.toLowerCase().includes(".webp");

  // Chemin direct : le plus rapide, et suffisant pour la majorité des cas.
  if (!isNautiljon && !looksWebp) {
    try {
      return await loadImage(imageUrl);
    } catch {
      // On retente en récupérant les octets nous-mêmes : certaines images
      // sont servies en WebP sans que l'URL ne le laisse deviner.
    }
  }

  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
  };
  if (isNautiljon) {
    headers.Referer = "https://www.nautiljon.com/";
    headers["Accept-Language"] = "fr-FR,fr;q=0.9,en;q=0.8";
  }

  const response = await fetch(imageUrl, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} sur ${imageUrl}`);
  }

  let buffer = Buffer.from(new Uint8Array(await response.arrayBuffer()));

  // Signature RIFF....WEBP, plus fiable que l'extension de l'URL.
  const isWebpPayload =
    buffer.length > 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if ((looksWebp || isWebpPayload) && typeof window === "undefined") {
    try {
      const { convertWebPToPNG } = await import("./imageConverter");
      buffer = Buffer.from(await convertWebPToPNG(buffer));
    } catch (error) {
      console.error("Conversion WebP impossible:", error);
    }
  }

  return await loadImage(buffer);
}

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
  private static fontsRegistered = false;

  constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.width = width;
    this.height = height;

    // Enregistrer les polices une seule fois
    if (!ServerCanvasHelper.fontsRegistered) {
      this.registerFonts();
      ServerCanvasHelper.fontsRegistered = true;
    }
  }

  private registerFonts() {
    // Plus de gestion spéciale des polices - on utilise les polices système
    console.log("🔤 Utilisation des polices système par défaut");
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

    // Utiliser la police par défaut
    let fontFamily = config.fontFamily || "Arial, sans-serif";

    this.ctx.font = `${config.fontSize}px ${fontFamily}`;
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

  /**
   * Largeur d'un texte pour une police donnee, sans le dessiner.
   * Utile pour aligner plusieurs elements les uns apres les autres.
   */
  measureText(
    text: string,
    fontSize: number,
    fontFamily: string = "Arial, sans-serif"
  ): number {
    this.ctx.save();
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const width = this.ctx.measureText(text).width;
    this.ctx.restore();
    return width;
  }

  /**
   * Tronque un texte pour une police donnee, sans dependre de l'etat courant
   * du contexte. Renvoyer le libelle permet d'en mesurer la largeur reelle
   * pour enchainer plusieurs elements sans qu'ils se chevauchent.
   */
  truncateTextToWidth(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: string = "Arial, sans-serif"
  ): string {
    this.ctx.save();
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const result = truncateToWidth(this.ctx, text, maxWidth);
    this.ctx.restore();
    return result;
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

    // Utiliser la police par défaut
    let finalFontFamily = fontFamily;

    this.ctx.font = `${fontSize}px ${finalFontFamily}`;
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

  /**
   * Pré-charge une image depuis une URL (ou le cache statique pour les assets locaux).
   * Utile pour charger plusieurs images en parallèle avec Promise.all avant de les dessiner.
   */
  async preloadImage(imageUrl: string): Promise<Image | null> {
    try {
      if (!imageUrl || imageUrl.trim() === "") return null;

      return await loadRemoteImage(imageUrl);
    } catch (error) {
      console.error("Erreur preload image:", error);
      return null;
    }
  }

  /**
   * Dessine une image déjà chargée avec bordure arrondie.
   */
  drawPreloadedImage(config: ImageConfig, img: Image) {
    this.ctx.save();

    this.ctx.beginPath();
    const radius = config.borderRadius || 0;
    if (radius > 0) {
      this.ctx.roundRect(config.x, config.y, config.width, config.height, radius);
    } else {
      this.ctx.rect(config.x, config.y, config.width, config.height);
    }
    this.ctx.clip();

    if (config.shadow) {
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    }

    this.ctx.drawImage(img, config.x, config.y, config.width, config.height);
    this.ctx.restore();
  }

  // Dessiner une image avec bordure arrondie
  async drawRoundedImage(config: ImageConfig, imageUrl: string) {
    try {
      // Vérifier si l'URL est valide
      if (!imageUrl || imageUrl.trim() === "") {
        throw new Error("URL d'image vide");
      }

      // Le chargement (headers Nautiljon, conversion WebP) est factorisé.
      const img = await loadRemoteImage(imageUrl);

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

    // Dessiner un rectangle arrondi manuellement
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
    this.ctx.restore();
  }

  /**
   * Crée un arrière-plan avec l'image du dernier anime (côté gauche) et noir (côté droit)
   */
  async createLastAnimeBackground(coverUrl: string): Promise<void> {
    try {
      // Charger l'image
      // Passe par loadRemoteImage : la jaquette de fond est souvent celle du
      // dernier anime, que MyAnimeList sert parfois en WebP. Un loadImage
      // direct échouait et la carte retombait sur le fond simple.
      const image = await loadRemoteImage(coverUrl);

      // Zone carrée à droite (même taille que la hauteur du canvas)
      const squareSize = this.height;
      const squareX = this.width - squareSize; // Position à droite

      // Calculer les dimensions pour remplir la zone carrée sans déformation
      const scale = Math.max(
        squareSize / image.width,
        squareSize / image.height
      );
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      // Position centrée dans la zone carrée
      const x = squareX + (squareSize - scaledWidth) / 2;
      const y = (squareSize - scaledHeight) / 2;

      // Dessiner l'image dans la zone carrée droite
      this.ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

      // Ajouter une couche noire de base sur tout le canvas à 25% d'opacité
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Ajouter un gradient horizontal sur la zone carrée : transparent (droite) vers noir fort (gauche)
      const gradient = this.ctx.createLinearGradient(
        squareX + squareSize,
        0,
        squareX,
        0
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.4)"); // Noir léger à droite
      gradient.addColorStop(0.2, "rgba(0, 0, 0, 0.6)"); // Noir moyen
      gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.8)"); // Noir fort
      gradient.addColorStop(0.8, "rgba(0, 0, 0, 0.95)"); // Noir très fort
      gradient.addColorStop(1, "rgba(0, 0, 0, 1)"); // Noir complet à gauche

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(squareX, 0, squareSize, squareSize);

      // Remplir le côté gauche en noir complet
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(0, 0, squareX, this.height);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de l'image d'arrière-plan:",
        error
      );
      // Fallback vers un arrière-plan simple
      await this.createSimpleBackground();
    }
  }

  /**
   * Crée un arrière-plan simple (fallback)
   */
  async createSimpleBackground(): Promise<void> {
    try {
      // Utiliser le cache statique pour le background
      const backgroundImage = await getStaticAsset("background") ?? await loadImage(
        path.join(process.cwd(), "public", "images", "thumbails-radial.png")
      );

      // Calculer les dimensions pour remplir le canvas sans déformation
      const imageAspect = backgroundImage.width / backgroundImage.height;
      const canvasAspect = this.width / this.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imageAspect > canvasAspect) {
        // L'image est plus large que le canvas
        drawHeight = this.height;
        drawWidth = drawHeight * imageAspect;
        offsetX = (this.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // L'image est plus haute que le canvas
        drawWidth = this.width;
        drawHeight = drawWidth / imageAspect;
        offsetX = 0;
        offsetY = (this.height - drawHeight) / 2;
      }

      // Dessiner l'image en gardant les proportions
      this.ctx.drawImage(
        backgroundImage,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
    } catch (error) {
      console.error("Erreur lors du chargement du background:", error);

      // Fallback : fond noir simple
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  // Exporter le canvas en buffer PNG
  toBuffer(): Buffer {
    return this.canvas.toBuffer("image/png");
  }

  // Exporter le canvas en data URL
  toDataURL(): string {
    return this.canvas.toDataURL("image/png");
  }
}
