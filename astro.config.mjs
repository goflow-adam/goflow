// @ts-check
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro'
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import rehypeWrapTables from './src/lib/rehype/rehypeWrapTables.mjs';
import rehypeExternalLinks from './src/lib/rehype/rehypeExternalLinks.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://goflow.plumbing',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  integrations: [
    UnoCSS({
      injectReset: true
    }),
    sitemap({lastmod: new Date()}),
    mdx({
      rehypePlugins: [rehypeWrapTables, rehypeExternalLinks]
    }),
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
    shikiConfig: { theme: 'github-light' },
    rehypePlugins: [rehypeWrapTables, rehypeExternalLinks]
  },
  build: {
    inlineStylesheets: 'never'
  },
  vite: {
    build: {
      cssCodeSplit: true,
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('leaflet')) return 'leaflet';
              if (id.includes('astro-seo')) return 'seo';
              return 'vendor';
            }
          }
        },
        plugins: process.env.ANALYZE ? [
          (await import('rollup-plugin-visualizer')).visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true
          })
        ] : []
      }
    },
    ssr: {
      noExternal: ['@astrojs/prism']
    },
    optimizeDeps: {
      include: ['leaflet', 'astro-seo']
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
