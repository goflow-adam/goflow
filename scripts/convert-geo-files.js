import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONSTANTS_DIR = path.join(__dirname, '..', 'src', 'constants');

// Convert CSV content to JS format
function convertCsvToJs(csvContent, countyName) {
    const lines = csvContent.trim().split('\n');
    // Skip header row if it exists
    const coordinates = lines[0].includes('Longitude,Latitude') 
        ? lines.slice(1) 
        : lines;
    
    const points = coordinates.map(line => {
        const [longitude, latitude] = line.split(',').map(Number);
        return [longitude, latitude];
    });

    return `export default {
    name: "${countyName}",
    description: "Full service area coverage in ${countyName}",
    coordinates: [${JSON.stringify(points, null, 2).slice(1, -1)}]
};
`;
}

// Process all CSV files
async function convertFiles() {
    const files = fs.readdirSync(CONSTANTS_DIR);
    const csvFiles = files.filter(file => file.endsWith('.csv'));

    for (const csvFile of csvFiles) {
        const csvPath = path.join(CONSTANTS_DIR, csvFile);
        const countyName = path.basename(csvFile, '.csv');
        const jsFileName = `${countyName}CountyGeo.js`;
        const jsPath = path.join(CONSTANTS_DIR, jsFileName);

        // Read CSV content
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        
        // Convert to JS format
        const jsContent = convertCsvToJs(csvContent, countyName);
        
        // Write JS file
        fs.writeFileSync(jsPath, jsContent);
        console.log(`Converted ${csvFile} to ${jsFileName}`);
        
        // Delete original CSV file
        fs.unlinkSync(csvPath);
        console.log(`Deleted ${csvFile}`);
    }
}

// Run the conversion
convertFiles().catch(console.error);
