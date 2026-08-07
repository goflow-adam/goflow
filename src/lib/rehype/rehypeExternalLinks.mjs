// src/lib/rehype/rehypeExternalLinks.mjs
// Adds target="_blank", rel="noopener noreferrer", and screen reader text to external links
// WCAG 3.2.5 Change on Request - inform users when links open in new tabs
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
        
        // Add screen reader text to indicate link opens in new tab
        // Check if sr-only span already exists to avoid duplicates
        const hasScreenReaderText = node.children?.some(
          child => child.type === 'element' && 
                   child.tagName === 'span' && 
                   child.properties?.className?.includes('sr-only')
        );
        
        if (!hasScreenReaderText) {
          node.children = node.children || [];
          node.children.push({
            type: 'element',
            tagName: 'span',
            properties: { className: ['sr-only'] },
            children: [{ type: 'text', value: ' (opens in new tab)' }]
          });
        }
      }
    });
  };
}
