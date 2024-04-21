const { Schema, model } = require('mongoose');

let onlinestaff = new Schema({
    Guild: String,
    Channel: String,
    Role: String
});

module.exports = model('onlinestaff234234234', onlinestaff);