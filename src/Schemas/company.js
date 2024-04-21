const { Schema, model } = require('mongoose');

let companyname = new Schema({
    Guild: String,
    Name: String,
    Sheetid: String,
    Ceprange: String,
    Eprange: String,
    Cepquota: Number,
    Epquota: Number,
    Weeklyoffset: Number,
    Totaloffset: Number,

});

const cepModel = model('companyname', companyname);


// Extract individual properties from the schema
const {Guild, Name, Sheetid, Ceprange, Eprange, Cepquota, Epquota, Weeklyoffset, Totaloffset } = companyname.obj;

// Export the model and individual properties
module.exports = { cepModel, Guild, Name, Sheetid, Ceprange, Eprange, Cepquota, Epquota, Weeklyoffset, Totaloffset };