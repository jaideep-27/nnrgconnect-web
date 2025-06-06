const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get all users pending approval
exports.getPendingUsers = async (req, res) => {
  try {
    // Find users that are not yet approved and are not admins themselves
    const pendingUsers = await User.find({ isApproved: false, isAdmin: false })
                                   .select('-password -__v') // Exclude password and version key
                                   .sort({ createdAt: -1 }); // Show newest first
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Server error while fetching pending users.' });
  }
};

// Approve a user registration
exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isApproved) {
      return res.status(400).json({ message: 'User is already approved.' });
    }

    user.isApproved = true;
    user.approvedAt = Date.now();
    user.approvedBy = req.user.id; // Admin who approved the user
    await user.save();

    // TODO: Potentially send an email notification to the user upon approval

    res.json({ message: `User ${user.fullName} (${user.rollNumber}) approved successfully.` });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Server error while approving user.' });
  }
};

// Reject a user registration
exports.rejectUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isApproved) {
      return res.status(400).json({ message: 'Cannot reject an already approved user. Consider suspending or deleting.' });
    }

    // For rejected users, we should delete their record and their uploaded ID card image.
    const imagePath = path.join(__dirname, '..', user.collegeIdCardImage);

    await User.findByIdAndDelete(userId);

    // Delete the ID card image file
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting ID card image for rejected user:', err);
          // Non-critical error, so don't send 500 to client just for this.
          // Log it for admin to check.
        }
      });
    } else {
        console.warn(`ID card image not found for rejected user ${userId} at path ${imagePath}`);
    }

    // TODO: Potentially send an email notification to the user about rejection

    res.json({ message: `User registration for ${user.fullName} (${user.rollNumber}) rejected and record deleted.` });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Server error while rejecting user.' });
  }
};

// Get all users (for admin view, might need pagination later)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
}; 