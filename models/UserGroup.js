const mongoose = require('mongoose');

let UserGroup;

let userGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    updateSearchTerm: {
        type: Boolean,
        required: true
    },
    uploadFiles: {
        type: Boolean,
        required: true
    }
});

module.exports = UserGroup = mongoose.model('UserGroup', userGroupSchema);
