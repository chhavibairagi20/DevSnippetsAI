import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { vscodeDark, vscodeLight, type AppColors } from './colors';

export { vscodeDark, vscodeLight, type AppColors };
export { FONT_SIZES, FONT_FAMILY } from './typography';

export const createPaperTheme = (isDark: boolean, colors: AppColors): MD3Theme => {
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      onPrimary: '#FFFFFF',
      primaryContainer: colors.primaryLight,
      secondary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surfaceElevated,
      onBackground: colors.text,
      onSurface: colors.text,
      onSurfaceVariant: colors.textSecondary,
      outline: colors.border,
      error: colors.error,
      elevation: {
        level0: 'transparent',
        level1: colors.surface,
        level2: colors.surfaceElevated,
        level3: colors.surfaceElevated,
        level4: colors.surfaceElevated,
        level5: colors.surfaceElevated,
      },
    },
    roundness: 10,
  };
};
