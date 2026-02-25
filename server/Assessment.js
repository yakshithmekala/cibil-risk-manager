const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullName: { type: String, required: true },
    paymentHistory: Number,
    creditUtilization: Number,
    creditAge: Number,
    creditMix: String,
    hardInquiries: Number,
    estimatedScore: Number,
    riskLevel: String,
    suggestions: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Assessment", assessmentSchema);
