const mongoose = require('mongoose');
const crypto = require('node:crypto');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 24 },
  salt: { type: String, required: true },
  hashedPassword: { type: String, required: true }
}, { timestamps: true });

userSchema.methods.setPassword = function setPassword(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hashedPassword = crypto.scryptSync(password, this.salt, 64).toString('hex');
};

userSchema.methods.checkPassword = function checkPassword(password) {
  const candidate = crypto.scryptSync(password, this.salt, 64);
  const saved = Buffer.from(this.hashedPassword, 'hex');
  return saved.length === candidate.length && crypto.timingSafeEqual(saved, candidate);
};

module.exports = mongoose.model('User', userSchema);
