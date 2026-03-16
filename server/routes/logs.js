const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { detectAnomaly } = require('../services/anomalyDetector');

// @route   POST /api/logs
// @desc    Create new log entry
// @access  Public
router.post('/', async (req, res) => {
  try {
    const logData = req.body;
    
    // Detect anomaly
    const anomalyResult = detectAnomaly(logData);
    
    const log = new Log({
      ...logData,
      isAnomaly: anomalyResult.isAnomaly,
      anomalyScore: anomalyResult.score,
      anomalyReasons: anomalyResult.reasons
    });
    
    await log.save();
    
    // Emit to connected clients via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('newLog', log);
      
      if (anomalyResult.isAnomaly) {
        io.emit('anomalyDetected', {
          log,
          score: anomalyResult.score,
          reasons: anomalyResult.reasons
        });
        console.log(`🚨 ANOMALY: ${log.service} - ${log.message} (Score: ${anomalyResult.score})`);
      }
      io.to(log.service).emit('serviceLog', log);
    }
    
    res.status(201).json({
      success: true,
      data: log,
      anomaly: anomalyResult
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/logs
// @desc    Get logs with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      service, 
      level, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      anomalyOnly = false
    } = req.query;
    
    // Build query
    const query = {};
    
    if (service) query.service = service;
    if (level) query.level = level;
    if (anomalyOnly === 'true') query.isAnomaly = true;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Log.countDocuments(query);
    
    res.json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/logs/stats
// @desc    Get aggregated statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$service',
          totalLogs: { $sum: 1 },
          errorCount: {
            $sum: { $cond: [{ $eq: ['$level', 'ERROR'] }, 1, 0] }
          },
          warnCount: {
            $sum: { $cond: [{ $eq: ['$level', 'WARN'] }, 1, 0] }
          },
          anomalyCount: {
            $sum: { $cond: ['$isAnomaly', 1, 0] }
          },
          avgResponseTime: { 
            $avg: '$metadata.response_time' 
          },
          maxResponseTime: { 
            $max: '$metadata.response_time' 
          }
        }
      },
      { $sort: { totalLogs: -1 } }
    ]);
    
    const overall = await Log.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $eq: ['$level', 'ERROR'] }, 1, 0] }
          },
          anomalies: {
            $sum: { $cond: ['$isAnomaly', 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byService: stats,
        overall: overall[0] || { total: 0, errors: 0, anomalies: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/logs/timeline
// @desc    Get logs grouped by time intervals
// @access  Public
router.get('/timeline', async (req, res) => {
  try {
    const { interval = 'hour', limit = 24 } = req.query;
    
    let groupBy;
    switch (interval) {
      case 'minute':
        groupBy = { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' }, hour: { $hour: '$timestamp' }, minute: { $minute: '$timestamp' } };
        break;
      case 'hour':
        groupBy = { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' }, hour: { $hour: '$timestamp' } };
        break;
      case 'day':
        groupBy = { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } };
        break;
      default:
        groupBy = { hour: { $hour: '$timestamp' } };
    }
    
    const timeline = await Log.aggregate([
      { $sort: { timestamp: -1 } },
      { $limit: parseInt(limit) * 100 },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          errors: { $sum: { $cond: [{ $eq: ['$level', 'ERROR'] }, 1, 0] } },
          warnings: { $sum: { $cond: [{ $eq: ['$level', 'WARN'] }, 1, 0] } },
          anomalies: { $sum: { $cond: ['$isAnomaly', 1, 0] } }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      interval,
      data: timeline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/logs/services
// @desc    Get list of all services
// @access  Public
router.get('/services', async (req, res) => {
  try {
    const services = await Log.distinct('service');
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/logs/cleanup
// @desc    Delete old logs (cleanup)
// @access  Public
router.delete('/cleanup', async (req, res) => {
  try {
    const { daysOld = 7 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));
    
    const result = await Log.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    res.json({
      success: true,
      deleted: result.deletedCount,
      message: `Deleted logs older than ${daysOld} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/logs/:id
// @desc    Get single log by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, error: 'Log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/logs/debug/baselines
router.get('/debug/baselines', (req, res) => {
  const { getBaselines } = require('../services/anomalyDetector');
  res.json({
    success: true,
    data: getBaselines()
  });
});

module.exports = router;
