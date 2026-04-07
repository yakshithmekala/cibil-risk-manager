const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullName: { type: String, required: true },
    // Core parameters for score calculation
    paymentHistory: Number, // Percentage of on-time payments
    creditUtilization: Number, // Percentage of credit used
    creditAge: Number, // Number of years
    creditMix: String, // "good", "average", "poor"
    hardInquiries: Number, // Number of inquiries
    
    // Additional fields for realistic Credit Summary
    totalAccounts: { type: Number, default: 0 },
    activeLoans: { type: Number, default: 0 },
    creditCards: { type: Number, default: 0 },
    closedAccounts: { type: Number, default: 0 },
    totalCreditLimit: { type: Number, default: 0 },
    usedCreditLimit: { type: Number, default: 0 },
    
    estimatedScore: Number,
    riskLevel: String,
    suggestions: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Assessment", assessmentSchema);

