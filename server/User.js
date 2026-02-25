const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  mfaEnabled: { type: Boolean, default: false },
  mfaType: { type: String, enum: ['email', 'app', 'none'], default: 'none' },
  mfaSecret: { type: String }, // For Authenticator App (TOTP)
  tempMfaCode: { type: String }, // For Email MFA
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);