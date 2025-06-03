import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Get the commit hash of when the current branch was created
 */
async function getBranchCreationCommit() {
  try {
    // Get current branch name
    const { stdout: branchName } = await execAsync('git rev-parse --abbrev-ref HEAD');
    // Get the commit where the branch diverged from main/master
    const { stdout: mergeBase } = await execAsync(`git merge-base origin/main ${branchName.trim()}`);
    return mergeBase.trim();
  } catch (error) {
    console.error('Error getting branch creation commit:', error);
    return null;
  }
}

/**
 * Check if a file has been modified in the current branch
 */
async function isFileModifiedInBranch(filePath, branchCreationCommit) {
  try {
    if (!branchCreationCommit) return true; // If we can't determine branch start, assume modified
    
    // Get the last commit that modified this file
    const { stdout: lastModifyCommit } = await execAsync(`git log -1 --format="%H" -- "${filePath}"`);
    
    if (!lastModifyCommit.trim()) return true; // New file
    
    // Check if the last modification is after the branch creation
    const { stdout: revList } = await execAsync(
      `git rev-list ${branchCreationCommit}..HEAD -- "${filePath}"`
    );
    
    return revList.trim().length > 0;
  } catch (error) {
    console.error(`Error checking if ${filePath} was modified:`, error);
    return true; // If we can't determine, assume modified
  }
}

/**
 * Get the last modified date of a file
 */
async function getLastModifiedDate(filePath) {
  try {
    const { stdout } = await execAsync(`git log -1 --format="%ad" --date=short -- "${filePath}"`);
    return stdout.trim() || new Date().toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Update the pubDate of a file if it has been modified in the current branch
 */
async function updatePubDate(filePath, branchCreationCommit) {
  try {
    // Check if file was modified in current branch
    const wasModified = await isFileModifiedInBranch(filePath, branchCreationCommit);
    if (!wasModified) {
      console.log(`Skipping ${filePath} - not modified in current branch`);
      return;
    }

    const content = await readFile(filePath, 'utf-8');
    const lastModified = await getLastModifiedDate(filePath);
    
    // Only update if the pubDate is different
    if (!content.includes(`pubDate: ${lastModified}`)) {
      const updatedContent = content.replace(
        /^(pubDate:).*$/m,
        `pubDate: ${lastModified}`
      );
      
      await writeFile(filePath, updatedContent);
      console.log(`Updated pubDate for ${filePath} to ${lastModified}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main() {
  // Get the commit hash when the branch was created
  const branchCreationCommit = await getBranchCreationCommit();
  console.log(`Branch creation commit: ${branchCreationCommit}`);

  // Get all MDX files
  const files = await glob('src/content/**/*.mdx');
  
  // Update pubDates only for files modified in current branch
  await Promise.all(files.map(file => updatePubDate(file, branchCreationCommit)));
}

main().catch(console.error);
