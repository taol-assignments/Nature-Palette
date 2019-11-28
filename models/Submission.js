const fs = require('fs');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Metadata = require('./Metadata');

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
    },
    createdAt: {
        type: Date,
        default: function () {
            return Date.now();
        },
        require: true
    }
});

submissionSchema.methods.getRawFilePath = function (file) {
    return `${__dirname}/../uploads/${this._id}/RawFiles/${file}.Master.Transmission`;
};

submissionSchema.methods.getUnprocessedPath = function (file) {
    return `${__dirname}/../uploads/${this._id}/Unprocessed/${file}.Master.Transmission`;
};

function unlink(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            console.log(err);
            if (err && err.code !== 'ENOENT') {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

submissionSchema.methods.modify = async function (modify) {
    let old2new = {};
    for (let doc of modify.replace) {
        old2new[doc.FileName] = doc;
    }

    await Promise.all([
        Promise.all(modify.delete.map(doc => Promise.all([
                unlink(this.getRawFilePath(doc.FileName)),
                Metadata.deleteMany({
                    Submission: this._id,
                    FileName: doc.FileName
                })
            ])
        )),
        Promise.all(modify.add.map(doc => {
            doc.FileName = doc.NewFileName;
            delete doc.NewFileName;

            doc = new Metadata(doc);
            return doc.save();
        })),
        Metadata.find({
            Submission: this._id,
            FileName: {
                $in: modify.replace.map(doc => doc.FileName)
            }
        }).then(result => Promise.all(result.map(doc => {
            let oldName = doc.FileName;
            let alter = old2new[doc.FileName];
            doc.FileName = alter.NewFileName;

            for (let k in alter) {
                if (alter.hasOwnProperty(k) && k !== 'FileName' && k !== 'NewFileName') {
                    doc[k] = alter[k];
                }
            }

            return Promise.all([
                unlink(this.getRawFilePath(oldName)),
                doc.save()
            ])
        })))
    ]);
};

module.exports = mongoose.model('submission', submissionSchema);