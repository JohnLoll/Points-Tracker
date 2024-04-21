const { Schema, model } = require('mongoose');

let blockcmd = new Schema({
    Guild: String,
    Command: String
});

module.exports = model('blockcmd2987297', blockcmd);