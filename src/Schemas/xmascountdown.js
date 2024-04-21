const { Schema, model } = require('mongoose');

let xmas = new Schema({
    Guild: String,
    Channel: String
});

module.exports = model('xmas', xmas);