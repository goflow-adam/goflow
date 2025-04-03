// @ts-check
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro'
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://goflow.plumbing',
  integrations: [
    UnoCSS({injectReset: true}),
    sitemap(),
    mdx()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light'
    }
  },
  build: {
    inlineStylesheets: 'never'
  }
});
