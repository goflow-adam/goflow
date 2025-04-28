import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const servicesDir = path.join(__dirname, '../src/content/services');

// Read all MDX files in the services directory
const files = fs.readdirSync(servicesDir).filter(file => file.endsWith('.mdx'));

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split the content into frontmatter and body
  const [_, frontmatter, body] = content.split('---\n');
  
  // Parse the frontmatter
  const data = yaml.parse(frontmatter);
  
  // Extract offers from schema if they exist
  let offers = [];
  if (data.schema?.offers) {
    offers = data.schema.offers.map(offer => ({
      name: offer.itemOffered.name,
      description: offer.itemOffered.description
    }));
  }
  
  // Remove the schema and add offers if they exist
  delete data.schema;
  if (offers.length > 0) {
    data.offers = offers;
  }
  
  // Convert back to YAML
  const newFrontmatter = yaml.stringify(data);
  
  // Write the updated content back to the file
  const newContent = `---\n${newFrontmatter}---\n${body}`;
  fs.writeFileSync(filePath, newContent);
});
