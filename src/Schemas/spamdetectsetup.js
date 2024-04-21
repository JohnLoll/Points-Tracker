const { Schema, model } = require('mongoose');

let spamdetect = new Schema({
    Guild: String,
    Channel: String
});

module.exports = model('spamdetectsetup323234', spamdetect);