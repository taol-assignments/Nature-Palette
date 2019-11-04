const crypto = require('crypto');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let Token;

let tokenSchema = new mongoose.Schema({
    nonce: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    expireAt: {
        type: Date,
        required: true,
        default: function () {
            return new Date(Date.now() + 86400 * 14 * 1000);
        }
    },
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    }
});

tokenSchema.statics.create = async function (user) {
    let nonce;

    do {
        nonce = await new Promise((resolve, reject) => {
            crypto.randomBytes(256, (err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer.toString('hex'));
                }
            })
        });

        try {
            let token = new Token({
                nonce: nonce,
                user: user._id
            });

            return await token.save();
        } catch (e) {
            // 11000 represents duplicate key error.
            if (e.code !== 11000) {
                throw e;
            }
        }
    } while (true);
};

tokenSchema.statics.validate = async function(nonce) {
    await Token.deleteMany({
        expireAt: {
            $lte: Date.now()
        }
    });

    return Token.findOne({nonce: nonce});
};

tokenSchema.statics.delete = async function(nonce) {
    await Token.deleteMany({
        $or: [{
            nonce: nonce
        }, {
            expireAt: {
                $lte: Date.now()
            }
        }]
    });
};

module.exports = Token = mongoose.model('Token', tokenSchema);