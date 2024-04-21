const { Schema, model } = require('mongoose');

let status = new Schema({
    Guild: String,
    Category: String
});

module.exports = model('statusvc1234234', status);