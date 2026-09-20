import type { Config } from 'tailwindcss';

// Self-contained brand theme for the developer portal — mirrors the token
// names used across quran.co.in (paper, ink, line, accent, gold) so the portal
// reads as part of the same product, without pulling in apps/web's design-token
// build pipeline.
const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        'surface-warm': 'var(--surface-warm)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          muted: 'var(--muted)',
        },
        line: {
          DEFAULT: 'var(--line)',
          soft: 'var(--line-soft)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          strong: 'var(--accent-strong)',
          soft: 'var(--accent-soft)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          soft: 'var(--gold-soft)',
          text: 'var(--gold-text)',
        },
        muted: 'var(--muted)',
        tint: {
          sage: 'var(--tint-sage)',
          sky: 'var(--tint-sky)',
          peach: 'var(--tint-peach)',
          sun: 'var(--tint-sun)',
          lavender: 'var(--tint-lavender)',
        },
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'DM Sans', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'DM Sans', 'system-ui', 'sans-serif'],
        reading: ['var(--font-reading)', 'var(--font-ui)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgb(33 62 74 / 0.04), 0 6px 18px rgb(33 62 74 / 0.05)',
        'card-hover':
          '0 2px 4px rgb(33 62 74 / 0.06), 0 10px 26px rgb(33 62 74 / 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
