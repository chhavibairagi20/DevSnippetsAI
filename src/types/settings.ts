export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  defaultLanguage: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontSize: 'medium',
  defaultLanguage: 'javascript',
};
