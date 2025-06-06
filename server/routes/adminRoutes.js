const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes in this file are protected and require admin privileges
router.use(protect);
router.use(isAdmin);

// GET /api/admin/pending-requests - Get all users pending approval
router.get('/pending-requests', adminController.getPendingUsers);

// PUT /api/admin/approve/:userId - Approve a user registration
router.put('/approve/:userId', adminController.approveUser);

// PUT /api/admin/reject/:userId - Reject a user registration (deletes user and their ID image)
router.put('/reject/:userId', adminController.rejectUser);

// GET /api/admin/users - Get all users (for admin overview)
router.get('/users', adminController.getAllUsers);

module.exports = router; 