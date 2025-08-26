import sharp from "sharp";

export async function convertWebPToPNG(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer).png().toBuffer();
  } catch (error) {
    console.error("Erreur lors de la conversion WebP:", error);
    return imageBuffer; // Retourner le buffer original si la conversion échoue
  }
}
