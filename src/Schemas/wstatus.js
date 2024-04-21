const { Schema, model } = require('mongoose');

let wstatus = new Schema({
    Guild: String,
    Enabled: Boolean,
    DM: Boolean
});

module.exports = model('wstatus213123', wstatus);