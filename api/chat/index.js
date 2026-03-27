const API_KEY = process.env.HERMES_API_KEY || 'sk-t2agtvh7n5ol3orb1sv3z';
const API_URL = 'https://api.nousresearch.com/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'hermes-3-llama-4-70b',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'AI Error' });
    }

    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('AI Error:', error);
    return res.status(500).json({ error: 'Service unavailable' });
  }
}
