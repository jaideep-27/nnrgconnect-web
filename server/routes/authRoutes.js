const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // The authController already creates this directory if it doesn't exist.
    // However, good to have it here as well for clarity or if controller changes.
    const uploadPath = path.join(__dirname, '..', 'uploads', 'id_cards');
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: fileFilter 
});

// POST /api/auth/signup
// The `upload.single('collegeIdCardImage')` middleware processes the file upload
// named 'collegeIdCardImage' in the form-data before it hits authController.signup
router.post('/signup', upload.single('collegeIdCardImage'), authController.signup);

// POST /api/auth/signin
router.post('/signin', authController.signin);

// TODO: Add routes for fetching current user, admin actions etc.

module.exports = router; 