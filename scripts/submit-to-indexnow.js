/*
 * Submit URLs to IndexNow
 * 
 * Usage:
 * # Dry run mode
 * node scripts/submit-to-indexnow.js --dry-run
 * 
 * # Dry run with custom days threshold
 * node scripts/submit-to-indexnow.js --dry-run --days 14
 * 
 * # Normal mode
 * node scripts/submit-to-indexnow.js
 * 
 * # Normal mode with custom days threshold
 * node scripts/submit-to-indexnow.js --days 3
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseArgs } from 'node:util';

const execAsync = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
// Parse command line arguments
const { values: args } = parseArgs({
    options: {
        'dry-run': { type: 'boolean', default: false },
        'days': { type: 'string', default: '7' }
    }
});

// Configuration
const BASE_URL = 'https://goflow.plumbing';
const API_KEY = 'b4b09ded6168458eb56fbd9ec687fc62';
const DAYS_THRESHOLD = parseInt(args.days, 10); // Only submit URLs modified within last N days
const HISTORY_FILE = path.join(__dirname, '..', 'data', 'indexnow-history.json');
const DRY_RUN = args['dry-run'];

// Logger utility
const logger = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    success: (msg) => console.log(`[SUCCESS] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`)
};

// Git utilities
async function getCurrentBranch() {
    try {
        const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
        return stdout.trim();
    } catch (error) {
        throw new Error(`Failed to get current branch: ${error.message}`);
    }
}

async function getCurrentGitHash() {
    try {
        const { stdout } = await execAsync('git rev-parse HEAD');
        return stdout.trim();
    } catch (error) {
        throw new Error(`Failed to get current git hash: ${error.message}`);
    }
}

// Submission history utilities
function loadSubmissionHistory() {
    try {
        if (!fs.existsSync(HISTORY_FILE)) {
            return { submissions: [], lastGitHash: null };
        }
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (error) {
        logger.warn(`Failed to load submission history: ${error.message}`);
        return { submissions: [], lastGitHash: null };
    }
}

function saveSubmissionHistory(history) {
    try {
        // Ensure directory exists
        const dir = path.dirname(HISTORY_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        logger.error(`Failed to save submission history: ${error.message}`);
    }
}

// Git change detection
async function getModifiedFiles(lastHash) {
    try {
        if (!lastHash) return [];
        const { stdout } = await execAsync(`git log --name-only --pretty=format:"%H" ${lastHash}..HEAD`);
        return stdout
            .split('\n')
            .filter(file => file.startsWith('src/content/') && file.endsWith('.mdx'));
    } catch (error) {
        logger.error(`Failed to get modified files: ${error.message}`);
        return [];
    }
}

// Validate sitemap path exists
function validateSitemapPath(sitemapPath) {
    if (!fs.existsSync(sitemapPath)) {
        throw new Error(`Sitemap not found at: ${sitemapPath}`);
    }
}

// Check if URL was modified recently
function isRecentlyModified(lastmod) {
    if (!lastmod) return true; // Include if no lastmod date
    
    const modDate = new Date(lastmod);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - DAYS_THRESHOLD);
    
    return modDate >= threshold;
}

// Read and parse the sitemap
async function getUrlsFromSitemap() {
    const sitemapPath = path.join(__dirname, '..', 'dist', 'sitemap-0.xml');
    
    try {
        validateSitemapPath(sitemapPath);
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
        
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        });
        
        const parsed = parser.parse(sitemapContent);
        
        // Extract URLs and filter by date
        const urls = parsed.urlset.url
            .filter(entry => isRecentlyModified(entry.lastmod))
            .map(entry => ({
                url: entry.loc.replace(BASE_URL, ''),
                lastmod: entry.lastmod
            }));
        
        logger.info(`Found ${parsed.urlset.url.length} total URLs`);
        logger.info(`Filtered to ${urls.length} URLs modified in last ${DAYS_THRESHOLD} days`);
        
        return urls;
    } catch (error) {
        logger.error(`Failed to parse sitemap: ${error.message}`);
        throw error;
    }
}

// Submit URLs to IndexNow
async function submitToIndexNow(urls) {
    // Prepare the request data
    const data = JSON.stringify({
        'host': BASE_URL.replace(/^https?:\/\/|\/+$/g, ''),
        'key': API_KEY,
        'keyLocation': `${BASE_URL}/${API_KEY}.txt`,
        'urlList': urls.map(u => BASE_URL + u.url)
    });

    // Configure the request options
    const options = {
        hostname: 'www.bing.com',
        path: '/indexnow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 202) {
                    logger.success(`Successfully submitted ${urls.length} URLs`);
                    logger.info(`Response: ${responseData}`);
                    resolve({ statusCode: res.statusCode, data: responseData });
                } else {
                    logger.error(`Failed with status ${res.statusCode}: ${responseData}`);
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            logger.error(`Request failed: ${error.message}`);
            reject(error);
        });

        // Set timeout
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout after 10s'));
        });

        // Send the request
        req.write(data);
        req.end();
    });
}

// Main execution
async function main() {
    try {
        // Check if we're on main branch
        const currentBranch = await getCurrentBranch();
        if (currentBranch !== 'main') {
            logger.error('This script can only be run from the main branch');
            process.exit(1);
        }

        // Load submission history
        const history = loadSubmissionHistory();
        logger.info(`Last processed git hash: ${history.lastGitHash || 'none'}`)

        // Get modified files since last run
        const modifiedFiles = await getModifiedFiles(history.lastGitHash);
        logger.info(`Found ${modifiedFiles.length} modified content files since last run`);

        // Get current sitemap URLs
        const urls = await getUrlsFromSitemap();
        if (urls.length === 0) {
            logger.warn('No URLs found in sitemap');
            return;
        }

        // Filter URLs that need submission based on Git history
        const urlsToSubmit = urls.filter(url => {
            // If no history, submit all
            if (!history.lastGitHash) return true;

            // Check if corresponding content file was modified
            const contentFile = `src/content${url.url.replace(/\/$/, '')}.mdx`;
            return modifiedFiles.includes(contentFile);
        });

        if (urlsToSubmit.length === 0) {
            logger.info('No URLs need submission');
            return;
        }

        // Handle submission based on mode
        if (DRY_RUN) {
            logger.info('DRY RUN MODE - Would submit the following URLs:');
            urlsToSubmit.forEach(url => {
                logger.info(`  - ${url.url} (last modified: ${url.lastmod || 'unknown'})`);
            });
            logger.info(`Total URLs that would be submitted: ${urlsToSubmit.length}`);
        } else {
            // Actually submit URLs
            logger.info('Submitting URLs to IndexNow...');
            await submitToIndexNow(urlsToSubmit);

            // Update submission history
            const currentGitHash = await getCurrentGitHash();
            history.lastGitHash = currentGitHash;
            history.submissions.push(
                ...urlsToSubmit.map(url => ({
                    url: url.url,
                    lastSubmitted: new Date().toISOString(),
                    fileHash: currentGitHash
                }))
            );
            saveSubmissionHistory(history);
        }

        logger.success(`Updated submission history with ${urlsToSubmit.length} URLs`);
    } catch (error) {
        logger.error(`Failed to execute: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
main();
