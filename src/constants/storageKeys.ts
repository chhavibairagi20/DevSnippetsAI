export const STORAGE_KEYS = {
  SETTINGS: '@devsnippets/settings',
} as const;

export const SECURE_KEYS = {
  OPENROUTER_API_KEY: 'openrouter_api_key',
  /** @deprecated legacy slot — read-only fallback for migration */
  GEMINI_API_KEY: 'gemini_api_key',
} as const;
