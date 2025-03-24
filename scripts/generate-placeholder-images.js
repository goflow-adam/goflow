import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create public/images directory if it doesn't exist
const imagesDir = join(__dirname, '..', 'public', 'images');
if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
}

// Create placeholder SVG for Sonoma County
const sonomaCountySvg = `
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#1f4a6f"/>
  <text x="400" y="200" font-family="Arial" font-size="48" fill="#f4f7f5" text-anchor="middle" dominant-baseline="middle">
    Sonoma County
  </text>
</svg>
`;

// Create placeholder SVG for Marin County
const marinCountySvg = `
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#509cba"/>
  <text x="400" y="200" font-family="Arial" font-size="48" fill="#f4f7f5" text-anchor="middle" dominant-baseline="middle">
    Marin County
  </text>
</svg>
`;

// Write SVGs to files
writeFileSync(join(imagesDir, 'sonoma-county.svg'), sonomaCountySvg);
writeFileSync(join(imagesDir, 'marin-county.svg'), marinCountySvg);

console.log('Placeholder images generated in public/images/');
