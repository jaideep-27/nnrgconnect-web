const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Setup for Profile Pictures ---
const profilePicUploadPath = path.join(__dirname, '..', 'uploads', 'profile-pics');

// Ensure the upload directory exists
if (!fs.existsSync(profilePicUploadPath)) {
  fs.mkdirSync(profilePicUploadPath, { recursive: true });
}

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePicUploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = req.user.id + '-' + Date.now() + path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix);
  }
});

const imageFileFilter = (req, file, cb) => {
  console.log('imageFileFilter - Original Name:', file.originalname, 'MIME Type:', file.mimetype);

  // Primary check: MIME type
  if (file.mimetype.startsWith('image/')) {
    // Optional: Secondary check for specific allowed image types if 'image/' is too broad
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log(`File accepted by MIME type: ${file.originalname} (${file.mimetype})`);
      cb(null, true);
    } else {
      console.log(`File rejected: Unsupported image MIME type ${file.mimetype} for ${file.originalname}`);
      // Ensure this error message is caught by the global error handler or handled appropriately
      cb(new Error('Only JPG, JPEG, PNG, GIF image files are allowed!'), false);
    }
  } else {
    // Fallback: Check extension if MIME type is not 'image/*' (e.g., 'application/octet-stream')
    // This can happen if browser fails to determine mimetype correctly
    console.warn(`Warning: File MIME type is '${file.mimetype}', not 'image/*'. Checking extension for ${file.originalname}.`);
    if (file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      console.log(`File accepted by extension (MIME type was ${file.mimetype}): ${file.originalname}`);
      cb(null, true); // Allow, but with a warning about mimetype
    } else {
      console.log(`File rejected: Not an image MIME type and extension is not recognized: ${file.originalname}`);
      cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed based on extension!'), false);
    }
  }
};

// Middleware for profile picture upload (exported)
exports.uploadProfilePicMiddleware = multer({
  storage: profilePicStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
}).single('profilePicture'); // Field name for the profile picture in the form

// Get current logged-in user's profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    // We re-fetch to ensure latest data, though req.user already has most of it
    // Select exclude password which is good practice even if protect middleware already does it.
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// Update current logged-in user's profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Handle text fields from req.body
    if (req.body.linkedinProfileUrl !== undefined) {
      userToUpdate.linkedinProfileUrl = req.body.linkedinProfileUrl.trim();
    }
    // For boolean fields coming from FormData, they might be strings 'true' or 'false'
    if (req.body.displayEmail !== undefined) {
      userToUpdate.displayEmail = String(req.body.displayEmail).toLowerCase() === 'true';
    }
    if (req.body.displayContactNumber !== undefined) {
      userToUpdate.displayContactNumber = String(req.body.displayContactNumber).toLowerCase() === 'true';
    }

    // Handle profile picture upload (if a new file was uploaded by multer)
    if (req.file) {
      const newProfilePicturePath = `/uploads/profile-pics/${req.file.filename}`;

      // If there was an old profile picture, attempt to delete it
      if (userToUpdate.profilePictureUrl && userToUpdate.profilePictureUrl !== newProfilePicturePath) {
        const oldPicServerPath = path.join(__dirname, '..', userToUpdate.profilePictureUrl);
        // Basic security check: ensure we are deleting from within the uploads directory
        if (oldPicServerPath.startsWith(path.join(__dirname, '..', 'uploads'))) {
          fs.unlink(oldPicServerPath, (err) => {
            if (err) {
              console.warn('Failed to delete old profile picture:', oldPicServerPath, err.message);
            }
          });
        }
      }
      userToUpdate.profilePictureUrl = newProfilePicturePath;
    }

    const updatedUser = await userToUpdate.save();

    // Return updated user, excluding sensitive fields
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.__v;
    // also remove fields not directly part of this update for a cleaner response specific to profile
    delete userResponse.collegeIdCardImage;
    delete userResponse.isApproved;
    delete userResponse.isAdmin;
    delete userResponse.approvedAt;
    delete userResponse.approvedBy;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Handle multer specific errors, if any slip through (though typically handled by error middleware)
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Profile picture is too large. Maximum 2MB allowed.' });
      }
      return res.status(400).json({ message: `File upload error: ${error.message}` });
    }
    // Handle custom error from fileFilter
    if (error.message && error.message.includes('Only image files')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

// Search for users by name or roll number
exports.searchUsers = async (req, res) => {
  const { query, type } = req.query; // type can be 'name' or 'rollNumber'

  if (!query || !type) {
    return res.status(400).json({ message: 'Search query and type (name/rollNumber) are required.' });
  }

  try {
    let searchCriteria = {};
    if (type === 'name') {
      searchCriteria = { fullName: { $regex: query, $options: 'i' } };
    } else if (type === 'rollNumber') {
      searchCriteria = { rollNumber: { $regex: query, $options: 'i' } };
    } else {
      return res.status(400).json({ message: 'Invalid search type. Use \'name\' or \'rollNumber\'.' });
    }

    const usersFromDB = await User.find({
      ...searchCriteria,
      isApproved: true,
      _id: { $ne: req.user.id } // Exclude the current user
    })
    .select('_id fullName rollNumber email phoneNumber profilePictureUrl linkedinProfileUrl displayEmail displayContactNumber branch academicYear')
    .limit(20);

    // Process users to respect display preferences
    const usersToReturn = usersFromDB.map(user => {
      const userObject = {
        _id: user._id,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        profilePictureUrl: user.profilePictureUrl,
        linkedinProfileUrl: user.linkedinProfileUrl,
      };

      if (user.displayEmail) {
        userObject.email = user.email;
      } else {
        userObject.email = null; // Or a placeholder like "Email Hidden"
      }

      if (user.displayContactNumber) {
        userObject.phoneNumber = user.phoneNumber;
      } else {
        userObject.phoneNumber = null; // Or a placeholder like "Contact Hidden"
      }
      return userObject;
    });

    res.json(usersToReturn);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error while searching users.' });
  }
};

// Get a random sample of users for suggestions
exports.getSuggestedUsers = async (req, res) => {
  try {
    const sampleSize = 5; // The number of random users to suggest

    const users = await User.aggregate([
      // Stage 1: Match approved users who are not the current user.
      {
        $match: {
          isApproved: true,
          _id: { $ne: req.user.id } // Reverted to use .id (string) instead of ._id (ObjectId) for stability
        }
      },
      // Stage 2: Get a random sample of documents.
      { $sample: { size: sampleSize } },
      // Stage 3: Project only the fields needed for the user card.
      {
        $project: {
          _id: 1,
          fullName: 1,
          rollNumber: 1,
          branch: 1,
          academicYear: 1,
          profilePictureUrl: 1,
          linkedinProfileUrl: 1,
          displayEmail: 1,
          displayContactNumber: 1,
          email: 1,
          phoneNumber: 1
        }
      }
    ]);
    
    // The aggregation pipeline returns plain JS objects, so we need to process them.
    const usersToReturn = users.map(user => {
        const userObject = {
            _id: user._id,
            fullName: user.fullName,
            rollNumber: user.rollNumber,
            profilePictureUrl: user.profilePictureUrl,
            linkedinProfileUrl: user.linkedinProfileUrl,
        };
  
        if (user.displayEmail) {
          userObject.email = user.email;
        }
        if (user.displayContactNumber) {
          userObject.phoneNumber = user.phoneNumber;
        }
        return userObject;
    });

    res.json(usersToReturn);

  } catch (error) {
    console.error('Error fetching suggested users:', error);
    res.status(500).json({ message: 'Server error while fetching suggested users.' });
  }
};

// TODO: Add updateUserProfile if needed in the future 