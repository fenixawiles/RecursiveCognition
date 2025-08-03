// promptClassifier.js
// Module for classifying user prompts by type

/**
 * Prompt types for classification
 */
export const PROMPT_TYPES = {
  EMOTIONAL: 'emotional',
  DIRECTIVE: 'directive',
  META: 'meta',
  STRATEGIC: 'strategic'
};

/**
 * Rule-based auto-tagging for prompts
 */
const promptRules = [
  {
    type: PROMPT_TYPES.EMOTIONAL,
    patterns: [/angry/i, /happy/i, /sad/i, /excited/i]
  },
  {
    type: PROMPT_TYPES.DIRECTIVE,
    patterns: [/do this/i, /perform/i, /execute/i, /complete/i]
  },
  {
    type: PROMPT_TYPES.META,
    patterns: [/how does/i, /why is/i, /what if/i, /can you/i]
  },
  {
    type: PROMPT_TYPES.STRATEGIC,
    patterns: [/plan/i, /strategy/i, /approach/i, /method/i]
  }
];

/**
 * Classify a given prompt text
 * @param {string} prompt - The user prompt to classify
 * @returns {string|null} - The prompt type or null if no match
 */
export function classifyPrompt(prompt) {
  for (const rule of promptRules) {
    if (rule.patterns.some((pattern) => pattern.test(prompt))) {
      return rule.type;
    }
  }
  return null;
}

/**
 * Auto-tag prompts in a batch
 * @param {Array} prompts - Array of prompt strings
 * @returns {Array} - Array of classified prompt types
 */
export function autoTagPrompts(prompts) {
  return prompts.map(classifyPrompt);
}
