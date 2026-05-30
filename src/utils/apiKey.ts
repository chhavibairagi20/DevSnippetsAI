const MASK = '••••••••';

export const isMaskedKey = (value: string): boolean =>
  value.includes('•') || value === MASK;

/** Normalize pasted keys (trim, strip accidental quotes/newlines) */
export const normalizeApiKey = (key: string): string =>
  key.trim().replace(/^["']|["']$/g, '');

export const validateOpenRouterApiKey = (key: string): string | null => {
  const k = normalizeApiKey(key);
  if (!k) return 'API key cannot be empty';
  if (k.length < 20) return 'API key looks too short';

  if (k.startsWith('AIza')) {
    return 'This app uses OpenRouter, not Google AI Studio. Create a key at openrouter.ai/keys';
  }
  if (!k.startsWith('sk-or-') && !k.startsWith('sk-')) {
    return 'OpenRouter keys usually start with sk-or-v1-';
  }
  return null;
};
