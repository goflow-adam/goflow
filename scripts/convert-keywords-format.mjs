#!/usr/bin/env node

/**
 * Convert Keywords Format
 * 
 * Converts old keyword format (simple string list) to new format (term + priority objects).
 * Priority is assigned in graduated fashion based on sequence (first = highest priority).
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const contentDir = path.join(projectRoot, 'src', 'content');

async function findMdxFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const mdxFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      mdxFiles.push(...await findMdxFiles(fullPath));
    } else if (file.name.endsWith('.mdx')) {
      mdxFiles.push(fullPath);
    }
  }

  return mdxFiles;
}

function isOldFormat(keywordsSection) {
  // Old format: simple list of strings starting with "  - keyword"
  // New format: objects with "  - term:" and "    priority:"
  return keywordsSection.includes('  - ') && !keywordsSection.includes('term:');
}

function convertKeywords(content) {
  // Find the keywords section in frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  
  // Find keywords block
  const keywordsMatch = frontmatter.match(/keywords:\n((?:  - [^\n]+\n?)+)/);
  if (!keywordsMatch) return null;

  const keywordsBlock = keywordsMatch[1];
  
  // Check if already in new format
  if (!isOldFormat(keywordsBlock)) return null;

  // Extract keywords
  const keywords = keywordsBlock
    .split('\n')
    .filter(line => line.trim().startsWith('- '))
    .map(line => line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '').trim());

  if (keywords.length === 0) return null;

  // Calculate graduated priorities (first keyword gets highest priority)
  // Use a scale that decreases: 100, 80, 60, 45, 35, 25, 20, 15, 10, 5, 1, 1, 1...
  const priorityScale = [100, 80, 60, 45, 35, 25, 20, 15, 10, 5];
  
  // Build new format
  const newKeywordsLines = keywords.map((kw, index) => {
    const priority = index < priorityScale.length ? priorityScale[index] : 1;
    return `  - term: "${kw}"\n    priority: ${priority}`;
  });

  const newKeywordsBlock = `keywords:\n${newKeywordsLines.join('\n')}\n`;

  // Replace old block with new block
  const newFrontmatter = frontmatter.replace(/keywords:\n((?:  - [^\n]+\n?)+)/, newKeywordsBlock);
  const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${newFrontmatter}\n---`);

  return newContent;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  console.log(dryRun ? 'DRY RUN - No files will be modified\n' : 'Converting files...\n');

  const mdxFiles = await findMdxFiles(contentDir);
  let convertedCount = 0;

  for (const filePath of mdxFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    const newContent = convertKeywords(content);

    if (newContent) {
      const relativePath = path.relative(projectRoot, filePath);
      console.log(`Converting: ${relativePath}`);
      
      if (!dryRun) {
        await fs.writeFile(filePath, newContent);
      }
      convertedCount++;
    }
  }

  console.log(`\n${dryRun ? 'Would convert' : 'Converted'} ${convertedCount} files`);
}

main().catch(console.error);
