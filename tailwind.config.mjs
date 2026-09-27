/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontFamily: {
      heading: ['Space Grotesk', 'sans-serif'],
      body: ['JetBrains Mono', 'monospace'],
      sans: ['JetBrains Mono', 'monospace'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    extend: {
      colors: {
        background: 'var(--bg-main)',
        card: {
          main: 'var(--bg-card-main)',
          issues: 'var(--bg-card-issues)',
          prs: 'var(--bg-card-prs)',
          errors: 'var(--bg-card-errors)',
          resolved: 'var(--bg-card-resolved)',
        },
        border: 'var(--border-color)',
        content: 'var(--text-main)',
        'card-content': 'var(--text-card)',
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px var(--shadow-color)',
        'neo-sm': '2px 2px 0px 0px var(--shadow-color)',
        'neo-lg': '6px 6px 0px 0px var(--shadow-color)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        neoLight: {
          primary: '#103BCA',
          secondary: '#C4547A',
          accent: '#C4547A',
          neutral: '#F6F2E9',
          'base-100': '#F6F2E9',
          'base-200': '#EDE9DF',
          'base-300': '#DDD9CF',
          'base-content': '#1D1D1F',
          info: '#0FA89E',
          success: '#10B981',
          warning: '#FFDC5A',
          error: '#FF5F4D',
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.25rem',
          '--rounded-badge': '0.25rem',
          '--border-btn': '2px',
        },
      },
      {
        neoDark: {
          primary: '#103BCA',
          secondary: '#C4547A',
          accent: '#C4547A',
          neutral: '#1D1D1F',
          'base-100': '#121316',
          'base-200': '#1A1D24',
          'base-300': '#242830',
          'base-content': '#F0EEE8',
          info: '#0FA89E',
          success: '#10B981',
          warning: '#FFDC5A',
          error: '#FF5F4D',
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.25rem',
          '--rounded-badge': '0.25rem',
          '--border-btn': '2px',
        },
      },
    ],
    defaultTheme: 'neoLight',
  },
  plugins: [require('daisyui')],
};