import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check if we're running in a CI environment
 */
function isCI() {
  return Boolean(process.env.CI || process.env.VERCEL);
}

/**
 * Get the current branch name
 */
async function getCurrentBranch() {
  // In CI, prefer environment variables for branch name
  if (isCI()) {
    const branch = process.env.VERCEL_GIT_COMMIT_REF || // Vercel
                  process.env.GITHUB_REF_NAME ||        // GitHub Actions
                  process.env.BRANCH_NAME;              // Generic CI
    if (branch) return branch;
  }

  // Fallback to git command
  const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
  return stdout.trim();
}

/**
 * Get the commit hash of when the current branch was created
 */
async function getBranchCreationCommit() {
  try {
    // Get current branch name
    const branchName = await getCurrentBranch();
    // Get the commit where the branch diverged from main/master
    const { stdout: mergeBase } = await execAsync(`git merge-base origin/main ${branchName}`);
    return mergeBase.trim();
  } catch (error) {
    console.error('Error getting branch creation commit:', error);
    return null;
  }
}

/**
 * Check if file has real content changes since branch creation (ignoring pubDate changes)
 */
async function hasRealChanges(filePath) {
  // In CI, we can't reliably check changes, so we'll use a different strategy
  if (isCI()) {
    try {
      // In CI, we'll check if the file was modified in the last commit
      // This works because Vercel deploys on a per-commit basis
      const { stdout } = await execAsync(
        `git diff --name-only HEAD^ HEAD -- "${filePath}"`
      );
      return stdout.trim().length > 0;
    } catch (error) {
      console.error(`Error checking changes in CI for ${filePath}:`, error);
      return false; // Be conservative in CI
    }
  }

  try {
    const mergeBase = await getMergeBase();
    if (!mergeBase) return true; // If we can't determine branch point, assume modified

    // Get the diff from merge-base to HEAD, excluding pubDate changes
    const { stdout } = await execAsync(
      `git diff --unified=0 ${mergeBase} -- "${filePath}" | ` +
      `grep -v '^[+-]pubDate:'`
    );
    
    // If there are other changes besides pubDate, return true
    return stdout.trim().length > 0;
  } catch (error) {
    if (error.code === 1 && !error.stdout && !error.stderr) {
      // grep returns 1 when no matches found, this is normal
      return false;
    }
    console.error(`Error checking for real changes in ${filePath}:`, error);
    return false;
  }
}

/**
 * Get the merge base of the current branch
 */
async function getMergeBase() {
  try {
    const branchName = await getCurrentBranch();
    const { stdout: mergeBase } = await execAsync(`git merge-base origin/main ${branchName}`);
    return mergeBase.trim();
  } catch (error) {
    console.error('Error getting merge base:', error);
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
  // Get current branch
  const currentBranch = await getCurrentBranch();

  // Skip updates in specific conditions
  if (
    // Skip on main/master branch
    currentBranch === 'main' || 
    currentBranch === 'master' ||
    // Skip in production deployment
    process.env.VERCEL_ENV === 'production' ||
    // Skip in preview if not explicitly enabled
    (isCI() && !process.env.ENABLE_PREVIEW_PUBDATE_UPDATES)
  ) {
    console.log(`Skipping pubDate updates (branch: ${currentBranch}, env: ${isCI() ? 'CI' : 'local'})`);
    return;
  }

  // Get all MDX files
  const files = await glob('src/content/**/*.mdx');
  
  // In CI, we don't need branch creation commit
  if (isCI()) {
    console.log('Running in CI environment - using simplified change detection');
    await Promise.all(files.map(file => updatePubDate(file, null)));
    return;
  }

  // In local development, use full git history
  const branchCreationCommit = await getBranchCreationCommit();
  console.log(`Branch creation commit: ${branchCreationCommit}`);
  await Promise.all(files.map(file => updatePubDate(file, branchCreationCommit)));
}

main().catch(console.error);
