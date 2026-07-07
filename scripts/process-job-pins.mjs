#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const SCRATCH_DIR = path.resolve(process.cwd(), 'scratch');
const JOBS_CSV = path.join(SCRATCH_DIR, 'jobs.csv');
const REVIEWS_CSV = path.join(SCRATCH_DIR, 'reviews.csv');
const IMAGES_DIR = path.join(SCRATCH_DIR, 'job-images');
const OUTPUT_JSON = path.resolve(process.cwd(), 'src/data/jobPins.json');

// City to region page mapping
const CITY_TO_REGION = {
  'Santa Rosa': 'santa-rosa-plumbing',
  'Rohnert Park': 'santa-rosa-plumbing',
  'Sebastopol': 'santa-rosa-plumbing',
  'Cotati': 'santa-rosa-plumbing',
  'Windsor': 'santa-rosa-plumbing',
  'Petaluma': 'petaluma-plumbing',
  'Healdsburg': 'healdsburg-plumbing',
  'Sonoma': 'sonoma-plumbing',
  'Glen Ellen': 'sonoma-plumbing',
  'Novato': 'novato-plumbing',
  'San Rafael': 'san-rafael-plumbing',
  'San Anselmo': 'san-rafael-plumbing',
  'Greenbrae': 'san-rafael-plumbing',
  'Mill Valley': 'mill-valley-plumbing',
  'Sausalito': 'mill-valley-plumbing',
  'Corte Madera': 'marin-county-plumbing',
  'Belvedere Tiburon': 'marin-county-plumbing',
  'Ross': 'marin-county-plumbing',
  'Bodega Bay': 'sonoma-county-plumbing',
};

// Default fallbacks by county
const MARIN_CITIES = ['San Rafael', 'Novato', 'Mill Valley', 'Larkspur', 'San Anselmo', 'Corte Madera', 'Tiburon', 'Fairfax', 'Sausalito', 'Ross', 'Belvedere', 'Greenbrae'];
const SONOMA_CITIES = ['Santa Rosa', 'Petaluma', 'Rohnert Park', 'Healdsburg', 'Sonoma', 'Windsor', 'Sebastopol', 'Cotati', 'Glen Ellen', 'Bodega Bay'];

function getRegionForCity(city) {
  // Direct match
  if (CITY_TO_REGION[city]) {
    return CITY_TO_REGION[city];
  }
  
  // Check if it's a Marin city
  if (MARIN_CITIES.some(c => city.toLowerCase().includes(c.toLowerCase()))) {
    return 'marin-county-plumbing';
  }
  
  // Default to Sonoma County
  return 'sonoma-county-plumbing';
}

function findImagesForJob(jobId) {
  const images = [];
  const files = fs.readdirSync(IMAGES_DIR);
  
  for (const file of files) {
    if (file.startsWith('.')) continue;
    
    const baseName = path.parse(file).name;
    // Match exact job ID or job ID with suffix (e.g., 1022 or 1022-1)
    if (baseName === String(jobId) || baseName.startsWith(`${jobId}-`)) {
      images.push(file);
    }
  }
  
  // Sort so 1022.jpg comes before 1022-1.jpg, etc.
  return images.sort((a, b) => {
    const aNum = a.match(/-(\d+)\./)?.[1] || '0';
    const bNum = b.match(/-(\d+)\./)?.[1] || '0';
    return parseInt(aNum) - parseInt(bNum);
  });
}

function parseStarRating(stars) {
  if (!stars) return null;
  // Count star characters
  const count = (stars.match(/★/g) || []).length;
  return count || null;
}

async function geocodeAddress(address) {
  // Use Nominatim (OpenStreetMap) for geocoding
  const encoded = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GoFlowPlumbing/1.0 (job-pins-poc)'
      }
    });
    
    if (!response.ok) {
      console.warn(`Geocoding failed for: ${address}`);
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    console.warn(`No geocoding results for: ${address}`);
    return null;
  } catch (err) {
    console.warn(`Geocoding error for ${address}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Reading jobs CSV...');
  const jobsRaw = fs.readFileSync(JOBS_CSV, 'utf-8');
  const jobs = parse(jobsRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });
  
  console.log(`Found ${jobs.length} jobs`);
  
  console.log('Reading reviews CSV...');
  const reviewsRaw = fs.readFileSync(REVIEWS_CSV, 'utf-8');
  const reviews = parse(reviewsRaw, {
    columns: true,
    skip_empty_lines: true,
  });
  
  // Create review lookup by job_id
  const reviewsByJobId = {};
  for (const review of reviews) {
    if (review.job_id) {
      reviewsByJobId[review.job_id] = {
        text: review.review_text,
        rating: parseStarRating(review.review_rating),
        reviewerName: review.reviewer_name,
        source: review.Source,
        date: review.date,
      };
    }
  }
  
  console.log(`Found ${Object.keys(reviewsByJobId).length} reviews with job IDs`);
  
  // Process each job
  const jobPins = [];
  
  for (const job of jobs) {
    const jobId = job.job_id;
    const images = findImagesForJob(jobId);
    const review = reviewsByJobId[jobId] || null;
    const region = getRegionForCity(job.city);
    
    // Geocode with rate limiting (Nominatim requires 1 req/sec)
    console.log(`Geocoding job ${jobId}: ${job.address}`);
    const coords = await geocodeAddress(job.address);
    
    // Rate limit: wait 1.1 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    jobPins.push({
      jobId,
      address: job.address,
      city: job.city,
      region,
      completionDate: job.completion_date,
      description: job.job_description,
      images,
      hasImages: images.length > 0,
      coordinates: coords,
      review,
    });
  }
  
  // Summary
  const withImages = jobPins.filter(j => j.hasImages).length;
  const withReviews = jobPins.filter(j => j.review).length;
  const withCoords = jobPins.filter(j => j.coordinates).length;
  
  console.log('\n--- Summary ---');
  console.log(`Total jobs: ${jobPins.length}`);
  console.log(`With images: ${withImages}`);
  console.log(`With reviews: ${withReviews}`);
  console.log(`With coordinates: ${withCoords}`);
  
  // Group by region
  const byRegion = {};
  for (const pin of jobPins) {
    if (!byRegion[pin.region]) byRegion[pin.region] = [];
    byRegion[pin.region].push(pin);
  }
  
  console.log('\nJobs by region:');
  for (const [region, pins] of Object.entries(byRegion)) {
    console.log(`  ${region}: ${pins.length}`);
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jobPins, null, 2));
  console.log(`\nWrote ${OUTPUT_JSON}`);
}

main().catch(console.error);
