const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    tier: { type: String, enum: ['free', 'pro'], default: 'free' },
    trialExpiresAt: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String }
});

module.exports = mongoose.model('User', userSchema);
