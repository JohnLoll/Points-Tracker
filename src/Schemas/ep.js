const { Schema, model } = require('mongoose');

// Define the schema
const epSchema = new Schema({
    Name: String,
    Guild: String,
    Sheetid: String,
    Range: String,
    Weeklyoffset: Number,
    Totaloffset: Number,
});

// Create the model
const epModel = model('ep', epSchema);

// Extract individual properties from the schema
const { Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset } = epSchema.obj;

// Export the model and individual properties
module.exports = { epModel, Name, Guild, Sheetid, Range, Weeklyoffset, Totaloffset };
