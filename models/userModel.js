const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user should have a name.'],
  },
  email: {
    type: String,
    required: [true, 'A user should have a mail.'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  role: {
    type: String,
    default: 'user',
    trim: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'A user should have password.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (confirmedPassword) {
        return confirmedPassword === this.password;
      },
      message: 'Confirmed password should match password!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordTokenValidTime: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userpassword
) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

userSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  // Encrypt the token and then store it in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordTokenValidTime = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
