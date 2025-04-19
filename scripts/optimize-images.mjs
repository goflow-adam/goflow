import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import sharp from 'sharp';

const SIZES = [320, 640, 768, 1024, 1280];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

async function* walk(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    const pathToFile = join(dir, file);
    const stats = await stat(pathToFile);
    if (stats.isDirectory()) {
      yield* walk(pathToFile);
    } else {
      yield pathToFile;
    }
  }
}

async function optimizeImage(imagePath) {
  const ext = extname(imagePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) return;

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  // Don't process images that are already smaller than our smallest target size
  if (metadata.width < SIZES[0]) return;

  for (const width of SIZES) {
    // Skip sizes larger than original
    if (width > metadata.width) continue;

    const resizedPath = imagePath.replace(ext, `-${width}${ext}`);
    await image
      .resize(width)
      .jpeg({ quality: 80, progressive: true })
      .toFile(resizedPath);
  }
}

async function main() {
  const publicDir = new URL('../public', import.meta.url).pathname;
  for await (const file of walk(publicDir)) {
    await optimizeImage(file).catch(console.error);
  }
}

main().catch(console.error);
