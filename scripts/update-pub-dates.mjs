import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Get the date of the first commit that added this file
 */
async function getFirstCommitDate(filePath) {
  try {
    // Get the first commit that added this file
    const { stdout } = await execAsync(
      `git log --follow --format="%ad" --date=short --reverse -- "${filePath}" | head -n 1`
    );
    return stdout.trim() || null;
  } catch (error) {
    console.error(`Error getting first commit date for ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract current pubDate from frontmatter
 */
function getCurrentPubDate(content) {
  // Look for pubDate in the frontmatter (between --- markers)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const match = frontmatter.match(/^pubDate:\s*(.*)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Check if a file needs its pubDate initialized
 */
async function checkPubDate(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const currentPubDate = getCurrentPubDate(content);
    
    // Always log the current state
    if (!currentPubDate) {
      console.log(`\n${filePath}:\n  - No pubDate found in frontmatter`);
    } else {
      console.log(`\n${filePath}:\n  - Current pubDate: ${currentPubDate}`);
    }

    // Get the first commit date for reference
    const firstCommitDate = await getFirstCommitDate(filePath);
    if (firstCommitDate) {
      console.log(`  - First commit date: ${firstCommitDate}`);
    } else {
      console.log(`  - No git history found`);
    }

    // Analyze if any action is needed
    if (!currentPubDate) {
      console.log(`  - ATTENTION: Missing pubDate`);
    } else if (currentPubDate === 'draft') {
      console.log(`  - ATTENTION: Marked as draft`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main() {
  console.log('Starting pubDate check...');
  
  const files = await glob('src/content/**/*.mdx');
  console.log(`Found ${files.length} MDX files to check`);
  
  if (files.length === 0) {
    console.log('No MDX files found in src/content/. Check if the path is correct.');
    return;
  }

  // Process files sequentially for clearer logging
  for (const file of files) {
    await checkPubDate(file);
  }

  console.log('\nPubDate check complete.');
}

// Ensure we catch and log any errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('Error in main:', error);
  process.exit(1);
});
