module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, mood, wallet } = req.body;
  const apiKey = process.env.HERMES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ content: 'API key not configured. Please set HERMES_API_KEY in Vercel environment variables.' });
  }

  const systemPrompt = `You are NOETICA, an empathetic AI mental health companion on the COTI Network. You provide warm, supportive conversations. User mood: ${mood || 'not specified'}. Wallet: ${wallet || 'anonymous'}. Keep responses conversational and under 200 words. Never give medical advice.`;

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...(messages || [])
  ];

  fetch('https://api.nousresearch.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'hermes-3-llama-4-70b',
      messages: allMessages,
      max_tokens: 500,
      temperature: 0.8
    })
  })
  .then(r => r.json())
  .then(data => {
    const content = data.choices?.[0]?.message?.content || 'I hear you. Tell me more about how you\'re feeling.';
    res.status(200).json({ content });
  })
  .catch(err => {
    console.error('AI Error:', err);
    res.status(500).json({ content: 'I apologize, but I\'m having trouble connecting right now. Please try again.' });
  });
};
