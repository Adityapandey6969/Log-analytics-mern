class AnomalyDetector {
  constructor() {
    this.recentLogs = [];
    this.maxHistory = 1000;
    this.serviceBaselines = new Map();
  }
  
  /**
   * Main detection method
   * Returns: { isAnomaly: boolean, score: number, reasons: string[] }
   */
  detectAnomaly(log) {
    const reasons = [];
    let score = 0;
    
    // Rule 1: Log level severity (30% weight)
    const levelScore = this.checkLogLevel(log);
    score += levelScore;
    if (levelScore > 0) {
      reasons.push(`High severity level: ${log.level}`);
    }
    
    // Rule 2: Response time anomaly (40% weight)
    const responseScore = this.checkResponseTime(log);
    score += responseScore;
    if (responseScore > 0) {
      reasons.push(`Abnormal response time: ${log.metadata?.response_time}ms`);
    }
    
    // Rule 3: Time-based anomaly (10% weight)
    const timeScore = this.checkTimeAnomaly(log);
    score += timeScore;
    if (timeScore > 0) {
      reasons.push(`Unusual activity time`);
    }
    
    // Rule 4: Error pattern matching (20% weight)
    const patternScore = this.checkErrorPatterns(log);
    score += patternScore;
    if (patternScore > 0) {
      reasons.push(`Critical error pattern detected`);
    }
    
    // Update history
    this.updateHistory(log);
    
    const isAnomaly = score >= 0.6; // 60% threshold
    
    return {
      isAnomaly,
      score: parseFloat(score.toFixed(2)),
      reasons: isAnomaly ? reasons : []
    };
  }
  
  /**
   * Rule 1: Check log level severity
   */
  checkLogLevel(log) {
    const levelWeights = {
      'DEBUG': 0,
      'INFO': 0,
      'WARN': 0.2,
      'ERROR': 0.3
    };
    
    return levelWeights[log.level] || 0;
  }
  
  /**
   * Rule 2: Response time anomaly detection
   */
  checkResponseTime(log) {
    if (!log.metadata?.response_time) return 0;
    
    const service = log.service;
    const responseTime = log.metadata.response_time;
    
    // Get baseline for this service
    const baseline = this.getServiceBaseline(service);
    
    if (!baseline) {
      // No baseline yet, update it
      this.updateServiceBaseline(service, responseTime);
      return 0;
    }
    
    const { avg, stdDev } = baseline;
    
    // Anomaly if > 3 standard deviations from mean
    if (responseTime > avg + (3 * stdDev)) {
      return 0.4;
    }
    
    // Warning if > 2 standard deviations
    if (responseTime > avg + (2 * stdDev)) {
      return 0.2;
    }
    
    return 0;
  }
  
  /**
   * Rule 3: Time-based anomaly (unusual hours)
   */
  checkTimeAnomaly(log) {
    const hour = new Date(log.timestamp).getHours();
    
    // High activity during off-hours (2 AM - 5 AM)
    if (hour >= 2 && hour <= 5) {
      // But only if it's an ERROR or WARN
      if (log.level === 'ERROR') return 0.1;
      if (log.level === 'WARN') return 0.05;
    }
    
    return 0;
  }
  
  /**
   * Rule 4: Error pattern matching
   */
  checkErrorPatterns(log) {
    const criticalPatterns = [
      /timeout/i,
      /connection\s+refused/i,
      /out\s+of\s+memory/i,
      /stack\s+overflow/i,
      /deadlock/i,
      /panic/i,
      /fatal/i,
      /unauthorized/i,
      /forbidden/i,
      /sql\s+injection/i
    ];
    
    const message = log.message.toLowerCase();
    
    for (const pattern of criticalPatterns) {
      if (pattern.test(message)) {
        return 0.2;
      }
    }
    
    return 0;
  }
  
  /**
   * Get service baseline statistics
   */
  getServiceBaseline(service) {
    return this.serviceBaselines.get(service);
  }
  
  /**
   * Update service baseline with new response time
   */
  updateServiceBaseline(service, responseTime) {
    const serviceLogs = this.recentLogs
      .filter(l => l.service === service && l.metadata?.response_time)
      .map(l => l.metadata.response_time);
    
    if (serviceLogs.length < 10) {
      // Not enough data for baseline
      return;
    }
    
    const avg = serviceLogs.reduce((a, b) => a + b, 0) / serviceLogs.length;
    const variance = serviceLogs.reduce((acc, val) => 
      acc + Math.pow(val - avg, 2), 0) / serviceLogs.length;
    const stdDev = Math.sqrt(variance);
    
    this.serviceBaselines.set(service, { avg, stdDev, count: serviceLogs.length });
  }
  
  /**
   * Update history for baseline calculations
   */
  updateHistory(log) {
    this.recentLogs.push({
      service: log.service,
      level: log.level,
      timestamp: log.timestamp,
      metadata: log.metadata
    });
    
    // Keep only recent logs
    if (this.recentLogs.length > this.maxHistory) {
      this.recentLogs.shift();
    }
    
    // Update baseline for this service
    if (log.metadata?.response_time) {
      this.updateServiceBaseline(log.service, log.metadata.response_time);
    }
  }
  
  /**
   * Get current baselines (for debugging)
   */
  getBaselines() {
    const baselines = {};
    this.serviceBaselines.forEach((value, key) => {
      baselines[key] = value;
    });
    return baselines;
  }
  
  /**
   * Reset detector (for testing)
   */
  reset() {
    this.recentLogs = [];
    this.serviceBaselines.clear();
  }
}

// Singleton instance
const detector = new AnomalyDetector();

module.exports = {
  detectAnomaly: (log) => detector.detectAnomaly(log),
  getBaselines: () => detector.getBaselines(),
  reset: () => detector.reset()
};
