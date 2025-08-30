export const MODELS = {
  'gpt-4o-mini': {
    context: 128000,
    defaultMaxTokens: 800,
    temperature: 0.7
  },
  'gpt-3.5-turbo': {
    context: 16000,
    defaultMaxTokens: 512,
    temperature: 0.7
  }
};

export const ACTIVE_MODEL = 'gpt-4o-mini';

export function getModelConfig(name = ACTIVE_MODEL) {
  return MODELS[name] || MODELS[ACTIVE_MODEL];
}

