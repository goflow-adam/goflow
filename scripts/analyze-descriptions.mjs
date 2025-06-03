import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { parse } from 'yaml';

async function analyzeDescription(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const match = content.match(/---\n([\s\S]*?)\n---/);
    if (!match) return null;
    
    const frontmatter = parse(match[1]);
    const description = frontmatter.description;
    if (!description) return null;
    
    return {
      file: filePath,
      description,
      length: description.length,
      isShort: description.length < 150
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

async function main() {
  const files = await glob('src/content/**/*.mdx');
  const results = await Promise.all(files.map(analyzeDescription));
  const validResults = results.filter(Boolean);
  
  // Sort by length
  validResults.sort((a, b) => a.length - b.length);
  
  console.log('\nPages with descriptions under 150 characters:');
  console.log('==========================================');
  validResults
    .filter(r => r.isShort)
    .forEach(r => {
      console.log(`\nFile: ${r.file}`);
      console.log(`Length: ${r.length} characters`);
      console.log(`Description: ${r.description}`);
    });
    
  console.log('\nCharacter count distribution:');
  console.log('==========================');
  validResults.forEach(r => {
    console.log(`${r.file}: ${r.length} chars`);
  });
}

main().catch(console.error);
