const { Schema, model } = require('mongoose');

let favorite = new Schema({
    MessageID: String,
    MessageContent: String,
    MessageLink: String
});

module.exports = model('favoritemessages129324234', favorite);