const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  level: {
    type: String,
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    required: true
  },
  service: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    response_time: Number,
    user_id: String,
    ip_address: String,
    endpoint: String,
    error_code: String,
    memory_usage_mb: Number,
    requests_per_minute: Number
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyScore: Number,
  anomalyReasons: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
logSchema.index({ timestamp: -1, service: 1 });
logSchema.index({ level: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);
