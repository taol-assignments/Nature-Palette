const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserGroup = require('./UserGroup');

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
    },
    userGroup: {
        type: ObjectId,
        ref: 'UserGroup',
        required: true
    }
});

userSchema.statics.register = async function (email, password) {
    password = await bcrypt.hash(password, 12);

    let user = new User({
        email: email,
        password: password,
        userGroup: (await UserGroup.findOne({name: "Researchers"}))._id
    });

    return user.save();
};

userSchema.statics.validate = async function (email, password) {
    let user = await User.findOne({
        email: email,
    }).populate('userGroup');

    if (!user) {
        return null;
    }

    if (await bcrypt.compare(password, user.password)) {
        return user;
    } else {
        return null;
    }
};

module.exports = User = mongoose.model('User', userSchema);
