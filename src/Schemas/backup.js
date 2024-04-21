const { Schema, model } = require('mongoose');

let backup = new Schema({
    Guild: String,
    Channels: Array,
    Roles: Array,
});

module.exports = model('backupSChema190782314978232', backup);