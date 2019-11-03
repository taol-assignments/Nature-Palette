const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

let User;

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.statics.register = async function (email, password) {
    password = await new Promise((resolve, reject) => {
        bcrypt.hash(password, 12, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });

    let user = new User({
        email: email,
        password: password
    });

    return user.save();
};

User = mongoose.model('User', userSchema);

module.exports = User;