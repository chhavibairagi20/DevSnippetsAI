import type { AIExplanation } from '../types/snippet';
import { getOpenRouterApiKey } from '../storage/secureStorage';
import { normalizeApiKey } from '../utils/apiKey';

const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';

const SYSTEM_PROMPT = `You are a helpful programming tutor. Analyze the code and respond ONLY with valid JSON in this exact shape:
{"explanation":"detailed explanation","summary":"one paragraph summary","suggestions":"improvement suggestions"}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Parse provider error bodies into user-friendly messages */
const parseHttpError = async (res: Response, provider: string): Promise<string> => {
  let message = '';
  let code = '';

  try {
    const body = await res.json();
    const err = body?.error ?? body;
    message = err?.message ?? err?.error?.message ?? '';
    code = err?.code ?? err?.type ?? '';
  } catch {
    // ignore JSON parse failure
  }

  if (res.status === 401) {
    return `${provider}: Invalid API key. Go to Settings, tap Replace key, paste your OpenRouter key, and Save.`;
  }

  if (res.status === 429) {
    if (
      code === 'insufficient_quota' ||
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('billing')
    ) {
      return `${provider}: Request blocked (quota/billing). Check credits at openrouter.ai/settings/credits.`;
    }
    return `${provider}: Rate limit (429). Wait a minute and try again.`;
  }

  if (res.status === 403) {
    return `${provider}: Access denied. Check that your API key is active and has permission for this model.`;
  }

  const detail = message ? ` — ${message}` : '';
  return `${provider} API error (${res.status})${detail}`;
};

const fetchWithRetry = async (
  request: () => Promise<Response>,
  provider: string,
  retries = 1
): Promise<Response> => {
  const res = await request();
  if (res.status === 429 && retries > 0) {
    const retryAfter = res.headers.get('retry-after');
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : 2500;
    await sleep(Number.isFinite(waitMs) && waitMs > 0 ? waitMs : 2500);
    return fetchWithRetry(request, provider, retries - 1);
  }
  if (!res.ok) {
    throw new Error(await parseHttpError(res, provider));
  }
  return res;
};

const parseAIResponse = (text: string): AIExplanation => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        explanation: parsed.explanation ?? text,
        summary: parsed.summary ?? '',
        suggestions: parsed.suggestions ?? '',
      };
    }
  } catch {
    // fall through
  }
  return {
    explanation: text,
    summary: '',
    suggestions: '',
  };
};

export type AIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const callOpenRouter = async (messages: AIChatMessage[], apiKey: string): Promise<string> => {
  const res = await fetchWithRetry(
    () =>
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://devsnippets.app',
          'X-Title': 'DevSnippets AI',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages,
        }),
      }),
    'OpenRouter'
  );
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  if (!text && data.error) {
    throw new Error(data.error.message ?? 'OpenRouter returned an error');
  }
  return text;
};

const getStoredOpenRouterApiKey = async (): Promise<string> => {
  const rawKey = await getOpenRouterApiKey();
  if (!rawKey) {
    throw new Error(
      'No OpenRouter API key found. Open Settings → paste your key from openrouter.ai/keys → Save.'
    );
  }
  return normalizeApiKey(rawKey);
};

export const sendAiChat = async (messages: AIChatMessage[]): Promise<string> => {
  const apiKey = await getStoredOpenRouterApiKey();
  return callOpenRouter(messages, apiKey);
};

/** Quick check that a stored key works (used from Settings) */
export const testOpenRouterConnection = async (apiKey?: string): Promise<void> => {
  const key = normalizeApiKey(apiKey ?? (await getOpenRouterApiKey()) ?? '');
  if (!key) throw new Error('No API key saved');

  const sample = 'console.log("hello");';
  await callOpenRouter(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Language: javascript\n\nCode:\n${sample}` },
    ],
    key
  );
};

/** Generates AI explanation — requires internet and a stored API key */
export const generateExplanation = async (
  code: string,
  language: string
): Promise<AIExplanation> => {
  const apiKey = await getStoredOpenRouterApiKey();
  const raw = await callOpenRouter(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Language: ${language}\n\nCode:\n${code}` },
    ],
    apiKey
  );

  if (!raw.trim()) throw new Error('Empty response from AI provider');
  return { ...parseAIResponse(raw), rawResponse: raw };
};
