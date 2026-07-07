#!/usr/bin/env node

/**
 * Enhances job descriptions from internal work notes to customer-facing copy.
 * Reads from jobPins.json, enhances descriptions, writes back to both JSON and CSV.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const SCRATCH_DIR = path.resolve(process.cwd(), 'scratch');
const JOB_PINS_JSON = path.join(DATA_DIR, 'jobPins.json');
const JOBS_CSV = path.join(SCRATCH_DIR, 'jobs.csv');

// Service type keywords for categorization
const SERVICE_CATEGORIES = {
  'drain': ['drain', 'clog', 'snake', 'blockage', 'rooter', 'sewer', 'waste line'],
  'toilet': ['toilet', 'flush', 'flapper', 'fill valve', 'wax ring'],
  'water heater': ['water heater', 'pilot', 'anode', 'expansion tank', 'burner'],
  'faucet': ['faucet', 'cartridge', 'handle', 'leak'],
  'garbage disposal': ['garbage disposal', 'disposal'],
  'gas line': ['gas line', 'gas pipe', 'gas fitting'],
  'water filtration': ['filter', 'filtration', 'reverse osmosis', 'ro system'],
  'pipe repair': ['pipe', 'leak', 'union', 'valve', 'fitting', 'copper', 'pvc'],
  'fixture': ['sink', 'tub', 'shower', 'bathtub', 'spout'],
  'smart water': ['moen flo', 'smart shutoff', 'water monitor'],
  'hose bib': ['hose bib', 'outdoor faucet', 'irrigation'],
  'water main': ['water main', 'main line', 'prv', 'pressure'],
};

function categorizeJob(description) {
  const lower = description.toLowerCase();
  const categories = [];
  
  for (const [category, keywords] of Object.entries(SERVICE_CATEGORIES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      categories.push(category);
    }
  }
  
  return categories.length > 0 ? categories : ['plumbing service'];
}

function enhanceDescription(original, city) {
  // Clean up the description
  let desc = original
    // Remove internal notes patterns
    .replace(/Task \d+\s*/gi, '')
    .replace(/Trip \d+[^.]*\./gi, '')
    .replace(/Phase \d+[^.]*\./gi, '')
    .replace(/Day \d+ visit fee[^.]*\./gi, '')
    .replace(/\d+ hours?\.?/gi, '')
    .replace(/Approx\.?\s*\d+\s*(hours?|ft|feet)/gi, '')
    .replace(/Price includes[^.]*\./gi, '')
    .replace(/Includes[^.]*parts[^.]*\./gi, '')
    // Remove pricing/estimate language
    .replace(/\$\d+/g, '')
    .replace(/estimate/gi, '')
    // Remove internal references
    .replace(/\([^)]*office[^)]*\)/gi, '')
    .replace(/\([^)]*bathroom[^)]*\)/gi, (match) => {
      // Keep bathroom references that are descriptive
      if (match.toLowerCase().includes('master') || match.toLowerCase().includes('guest') || match.toLowerCase().includes('hall')) {
        return match;
      }
      return '';
    })
    // Clean up job location duplicates
    .replace(/Job Location[^)]*\)/gi, '')
    // Remove "we will" future tense (convert to past)
    .replace(/we will/gi, 'we')
    .replace(/will be/gi, 'was')
    // Clean up multiple spaces and newlines
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure it starts with a capital letter
  if (desc.length > 0) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  // Ensure it ends with a period
  if (desc.length > 0 && !desc.endsWith('.') && !desc.endsWith('!')) {
    desc += '.';
  }

  // Clean up any double periods
  desc = desc.replace(/\.+/g, '.').replace(/\.\s*\./g, '.');

  return desc;
}

function generateShortDescription(enhanced, categories) {
  // Create a brief summary for cards/previews
  const categoryNames = categories.map(c => {
    switch(c) {
      case 'drain': return 'Drain Clearing';
      case 'toilet': return 'Toilet Repair';
      case 'water heater': return 'Water Heater Service';
      case 'faucet': return 'Faucet Repair';
      case 'garbage disposal': return 'Garbage Disposal Installation';
      case 'gas line': return 'Gas Line Installation';
      case 'water filtration': return 'Water Filtration';
      case 'pipe repair': return 'Pipe Repair';
      case 'fixture': return 'Fixture Service';
      case 'smart water': return 'Smart Water Monitor Installation';
      case 'hose bib': return 'Outdoor Faucet Installation';
      case 'water main': return 'Water Main Service';
      default: return 'Plumbing Service';
    }
  });

  return categoryNames[0] || 'Plumbing Service';
}

async function main() {
  console.log('Reading job pins...');
  const jobPins = JSON.parse(fs.readFileSync(JOB_PINS_JSON, 'utf-8'));
  
  console.log(`Enhancing ${jobPins.length} job descriptions...`);
  
  const enhanced = jobPins.map(job => {
    const categories = categorizeJob(job.description);
    const enhancedDesc = enhanceDescription(job.description, job.city);
    const shortDesc = generateShortDescription(enhancedDesc, categories);
    
    return {
      ...job,
      originalDescription: job.description,
      description: enhancedDesc,
      shortDescription: shortDesc,
      serviceCategories: categories,
    };
  });

  // Write enhanced JSON
  fs.writeFileSync(JOB_PINS_JSON, JSON.stringify(enhanced, null, 2));
  console.log(`Updated ${JOB_PINS_JSON}`);

  // Update CSV with enhanced descriptions
  console.log('Updating CSV...');
  const csvLines = fs.readFileSync(JOBS_CSV, 'utf-8').split('\n');
  const header = csvLines[0];
  
  // Add enhanced_description column if not present
  let newHeader = header;
  if (!header.includes('enhanced_description')) {
    newHeader = header.trimEnd() + ',enhanced_description';
  }

  // Create lookup by job_id
  const enhancedByJobId = {};
  for (const job of enhanced) {
    enhancedByJobId[job.jobId] = job.description;
  }

  // Process CSV - this is tricky because of multi-line descriptions
  // Read the original CSV properly
  const { parse } = await import('csv-parse/sync');
  const { stringify } = await import('csv-stringify/sync');
  
  const records = parse(fs.readFileSync(JOBS_CSV, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  // Add enhanced description to each record
  for (const record of records) {
    record.enhanced_description = enhancedByJobId[record.job_id] || record.job_description;
  }

  // Write back
  const output = stringify(records, { header: true });
  fs.writeFileSync(JOBS_CSV, output);
  console.log(`Updated ${JOBS_CSV}`);

  // Show some examples
  console.log('\n--- Sample Enhanced Descriptions ---\n');
  for (let i = 0; i < Math.min(5, enhanced.length); i++) {
    const job = enhanced[i];
    console.log(`Job ${job.jobId} (${job.city}):`);
    console.log(`  Categories: ${job.serviceCategories.join(', ')}`);
    console.log(`  Short: ${job.shortDescription}`);
    console.log(`  Original: ${job.originalDescription.substring(0, 80)}...`);
    console.log(`  Enhanced: ${job.description.substring(0, 80)}...`);
    console.log('');
  }
}

main().catch(console.error);
