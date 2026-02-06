#!/usr/bin/env node

/**
 * Compare Google Search Result with Frontmatter
 * 
 * This script takes a URL, finds the corresponding content file,
 * automatically opens Google search for that URL, and uses Claude API
 * to generate recommendations for improving title/description alignment.
 * 
 * Usage:
 *   node scripts/compare-search-result.mjs <url>
 *   node scripts/compare-search-result.mjs https://goflow.plumbing/articles/smart-shutoff-valves/
 * 
 * Environment:
 *   ANTHROPIC_API_KEY - Your Anthropic API key
 *   SERP_API_KEY - (Optional) SerpAPI key for fully automated SERP fetching
 * 
 * Workflow:
 *   1. Script finds the content file and extracts frontmatter
 *   2. Opens Google search for site:your-url in your browser
 *   3. You paste the title and description Google is showing
 *   4. Claude analyzes the discrepancy and provides recommendations
 * 
 * If SERP_API_KEY is set, step 2-3 are automated.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import readline from 'readline';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const contentDir = path.join(projectRoot, 'src', 'content');

// Get API keys from environment
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function multilineQuestion(rl, prompt) {
  console.log(prompt);
  console.log('(Enter an empty line when done)');
  
  const lines = [];
  while (true) {
    const line = await question(rl, '');
    if (line === '') break;
    lines.push(line);
  }
  return lines.join(' ').trim();
}

/**
 * Open a URL in the default browser
 */
function openInBrowser(url) {
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error('Could not open browser automatically:', error.message);
    }
  });
}

/**
 * Fetch SERP data using SerpAPI (if key is available)
 */
async function fetchSerpData(url) {
  if (!SERP_API_KEY) {
    return null;
  }
  
  const searchQuery = `site:${url}`;
  const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${SERP_API_KEY}&num=1`;
  
  try {
    const response = await fetch(serpUrl);
    if (!response.ok) {
      console.error('SerpAPI error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.organic_results && data.organic_results.length > 0) {
      const result = data.organic_results[0];
      return {
        title: result.title || '',
        description: result.snippet || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('SerpAPI fetch error:', error.message);
    return null;
  }
}

/**
 * Convert a URL to a content file path
 * e.g., https://goflow.plumbing/articles/smart-shutoff-valves/ 
 *       -> src/content/articles/smart-shutoff-valves.mdx
 */
function urlToContentPath(url) {
  // Parse the URL
  let urlPath;
  try {
    const parsed = new URL(url);
    urlPath = parsed.pathname;
  } catch {
    // Assume it's already a path
    urlPath = url;
  }
  
  // Remove leading/trailing slashes
  urlPath = urlPath.replace(/^\/+|\/+$/g, '');
  
  // Map URL segments to content directories
  const segments = urlPath.split('/');
  
  // Handle different content types based on URL structure
  // /articles/xxx -> src/content/articles/xxx.mdx
  // /services/xxx -> src/content/services/xxx.mdx (but some are at root like /leak-detection/)
  // /regions/xxx -> src/content/regions/xxx.mdx
  // /xxx-plumbing -> src/content/regions/xxx-plumbing.mdx or src/content/cities/xxx-plumbing.mdx
  
  const contentMappings = [
    { prefix: 'articles', dir: 'articles' },
    { prefix: 'services', dir: 'services' },
    { prefix: 'regions', dir: 'regions' },
    { prefix: 'pages', dir: 'pages' },
  ];
  
  for (const mapping of contentMappings) {
    if (segments[0] === mapping.prefix) {
      const filename = segments.slice(1).join('/') + '.mdx';
      return path.join(contentDir, mapping.dir, filename);
    }
  }
  
  // For root-level URLs, check multiple possible locations
  const possiblePaths = [
    path.join(contentDir, 'pages', `${urlPath}.mdx`),
    path.join(contentDir, 'services', `${urlPath}.mdx`),
    path.join(contentDir, 'regions', `${urlPath}.mdx`),
    path.join(contentDir, 'cities', `${urlPath}.mdx`),
    path.join(contentDir, 'articles', `${urlPath}.mdx`),
  ];
  
  return possiblePaths;
}

async function findContentFile(url) {
  const possiblePaths = urlToContentPath(url);
  const pathsToCheck = Array.isArray(possiblePaths) ? possiblePaths : [possiblePaths];
  
  for (const filePath of pathsToCheck) {
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      // File doesn't exist, try next
    }
  }
  
  return null;
}

async function extractFrontmatter(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data } = matter(content);
  
  return {
    title: data.title || '',
    description: data.description || '',
    contentTitle: data.contentTitle || '',
    keywords: data.keywords || [],
  };
}

async function callClaudeAPI(frontmatter, googleData, url) {
  if (!ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY not set.');
    console.error('Set it via: export ANTHROPIC_API_KEY=your-key-here');
    process.exit(1);
  }
  
  const prompt = `You are an SEO expert helping optimize title and meta description tags for a plumbing company website (GoFlow Plumbing in Sonoma/Marin County, California).

## Current Situation

**URL:** ${url}

**Frontmatter (what we intend Google to show):**
- Title: "${frontmatter.title}"
- Description: "${frontmatter.description}"
- Content Title (H1): "${frontmatter.contentTitle}"
- Keywords: ${frontmatter.keywords.join(', ')}

**Google's Current Display (what Google is actually showing):**
- Title: "${googleData.title}"
- Description: "${googleData.description}"

## Your Task

1. **Analyze the discrepancy** between what we want Google to show and what Google is actually showing.

2. **Explain why** Google might be choosing different text (common reasons: title too long/short, description doesn't match search intent, Google pulling from page content instead, etc.)

3. **Recommend specific changes** to the frontmatter title and description that will:
   - Be more likely to be used by Google as-is
   - Maintain or improve click-through rate
   - Stay within optimal character limits (title: 50-60 chars, description: 150-160 chars)
   - Include relevant keywords naturally
   - Match the search intent for this type of page

4. **Provide the exact new title and description** I should use in the following format (this exact format is required for parsing):

\`\`\`recommended
TITLE: Your recommended title here
DESCRIPTION: Your recommended description here
\`\`\`

If no changes are needed, still provide the recommended block with the current values.

Be specific and actionable. If the current frontmatter is already good and Google is just being Google, say so.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

/**
 * Parse recommended title and description from Claude's response
 */
function parseRecommendations(analysis) {
  const recommendedMatch = analysis.match(/```recommended\s*\n([\s\S]*?)```/);
  
  if (!recommendedMatch) {
    return null;
  }
  
  const block = recommendedMatch[1];
  const titleMatch = block.match(/TITLE:\s*(.+)/);
  const descMatch = block.match(/DESCRIPTION:\s*(.+)/);
  
  if (!titleMatch || !descMatch) {
    return null;
  }
  
  return {
    title: titleMatch[1].trim(),
    description: descMatch[1].trim()
  };
}

/**
 * Update frontmatter in a file with new title and description
 */
async function updateFrontmatter(filePath, newTitle, newDescription) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: body } = matter(content);
  
  // Update the frontmatter
  data.title = newTitle;
  data.description = newDescription;
  
  // Reconstruct the file
  const newContent = matter.stringify(body, data);
  
  await fs.writeFile(filePath, newContent, 'utf-8');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/compare-search-result.mjs <url>');
    console.log('Example: node scripts/compare-search-result.mjs https://goflow.plumbing/articles/smart-shutoff-valves/');
    process.exit(1);
  }
  
  const url = args[0];
  
  // Clear the console
  console.clear();
  
  console.log(`\n🔍 Analyzing: ${url}\n`);
  
  // Find the content file
  const contentFile = await findContentFile(url);
  if (!contentFile) {
    console.error(`❌ Could not find content file for URL: ${url}`);
    console.error('Make sure the URL corresponds to a file in src/content/');
    process.exit(1);
  }
  
  console.log(`📄 Found content file: ${path.relative(projectRoot, contentFile)}`);
  
  // Extract frontmatter
  const frontmatter = await extractFrontmatter(contentFile);
  console.log('\n--- Current Frontmatter ---');
  console.log(`Title: ${frontmatter.title}`);
  console.log(`  (${frontmatter.title.length} chars)`);
  console.log(`Description: ${frontmatter.description}`);
  console.log(`  (${frontmatter.description.length} chars)`);
  
  let googleData;
  
  // Try SerpAPI first if available
  if (SERP_API_KEY) {
    console.log('\n🔄 Fetching Google search result via SerpAPI...');
    googleData = await fetchSerpData(url);
    
    if (googleData) {
      console.log('\n--- Google Search Result (via SerpAPI) ---');
      console.log(`Title: ${googleData.title}`);
      console.log(`Description: ${googleData.description}`);
    } else {
      console.log('⚠️  SerpAPI returned no results. Falling back to manual input.');
    }
  }
  
  // Fall back to manual input if no SerpAPI or no results
  if (!googleData) {
    // Build Google search URL and open it
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent('site:' + url)}`;
    
    console.log('\n--- Google Search Result ---');
    console.log('Opening Google search in your browser...');
    openInBrowser(googleSearchUrl);
    
    // Give the browser a moment to open
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`\n📋 Look at the search result in your browser.`);
    console.log(`   If no result appears, the page may not be indexed yet.\n`);
    
    const rl = createReadlineInterface();
    
    const googleTitle = await question(rl, 'Paste Google\'s displayed title (or press Enter if not indexed): ');
    
    let googleDescription = '';
    if (googleTitle) {
      googleDescription = await multilineQuestion(rl, 'Paste Google\'s displayed description:');
    }
    
    rl.close();
    
    if (!googleTitle) {
      console.log('\n⚠️  No Google data provided. Analyzing frontmatter only...');
      googleData = {
        title: '(page not indexed or no result found)',
        description: '(page not indexed or no result found)'
      };
    } else {
      googleData = {
        title: googleTitle,
        description: googleDescription || '(not provided)'
      };
    }
  }
  
  console.log('\n🤖 Analyzing with Claude...\n');
  
  try {
    const analysis = await callClaudeAPI(frontmatter, googleData, url);
    console.log('--- Analysis & Recommendations ---\n');
    console.log(analysis);
    console.log('\n--- End of Analysis ---\n');
    
    // Parse recommendations and offer to apply them
    const recommendations = parseRecommendations(analysis);
    
    if (recommendations) {
      const titleChanged = recommendations.title !== frontmatter.title;
      const descChanged = recommendations.description !== frontmatter.description;
      
      if (titleChanged || descChanged) {
        console.log('--- Parsed Recommendations ---');
        if (titleChanged) {
          console.log(`New Title: ${recommendations.title}`);
          console.log(`  (${recommendations.title.length} chars, was ${frontmatter.title.length})`);
        } else {
          console.log('Title: (no change)');
        }
        if (descChanged) {
          console.log(`New Description: ${recommendations.description}`);
          console.log(`  (${recommendations.description.length} chars, was ${frontmatter.description.length})`);
        } else {
          console.log('Description: (no change)');
        }
        console.log('');
        
        const rl = createReadlineInterface();
        const apply = await question(rl, 'Apply these changes to the file? (y/n): ');
        rl.close();
        
        if (apply.toLowerCase() === 'y' || apply.toLowerCase() === 'yes') {
          await updateFrontmatter(
            contentFile,
            titleChanged ? recommendations.title : frontmatter.title,
            descChanged ? recommendations.description : frontmatter.description
          );
          console.log(`\n✅ Updated ${path.relative(projectRoot, contentFile)}`);
        } else {
          console.log('\n⏭️  Changes not applied.');
        }
      } else {
        console.log('ℹ️  No changes recommended - current frontmatter looks good.');
      }
    } else {
      console.log('⚠️  Could not parse recommendations from analysis.');
      console.log('   You can manually copy the suggested title/description from above.');
    }
    
  } catch (error) {
    console.error('❌ Error calling Claude API:', error.message);
    process.exit(1);
  }
}

main();
