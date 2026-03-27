// NOETICA — Serverless API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { messages } = req.body
  const apiKey = process.env.HERMES_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }
  try {
    const response = await fetch('https://api.nousresearch.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'hermes-3-llama-3-8b',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1000,
        temperature: 0.8
      })
    })
    if (!response.ok) throw new Error('AI API error')
    const data = await response.json()
    return res.status(200).json({ content: data.choices[0].message.content })
  } catch (error) {
    return res.status(500).json({ error: 'Service unavailable' })
  }
}
