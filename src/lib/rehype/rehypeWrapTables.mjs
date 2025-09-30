// src/lib/rehype/rehypeWrapTables.mjs
import { visit } from 'unist-util-visit';

export default function rehypeWrapTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || !Array.isArray(parent.children)) return;
      if (node.tagName !== 'table') return;

      // Replace <table> with <div class="table-container"><table>...</table></div>
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-container'] },
        children: [node],
      };
    });
  };
}