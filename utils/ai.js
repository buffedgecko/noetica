// NOETICA — AI utilities
export async function sendToAI(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  })
  if (!res.ok) throw new Error('AI service unavailable')
  const data = await res.json()
  return data.content
}
export async function getInsight(text) {
  return null // Optional feature
}
export function detectCrisis(text) {
  const high = ['suicide','kill myself','end my life','want to die']
  return high.some(w => text.toLowerCase().includes(w)) ? 'high' : 'normal'
}
