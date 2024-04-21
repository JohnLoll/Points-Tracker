const { Schema, model } = require('mongoose');

let officerrole = new Schema({
    Guild: String,
    Role: String
});

module.exports = model('officerrole132213123123123', officerrole);