const axios = require('axios');

/**
 * Generates AI summary from code reviews using Cohere API
 * @param {Array<string>} reviews - Array of review texts to summarize
 * @returns {Promise<string>} - Generated summary text
 * @throws {Error} - If API key is not set or API call fails
 */
async function generateAISummary(reviews) {
  // Validate API key
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error('Cohere API key not set');
  }
  
  // Build prompt with numbered reviews
  const reviewsList = reviews.map((review, index) => `${index + 1}. ${review}`).join('\n');
  const prompt = `Summarize the following code reviews into a concise, helpful summary for the code author.\n\nReviews:\n${reviewsList}\n\nProvide a brief summary highlighting the main points and suggestions from the reviews.`;
  
  try {
    // Call Cohere v2 Chat API
    const response = await axios.post(
      'https://api.cohere.com/v2/chat',
      {
        model: 'command-r-plus-08-2024',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract and return the generated text
    const summaryText = response.data.message.content[0].text.trim();
    return summaryText;
  } catch (error) {
    // Log error only in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Cohere API Error:', error.response?.data || error.message);
    }
    throw new Error('Failed to generate AI summary');
  }
}

module.exports = { generateAISummary };