const { Schema, model } = require('mongoose');

let inbox = new Schema({
    User: String,
    Message: String,
    Guild: String,
    ID: String,
    Channel: String
});

module.exports = model('inbox2143232', inbox);