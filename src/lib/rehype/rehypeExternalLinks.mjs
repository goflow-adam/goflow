// src/lib/rehype/rehypeExternalLinks.mjs
// Adds target="_blank" and rel="noopener noreferrer" to external links
import { visit } from 'unist-util-visit';

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      
      const href = node.properties?.href;
      if (!href || typeof href !== 'string') return;
      
      // Check if link is external (starts with http:// or https:// and not our domain)
      const isExternal = /^https?:\/\//.test(href) && !href.includes('goflow.plumbing');
      
      if (isExternal) {
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
    });
  };
}
