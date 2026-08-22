// constants/theme.ts

export const Colors = {
  // Brand Colors
  primary: '#C2622A',      // Burnt orange / terracotta
  secondary: '#D4D4D0',    // Light heathered grey
  dark: '#1A1A1A',         // Deep black

  // Neutrals (Light Mode)
  bg: '#F2F0ED',           // Warm off-white
  bgAlt: '#ECEAE6',        // Slightly deeper off-white
  surface: '#FFFFFF',      // Pure white card surfaces
  border: '#E0DDD9',       // Subtle border

  // Text Colors
  textPrimary: '#1A1A1A',
  textSecondary: '#5A5A5A',
  textMuted: '#9A9A9A',
  textInverse: '#FFFFFF',

  // Semantics
  accent: '#C2622A',
  success: '#4A7C59',
  warning: '#D4A017',
  error: '#B94040',
  errorBg: '#FDF2F2',

  // Dark Mode Overrides
  darkTheme: {
    bg: '#0F0F0E',
    bgAlt: '#161614',
    surface: '#1E1E1C',
    border: '#2D2D2B',
    textPrimary: '#ECEAE6',
    textSecondary: '#B5B3B0',
    textMuted: '#7E7C79',
    textInverse: '#1E1E1C',
  }
}

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
}

export const Shadows = {
  sm: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
}
