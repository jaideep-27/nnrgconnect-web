const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'id_cards');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sign Up a new user
exports.signup = async (req, res) => {
  const { fullName, email, phoneNumber, rollNumber, password, branch, academicYear } = req.body;

  if (!fullName || !email || !phoneNumber || !rollNumber || !password || !branch || !academicYear) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'College ID card image is required.' });
  }

  try {
    // Check if user already exists by email or roll number
    let user = await User.findOne({ $or: [{ email }, { rollNumber }] });
    if (user) {
      // Important: If user exists, delete the uploaded file to prevent clutter
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'User with this email or roll number already exists.' });
    }

    // Create new user instance (password will be hashed by pre-save hook in User model)
    user = new User({
      fullName,
      email,
      phoneNumber,
      rollNumber,
      branch,
      academicYear,
      password, // Plain password, will be hashed by Mongoose pre-save hook
      collegeIdCardImage: `/uploads/id_cards/${req.file.filename}` // Path relative to server
    });

    await user.save();

    // Respond (excluding password)
    // We don't send a token here as user needs admin approval first
    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    // Attempt to delete uploaded file if an error occurs after file upload but before DB save
    if (req.file && req.file.path) {
        try {
            if(fs.existsSync(req.file.path)){
                fs.unlinkSync(req.file.path);
            }
        } catch (unlinkErr) {
            console.error('Error deleting file during signup error cleanup:', unlinkErr);
        }
    }
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
};

// Sign In an existing user
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account not yet approved by admin. Please wait.' });
    }

    // User is valid and approved, create JWT payload
    const payload = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        isAdmin: user.isAdmin 
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: payload.user
        });
      }
    );

  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ message: 'Server error during sign in.' });
  }
};

// TODO: Add more controller functions: get current user, admin actions, etc. 