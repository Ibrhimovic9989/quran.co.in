import type { Config } from 'tailwindcss';
import { tokens } from './lib/design-tokens';

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
        // Design tokens integration
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        surface: tokens.colors.surface,
        'surface-elevated': tokens.colors.surfaceElevated,
        text: tokens.colors.text,
        border: tokens.colors.border,
        state: tokens.colors.state,
      },
      spacing: tokens.spacing,
      fontFamily: {
        sans: [...tokens.typography.fontFamily.sans],
        arabic: [...tokens.typography.fontFamily.arabic],
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
      boxShadow: tokens.shadows,
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
