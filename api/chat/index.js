const { createServer } = require('http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.HERMES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages } = req.body;
    const response = await fetch('https://api.nousresearch.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'hermes-3-llama-3.1-70b',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response';
    return res.status(200).json({ content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
