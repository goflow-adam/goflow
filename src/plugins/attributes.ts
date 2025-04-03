import type { Root, RootContent, Parent, Text, ListItem } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Properties } from 'hast';
import type { Node } from 'unist';

type ExtendedNode = RootContent & {
  children?: RootContent[];
  value?: string;
  data?: {
    hProperties?: Properties;
  };
  parent?: Parent;
}

const attributeRegex = /^(.*?)\{([^}]+)\}$/;

/**
 * Parse attribute string into key-value pairs
 * Supports:
 * - key="value"
 * - key='value'
 * - key=value
 * - boolean attributes (just key)
 */
const parseAttributes = (attrString: string): Record<string, string> => {
  return attrString.split(/\s+/).reduce((acc, attr) => {
    // Handle boolean attributes
    if (!attr.includes('=')) {
      acc[attr] = '';
      return acc;
    }

    // Handle key=value pairs
    const [key, ...valueParts] = attr.split('=');
    const value = valueParts.join('='); // Rejoin in case value contained =
    if (key && value) {
      // Remove quotes if they exist
      acc[key] = value.replace(/^["']|["']$/g, '');
    }
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Process a node to extract attributes and update its content
 */
const processNode = (node: Node): void => {
  // Handle text nodes and list items
  if (node.type === 'text' && 'value' in node && typeof node.value === 'string') {
    const match = node.value.match(attributeRegex);
    if (match) {
      const [, text, attributes] = match;
      node.value = text.trim();

      // Walk up to find the nearest parent that can accept attributes
      let current = (node as any).parent;
      while (current && current.type !== 'listItem' && current.type !== 'paragraph' && current.type !== 'heading') {
        current = current.parent;
      }

      if (current) {
        // Ensure data structures exist
        if (!current.data) current.data = {};
        if (!current.data.hProperties) current.data.hProperties = {};
        
        const props = parseAttributes(attributes);
        
        // Special handling for list items with addressLocality
        if (current.type === 'listItem' && props.itemprop === 'addressLocality') {
          // Create a span node for the city name
          const span = {
            type: 'element',
            tagName: 'span',
            properties: {
              itemscope: '',
              itemtype: 'https://schema.org/City',
              itemprop: 'containsPlace'
            },
            children: [{
              type: 'text',
              value: text.trim()
            }]
          };
          
          // Replace the text node with the span
          if (Array.isArray(current.children)) {
            current.children = [span];
          }
        } else {
          // For non-list items or other attributes, apply normally
          Object.assign(current.data.hProperties, props);
        }
      }
    }
  }

  // Process children recursively
  if ('children' in node && Array.isArray(node.children)) {
    node.children.forEach(child => {
      (child as any).parent = node;
      processNode(child);
    });
  }
};

/**
 * Remark plugin that adds support for element attributes using curly braces syntax
 * Example: # Heading{class="title" itemprop="name"}
 *          Paragraph text{class="highlight"}
 */
const remarkAttributes: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node: Node) => {
      processNode(node);
    });
  };
};

export default remarkAttributes;