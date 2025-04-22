// @ts-check
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro'
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://goflow.plumbing',
  integrations: [
    UnoCSS({
      injectReset: true
    }),
    sitemap({lastmod: new Date()}),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push']
      }
    }),
    (await import("astro-compress")).default({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
          collapseWhitespace: true,
          removeComments: true
        }
      },
      Image: {
        sharp: {
          jpeg: {
            quality: 80,
            mozjpeg: true
          },
          png: {
            quality: 80,
            compressionLevel: 9
          },
          webp: {
            quality: 80
          }
        }
      },
      JavaScript: {
        terser: {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          mangle: true
        }
      }
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light'
    }
  },
  build: {
    inlineStylesheets: 'never'
  },
  vite: {
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000
    },
    ssr: {
      noExternal: ['@astrojs/prism']
    }
  },
  image: {
    service: {
      entrypoint: 'sharp'
    },
    domains: ['goflow.plumbing'],
    remotePatterns: [{
      protocol: 'https'
    }]
  }
});
