const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true, 
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phoneNumber: { type: String, required: true, trim: true }, // Add validation if needed
  rollNumber: { type: String, required: true, unique: true, trim: true },
  
  // New Academic Fields
  branch: { type: String, required: true, trim: true },
  academicYear: { type: String, required: true, trim: true }, // e.g., "2021-2025"

  password: { type: String, required: true }, // Will be hashed before saving
  collegeIdCardImage: { type: String, required: true }, // Path or URL to the uploaded image
  isApproved: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  
  // New Profile Fields
  profilePictureUrl: { type: String, default: '' }, // URL to the uploaded profile picture
  linkedinProfileUrl: { type: String, trim: true, default: '' },
  displayEmail: { type: Boolean, default: true },
  displayContactNumber: { type: Boolean, default: true },

  // Connections field
  connections: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: []
  },

  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin who approved
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 