const { Schema, model } = require('mongoose');

let note = new Schema({
    Guild: String,
    User: String,
    Note: String,
    Moderator: String
});

module.exports = model('note234234', note);