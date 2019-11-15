const mongoose = require('mongoose');

let SearchTerm;

let searchTermSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = SearchTerm = mongoose.model('SearchTerm', searchTermSchema);