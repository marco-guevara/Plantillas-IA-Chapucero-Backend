import { env } from '../config/env.js';
import { generateLaminaDraft as geminiGenerateLaminaDraft } from './ai/geminiProvider.js';

// Swap the active provider here when moving from Gemini to Claude:
// add ./ai/claudeProvider.js and register it in this map, no other
// caller needs to change.
const PROVIDERS = {
  gemini: geminiGenerateLaminaDraft,
};

export const generateLaminaDraft = (input) => {
  const implementation = PROVIDERS[env.aiProvider] || geminiGenerateLaminaDraft;
  return implementation(input);
};
