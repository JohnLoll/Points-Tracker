const { Schema, model } = require('mongoose');

let couting = new Schema({
    Guild: String,
    Channel: String,
    Number: Number
});

module.exports = model('countingSystemSchema', counting);