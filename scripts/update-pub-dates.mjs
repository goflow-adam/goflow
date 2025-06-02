import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getLastModifiedDate(filePath) {
  try {
    const { stdout } = await execAsync(`git log -1 --format="%ad" --date=short -- "${filePath}"`);
    return stdout.trim();
  } catch (error) {
    // If file is not in git, use current date
    return new Date().toISOString().split('T')[0];
  }
}

async function updatePubDate(filePath) {
  try {
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
  const files = await glob('src/content/**/*.mdx');
  await Promise.all(files.map(updatePubDate));
}

main().catch(console.error);
