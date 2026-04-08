const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    type: { type: String, default: 'insight' } // insight, recommendation, prediction
});

module.exports = mongoose.model('AiHistory', aiHistorySchema);
