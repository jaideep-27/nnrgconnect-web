require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Required for serving static files
const multer = require('multer'); // Required for Multer error handling
const User = require('./models/User'); // Import User model

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Added admin routes
const userRoutes = require('./routes/userRoutes'); // Added user routes
const careerRoutes = require('./routes/careerRoutes'); // Added career routes
const connectionRoutes = require('./routes/connectionRoutes'); // Added connection routes

const app = express();
const PORT = process.env.PORT || 5001; // Changed port to 5001 to avoid common conflicts

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies

// Serve static files from the 'uploads' directory (for ID cards and other assets)
// The path.join is important for cross-platform compatibility
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Use admin routes
app.use('/api/users', userRoutes); // Use user routes
app.use('/api/career', careerRoutes); // Use career routes
app.use('/api/connections', connectionRoutes); // Use connection routes

// Basic Route
app.get('/', (req, res) => {
  res.send('NNRG Connect Backend is Running!');
});

// Global Multer Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    if (err.code === 'LIMIT_FILE_SIZE') {
      // Check if this error is from profile pic upload or ID card upload based on route or a field in err
      // For now, providing a generic message, or you can make it more specific
      const maxSizeMB = err.field === 'profilePicture' ? 2 : 5; // Example: 2MB for profile, 5MB for ID
      return res.status(400).json({ message: `File is too large. Maximum size is ${maxSizeMB}MB.` });
    }
    // For other Multer errors like LIMIT_FILE_COUNT, LIMIT_FIELD_KEY, etc.
    return res.status(400).json({ message: `File upload error: ${err.message} (Code: ${err.code})` });
  } else if (err) {
    // Handle custom errors
    if (err.message === 'Not an image! Please upload an image file.') { // For ID card (legacy message)
        return res.status(400).json({ message: err.message });
    }
    // Handle the new error message from profile picture filter
    if (err.message === 'Only image files (jpg, jpeg, png, gif) are allowed!') { // For profile picture
        return res.status(400).json({ message: err.message });
    }
    
    // Log other unexpected errors
    console.error('Global Error Handler Catch-All:', err);
    return res.status(500).json({ message: 'An unexpected error occurred on the server.' });
  }
  // Everything went fine.
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// module.exports = { app }; // Removed User export as it's managed by its own module 