import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const results = {
  jsonld: { valid: [], invalid: [] },
  canonical: { valid: [], invalid: [], missing: [] },
  duplicates: []
};

function validateJsonLD(jsonld) {
  try {
    const parsed = JSON.parse(jsonld);
    if (!parsed['@context'] || !parsed['@type']) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function validateCanonical(canonical, filePath) {
  if (!canonical) return false;
  const href = canonical.getAttribute('href');
  if (!href) return false;
  
  // Check if canonical URL is absolute and points to goflow.plumbing
  return href.startsWith('https://goflow.plumbing/');
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(content);
  const document = dom.window.document;

  // Check JSON-LD
  const jsonldScripts = document.querySelectorAll('script[type="application/ld+json"]');
  const jsonldResults = Array.from(jsonldScripts).map(script => {
    try {
      return validateJsonLD(script.textContent);
    } catch (e) {
      return false;
    }
  });

  if (jsonldScripts.length === 0) {
    results.jsonld.invalid.push({ file: filePath, reason: 'No JSON-LD found' });
  } else if (jsonldResults.some(r => !r)) {
    results.jsonld.invalid.push({ file: filePath, reason: 'Invalid JSON-LD structure' });
  } else {
    results.jsonld.valid.push(filePath);
  }

  // Check canonical tags
  const canonicalTags = document.querySelectorAll('link[rel="canonical"]');
  if (canonicalTags.length === 0) {
    results.canonical.missing.push(filePath);
  } else if (canonicalTags.length > 1) {
    results.duplicates.push({ file: filePath, type: 'canonical', count: canonicalTags.length });
  } else {
    const isValid = validateCanonical(canonicalTags[0], filePath);
    if (isValid) {
      results.canonical.valid.push(filePath);
    } else {
      results.canonical.invalid.push({ file: filePath, href: canonicalTags[0].getAttribute('href') });
    }
  }
}

// Process all HTML files
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (path.extname(file) === '.html') {
      processFile(filePath);
    }
  });
}

walkDir(distDir);

// Print results
console.log('\nJSON-LD Validation Results:');
console.log('Valid:', results.jsonld.valid.length);
console.log('Invalid:', results.jsonld.invalid.length);
if (results.jsonld.invalid.length > 0) {
  console.log('\nInvalid JSON-LD files:');
  results.jsonld.invalid.forEach(item => {
    console.log(`- ${item.file}: ${item.reason}`);
  });
}

console.log('\nCanonical Tag Results:');
console.log('Valid:', results.canonical.valid.length);
console.log('Invalid:', results.canonical.invalid.length);
console.log('Missing:', results.canonical.missing.length);
if (results.canonical.invalid.length > 0) {
  console.log('\nInvalid canonical tags:');
  results.canonical.invalid.forEach(item => {
    console.log(`- ${item.file}: ${item.href}`);
  });
}
if (results.canonical.missing.length > 0) {
  console.log('\nMissing canonical tags:');
  results.canonical.missing.forEach(file => {
    console.log(`- ${file}`);
  });
}

if (results.duplicates.length > 0) {
  console.log('\nDuplicate tags found:');
  results.duplicates.forEach(item => {
    console.log(`- ${item.file}: ${item.count} ${item.type} tags`);
  });
}
