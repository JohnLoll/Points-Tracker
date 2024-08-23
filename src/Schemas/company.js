const { Schema, model } = require('mongoose');

let companyname = new Schema({
    Guild: String,
    Name: String,
    Sheetid: String,
    Ceprange: String,
    Eprange: String,
    Trooperrange: String,
    Trooperstart: Number,
    Officerstart: Number,
    Weeklycolumoffset: Number,
    Totalcolumoffset: Number,
    Cepquota: Number,
    Epquota: Number,
    Weeklyoffset: Number,
    Totaloffset: Number,

});

const cepModel = model('companyname', companyname);


// Extract individual properties from the schema
const {Guild, Name, Sheetid, Ceprange, Eprange,Trooperrange, Trooperstart, Officerstart, Weeklycolumoffset, Totalcolumoffset, Cepquota, Epquota, Weeklyoffset, Totaloffset } = companyname.obj;

// Export the model and individual properties
module.exports = { cepModel, Guild, Name, Sheetid, Ceprange, Eprange, Trooperrange, Trooperstart, Officerstart, Weeklycolumoffset, Totalcolumoffset,  Cepquota, Epquota, Weeklyoffset, Totaloffset };