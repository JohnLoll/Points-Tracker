const { Schema, model } = require('mongoose');

let companyrole = new Schema({
    Guild: String,
    Name: String,
    Role: Array,
});

module.exports = model('companyrole', companyrole);