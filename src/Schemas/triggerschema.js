const { Schema, model } = require('mongoose');

let triggerSchema = new Schema({
    Guild: String,
    Phrase: String,
    Reply: String,
    Block: Array
});

module.exports = model('triggerschema1987123498271312', triggerSchema);