// NOETICA — Configuration
export const Cfg = {
  API_KEY: import.meta.env.VITE_AI_API_KEY || '',
  API_URL: import.meta.env.VITE_AI_API_URL || 'https://api.nousresearch.com/v1/chat/completions',
  hasApiKey() { return !!this.API_KEY }
}
