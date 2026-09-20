import type { Config } from 'tailwindcss';
// Use require for CommonJS compatibility in Tailwind config
const { tokens } = require('./lib/design-tokens/index.ts');

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // ── World-class reading palette (paper & ink & emerald & gold) ──
        paper: 'var(--paper)',
        'surface-warm': 'var(--surface-warm)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          muted: 'var(--muted)',
        },
        // `text-muted` is used widely alongside `text-ink-muted` — same token
        muted: 'var(--muted)',
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
        // ── Pastel tints — category tiles, quiet callouts (never text) ──
        tint: {
          sage: 'var(--tint-sage)',
          sky: 'var(--tint-sky)',
          peach: 'var(--tint-peach)',
          sun: 'var(--tint-sun)',
          lavender: 'var(--tint-lavender)',
        },
        night: {
          DEFAULT: 'var(--night)',
          surface: 'var(--night-surface)',
          ink: 'var(--night-ink)',
          gold: 'var(--night-gold)',
        },
        // Design tokens integration (legacy)
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        surface: 'var(--surface)',
        'surface-elevated': tokens.colors.surfaceElevated,
        text: tokens.colors.text,
        border: tokens.colors.border,
        state: tokens.colors.state,
      },
      spacing: tokens.spacing,
      fontFamily: {
        sans: [...tokens.typography.fontFamily.sans],
        arabic: ['var(--font-quran)', 'var(--font-amiri)', 'Noto Naskh Arabic', 'serif'],
        'arabic-display': ['var(--font-amiri)', 'var(--font-quran)', 'serif'],
        reading: ['var(--font-reading)', 'var(--font-ui)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-ui)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: [...tokens.typography.fontFamily.mono],
      },
      fontSize: tokens.typography.fontSize,
      fontWeight: {
        normal: tokens.typography.fontWeight.normal.toString(),
        medium: tokens.typography.fontWeight.medium.toString(),
        semibold: tokens.typography.fontWeight.semibold.toString(),
        bold: tokens.typography.fontWeight.bold.toString(),
      },
      lineHeight: {
        tight: tokens.typography.lineHeight.tight.toString(),
        normal: tokens.typography.lineHeight.normal.toString(),
        relaxed: tokens.typography.lineHeight.relaxed.toString(),
      },
      borderRadius: tokens.borderRadius,
      boxShadow: {
        ...tokens.shadows,
        // Calm elevation: cards sit on the page, they don't hover over it
        card: '0 1px 2px rgb(33 62 74 / 0.04), 0 6px 18px rgb(33 62 74 / 0.05)',
        'card-hover': '0 2px 4px rgb(33 62 74 / 0.06), 0 10px 26px rgb(33 62 74 / 0.08)',
      },
      transitionDuration: tokens.transitions,
      screens: tokens.breakpoints,
      animation: {
        "shimmer-slide":
          "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      },
      keyframes: {
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
