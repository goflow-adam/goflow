import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import sharp from 'sharp';
import * as piexif from 'piexif-ts';

// Load job pins data for GPS coordinates
const jobPinsPath = new URL('../src/data/jobPins.json', import.meta.url).pathname;
let jobPinsData = [];
try {
  jobPinsData = JSON.parse(await readFile(jobPinsPath, 'utf-8'));
} catch (e) {
  console.log('No jobPins.json found, skipping GPS embedding');
}

// Build a map of jobId -> coordinates
const jobCoordinates = new Map();
for (const job of jobPinsData) {
  if (job.coordinates && job.images) {
    for (const img of job.images) {
      jobCoordinates.set(img, job.coordinates);
    }
  }
}

// Define which images need what sizes
// Column images max at 600px width
const COLUMN_SIZES = [300, 450, 600];
const BADGE_SIZES = [150, 225, 300];
const JOB_SIZES = [320, 480, 640]; // Job pin images - card display

const IMAGE_CONFIGS = {
  // Column images (max 600px)
  'Healdsburg.webp': COLUMN_SIZES,
  'main-line-leak-1.webp': COLUMN_SIZES,
  'main-line-leak-2.webp': COLUMN_SIZES,
  'NovatoGOFLOW.webp': COLUMN_SIZES,
  'PetalumaGOFLOW.webp': COLUMN_SIZES,
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
  'water-heater-expansion-tank.webp': COLUMN_SIZES,
  'moen-flow-install-bel-marin-keys-1.webp': COLUMN_SIZES,
  'delta-pro-certified.webp': COLUMN_SIZES,
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

// Convert decimal degrees to degrees/minutes/seconds for EXIF GPS
function decimalToDMS(decimal) {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  
  // EXIF GPS uses rationals [numerator, denominator]
  return [
    [degrees, 1],
    [minutes, 1],
    [Math.round(seconds * 10000), 10000]
  ];
}

// Embed GPS coordinates into a JPEG file
async function embedGPSCoordinates(filePath, lat, lng) {
  try {
    const imageData = await readFile(filePath);
    const base64 = imageData.toString('binary');
    
    // Use piexif's helper to convert decimal degrees to DMS rational format
    const latDMS = piexif.GPSHelper.degToDmsRational(Math.abs(lat));
    const lngDMS = piexif.GPSHelper.degToDmsRational(Math.abs(lng));
    
    // Create GPS EXIF data using numeric tag keys
    // 1 = GPSLatitudeRef, 2 = GPSLatitude, 3 = GPSLongitudeRef, 4 = GPSLongitude
    const gpsIfd = {
      1: lat >= 0 ? 'N' : 'S',
      2: latDMS,
      3: lng >= 0 ? 'E' : 'W',
      4: lngDMS,
    };
    
    const exifObj = { GPS: gpsIfd };
    const exifBytes = piexif.dump(exifObj);
    const newImageData = piexif.insert(exifBytes, base64);
    
    await writeFile(filePath, Buffer.from(newImageData, 'binary'));
    return true;
  } catch (err) {
    console.error(`Failed to embed GPS in ${filePath}:`, err.message);
    return false;
  }
}

async function optimizeImage(imagePath, outputDir) {
  const originalExt = extname(imagePath);
  const ext = originalExt.toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) return;

  // Get the base filename and normalize extension to lowercase for output
  const filename = imagePath.split('/').pop();
  const normalizedFilename = filename.slice(0, -originalExt.length) + ext;
  
  // Check if this image needs optimization
  // Job images (in /jobs/ directory) get JOB_SIZES automatically
  const isJobImage = imagePath.includes('/jobs/');
  const requiredSizes = isJobImage ? JOB_SIZES : IMAGE_CONFIGS[filename];
  if (!requiredSizes) {
    console.log(`Skipping ${filename} - no size configuration found`);
    return;
  }

  // Use rotate() with no arguments to auto-orient based on EXIF data
  const image = sharp(imagePath).rotate();
  const metadata = await image.metadata();

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  for (const width of requiredSizes) {
    const resizedPath = join(outputDir, normalizedFilename.replace(ext, `-${width}${ext}`));
    
    // If requested size is larger than original, copy the original with the larger size name
    if (width > metadata.width) {
      console.log(`Copying original for ${width}px version of ${filename} - source only ${metadata.width}px`);
      if (ext === '.webp') {
        await image.webp({ quality: 80 }).toFile(resizedPath);
      } else if (ext === '.png') {
        await image.png({ quality: 80, compressionLevel: 9 }).toFile(resizedPath);
      } else {
        await image.jpeg({ quality: 80, progressive: true }).toFile(resizedPath);
      }
      continue;
    }

    console.log(`Generating ${width}px version of ${filename}`);
    
    const resized = image.resize(width);
    
    // Output in the same format as input
    if (ext === '.webp') {
      await resized.webp({ quality: 80 }).toFile(resizedPath);
    } else if (ext === '.png') {
      await resized.png({ quality: 80, compressionLevel: 9 }).toFile(resizedPath);
    } else {
      await resized.jpeg({ quality: 80, progressive: true }).toFile(resizedPath);
      
      // Embed GPS coordinates for job images (JPEG only - EXIF not supported in WebP/PNG)
      if (isJobImage) {
        // Try both original and normalized filename for GPS lookup
        const coords = jobCoordinates.get(filename) || jobCoordinates.get(normalizedFilename);
        if (coords) {
          await embedGPSCoordinates(resizedPath, coords.lat, coords.lng);
          console.log(`  → Embedded GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        }
      }
    }
  }
}

async function main() {
  const publicDir = new URL('../public/images', import.meta.url).pathname;
  
  for await (const file of walk(publicDir)) {
    // Skip files that are already in the generated directory
    if (file.includes('/generated/')) continue;
    
    // Output to a 'generated' subdirectory relative to the source image's directory
    const imageDir = file.slice(0, file.lastIndexOf('/'));
    const outputDir = join(imageDir, 'generated');
    
    await optimizeImage(file, outputDir).catch(console.error);
  }
}

main().catch(console.error);
