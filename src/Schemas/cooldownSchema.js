const { Schema, model } = require('mongoose');

const cooldownSchema = new Schema({
  Guild: String, // Guild ID
  User: String,  // User ID
  EndTime: Date, // When the temporary role should be removed
  InactivityEndTime: Date // When the inactivity role should be removed
});

module.exports = model('Cooldown', cooldownSchema);
