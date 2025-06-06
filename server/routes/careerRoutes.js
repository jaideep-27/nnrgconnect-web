const express = require('express');
const router = express.Router();
const {
  analyzeResume,
  getCareerTips,
  uploadResumePdf, // Import the multer middleware for PDF uploads
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware'); // Changed to 'protect'

// Route for resume analysis
// POST /api/career/analyze-resume
// The `uploadResumePdf` middleware handles the file upload named 'resume'
// `protect` ensures the user is logged in
router.post('/analyze-resume', protect, uploadResumePdf, analyzeResume);

// Route for getting career tips
// POST /api/career/get-tips
// `protect` ensures the user is logged in
router.post('/get-tips', protect, getCareerTips);

// Multer error handling middleware specific to these routes (optional, can also be global)
// This handles errors like 'Not a PDF!' or file size limits from the careerController's multer setup.
router.use((err, req, res, next) => {
  if (err.message === 'Not a PDF! Please upload a PDF file.') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
  }
  // If it's not a Multer error we recognize here, pass it on
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  // For other errors, especially if they are not handled by the global error handler properly
  if (err) {
    console.error('Error in career routes:', err); 
    return res.status(500).json({ message: 'An unexpected error occurred in career services.' });
  }
  next();
});


module.exports = router; 