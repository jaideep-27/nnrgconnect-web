const multer = require('multer');
const pdfParse = require('pdf-parse');
const { generateContent } = require('../services/geminiService');

// Configure Multer for PDF file uploads
// We'll store files in memory for processing, then discard. No need to save to disk here.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Not a PDF! Please upload a PDF file.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit for PDF files
  },
});

// Middleware for single PDF upload, field name 'resume'
const uploadResumePdf = upload.single('resume');

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' });
    }

    // Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF or PDF is empty.' });
    }

    // Create a prompt for Gemini API
    const prompt = `Analyze the following resume text and provide constructive feedback and suggestions for improvement. Focus on clarity, impact, and common resume best practices. Highlight strengths and areas for development. Format the output clearly, perhaps with sections for suggestions, strengths, and areas to improve.:\n\n---\n${resumeText}\n---\nSuggestions:`;

    const suggestions = await generateContent(prompt);
    res.status(200).json({ suggestions });

  } catch (error) {
    console.error('Error in analyzeResume:', error);
    if (error.message.startsWith('Not a PDF!') || error.message.startsWith('File is too large')) {
        return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('Gemini API Error') || error.message.includes('Gemini API key is not configured')) {
        return res.status(500).json({ message: `Failed to get suggestions from AI service: ${error.message}` });
    }
    res.status(500).json({ message: 'Error processing resume. ' + error.message });
  }
};

const getCareerTips = async (req, res) => {
  try {
    const { interests, currentRole, experienceLevel } = req.body;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ message: 'Please provide a list of interests.' });
    }

    // Construct a detailed prompt
    let prompt = `Provide career tips for someone interested in the following fields: ${interests.join(', ')}.`;
    if (currentRole) {
      prompt += ` Their current role is ${currentRole}.`;
    }
    if (experienceLevel) {
      prompt += ` Their experience level is ${experienceLevel}.`;
    }
    prompt += ` Offer actionable advice, potential career paths, skills to develop, and resources for learning.`;

    const tips = await generateContent(prompt);
    res.status(200).json({ tips });

  } catch (error) {
    console.error('Error in getCareerTips:', error);
     if (error.message.includes('Gemini API Error') || error.message.includes('Gemini API key is not configured')) {
        return res.status(500).json({ message: `Failed to get tips from AI service: ${error.message}` });
    }
    res.status(500).json({ message: 'Error generating career tips. ' + error.message });
  }
};

module.exports = {
  analyzeResume,
  getCareerTips,
  uploadResumePdf, // Export the multer middleware to be used in routes
}; 