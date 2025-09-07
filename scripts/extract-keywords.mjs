import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYAML } from 'yaml';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const contentDir = path.join(projectRoot, 'src', 'content');
const pagesDir = path.join(projectRoot, 'src', 'pages');
const dataDir = path.join(projectRoot, 'data');
const outputFile = path.join(dataDir, 'keywords.csv');
const consolidatedFile = path.join(dataDir, 'keywords-consolidated.csv');

async function ensureDataDirExists() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function findFiles(dir, extensions) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const matchingFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      matchingFiles.push(...await findFiles(fullPath, extensions));
    } else if (extensions.some(ext => file.name.endsWith(ext))) {
      matchingFiles.push(fullPath);
    }
  }

  return matchingFiles;
}

async function extractKeywordsFromMdx(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data } = matter(content);
  
  return {
    file: path.relative(projectRoot, filePath),
    type: 'mdx',
    keywords: (data.keywords || []).join(', '),
    title: data.title || ''
  };
}

async function extractKeywordsFromAstro(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    return {
      file: path.relative(projectRoot, filePath),
      type: 'astro',
      keywords: '',
      title: ''
    };
  }

  const frontmatter = frontmatterMatch[1];
  
  // Extract title from BaseLayout component props
  const titleMatch = content.match(/title="([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : '';
  
  // Look for schema-related keywords in the file
  const keywordMatches = content.match(/keywords?:.*?\[(.*?)\]/gs) || [];
  const keywords = keywordMatches
    .map(match => match.replace(/keywords?:.*?\[(.*?)\]/s, '$1'))
    .join(', ')
    .replace(/['"]/g, '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)
    .join(', ');

  return {
    file: path.relative(projectRoot, filePath),
    type: 'astro',
    keywords,
    title
  };
}

async function writeConsolidatedKeywords(results) {
  // Extract all keywords and deduplicate
  const allKeywords = new Set();
  results.forEach(({ keywords }) => {
    if (keywords) {
      keywords.split(',')
        .map(k => k.trim())
        .filter(k => k && k.length > 0) 
        .forEach(k => allKeywords.add(k));
    }
  });

  // Sort and join keywords
  const sortedKeywords = Array.from(allKeywords)
    .sort((a, b) => a.localeCompare(b, 'en'))
    .filter(k => k && k.length > 0)
    .join(',');
  
  // Write to file
  await fs.writeFile(consolidatedFile, sortedKeywords);
  console.log(`Consolidated keywords written to ${consolidatedFile}`);
  console.log(`Total unique keywords: ${allKeywords.size}`);
}

async function main() {
  try {
    await ensureDataDirExists();
    
    // Find all content files
    const mdxFiles = await findFiles(contentDir, ['.mdx']);
    const astroFiles = await findFiles(pagesDir, ['.astro']);
    
    // Extract keywords from each file
    const mdxResults = await Promise.all(mdxFiles.map(extractKeywordsFromMdx));
    const astroResults = await Promise.all(astroFiles.map(extractKeywordsFromAstro));
    const results = [...mdxResults, ...astroResults];
    
    // Create detailed CSV content
    const csvContent = ['File,Type,Title,Keywords\n'];
    results.forEach(({ file, type, title, keywords }) => {
      csvContent.push(`"${file}","${type}","${title}","${keywords}"\n`);
    });
    
    // Write detailed CSV
    await fs.writeFile(outputFile, csvContent.join(''));
    console.log(`Detailed keywords extracted to ${outputFile}`);
    
    // Write consolidated keywords
    await writeConsolidatedKeywords(results);
    
    console.log(`Processed ${mdxFiles.length} MDX files and ${astroFiles.length} Astro files`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
