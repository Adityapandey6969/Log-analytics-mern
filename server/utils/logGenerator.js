const axios = require('axios');

const API_URL = 'http://localhost:5000/api/logs';

const SERVICES = [
  'auth-service',
  'payment-service',
  'user-service',
  'notification-service'
];

const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

const NORMAL_MESSAGES = [
  'Request processed successfully',
  'User authenticated',
  'Database query executed',
  'Cache hit',
  'API call completed',
  'Session created',
  'Data validated',
  'Transaction completed'
];

const ERROR_MESSAGES = [
  'Database connection timeout',
  'Payment gateway unreachable',
  'Authentication failed',
  'Rate limit exceeded',
  'Invalid request parameters',
  'Service unavailable',
  'Internal server error',
  'Connection refused'
];

const WARNING_MESSAGES = [
  'High memory usage detected',
  'Slow query detected',
  'Retry attempt initiated',
  'Deprecated API used',
  'Cache miss - fallback to DB'
];

// Generate random IP
function randomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate realistic endpoints
function randomEndpoint(service) {
  const endpoints = {
    'auth-service': ['/login', '/register', '/logout', '/verify'],
    'payment-service': ['/charge', '/refund', '/webhook', '/status'],
    'user-service': ['/profile', '/update', '/delete', '/list'],
    'notification-service': ['/send', '/queue', '/status', '/retry']
  };
  const serviceEndpoints = endpoints[service] || ['/api'];
  return serviceEndpoints[Math.floor(Math.random() * serviceEndpoints.length)];
}

// Anomaly scenarios
const ANOMALY_SCENARIOS = [
  {
    name: 'Database Timeout Storm',
    probability: 0.02,
    generate: (service) => ({
      level: 'ERROR',
      service,
      message: 'Database connection timeout - connection pool exhausted',
      metadata: {
        response_time: Math.floor(Math.random() * 3000) + 3000, // 3-6 seconds
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        ip_address: randomIP(),
        endpoint: randomEndpoint(service),
        error_code: 'DB_TIMEOUT'
      }
    })
  },
  {
    name: 'Memory Leak',
    probability: 0.01,
    generate: (service) => ({
      level: 'ERROR',
      service,
      message: 'Out of memory error - heap limit exceeded',
      metadata: {
        response_time: Math.floor(Math.random() * 2000) + 2000,
        user_id: `system`,
        ip_address: '127.0.0.1',
        endpoint: '/internal/healthcheck',
        memory_usage_mb: Math.floor(Math.random() * 500) + 1500
      }
    })
  },
  {
    name: 'Unusual Off-Hours Activity',
    probability: 0.03,
    generate: (service) => {
      const now = new Date();
      now.setHours(3); // 3 AM
      return {
        timestamp: now.toISOString(),
        level: 'WARN',
        service,
        message: 'Unusual activity detected during off-hours',
        metadata: {
          response_time: Math.floor(Math.random() * 500) + 200,
          user_id: `user_${Math.floor(Math.random() * 10)}`, // Few users
          ip_address: randomIP(),
          endpoint: randomEndpoint(service)
        }
      };
    }
  },
  {
    name: 'Rate Limit Breach',
    probability: 0.015,
    generate: (service) => ({
      level: 'ERROR',
      service,
      message: 'Rate limit exceeded - blocking request',
      metadata: {
        response_time: 50,
        user_id: `user_suspicious_${Math.floor(Math.random() * 5)}`,
        ip_address: randomIP(),
        endpoint: randomEndpoint(service),
        requests_per_minute: Math.floor(Math.random() * 500) + 1000
      }
    })
  }
];

// Generate single log (modified for anomalies)
function generateLog() {
  const randomValue = Math.random();
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  
  // Check if we should generate an anomaly
  for (const scenario of ANOMALY_SCENARIOS) {
    if (Math.random() < scenario.probability) {
      console.log(`🚨 Generating anomaly: ${scenario.name}`);
      return scenario.generate(service);
    }
  }
  
  // Normal log generation (existing code)
  let level, message, responseTime;
  
  if (randomValue < 0.10) {
    level = 'ERROR';
    message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
    responseTime = Math.floor(Math.random() * 3000) + 1000;
  } else if (randomValue < 0.25) {
    level = 'WARN';
    message = WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)];
    responseTime = Math.floor(Math.random() * 1000) + 500;
  } else {
    level = randomValue < 0.50 ? 'INFO' : 'DEBUG';
    message = NORMAL_MESSAGES[Math.floor(Math.random() * NORMAL_MESSAGES.length)];
    responseTime = Math.floor(Math.random() * 300) + 50;
  }
  
  return {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    metadata: {
      response_time: responseTime,
      user_id: `user_${Math.floor(Math.random() * 1000)}`,
      ip_address: randomIP(),
      endpoint: randomEndpoint(service)
    }
  };
}

// Send log to API
async function sendLog(log) {
  try {
    const response = await axios.post(API_URL, log);
    console.log(`✓ [${log.level}] ${log.service}: ${log.message} (${log.metadata.response_time}ms)`);
    return response.data;
  } catch (error) {
    console.error(`✗ Error sending log:`, error.message);
  }
}

// Generate logs continuously
async function startGeneration(logsPerSecond = 5) {
  console.log('🚀 Starting log generation...');
  console.log(`📊 Rate: ${logsPerSecond} logs/second`);
  console.log('-----------------------------------\n');
  
  const interval = 1000 / logsPerSecond;
  
  setInterval(async () => {
    const log = generateLog();
    await sendLog(log);
  }, interval);
}

// Generate batch of historical logs
async function generateHistoricalData(count = 1000) {
  console.log(`📚 Generating ${count} historical logs...`);
  
  for (let i = 0; i < count; i++) {
    const log = generateLog();
    // Randomize timestamp within last 7 days
    const daysAgo = Math.floor(Math.random() * 7);
    const hoursAgo = Math.floor(Math.random() * 24);
    log.timestamp = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
    
    await sendLog(log);
    
    if ((i + 1) % 100 === 0) {
      console.log(`Progress: ${i + 1}/${count}`);
    }
  }
  
  console.log('✅ Historical data generation complete!');
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'historical') {
  const count = parseInt(args[1]) || 1000;
  generateHistoricalData(count).then(() => process.exit(0));
} else {
  const rate = parseInt(args[0]) || 5;
  startGeneration(rate);
}
