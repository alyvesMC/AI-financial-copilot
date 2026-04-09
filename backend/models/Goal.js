const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    monthlyContribution: { type: Number },
    estimatedMonths: { type: Number },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    steps: [{ type: String }],
    isAIGenerated: { type: Boolean, default: false },
    // PRO Features Integration
    optimizationStrategy: { type: String },
    successProbability: { type: Number }, 
    estimatedSavings: { type: Number },
    deadline: { type: Date }
});

module.exports = mongoose.model('Goal', goalSchema);
