const Connection = require('../models/Connection');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to determine user1 and user2 based on lexicographical ID order
const getOrderedUserIds = (id1, id2) => {
  const id1Str = id1.toString();
  const id2Str = id2.toString();
  return id1Str < id2Str ? { user1: id1, user2: id2 } : { user1: id2, user2: id1 };
};

exports.createConnection = async (req, res) => {
  const currentUserId = req.user.id; // From auth middleware
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ message: 'Target user ID is required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: 'Invalid target user ID format.' });
  }

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: 'Cannot connect with yourself.' });
  }

  const { user1, user2 } = getOrderedUserIds(currentUserId, targetUserId);

  try {
    // Check if target user exists
    const targetUserExists = await User.findById(targetUserId);
    if (!targetUserExists) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({ user1, user2 });
    if (existingConnection) {
      return res.status(409).json({ message: 'Connection already exists.', connection: existingConnection });
    }

    const newConnection = new Connection({ user1, user2 });
    await newConnection.save();

    res.status(201).json({ message: 'Connection established successfully.', connection: newConnection });
  } catch (error) {
    console.error('Error creating connection:', error);
    if (error.code === 11000) { // Duplicate key error, though pre-check should catch it
        return res.status(409).json({ message: 'Connection already exists (concurrent request?).' });
    }
    res.status(500).json({ message: 'Server error while creating connection.' });
  }
};

exports.getUserConnections = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const connections = await Connection.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }],
    })
    .populate('user1', '_id fullName profilePictureUrl linkedinProfileUrl rollNumber')
    .populate('user2', '_id fullName profilePictureUrl linkedinProfileUrl rollNumber');

    // Transform connections to show only the *other* user
    const connectedUsers = connections.map(conn => {
      let otherUser = {};
      if (conn.user1._id.toString() === currentUserId) {
        otherUser = conn.user2;
      } else {
        otherUser = conn.user1;
      }
      return {
        connectionId: conn._id,
        connectedAt: conn.createdAt,
        user: {
            _id: otherUser._id,
            fullName: otherUser.fullName,
            profilePictureUrl: otherUser.profilePictureUrl,
            linkedinProfileUrl: otherUser.linkedinProfileUrl,
            rollNumber: otherUser.rollNumber,
        }
      };
    });

    res.json(connectedUsers);
  } catch (error) {
    console.error('Error fetching user connections:', error);
    res.status(500).json({ message: 'Server error while fetching connections.' });
  }
};

exports.checkConnectionStatus = async (req, res) => {
  const currentUserId = req.user.id;
  const { targetUserId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: 'Invalid target user ID format.' });
  }

  const { user1, user2 } = getOrderedUserIds(currentUserId, targetUserId);

  try {
    const connection = await Connection.findOne({ user1, user2 });
    if (connection) {
      res.json({ connected: true, connectionId: connection._id, connectedAt: connection.createdAt });
    } else {
      res.json({ connected: false });
    }
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ message: 'Server error while checking connection status.' });
  }
};

exports.checkBulkConnectionStatus = async (req, res) => {
  const currentUserId = req.user.id;
  const { userIds } = req.body; // Expecting an array of user IDs

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'An array of userIds is required.' });
  }

  try {
    // Find all connections where the current user is either user1 or user2...
    const connections = await Connection.find({
      $or: [
        { user1: currentUserId, user2: { $in: userIds } },
        { user2: currentUserId, user1: { $in: userIds } }
      ]
    });

    // Create a Set of connected user IDs for quick lookup
    const connectedIds = new Set();
    connections.forEach(conn => {
      // Add the ID that is NOT the current user's ID
      if (conn.user1.toString() === currentUserId) {
        connectedIds.add(conn.user2.toString());
      } else {
        connectedIds.add(conn.user1.toString());
      }
    });

    // Create a response map of { userId: boolean }
    const statusMap = {};
    userIds.forEach(id => {
      statusMap[id] = connectedIds.has(id);
    });

    res.json(statusMap);

  } catch (error) {
    console.error('Error checking bulk connection status:', error);
    res.status(500).json({ message: 'Server error during bulk status check.' });
  }
}; 