import { defineConfig, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      primary: '#1f4a6f',
      secondary: '#509cba',
      background: '#f4f7f5',
      accent: '#ffc60c',
      error: '#bd0006',
      text: '#000000'
    }
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg transition-colors duration-200',
    'btn-primary': 'bg-error text-background hover:opacity-90',
    'btn-secondary': 'bg-accent text-background hover:opacity-90',
    'nav-link': 'text-background hover:text-accent transition-colors duration-200',
    'nav-active': 'text-accent'
  }
})