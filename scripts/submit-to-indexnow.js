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
        'days': { type: 'string', default: '7' },
        'force': { type: 'boolean', default: false }
    }
});


// Configuration
const BASE_URL = 'https://goflow.plumbing';
const API_KEY = 'b4b09ded6168458eb56fbd9ec687fc62';
const DAYS_THRESHOLD = parseInt(args.days, 10); // Only submit URLs modified within last N days
const HISTORY_FILE = path.join(__dirname, '..', 'data', 'indexnow-history.json');
const DRY_RUN = args['dry-run'];
const FORCE_ALL = args['force'];

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
            .filter(file => {
                // Include both content files and page files
                return (
                    (file.startsWith('src/content/') && file.endsWith('.mdx')) ||
                    (file.startsWith('src/pages/') && file.endsWith('.astro'))
                );
            });
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

// Check if URL was modified recently - always return true since we're using git history
function isRecentlyModified(lastmod) {
    return true;
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

    const statusCodes = {
        200: 'The URL was successfully submitted to the IndexNow API.',
        202: 'The IndexNow API received your URL. However, it still needs to validate the API key to confirm the URL belongs to your site.',
        400: 'The URL was not properly formatted.',
        403: 'The IndexNow API did not find your API key and cannot confirm the URL belongs to your site.',
        422: 'The URL belongs to another site and cannot be processed.',
        429: 'The IndexNow API received too many requests beyond the permitted quota of 10,000 requests per HTTP POST. You can refer to this article on how to fix the 429 response error.',
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 202 || res.statusCode === 200) {
                    logger.success(`Successfully submitted ${urls.length} URLs`);
                    logger.info(`Status code: ${res.statusCode}: ${statusCodes[res.statusCode]}`);
                    logger.info(`Response: ${responseData}`);
                    resolve({ statusCode: res.statusCode, data: responseData });
                } else {
                    logger.error(`Failed with status ${res.statusCode}: ${statusCodes[res.statusCode]}`);
                    logger.info(`Response: ${responseData}`);
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
        logger.info(`Found ${modifiedFiles.length} modified files (content + pages) since last run`);

        // Get current sitemap URLs
        const urls = await getUrlsFromSitemap();
        if (urls.length === 0) {
            logger.warn('No URLs found in sitemap');
            return;
        }

        // Filter URLs that need submission based on Git history (unless force flag is used)
        const urlsToSubmit = FORCE_ALL ? urls : urls.filter(url => {
            // If no history, submit all
            if (!history.lastGitHash) return true;

            // Map URL back to potential source files
            const possibleFiles = [
                // Content file (e.g. /blog/post/ -> src/content/blog/post.mdx)
                `src/content${url.url.replace(/\/$/, '')}.mdx`,
                // Content file with region prefix
                `src/content/regions${url.url.replace(/\/$/, '')}.mdx`,
                // Content file with services prefix
                `src/content/services${url.url.replace(/\/$/, '')}.mdx`,
                // Page file (e.g. /about-us/ -> src/pages/about-us.astro)
                `src/pages${url.url.replace(/\/$/, '')}.astro`,
                // Index page file (e.g. /blog/ -> src/pages/blog/index.astro)
                `src/pages${url.url.replace(/\/$/, '')}/index.astro`
            ];
            
            // Check if any of the possible file paths match our modified files
            const isModified = possibleFiles.some(file => modifiedFiles.includes(file));
            if (isModified) {
                logger.info(`Found modified file for URL: ${url.url}`);
                logger.info(`Possible files checked: ${possibleFiles.join(', ')}`);
            }
            return isModified;
        });

        if (FORCE_ALL) {
            logger.info('Force flag enabled - submitting all URLs regardless of modification status');
        }
        
        logger.info(`Found ${urlsToSubmit.length} URLs that need submission based on Git history`);

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
