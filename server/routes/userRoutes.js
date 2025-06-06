const express = require('express');
const router = express.Router();
const {
    getCurrentUserProfile,
    searchUsers,
    updateUserProfile,
    uploadProfilePicMiddleware, // Import the multer middleware
    getSuggestedUsers // Changed from getMostConnectedUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected and require a valid token
router.use(protect);

// GET /api/users/me - Get current logged-in user's profile
router.get('/me', getCurrentUserProfile);

// PUT /api/users/me/profile - Update current logged-in user's profile
// The uploadProfilePicMiddleware handles the 'profilePicture' file upload
router.put('/me/profile', uploadProfilePicMiddleware, updateUserProfile);

// GET /api/users/search - Search for users by name or roll number
// Example: /api/users/search?query=John&type=name
// Example: /api/users/search?query=12345&type=rollNumber
router.get('/search', searchUsers);

// GET /api/users/suggested - Get a random list of suggested users
router.get('/suggested', getSuggestedUsers);

module.exports = router; 