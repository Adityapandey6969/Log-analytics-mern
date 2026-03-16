const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected to server');
});

socket.on('newLog', (log) => {
  console.log('📝 New log:', log.service, '-', log.message);
});

socket.on('anomalyDetected', (data) => {
  console.log('🚨 ANOMALY ALERT!');
  console.log('   Service:', data.log.service);
  console.log('   Message:', data.log.message);
  console.log('   Score:', data.score);
  console.log('   Reasons:', data.reasons.join(', '));
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

console.log('Listening for real-time logs...');
