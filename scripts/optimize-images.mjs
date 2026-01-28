import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import sharp from 'sharp';

// Define which images need what sizes
// Column images max at 600px width
const COLUMN_SIZES = [300, 450, 600];

const IMAGE_CONFIGS = {
  // 'celtic.jpg': [320, 640, 768, 1024, 1280], // Hero background image
  
  // Column images (max 600px)
  'Healdsburg.webp': COLUMN_SIZES,
  'main-line-leak-1.webp': COLUMN_SIZES,
  'main-line-leak-2.webp': COLUMN_SIZES,
  'NovatoGoFlow.webp': COLUMN_SIZES,
  'PetalumaGoFlow.webp': COLUMN_SIZES,
  'SanRafael-Cropped1.webp': COLUMN_SIZES,
  'SantaRosaTruck.webp': COLUMN_SIZES,
  'cold-shutoff.webp': COLUMN_SIZES,
  'drain.webp': COLUMN_SIZES,
  'earthquake-strap-front.webp': COLUMN_SIZES,
  'earthquake-strap.webp': COLUMN_SIZES,
  'flue.webp': COLUMN_SIZES,
  'gas-line.webp': COLUMN_SIZES,
  'gas-shutoff-valve-1.webp': COLUMN_SIZES,
  'gas-shutoff-valve.webp': COLUMN_SIZES,
  'gas.webp': COLUMN_SIZES,
  'hot-cold.webp': COLUMN_SIZES,
  'pan.webp': COLUMN_SIZES,
  'tnp-45-deg.webp': COLUMN_SIZES,
  'tnp-drain.webp': COLUMN_SIZES,
  'tnp-side.webp': COLUMN_SIZES,
  'tnp-test.webp': COLUMN_SIZES,
  'water-heater.webp': COLUMN_SIZES,
};
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

import { mkdir } from 'fs/promises';

async function optimizeImage(imagePath, outputDir) {
  const ext = extname(imagePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) return;

  // Get the base filename
  const filename = imagePath.split('/').pop();
  
  // Check if this image needs optimization
  const requiredSizes = IMAGE_CONFIGS[filename];
  if (!requiredSizes) {
    console.log(`Skipping ${filename} - no size configuration found`);
    return;
  }

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  for (const width of requiredSizes) {
    // Skip sizes larger than original
    if (width > metadata.width) {
      console.log(`Skipping ${width}px for ${filename} - larger than original ${metadata.width}px`);
      continue;
    }

    const resizedPath = join(outputDir, filename.replace(ext, `-${width}${ext}`));
    console.log(`Generating ${width}px version of ${filename}`);
    
    const resized = image.resize(width);
    
    // Output in the same format as input
    if (ext === '.webp') {
      await resized.webp({ quality: 80 }).toFile(resizedPath);
    } else if (ext === '.png') {
      await resized.png({ quality: 80, compressionLevel: 9 }).toFile(resizedPath);
    } else {
      await resized.jpeg({ quality: 80, progressive: true }).toFile(resizedPath);
    }
  }
}

async function main() {
  const publicDir = new URL('../public/images', import.meta.url).pathname;
  const generatedDir = new URL('../public/images/generated', import.meta.url).pathname;
  
  for await (const file of walk(publicDir)) {
    // Skip files that are already in the generated directory
    if (file.includes('/generated/')) continue;
    await optimizeImage(file, generatedDir).catch(console.error);
  }
}

main().catch(console.error);
