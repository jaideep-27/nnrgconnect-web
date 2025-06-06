const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  // user1 and user2 will store ObjectIds of the connected users.
  // To ensure uniqueness and easier querying, we can enforce a convention,
  // e.g., user1 always stores the ID that is lexicographically smaller.
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure that the combination of user1 and user2 is unique.
// This prevents duplicate connection entries regardless of order if handled in application logic.
connectionSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Pre-save hook to ensure user1 < user2 lexicographically if not handled by application logic before saving
// This simplifies checking for existing connections (e.g., always query with smaller ID first)
connectionSchema.pre('save', function(next) {
  if (this.user1 && this.user2) {
    // Convert ObjectIds to strings for comparison
    const id1 = this.user1.toString();
    const id2 = this.user2.toString();
    if (id1 > id2) {
      // Swap them if user1's ID string is greater than user2's
      [this.user1, this.user2] = [this.user2, this.user1];
    }
  }
  next();
});


const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection; 