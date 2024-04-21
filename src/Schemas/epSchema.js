const mongoose = require('mongoose');

// Define EP Schema
const EPSchema = new mongoose.Schema({
  officerReplying: { type: String, default: null },
  lookingForReply: { type: Boolean, default: false },
  msgToReplyep: { type: String, default: null },
  reason: { type: String, default: '' },
  mentionedUser: { type: String, default: null },
  amountToRemoveep: { type: Number, default: null },
  amountToAddep: { type: Number, default: null },
  avatar: { type: String, default: '' }
});

// Export EP model
module.exports = mongoose.model('epshem', EPSchema);
