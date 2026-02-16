#!/usr/bin/env node

/**
 * Categorize Keywords by Page
 * 
 * Takes a CSV of search queries and groups them by the most relevant page
 * (existing or proposed) based on the site's architecture.
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const contentDir = path.join(projectRoot, 'src', 'content');

// Check if a page exists in the content directories
function pageExists(filename) {
  const searchDirs = ['services', 'regions', 'articles'];
  for (const dir of searchDirs) {
    const filePath = path.join(contentDir, dir, filename);
    if (existsSync(filePath)) {
      return true;
    }
  }
  return false;
}

// Location keywords to detect
const locations = [
  { name: 'petaluma', page: 'petaluma' },
  { name: 'santa rosa', page: 'santa-rosa' },
  { name: 'novato', page: 'novato' },
  { name: 'san rafael', page: 'san-rafael' },
  { name: 'sonoma county', page: 'sonoma-county' },
  { name: 'marin county', page: 'marin-county' },
  { name: 'marin', page: 'marin-county' },
  { name: 'sonoma', page: 'sonoma' }, // City of Sonoma, not county
  { name: 'healdsburg', page: 'healdsburg' },
  { name: 'rohnert park', page: 'rohnert-park' },
  { name: 'penngrove', page: 'penngrove' },
  { name: 'cotati', page: 'cotati' },
  { name: 'coloma', page: 'coloma' },
  { name: 'rincon valley', page: 'rincon-valley' },
];

// Keywords to exclude from results entirely
const excludeKeywords = [
  'furnace',
  'heat pump',
  'hvac',
  'air conditioning',
  'ac repair',
];

// Check if a query should be excluded
function shouldExclude(query) {
  const q = query.toLowerCase();
  return excludeKeywords.some(kw => q.includes(kw));
}

// Service keywords to detect
// Note: water heater install/repair/replace are treated as equivalent and grouped under 'water-heater' service
const services = [
  { keywords: ['water heater repair', 'hot water heater repair', 'water heater fix', 'heater repair', 'water heater install', 'water heater replacement', 'water heater service', 'water heaters', 'water heater', 'water heater installer', 'water heater technician', 'water heater maintenance'], service: 'water-heater' },
  { keywords: ['tankless water heater'], service: 'tankless-water-heater' },
  { keywords: ['heat pump water heater', 'heat pump installation', 'heat pump repair', 'heat pump maintenance'], service: 'heat-pump' },
  { keywords: ['jetting', 'drain', 'cleaning'], service: 'drain-cleaning' },
  { keywords: ['clogged toilet', 'toilet clog', 'running toilet'], service: 'clogged-toilet' },
  { keywords: ['broken pipe', 'pipe repair', 'pipe replacement'], service: 'pipe-repair' },
  { keywords: ['sewer line', 'sewer cleaning'], service: 'sewer-line' },
  { keywords: ['faucet install', 'faucet repair', 'faucet leak'], service: 'faucet' },
  { keywords: ['garbage disposal'], service: 'garbage-disposal' },
  { keywords: ['emergency plumb', '24 hour plumb', '24/7 plumb'], service: 'emergency-plumbing' },
  { keywords: ['repiping', 'repipe'], service: 'repiping' },
  { keywords: ['plumber', 'plumbing'], service: 'plumbing-general' },
  { keywords: ['anatomy', 'water heater gas line', 'water heater gas control', 'pilot light', 'cold water inlet'], service: 'anatomy-article' },
];

function categorizeKeyword(query) {
  const q = query.toLowerCase();
  
  // Detect location
  let location = null;
  for (const loc of locations) {
    if (q.includes(loc.name)) {
      location = loc.page;
      break;
    }
  }
  
  // Detect service
  let service = null;
  for (const svc of services) {
    for (const kw of svc.keywords) {
      if (q.includes(kw)) {
        service = svc.service;
        break;
      }
    }
    if (service) break;
  }
  
  // Determine the target page
  let targetPage = 'uncategorized.mdx';
  
  if (service === 'anatomy-article') {
    if (q.includes('gas line') || q.includes('gas supply')) {
      targetPage = 'anatomy-of-a-water-heater-gas-line.mdx';
    } else if (q.includes('gas control') || q.includes('gas valve')) {
      targetPage = 'anatomy-of-a-water-heater-gas-valve.mdx';
    } else if (q.includes('pilot light')) {
      targetPage = 'anatomy-of-a-water-heater-light-pilot.mdx';
    } else if (q.includes('cold water inlet') || q.includes('hot water')) {
      targetPage = 'anatomy-of-a-water-heater-hot-cold.mdx';
    } else {
      targetPage = 'anatomy-of-a-water-heater.mdx';
    }
  } else if (location && service) {
    // Location + Service combo
    if (service === 'water-heater') {
      // Try multiple naming patterns for water heater pages
      const patterns = [
        `water-heater-${location}.mdx`,
        `water-heater-repair-${location}.mdx`,
        `water-heater-installation-${location}.mdx`,
      ];
      targetPage = patterns.find(p => pageExists(p)) || `water-heater-${location}.mdx`;
    } else if (service === 'drain-cleaning') {
      targetPage = `drain-cleaning-${location}.mdx`;
    } else if (service === 'clogged-toilet') {
      targetPage = `clogged-toilet-${location}.mdx`;
    } else if (service === 'heat-pump') {
      targetPage = `heat-pump-${location}.mdx`;
    } else if (service === 'plumbing-general') {
      targetPage = `${location}-plumbing.mdx`;
    } else {
      // Default to region page for other service+location combos
      targetPage = `${location}-plumbing.mdx`;
    }
  } else if (location) {
    // Location only
    targetPage = `${location}-plumbing.mdx`;
  } else if (service) {
    // Service only (no location)
    if (service === 'water-heater') {
      targetPage = 'water-heater-repair-and-replacement.mdx';
    } else if (service === 'drain-cleaning') {
      targetPage = 'clogged-drains-rootered.mdx';
    } else if (service === 'clogged-toilet') {
      targetPage = 'clogged-or-running-toilets.mdx';
    } else if (service === 'pipe-repair') {
      targetPage = 'pipe-repair-and-replacement.mdx';
    } else if (service === 'sewer-line') {
      targetPage = 'sewer-line-repair-and-replacement.mdx';
    } else if (service === 'emergency-plumbing') {
      targetPage = 'emergency-plumbing-services.mdx';
    } else if (service === 'faucet') {
      targetPage = 'faucet-leaks-repaired.mdx';
    } else if (service === 'garbage-disposal') {
      targetPage = 'garbage-disposal-repair-or-installation.mdx';
    } else if (service === 'tankless-water-heater') {
      targetPage = 'tankless-water-heater.mdx';
    } else if (service === 'heat-pump') {
      targetPage = 'heat-pump-water-heater.mdx';
    } else if (service === 'hydro-jetting') {
      targetPage = 'hydro-jetting.mdx';
    } else if (service === 'repiping') {
      targetPage = 'whole-house-repiping.mdx';
    } else if (service === 'plumbing-general') {
      targetPage = 'homepage-or-services.mdx';
    }
  }
  
  // Check if the page actually exists in the filesystem
  const exists = pageExists(targetPage);
  
  return { targetPage, exists };
}

async function main() {
  const inputFile = process.argv[2] || '/Users/doubletap/Documents/GoFlow/SEO/AllKeywordsForWhichWeRank/Queries.csv';
  
  // Read CSV
  const content = await fs.readFile(inputFile, 'utf-8');
  const lines = content.trim().split('\n');
  const header = lines[0];
  const rows = lines.slice(1);
  
  // Categorize each keyword
  const grouped = {};
  
  for (const row of rows) {
    // Parse CSV - split by comma, handle the query which may contain special chars
    const parts = row.split(',');
    if (parts.length < 3) continue;
    
    // Query is everything except last two fields (impressions, position)
    const position = parts.pop();
    const impressions = parts.pop();
    const query = parts.join(',').replace(/^"|"$/g, '').trim();
    
    // Skip excluded keywords
    if (shouldExclude(query)) continue;
    
    const { targetPage, exists } = categorizeKeyword(query);
    
    if (!grouped[targetPage]) {
      grouped[targetPage] = {
        exists,
        keywords: []
      };
    }
    
    grouped[targetPage].keywords.push({ query, impressions, position });
  }
  
  // Sort pages: existing first, then by total impressions
  const sortedPages = Object.entries(grouped).sort((a, b) => {
    // Existing pages first
    if (a[1].exists !== b[1].exists) {
      return a[1].exists ? -1 : 1;
    }
    // Then by total impressions
    const aImpressions = a[1].keywords.reduce((sum, k) => sum + parseInt(k.impressions), 0);
    const bImpressions = b[1].keywords.reduce((sum, k) => sum + parseInt(k.impressions), 0);
    return bImpressions - aImpressions;
  });
  
  // Output grouped CSV
  console.log('Target Page,Exists,Query,Impressions,Position');
  
  for (const [page, data] of sortedPages) {
    // Sort keywords by position descending (higher position = lower in results, so we want those first to see improvement opportunities)
    data.keywords.sort((a, b) => parseFloat(b.position) - parseFloat(a.position));
    
    // Output group header row
    console.log(`${page},${data.exists ? 'YES' : 'NO'},,,`);
    
    // Output keywords under this group
    for (const kw of data.keywords) {
      console.log(`,,"${kw.query}",${kw.impressions},${kw.position}`);
    }
  }
}

main().catch(console.error);
