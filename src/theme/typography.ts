import type { FontSize } from '../types/settings';

export const FONT_SIZES: Record<FontSize, { body: number; title: number; code: number; caption: number }> = {
  small: { body: 13, title: 18, code: 12, caption: 11 },
  medium: { body: 15, title: 20, code: 14, caption: 12 },
  large: { body: 17, title: 24, code: 16, caption: 13 },
};

export const FONT_FAMILY = {
  regular: 'System',
  mono: 'monospace',
};
