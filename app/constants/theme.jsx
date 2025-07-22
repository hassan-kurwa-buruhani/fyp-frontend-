export const lightColors = {
  primary: '#304FFE',       // Academic deep blue
  primaryLight: '#7A88FF',  // Soft blue
  primaryDark: '#0026CA',   // Navy blue
  secondary: '#00C7B7',     // Academic teal
  accent: '#FFA000',        // Academic gold accent
  background: '#F5F7FA',    // Gentle paper white
  surface: '#FFFFFF',       // White surfaces
  error: '#D32F2F',         // Academic red for errors
  success: '#388E3C',       // Green for success/completion
  info: '#0288D1',          // Academic blue for info
  warning: '#FBC02D',       // Subtle warm highlight
  textPrimary: '#1A237E',   // Strong indigo for headers
  textSecondary: '#424874', // Academic, gentle subtle text
  textInverted: '#FFFFFF',  // White text on colored backgrounds
  divider: '#E0E6F1',       // Light divider
  highlight: '#FFFDE7',     // Cream highlight
  outline: '#C5CAE9',       // Subtle outline for inputs/cards
  disabled: '#B0BEC5',      // Disabled elements
};

export const baseLayout = {
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,        // adapt for platform later in component
    borderBottomColor: lightColors.divider,
    menuButtonMarginRight: 12,
    shadow: {
      elevationAndroid: 4,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    }
  },
};

export const darkColors = {
  primary: '#7986FF',       // Light Academic Blue
  primaryLight: '#AAB6FE',  // Lighter blue
  primaryDark: '#304FFE',   // For elevation contrast
  secondary: '#00DAC6',     // Brighter teal
  accent: '#FFD54F',        // Muted gold accent
  background: '#18192A',    // Deep academic ink blue
  surface: '#232346',       // Card/section backgrounds
  error: '#FF6659',
  success: '#81C784',
  info: '#4FC3F7',
  warning: '#FFD740',
  textPrimary: '#E3E7FF',   // Nearly white
  textSecondary: '#B2B7CD', // Subdued pale text
  textInverted: '#202230',  // Dark text on light buttons
  divider: '#30375F',       // Muted divider
  highlight: '#28294A',     // Slight highlight
  outline: '#3C4378',
  disabled: '#3A3F5C',
};

// Academic/exam-oriented typography
export const baseTypography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: lightColors.textPrimary,
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: lightColors.textPrimary,
    marginBottom: 14,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500',
    color: lightColors.textPrimary,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: lightColors.textSecondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    color: lightColors.textSecondary,
    opacity: 0.82,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: lightColors.textInverted,
  },
};

export const darkTypography = {
  ...baseTypography,
  h1: { ...baseTypography.h1, color: darkColors.textPrimary },
  h2: { ...baseTypography.h2, color: darkColors.textPrimary },
  h3: { ...baseTypography.h3, color: darkColors.textPrimary },
  body: { ...baseTypography.body, color: darkColors.textSecondary },
  caption: { ...baseTypography.caption, color: darkColors.textSecondary },
  button: { ...baseTypography.button, color: darkColors.textInverted },
};


// Export a theme object for each mode
export const lightTheme = {
  colors: lightColors,
  typography: baseTypography,
};

export const darkTheme = {
  colors: darkColors,
  typography: darkTypography,
};

// Named export of a theme object to support context/providers
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Default (light) for direct importing
export default lightTheme;
