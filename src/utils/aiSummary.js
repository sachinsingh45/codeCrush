const axios = require('axios');

async function generateAISummary(reviews) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error('Cohere API key not set');
  const prompt = `Summarize the following code reviews into a concise, helpful summary for the code author.\n\nReviews:\n${reviews.map((r, i) => `${i+1}. ${r}`).join('\n')}\n\nSummary:`;
  const response = await axios.post('https://api.cohere.ai/v1/generate', {
    model: 'command',
    prompt,
    max_tokens: 120,
    temperature: 0.5
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.generations[0].text.trim();
}

module.exports = { generateAISummary }; 