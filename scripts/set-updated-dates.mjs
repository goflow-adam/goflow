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
 * Extract current updatedDate from frontmatter
 */
function getCurrentUpdatedDate(content) {
  // Look for updatedDate in the frontmatter (between --- markers)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const match = frontmatter.match(/^updatedDate:\s*(.*)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Upsert updatedDate in frontmatter. If missing, insert it after pubDate when possible.
 */
async function updateFileContent(filePath, oldDate, newDate) {
  try {
    const content = await readFile(filePath, 'utf-8');

    const hasUpdatedDate = /^updatedDate:\s*.*$/m.test(content);
    let updatedContent = content;

    if (hasUpdatedDate) {
      updatedContent = updatedContent.replace(
        /^(updatedDate:\s*).*$/m,
        `$1${newDate}`
      );
    } else if (/^pubDate:\s*.*$/m.test(content)) {
      // Insert updatedDate after pubDate, preserving indentation (frontmatter keys are at column 0)
      updatedContent = updatedContent.replace(
        /^(pubDate:\s*.*)$/m,
        `$1\nupdatedDate: ${newDate}`
      );
    } else {
      // Fallback: insert updatedDate near the top of the frontmatter
      updatedContent = updatedContent.replace(
        /^---\n/, 
        `---\nupdatedDate: ${newDate}\n`
      );
    }

    await writeFile(filePath, updatedContent);
    console.log(`  ✓ Updated updatedDate from ${oldDate} to ${newDate}`);
  } catch (error) {
    console.error(`  ✗ Failed to update updatedDate: ${error.message}`);
  }
}

async function checkUpdatedDate(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const currentUpdatedDate = getCurrentUpdatedDate(content);
    const latestCommitDate = await getLatestCommitDate(filePath);
    
    // Always log the current state
    console.log(`\n${filePath}:`);
    console.log(`  - Current updatedDate: ${currentUpdatedDate || 'Not set'}`);
    console.log(`  - Latest commit: ${latestCommitDate || 'No git history'}`);

    // Update updatedDate if needed
    if (!currentUpdatedDate && latestCommitDate) {
      console.log(`  - Missing updatedDate, setting to ${latestCommitDate}`);
      await updateFileContent(filePath, 'Not set', latestCommitDate);
    } else if (currentUpdatedDate === 'draft' && latestCommitDate) {
      console.log(`  - Draft status, setting to ${latestCommitDate}`);
      await updateFileContent(filePath, 'draft', latestCommitDate);
    } else if (latestCommitDate && currentUpdatedDate < latestCommitDate) {
      // Only update if updatedDate is strictly older than the commit date
      console.log(`  - Content updated on ${latestCommitDate}, current updatedDate is ${currentUpdatedDate}`);
      await updateFileContent(filePath, currentUpdatedDate, latestCommitDate);
    } else if (latestCommitDate && currentUpdatedDate === latestCommitDate) {
      console.log(`  - Already up to date`);
    } else if (latestCommitDate && currentUpdatedDate > latestCommitDate) {
      console.log(`  - updatedDate (${currentUpdatedDate}) is newer than last commit (${latestCommitDate}), keeping current date`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main() {
  console.log('Starting updatedDate check...');
  
  const files = await glob('src/content/**/*.mdx');
  console.log(`Found ${files.length} MDX files to check`);
  
  if (files.length === 0) {
    console.log('No MDX files found in src/content/. Check if the path is correct.');
    return;
  }

  // Process files sequentially for clearer logging
  for (const file of files) {
    await checkUpdatedDate(file);
  }

  console.log('\nUpdatedDate check complete.');
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
