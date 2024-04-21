const { Schema, model } = require('mongoose');

let modrole = new Schema({
    Guild: String,
    Role: String
});

module.exports = model('modrole132213123123123', modrole);