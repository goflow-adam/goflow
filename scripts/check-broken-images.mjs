#!/usr/bin/env node
/**
 * Check for broken image paths in the build output.
 * Scans all HTML files in dist/ and verifies that referenced images exist.
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { resolve, dirname } from 'path';

const DIST_DIR = './dist';

async function checkBrokenImages() {
  const htmlFiles = await glob(`${DIST_DIR}/**/*.html`);
  const brokenImages = [];
  const checkedPaths = new Set();

  // Regex patterns for image sources
  const imgSrcPattern = /<img[^>]+src=["']([^"']+)["']/gi;
  const srcsetPattern = /srcset=["']([^"']+)["']/gi;
  const ogImagePattern = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
  const ogImagePattern2 = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi;

  for (const htmlFile of htmlFiles) {
    const content = readFileSync(htmlFile, 'utf-8');
    const fileDir = dirname(htmlFile);

    // Check <img src="...">
    let match;
    while ((match = imgSrcPattern.exec(content)) !== null) {
      const src = match[1];
      checkImagePath(src, htmlFile, fileDir, brokenImages, checkedPaths);
    }

    // Check srcset attributes
    while ((match = srcsetPattern.exec(content)) !== null) {
      const srcset = match[1];
      // srcset can have multiple URLs separated by commas, each with optional width descriptor
      const urls = srcset.split(',').map(s => s.trim().split(/\s+/)[0]);
      for (const url of urls) {
        checkImagePath(url, htmlFile, fileDir, brokenImages, checkedPaths);
      }
    }

    // Check og:image meta tags
    while ((match = ogImagePattern.exec(content)) !== null) {
      checkImagePath(match[1], htmlFile, fileDir, brokenImages, checkedPaths);
    }
    while ((match = ogImagePattern2.exec(content)) !== null) {
      checkImagePath(match[1], htmlFile, fileDir, brokenImages, checkedPaths);
    }
  }

  // Report results
  if (brokenImages.length > 0) {
    console.error(`\n❌ Found ${brokenImages.length} broken image path(s):\n`);
    for (const { src, file, resolvedPath } of brokenImages) {
      console.error(`  ${src}`);
      console.error(`    Referenced in: ${file}`);
      console.error(`    Expected at: ${resolvedPath}\n`);
    }
    process.exit(1);
  } else {
    console.log(`\n✅ All image paths are valid (checked ${checkedPaths.size} unique paths)\n`);
    process.exit(0);
  }
}

function checkImagePath(src, htmlFile, fileDir, brokenImages, checkedPaths) {
  // Skip external URLs, data URIs, and empty sources
  if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return;
  }

  // Resolve the path
  let resolvedPath;
  if (src.startsWith('/')) {
    // Absolute path from site root
    resolvedPath = resolve(DIST_DIR, src.slice(1));
  } else {
    // Relative path from HTML file location
    resolvedPath = resolve(fileDir, src);
  }

  // Create a unique key for this path
  const pathKey = resolvedPath;
  if (checkedPaths.has(pathKey)) {
    return;
  }
  checkedPaths.add(pathKey);

  // Check if file exists
  if (!existsSync(resolvedPath)) {
    brokenImages.push({ src, file: htmlFile, resolvedPath });
  }
}

checkBrokenImages().catch(err => {
  console.error('Error checking images:', err);
  process.exit(1);
});
