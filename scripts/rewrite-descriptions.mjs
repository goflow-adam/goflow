import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const apiKey = readFileSync('/Users/doubletap/Projects/nextdoor-scraper/claude-api-key.txt', 'utf-8').trim();
const client = new Anthropic({ apiKey });

// Read the CSV
const csvContent = readFileSync('./scratch/jobs.csv', 'utf-8');
const records = parse(csvContent, { columns: true, skip_empty_lines: true });

// First 10 records are the user's examples (rows 2-11, index 0-9)
const examples = records.slice(0, 10);

// Build few-shot examples from user's rewrites
const fewShotExamples = examples.map(row => ({
  original: row.job_description,
  rewritten: row.enhanced_description
}));

console.log('Using these examples as style guide:');
fewShotExamples.forEach((ex, i) => {
  console.log(`\n--- Example ${i + 1} ---`);
  console.log(`Original: ${ex.original.substring(0, 80)}...`);
  console.log(`Rewritten: ${ex.rewritten.substring(0, 80)}...`);
});

// Process remaining records (index 10+)
const toRewrite = records.slice(10);
console.log(`\n\nRewriting ${toRewrite.length} descriptions...`);

async function rewriteDescription(original, city) {
  const message = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `You are rewriting plumbing job descriptions for a website. Match the writing style of these examples exactly.

EXAMPLES OF THE STYLE TO MATCH:

${fewShotExamples.map((ex, i) => `Example ${i + 1}:
Original: "${ex.original}"
Rewritten: "${ex.rewritten}"
`).join('\n')}

STYLE RULES:
- Start with context about the customer's problem or request
- Conversational, human tone (use "We", "Our customer", etc.)
- Explain the problem first, then the solution
- Remove internal notes, pricing details, part numbers, and technical jargon
- Short, clear sentences
- Don't mention specific hours, fees, or trip numbers
- Keep it brief (1-3 sentences typically)

NOW REWRITE THIS DESCRIPTION:
Original: "${original}"
City: ${city}

Return ONLY the rewritten description, nothing else.`
      }
    ]
  });

  return message.content[0].text.trim();
}

// Process in batches to avoid rate limits
async function processAll() {
  for (let i = 0; i < toRewrite.length; i++) {
    const row = toRewrite[i];
    const original = row.job_description;
    const current = row.enhanced_description;
    
    // Check if current enhanced_description looks like it needs rewriting
    // (if it's basically the same as original or has internal notes)
    const needsRewrite = 
      current === original ||
      current.includes('trip fee') ||
      current.includes('hours labor') ||
      current.includes('Price includes') ||
      current.includes('Includes all') ||
      current.length > 300 ||
      !current.startsWith('Our ') && !current.startsWith('Customer ') && !current.startsWith('We ') && !current.startsWith('The ') && !current.startsWith('A ') && !current.startsWith('During ');

    if (needsRewrite) {
      console.log(`\n[${i + 11}/${records.length}] Rewriting job ${row.job_id}...`);
      console.log(`  Original: ${original.substring(0, 60)}...`);
      
      try {
        const rewritten = await rewriteDescription(original, row.city);
        row.enhanced_description = rewritten;
        console.log(`  Rewritten: ${rewritten.substring(0, 60)}...`);
      } catch (err) {
        console.error(`  Error: ${err.message}`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } else {
      console.log(`[${i + 11}/${records.length}] Skipping job ${row.job_id} (already good)`);
    }
  }

  // Combine examples + rewritten records
  const allRecords = [...examples, ...toRewrite];
  
  // Write back to CSV
  const output = stringify(allRecords, { header: true });
  writeFileSync('./scratch/jobs.csv', output);
  console.log('\n✓ Updated scratch/jobs.csv');
}

processAll().catch(console.error);
