import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Get the date of the latest commit that modified this file
 */
async function getLatestCommitDate(filePath) {
  try {
    // Get the most recent commit that modified this file
    const { stdout } = await execAsync(
      `git log -1 --format="%ad" --date=short -- "${filePath}"`
    );
    return stdout.trim() || null;
  } catch (error) {
    console.error(`Error getting latest commit date for ${filePath}:`, error);
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
async function updateFileContent(filePath, oldDate, newDate) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const updatedContent = content.replace(
      /^(pubDate:\s*).*$/m,
      `$1${newDate}`
    );
    await writeFile(filePath, updatedContent);
    console.log(`  ✓ Updated pubDate from ${oldDate} to ${newDate}`);
  } catch (error) {
    console.error(`  ✗ Failed to update pubDate: ${error.message}`);
  }
}

async function checkPubDate(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const currentPubDate = getCurrentPubDate(content);
    const latestCommitDate = await getLatestCommitDate(filePath);
    
    // Always log the current state
    console.log(`\n${filePath}:`);
    console.log(`  - Current pubDate: ${currentPubDate || 'Not set'}`);
    console.log(`  - Latest commit: ${latestCommitDate || 'No git history'}`);

    // Update pubDate if needed
    if (!currentPubDate && latestCommitDate) {
      console.log(`  - Missing pubDate, setting to ${latestCommitDate}`);
      await updateFileContent(filePath, 'Not set', latestCommitDate);
    } else if (currentPubDate === 'draft' && latestCommitDate) {
      console.log(`  - Draft status, setting to ${latestCommitDate}`);
      await updateFileContent(filePath, 'draft', latestCommitDate);
    } else if (latestCommitDate && currentPubDate < latestCommitDate) {
      // Only update if pubDate is strictly older than the commit date
      console.log(`  - Content updated on ${latestCommitDate}, current pubDate is ${currentPubDate}`);
      await updateFileContent(filePath, currentPubDate, latestCommitDate);
    } else if (latestCommitDate && currentPubDate === latestCommitDate) {
      console.log(`  - Already up to date`);
    } else if (latestCommitDate && currentPubDate > latestCommitDate) {
      console.log(`  - pubDate (${currentPubDate}) is newer than last commit (${latestCommitDate}), keeping current date`);
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
