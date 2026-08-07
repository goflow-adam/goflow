// src/lib/rehype/rehypeTableAccessibility.mjs
// Adds accessibility attributes to tables: scope on th elements
// WCAG 1.3.1 Info and Relationships
import { visit } from 'unist-util-visit';

export default function rehypeTableAccessibility() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Add scope="col" to th elements in thead
      if (node.tagName === 'th') {
        // Check if this th is inside a thead (column header)
        let isInThead = false;
        let ancestor = parent;
        while (ancestor) {
          if (ancestor.tagName === 'thead') {
            isInThead = true;
            break;
          }
          if (ancestor.tagName === 'tbody') {
            break;
          }
          ancestor = ancestor.parent;
        }
        
        // Default to col scope for th elements (most common case in markdown tables)
        if (!node.properties) {
          node.properties = {};
        }
        if (!node.properties.scope) {
          node.properties.scope = 'col';
        }
      }
    });
  };
}
