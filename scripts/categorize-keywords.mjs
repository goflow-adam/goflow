#!/usr/bin/env node

/**
 * Categorize Keywords by Page
 * 
 * Takes a CSV of search queries from Google Search Console and groups them 
 * by the most relevant page (existing or proposed) based on the site's architecture.
 * 
 * KEYWORD TYPES:
 *   This script helps identify four types of keywords for SEO analysis:
 * 
 *   Type 1: TARGETED & RANKING
 *     - Keywords we intentionally target in our content AND rank for in search
 *     - Identified by: Targeted=YES, Impressions>0, Position>0
 *     - Action: Monitor and optimize to improve position
 * 
 *   Type 2: NOT TARGETED & RANKING  
 *     - Keywords we rank for but don't explicitly target in our content
 *     - Identified by: Targeted=empty, Impressions>0, Position>0
 *     - Action: Consider adding to targeted keywords if relevant, or create content
 * 
 *   Type 3: TARGETED & NOT RANKING
 *     - Keywords we target in our content but don't rank for at all
 *     - Identified by: Targeted=YES, Impressions=0, Position=0
 *     - Action: Investigate why we're not ranking - content gaps, competition, etc.
 * 
 *   Type 4: NOT TARGETED & NOT RANKING (not in output)
 *     - Keywords users search for that we neither target nor rank for
 *     - These are NOT included in this script's output
 *     - To find these: Use keyword research tools, competitor analysis, or 
 *       review GSC queries that categorize to pages we don't have yet
 *     - Action: Evaluate for new content opportunities
 * 
 * RECOMMENDATIONS:
 *   The "Recommendation" column provides actionable guidance based on SERP page position
 *   and relative impressions (compared to your dataset's actual ranges).
 * 
 *   SERP Page Boundaries:
 *     - Page 1: Positions 1-10 (visible without scrolling past ads)
 *     - Page 2: Positions 11-20 (one click away from visibility)
 *     - Page 3+: Positions 21+ (rarely seen by searchers)
 * 
 *   Recommendation Values:
 *   MAINTAIN - Page 1, top 3 positions. Protect this position.
 *   OPTIMIZE - Page 1, positions 4-10. Push to top 3 for more clicks.
 *   QUICK WIN - Page 2 (positions 11-20). Close to page 1, worth the push.
 *   IMPROVE - Page 3 with above-median impressions. People are searching, worth effort.
 *   INVESTIGATE - Targeted but not ranking at all. Why? Competition? Content gaps?
 *   CONSIDER TARGETING - Ranking but not targeted. Add to keywords if relevant.
 *   LOW PRIORITY - Page 3+ with below-median impressions. Minimal opportunity.
 * 
 *   Note: Impression thresholds are calculated relative to YOUR dataset:
 *     - High impressions = top 25% of your keywords
 *     - Medium impressions = median (50th percentile)
 *     - Low impressions = bottom 25% of your keywords
 * 
 * PRIORITIZATION FRAMEWORK:
 *   High Priority (focus effort here):
 *     1. QUICK WIN - These are closest to driving traffic with minimal effort
 *     2. OPTIMIZE - Small improvements could move you to #1
 *     3. CONSIDER TARGETING - You're already ranking, capitalize on it
 * 
 *   Medium Priority (evaluate case by case):
 *     4. MAINTAIN - Monitor but don't over-invest
 *     5. IMPROVE - Only if keyword is strategically important
 * 
 *   Low Priority (reduce or eliminate effort):
 *     6. INVESTIGATE - Either fix the root cause or stop targeting
 *     7. LOW PRIORITY - Minimal opportunity, focus elsewhere
 * 
 *   New Page Indicators:
 *     - Multiple CONSIDER TARGETING keywords clustering around a topic you don't have a page for
 *     - High-impression keywords categorizing to "proposed" pages (Exists=NO)
 * 
 * USAGE:
 *   node scripts/categorize-keywords.mjs <queries.csv> [keywords.csv]
 * 
 * ARGUMENTS:
 *   queries.csv   - Google Search Console queries export (required)
 *                   Expected format: Top queries,Clicks,Impressions,CTR,Position
 *   keywords.csv  - Extracted keywords from extract-keywords.mjs (optional)
 *                   Used to mark which ranking queries match targeted keywords
 * 
 * OUTPUT:
 *   CSV to stdout with columns: Target Page,Exists,Query,Impressions,Position,Targeted,Overlaps,Recommendation
 *   - Grouped by geographic silos (city pages together) then general services
 *   - Within each page: ranked keywords sorted by position, then unranked targeted keywords
 * 
 * EXAMPLES:
 *   # Basic usage - categorize queries without targeted keyword matching
 *   node scripts/categorize-keywords.mjs ~/Downloads/Queries.csv > categorized.csv
 * 
 *   # With targeted keyword matching from a file
 *   node scripts/categorize-keywords.mjs ~/Downloads/Queries.csv data/keywords.csv > categorized.csv
 * 
 *   # With targeted keyword matching piped from extract-keywords
 *   node scripts/extract-keywords.mjs | \
 *     node scripts/categorize-keywords.mjs ~/Downloads/Queries.csv /dev/stdin > categorized.csv
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
    } else if (service === 'emergency-plumbing') {
      targetPage = `emergency-plumbing-${location}.mdx`;
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

// Load targeted keywords from extract-keywords.mjs output
async function loadTargetedKeywords(targetedKeywordsFile) {
  const pageKeywords = new Map(); // Map<filename, Set<keyword>>
  
  if (!targetedKeywordsFile) {
    return pageKeywords; // Return empty map if no file provided
  }
  
  try {
    const content = await fs.readFile(targetedKeywordsFile, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Skip header: File,Type,Title,Keywords
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Parse CSV with quoted fields
      const matches = line.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/)
      if (!matches) continue;
      
      const [, filePath, type, title, keywordsStr] = matches;
      
      // Extract filename from path (e.g., "src/content/services/water-heater-repair.mdx" -> "water-heater-repair.mdx")
      const filename = path.basename(filePath);
      
      // Parse keywords
      const keywords = keywordsStr
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);
      
      if (keywords.length > 0) {
        pageKeywords.set(filename, new Set(keywords));
      }
    }
  } catch (error) {
    console.error(`Warning: Could not load targeted keywords from ${targetedKeywordsFile}`);
    console.error('Run extract-keywords.mjs first to enable targeted keyword matching.');
  }
  
  return pageKeywords;
}

// Check if a query exactly matches any targeted keyword for a page
function isTargetedKeyword(query, targetPage, pageKeywords) {
  const keywords = pageKeywords.get(targetPage);
  if (!keywords) return false;
  
  const q = query.toLowerCase().trim();
  
  // Exact match only
  return keywords.has(q);
}

// Find overlapping keywords (query contains keyword - i.e., query is a longer phrase containing the targeted keyword)
function findOverlappingKeywords(query, targetPage, pageKeywords) {
  const keywords = pageKeywords.get(targetPage);
  if (!keywords) return [];
  
  const q = query.toLowerCase().trim();
  const overlaps = [];
  
  for (const keyword of keywords) {
    // Skip exact matches (those go in Targeted column)
    if (q === keyword) continue;
    
    // Check if query contains keyword (query is longer phrase containing the targeted keyword)
    if (q.includes(keyword)) {
      overlaps.push(keyword);
    }
  }
  
  return overlaps;
}

// Determine recommendation based on position, impressions, and targeting status
// Uses relative thresholds calculated from the dataset
function getRecommendation(position, impressions, targeted, unranked, stats) {
  const pos = parseFloat(position);
  const imp = parseInt(impressions);
  
  // Type 3: Targeted but not ranking
  if (unranked || (pos === 0 && imp === 0)) {
    return 'INVESTIGATE';
  }
  
  // Calculate which SERP page this keyword is on (1-10 = page 1, 11-20 = page 2, etc.)
  const serpPage = Math.ceil(pos / 10);
  
  // Relative impression thresholds based on dataset
  const highImpressions = stats.impressionP75;  // Top 25% of impressions
  const medImpressions = stats.impressionP50;   // Median impressions
  const lowImpressions = stats.impressionP25;   // Bottom 25% of impressions
  
  // Type 2: Ranking but not targeted
  if (!targeted) {
    // High impressions = definitely consider targeting
    if (imp >= medImpressions) {
      return 'CONSIDER TARGETING';
    }
    // Low impressions and beyond page 2 = low priority
    if (imp < lowImpressions && serpPage > 2) {
      return 'LOW PRIORITY';
    }
    return 'CONSIDER TARGETING';
  }
  
  // Type 1: Targeted and ranking - prioritize by SERP page and relative impressions
  
  // Page 1 (positions 1-10)
  if (serpPage === 1) {
    if (pos <= 3) {
      return 'MAINTAIN';  // Top 3 - protect this position
    }
    return 'OPTIMIZE';  // Positions 4-10 - push to top 3
  }
  
  // Page 2 (positions 11-20) - these are quick wins, close to page 1
  if (serpPage === 2) {
    if (imp >= medImpressions) {
      return 'QUICK WIN';  // Good impressions, worth the push
    }
    return 'QUICK WIN';  // Still worth pushing to page 1
  }
  
  // Page 3+ (positions 21+)
  if (serpPage === 3) {
    if (imp >= highImpressions) {
      return 'IMPROVE';  // High impressions despite poor position - opportunity
    }
    if (imp >= medImpressions) {
      return 'IMPROVE';  // Decent impressions, may be worth effort
    }
    return 'LOW PRIORITY';  // Low impressions, far from page 1
  }
  
  // Page 4+ (positions 31+)
  if (imp >= highImpressions) {
    return 'IMPROVE';  // High impressions = people are searching, worth effort
  }
  return 'LOW PRIORITY';  // Far from page 1 with low impressions
}

// Calculate statistics for relative scoring
function calculateStats(keywords) {
  const impressions = keywords
    .filter(k => !k.unranked && parseInt(k.impressions) > 0)
    .map(k => parseInt(k.impressions))
    .sort((a, b) => a - b);
  
  const positions = keywords
    .filter(k => !k.unranked && parseFloat(k.position) > 0)
    .map(k => parseFloat(k.position))
    .sort((a, b) => a - b);
  
  if (impressions.length === 0) {
    return { impressionP25: 10, impressionP50: 50, impressionP75: 100, minPos: 1, maxPos: 100 };
  }
  
  const p25Idx = Math.floor(impressions.length * 0.25);
  const p50Idx = Math.floor(impressions.length * 0.50);
  const p75Idx = Math.floor(impressions.length * 0.75);
  
  return {
    impressionP25: impressions[p25Idx] || 1,
    impressionP50: impressions[p50Idx] || 10,
    impressionP75: impressions[p75Idx] || 50,
    minPos: positions[0] || 1,
    maxPos: positions[positions.length - 1] || 100
  };
}

function printUsage() {
  console.error('Usage: node categorize-keywords.mjs <queries.csv> [keywords.csv]');
  console.error('');
  console.error('Arguments:');
  console.error('  queries.csv   - Google Search Console queries export (required)');
  console.error('  keywords.csv  - Extracted keywords from extract-keywords.mjs (optional)');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/categorize-keywords.mjs ~/Downloads/Queries.csv');
  console.error('  node scripts/extract-keywords.mjs | node scripts/categorize-keywords.mjs ~/Downloads/Queries.csv /dev/stdin');
}

async function main() {
  const inputFile = process.argv[2];
  const targetedKeywordsFile = process.argv[3] || null;
  
  if (!inputFile) {
    printUsage();
    process.exit(1);
  }
  
  // Load targeted keywords
  const pageKeywords = await loadTargetedKeywords(targetedKeywordsFile);
  
  // Read CSV
  const content = await fs.readFile(inputFile, 'utf-8');
  const lines = content.trim().split('\n');
  const header = lines[0];
  const rows = lines.slice(1);
  
  // Categorize each keyword
  const grouped = {};
  
  for (const row of rows) {
    // Parse CSV - format: Top queries,Clicks,Impressions,CTR,Position
    const parts = row.split(',');
    if (parts.length < 5) continue;
    
    // Extract fields by position
    const position = parts.pop();           // Position (last)
    const ctr = parts.pop();                // CTR (skip)
    const impressions = parts.pop();        // Impressions
    const clicks = parts.pop();             // Clicks (skip)
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
    
    // Check if this is a targeted keyword (exact match)
    const targeted = isTargetedKeyword(query, targetPage, pageKeywords);
    
    // Find overlapping keywords from the same page
    const overlaps = findOverlappingKeywords(query, targetPage, pageKeywords);
    
    grouped[targetPage].keywords.push({ query, impressions, position, targeted, overlaps });
  }
  
  // Add unranked targeted keywords (type 3: targeted but not ranking)
  // For each page with targeted keywords, check if any are missing from the ranked queries
  for (const [filename, keywords] of pageKeywords) {
    // Get all ranked queries for this page (normalized to lowercase)
    const rankedQueries = new Set();
    if (grouped[filename]) {
      for (const kw of grouped[filename].keywords) {
        rankedQueries.add(kw.query.toLowerCase().trim());
      }
    }
    
    // Find targeted keywords that aren't in the ranked queries
    for (const keyword of keywords) {
      if (!rankedQueries.has(keyword)) {
        // This is a targeted keyword we're not ranking for
        if (!grouped[filename]) {
          grouped[filename] = {
            exists: pageExists(filename),
            keywords: []
          };
        }
        grouped[filename].keywords.push({
          query: keyword,
          impressions: 0,
          position: 0,
          targeted: true,
          overlaps: [],
          unranked: true  // Flag to identify these in output
        });
      }
    }
  }
  
  // Calculate statistics for relative scoring from all keywords
  const allKeywords = Object.values(grouped).flatMap(g => g.keywords);
  const stats = calculateStats(allKeywords);
  
  // City silo definitions - order matters for output
  const citySilos = [
    'santa-rosa',
    'petaluma', 
    'novato',
    'san-rafael',
    'healdsburg',
    'sonoma',
    'mill-valley',
  ];
  
  // County silos
  const countySilos = [
    'sonoma-county',
    'marin-county',
  ];
  
  // Service page patterns within a city silo
  const siloServicePatterns = [
    '-plumbing.mdx',           // e.g., santa-rosa-plumbing.mdx
    'drain-cleaning-',         // e.g., drain-cleaning-santa-rosa.mdx
    'emergency-plumbing-',     // e.g., emergency-plumbing-santa-rosa.mdx
    'water-heater-',           // e.g., water-heater-repair-santa-rosa.mdx
  ];
  
  // Helper to extract city from page name
  function getCityFromPage(page) {
    for (const city of citySilos) {
      if (page.includes(city)) {
        return city;
      }
    }
    return null;
  }
  
  // Helper to extract county from page name
  function getCountyFromPage(page) {
    for (const county of countySilos) {
      if (page.includes(county)) {
        return county;
      }
    }
    return null;
  }
  
  // Group pages into silos
  const siloGroups = {};
  const generalServices = {};
  
  for (const [page, data] of Object.entries(grouped)) {
    const city = getCityFromPage(page);
    const county = getCountyFromPage(page);
    
    if (city) {
      if (!siloGroups[city]) {
        siloGroups[city] = {};
      }
      siloGroups[city][page] = data;
    } else if (county) {
      if (!siloGroups[county]) {
        siloGroups[county] = {};
      }
      siloGroups[county][page] = data;
    } else {
      generalServices[page] = data;
    }
  }
  
  // Helper to output a page group
  function outputPageGroup(page, data) {
    // Sort keywords: ranked keywords by position ascending, then unranked at the end
    data.keywords.sort((a, b) => {
      // Unranked keywords (position 0) go to the end
      if (a.unranked && !b.unranked) return 1;
      if (!a.unranked && b.unranked) return -1;
      // Both unranked: sort alphabetically
      if (a.unranked && b.unranked) return a.query.localeCompare(b.query);
      // Both ranked: sort by position ascending (lower = better)
      return parseFloat(a.position) - parseFloat(b.position);
    });
    
    // Output group header row
    console.log(`${page},${data.exists ? 'YES' : 'NO'},,,,,,`);
    
    // Output keywords under this group
    for (const kw of data.keywords) {
      const overlapsStr = kw.overlaps.length > 0 ? kw.overlaps.join('; ') : '';
      const recommendation = getRecommendation(kw.position, kw.impressions, kw.targeted, kw.unranked, stats);
      console.log(`,,"${kw.query}",${kw.impressions},${kw.position},${kw.targeted ? 'YES' : ''},"${overlapsStr}",${recommendation}`);
    }
  }
  
  // Helper to sort pages within a silo by total impressions
  function sortByImpressions(pages) {
    return Object.entries(pages).sort((a, b) => {
      // Existing pages first
      if (a[1].exists !== b[1].exists) {
        return a[1].exists ? -1 : 1;
      }
      // Then by total impressions
      const aImpressions = a[1].keywords.reduce((sum, k) => sum + parseInt(k.impressions), 0);
      const bImpressions = b[1].keywords.reduce((sum, k) => sum + parseInt(k.impressions), 0);
      return bImpressions - aImpressions;
    });
  }
  
  // Output grouped CSV
  console.log('Target Page,Exists,Query,Impressions,Position,Targeted,Overlaps,Recommendation');
  
  // Output city silos first (in defined order)
  for (const city of citySilos) {
    if (siloGroups[city]) {
      // Add silo header
      console.log(`--- ${city.toUpperCase().replace(/-/g, ' ')} SILO ---,,,,,,,`);
      
      const sortedPages = sortByImpressions(siloGroups[city]);
      for (const [page, data] of sortedPages) {
        outputPageGroup(page, data);
      }
    }
  }
  
  // Output county silos
  for (const county of countySilos) {
    if (siloGroups[county]) {
      // Add silo header
      console.log(`--- ${county.toUpperCase().replace(/-/g, ' ')} SILO ---,,,,,,,`);
      
      const sortedPages = sortByImpressions(siloGroups[county]);
      for (const [page, data] of sortedPages) {
        outputPageGroup(page, data);
      }
    }
  }
  
  // Output general services last
  if (Object.keys(generalServices).length > 0) {
    console.log(`--- GENERAL SERVICES ---,,,,,,,`);
    
    const sortedPages = sortByImpressions(generalServices);
    for (const [page, data] of sortedPages) {
      outputPageGroup(page, data);
    }
  }
}

main().catch(console.error);
