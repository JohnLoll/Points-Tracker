const { Schema, model } = require('mongoose');

let msglog = new Schema({
    Guild: String,
    Channel: String,
    LogChannel: String
});

module.exports = model('msglog324234', msglog);