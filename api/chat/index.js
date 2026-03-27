export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, apiKey } = req.body;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  // Use Nous Research API
  try {
    const response = await fetch('https://api.nousresearch.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'hermes-3-llama-4-70b',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nous API Error:', response.status, errorText);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
