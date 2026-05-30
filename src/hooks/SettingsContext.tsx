import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { loadSettings, saveSettings } from '../storage/asyncStorage';
import { createPaperTheme, vscodeDark, vscodeLight, type AppColors } from '../theme';
import { FONT_SIZES } from '../theme/typography';
import type { AppSettings, ThemeMode } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import type { MD3Theme } from 'react-native-paper';

interface SettingsContextValue {
  settings: AppSettings;
  isDark: boolean;
  colors: AppColors;
  paperTheme: MD3Theme;
  fontSizes: (typeof FONT_SIZES)['medium'];
  loading: boolean;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const isDark = useMemo(() => {
    if (settings.theme === 'system') return systemScheme === 'dark';
    return settings.theme === 'dark';
  }, [settings.theme, systemScheme]);

  const colors = isDark ? vscodeDark : vscodeLight;
  const paperTheme = useMemo(() => createPaperTheme(isDark, colors), [isDark, colors]);
  const fontSizes = FONT_SIZES[settings.fontSize];

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isDark,
      colors,
      paperTheme,
      fontSizes,
      loading,
      updateSettings,
    }),
    [settings, isDark, colors, paperTheme, fontSizes, loading, updateSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const useAppTheme = () => {
  const { colors, isDark, fontSizes, paperTheme } = useSettings();
  return { colors, isDark, fontSizes, paperTheme };
};
