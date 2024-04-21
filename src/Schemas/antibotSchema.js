const { Schema, model } = require('mongoose');

let antiBot = new Schema({
    Guild: String,
});

module.exports = model('antiBot19023948723947', antiBot);