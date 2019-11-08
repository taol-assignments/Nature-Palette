const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let submissionSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        require: true,
        ref: 'User'
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    institution: {
        type: String,
        require: true
    },
    dataType: {
        type: String,
        enum: ['Transmittance', 'Reflectance', 'Irradiance'],
        require: true
    },
    dataFrom: {
        type: String,
        enum: ['Field', 'Museum'],
        require: true
    },
    isPublished: {
        type: Boolean,
        require: true
    },
    reference: {
        type: String,
        require: function () {
            return this.isPublished;
        }
    },
    DOI: {
        type: String,
        require: function () {
            return this.isPublished;
        }
    },
    isEmbargo: {
        type: Boolean,
        require: true
    },
    availableAt: {
        type: Date,
        require: function () {
            return this.isEmbargo;
        }
    }
});

module.exports = mongoose.model('submission', submissionSchema);