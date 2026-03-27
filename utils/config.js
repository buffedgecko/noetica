// COTI Network Configuration
export const Cfg = {
  API_URL: '/api/chat',
  getApiKey: () => typeof window !== 'undefined' ? localStorage.getItem('noetica_apikey') || '' : '',
  hasApiKey: () => {
    if (typeof window === 'undefined') return false;
    const key = localStorage.getItem('noetica_apikey');
    return key && key.length > 10;
  },
  setApiKey: (key) => {
    if (typeof window !== 'undefined') localStorage.setItem('noetica_apikey', key);
  }
}
