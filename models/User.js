const mongoose = require('mongoose');

let User;

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.statics.register = async function (email, password) {
  let user = new User({
      email: email,
      password: password
  });

  return user.save();
};

User = mongoose.model('User', userSchema);

module.exports = User;