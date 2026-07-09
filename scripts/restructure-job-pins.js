#!/usr/bin/env node
/**
 * Script to restructure jobPins.json:
 * 1. Extract service type from **Service Name:** pattern in descriptions
 * 2. Split multi-service jobs into separate entries with -1, -2, etc. suffixes
 * 3. Add serviceType field for filtering
 * 4. Move service name to shortDescription
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../src/data/jobPins.json');
const outputPath = join(__dirname, '../src/data/jobPins.json');

// Service type mapping based on keywords in the service name
function getServiceType(serviceName) {
  const name = serviceName.toLowerCase();
  
  // Drain/Sewer related
  if (name.includes('drain') || name.includes('sewer') || name.includes('rooter')) {
    return 'drain';
  }
  
  // Water heater related
  if (name.includes('water heater') || name.includes('hot water')) {
    return 'water-heater';
  }
  
  // Toilet related
  if (name.includes('toilet')) {
    return 'toilet';
  }
  
  // Gas related
  if (name.includes('gas line') || name.includes('gas leak')) {
    return 'gas';
  }
  
  // Leak/Pipe related
  if (name.includes('leak') || name.includes('pipe') || name.includes('repiping')) {
    return 'leak';
  }
  
  // Smart home / Moen Flo
  if (name.includes('moen flo') || name.includes('smart')) {
    return 'smart-home';
  }
  
  // Water filtration
  if (name.includes('filtration') || name.includes('reverse osmosis')) {
    return 'water-filtration';
  }
  
  // Fixture related (faucet, shower, sink, garbage disposal, etc.)
  if (name.includes('faucet') || name.includes('shower') || name.includes('sink') || 
      name.includes('garbage disposal') || name.includes('fixture') || name.includes('bidet') ||
      name.includes('hose bib') || name.includes('ice maker') || name.includes('bathtub') ||
      name.includes('tub spout') || name.includes('angle stop')) {
    return 'fixture';
  }
  
  return 'general';
}

// Parse a description to extract individual services
// Pattern: **Service Name:** description text
function parseServices(description) {
  // Match all **Service Name:** patterns and their descriptions
  const servicePattern = /\*\*([^*]+)\*\*\s*([^*]*?)(?=\*\*|$)/g;
  const services = [];
  let match;
  
  while ((match = servicePattern.exec(description)) !== null) {
    const serviceName = match[1].trim().replace(/:$/, ''); // Remove trailing colon if present
    const serviceDescription = match[2].trim();
    
    if (serviceName && serviceDescription) {
      services.push({
        serviceName,
        description: serviceDescription
      });
    }
  }
  
  // If no pattern matches found, treat the whole description as one service
  if (services.length === 0) {
    // Try to extract just the service name from the start
    const singleMatch = description.match(/^\*\*([^*]+)\*\*\s*(.*)/s);
    if (singleMatch) {
      services.push({
        serviceName: singleMatch[1].trim().replace(/:$/, ''),
        description: singleMatch[2].trim()
      });
    } else {
      // No pattern at all, use as-is
      services.push({
        serviceName: 'Plumbing Service',
        description: description
      });
    }
  }
  
  return services;
}

// Main processing
const jobPins = JSON.parse(readFileSync(inputPath, 'utf-8'));
const restructuredJobs = [];

for (const job of jobPins) {
  const services = parseServices(job.description);
  
  if (services.length === 1) {
    // Single service job - keep original ID
    const service = services[0];
    restructuredJobs.push({
      ...job,
      shortDescription: service.serviceName,
      serviceType: getServiceType(service.serviceName),
      description: service.description
    });
  } else {
    // Multi-service job - split into separate entries
    services.forEach((service, index) => {
      const suffix = index + 1;
      const newJobId = `${job.jobId}-${suffix}`;
      
      restructuredJobs.push({
        ...job,
        jobId: newJobId,
        parentJobId: job.jobId,
        shortDescription: service.serviceName,
        serviceType: getServiceType(service.serviceName),
        description: service.description,
        // Only first split job keeps the review
        review: index === 0 ? job.review : null
      });
    });
  }
}

// Sort by completion date descending, then by jobId
restructuredJobs.sort((a, b) => {
  const dateA = new Date(a.completionDate.split('/').reverse().join('-'));
  const dateB = new Date(b.completionDate.split('/').reverse().join('-'));
  if (dateB.getTime() !== dateA.getTime()) {
    return dateB.getTime() - dateA.getTime();
  }
  return a.jobId.localeCompare(b.jobId);
});

// Write output
writeFileSync(outputPath, JSON.stringify(restructuredJobs, null, 2));

console.log(`Processed ${jobPins.length} jobs into ${restructuredJobs.length} entries`);

// Summary stats
const serviceTypeCounts = {};
for (const job of restructuredJobs) {
  serviceTypeCounts[job.serviceType] = (serviceTypeCounts[job.serviceType] || 0) + 1;
}
console.log('\nService type breakdown:');
for (const [type, count] of Object.entries(serviceTypeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`);
}

// Show multi-service jobs that were split
const splitJobs = restructuredJobs.filter(j => j.parentJobId);
if (splitJobs.length > 0) {
  console.log(`\nSplit ${new Set(splitJobs.map(j => j.parentJobId)).size} multi-service jobs into ${splitJobs.length} entries`);
}
