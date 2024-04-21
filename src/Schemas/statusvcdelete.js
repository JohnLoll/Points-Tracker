const { Schema, model } = require('mongoose');

let status = new Schema({
    Guild: String,
    Channel: String
});

module.exports = model('statusvcdelete1234234', status);