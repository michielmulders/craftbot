var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    score: String,
    date: String
});

module.exports = mongoose.model('Craftball', schema);