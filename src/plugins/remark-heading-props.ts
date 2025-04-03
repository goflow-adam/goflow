import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

interface HeadingNode {
  type: 'heading';
  depth: number;
  children: Array<{
    type: string;
    value: string;
  }>;
  data?: {
    hProperties?: Record<string, string>;
  };
}

const attributeRegex = /^(.*?)\{([^}]+)\}$/;

const remarkHeadingProps: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'heading', (node: HeadingNode) => {
      if (node.children.length === 0) return;

      const lastChild = node.children[node.children.length - 1];
      if (lastChild.type !== 'text') return;

      const match = lastChild.value.match(attributeRegex);
      if (!match) return;

      // Extract the text and attributes
      const [, text, attributes] = match;

      // Parse the attributes string into key-value pairs
      const props = attributes.split(' ').reduce((acc, attr) => {
        const [key, value] = attr.split('=');
        if (key && value) {
          // Remove quotes if they exist
          acc[key] = value.replace(/^["']|["']$/g, '');
        }
        return acc;
      }, {} as Record<string, string>);

      // Update the text content
      lastChild.value = text.trim();

      // Add the properties to the node
      if (!node.data) node.data = {};
      if (!node.data.hProperties) node.data.hProperties = {};
      Object.assign(node.data.hProperties, props);
    });
  };
};

export default remarkHeadingProps;
