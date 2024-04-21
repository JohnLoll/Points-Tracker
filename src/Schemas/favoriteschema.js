const { Schema, model } = require('mongoose');

let favorites = new Schema({
    Guild: String,
    User: String,
    Channel: String,
    Note: String
});

module.exports = model('favorites34322', favorites);