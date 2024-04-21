const { Schema, model } = require('mongoose');

let birthday = new Schema({
    Guild: String,
    Channel: String,
    User: String,
    Date: String
});

module.exports = model('birthday3245534534', birthday);