// Design Tokens
// Single source of truth for design system values
// Follows Design Systems principle (OCP & DRY)

export const tokens = {
  colors: {
    // Primary colors
    primary: '#000000',
    secondary: '#FFFFFF',
    
    // Background colors
    background: '#000000',
    surface: '#111111',
    surfaceElevated: '#1A1A1A',
    
    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#D1D5DB', // gray-300
      tertiary: '#9CA3AF', // gray-400
      muted: '#6B7280', // gray-500
    },
    
    // Border colors
    border: {
      default: '#374151', // gray-700
      hover: '#4B5563', // gray-600
      focus: '#FFFFFF',
    },
    
    // State colors
    state: {
      success: '#10B981', // green-500
      error: '#EF4444', // red-500
      warning: '#F59E0B', // amber-500
      info: '#3B82F6', // blue-500
    },
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      arabic: ['Amiri', 'serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports for TypeScript
export type ColorToken = typeof tokens.colors;
export type SpacingToken = typeof tokens.spacing;
export type TypographyToken = typeof tokens.typography;
