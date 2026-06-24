/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'], 
  theme: {
    extend: {
      colors: {
        base:     '#0b0e14',
        panel:    '#11151f',
        panel2:   '#161b27',
        line:     '#222a39',
        ink:      '#e7ecf3',
        inkdim:   '#94a1b6',
        inkfaint: '#5c6a80',
        amber:    '#f5a623',
        amber2:   '#ffce6b',
        quiet:    '#3ecf8e',
        moderate: '#f5a623',
        strong:   '#ef4444',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

