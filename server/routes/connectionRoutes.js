const express = require('express');
const router = express.Router();
const {
  createConnection,
  getUserConnections,
  checkConnectionStatus,
  checkBulkConnectionStatus,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(protect);

// POST /api/connections - Create a new connection
// Expects { targetUserId: 'someUserId' } in the request body
router.post('/', createConnection);

// GET /api/connections/me - Get all connections for the logged-in user
router.get('/me', getUserConnections);

// GET /api/connections/status/:targetUserId - Check connection status with a target user
router.get('/status/:targetUserId', checkConnectionStatus);

// POST /api/connections/status/bulk - Check connection status for multiple users
router.post('/status/bulk', checkBulkConnectionStatus);

module.exports = router; 