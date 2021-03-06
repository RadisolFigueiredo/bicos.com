const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  phone: Number,
  isAdmin: { type: Boolean, default: false }
});

userSchema.set('timestamps', true);

const User = mongoose.model('User', userSchema);

module.exports = User;
