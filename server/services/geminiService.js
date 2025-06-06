const axios = require('axios');

const apiKey = process.env.GEMINI_API_KEY;

/**
 * Calls the Gemini API to generate content.
 * @param {string} inputText The input text/prompt for the Gemini model.
 * @param {object} generationConfig Optional generation configuration.
 * @returns {Promise<string>} The generated text content.
 * @throws {Error} If the API call fails or the API key is missing.
 */
async function generateContent(inputText, generationConfig = null) {
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set. Please check your .env file.');
    throw new Error('Gemini API key is not configured.');
  }

  const defaultConfig = {
    temperature: 0.7, // Adjusted for more balanced responses, 1 can be too random
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096, // Reduced from 8192 for potentially faster responses, adjust as needed
    responseMimeType: 'text/plain',
  };

  const config = generationConfig || defaultConfig;

  const data = {
    generationConfig: config,
    contents: [
      {
        role: 'user',
        parts: [
          { text: inputText },
        ],
      },
    ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // According to Gemini API documentation, the generated text is usually in:
    // response.data.candidates[0].content.parts[0].text
    if (response.data && response.data.candidates && response.data.candidates.length > 0 &&
        response.data.candidates[0].content && response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      // Log the unexpected response structure for debugging
      console.error('Unexpected response structure from Gemini API:', response.data);
      // Check for prompt feedback which might indicate issues like safety blocks
      if (response.data && response.data.promptFeedback) {
        console.error('Prompt Feedback:', response.data.promptFeedback);
        const blockReason = response.data.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`Content generation blocked by API. Reason: ${blockReason}. Check safety settings or prompt content.`);
        }
      }
      throw new Error('Failed to extract content from Gemini API response or content was empty/blocked.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.error) {
        throw new Error(`Gemini API Error: ${error.response.data.error.message} (Code: ${error.response.data.error.code})`);
    }
    throw new Error('Failed to generate content using Gemini API.');
  }
}

module.exports = { generateContent }; 