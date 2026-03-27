// AI utilities for NOETICA

export async function sendToAI(messages) {
  const key = localStorage.getItem('noetica_apikey');
  if (!key) {
    throw new Error('API key not configured');
  }
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, apiKey: key })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'AI request failed');
  }
  
  const data = await response.json();
  return data.content || data.response || 'No response';
}

export async function getInsight(text) {
  // Optional: Get AI insight for journal entries
  return null;
}

export function detectCrisis(text) {
  const crisisWords = ['suicide', 'kill myself', 'want to die', 'self harm', 'harm myself'];
  const lower = text.toLowerCase();
  for (const word of crisisWords) {
    if (lower.includes(word)) return 'high';
  }
  return 'low';
}
