const { Schema, model } = require('mongoose');

let spamdetect = new Schema({
    Guild: String,
    User: String,
    Count: Number, 
    Time: Number,
});

module.exports = model('spamdetect2324234', spamdetect);