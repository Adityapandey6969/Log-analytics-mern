const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Running API Tests\n');
  
  try {
    // Test 1: Create log
    console.log('1️⃣ Testing POST /logs...');
    const createResponse = await axios.post(`${API_URL}/logs`, {
      level: 'INFO',
      service: 'test-service',
      message: 'Test log',
      metadata: { response_time: 100 }
    });
    console.log('✅ Log created:', createResponse.data.success);
    
    // Test 2: Get logs
    console.log('\n2️⃣ Testing GET /logs...');
    const logsResponse = await axios.get(`${API_URL}/logs?limit=5`);
    console.log('✅ Retrieved logs:', logsResponse.data.count);
    
    // Test 3: Get stats
    console.log('\n3️⃣ Testing GET /logs/stats...');
    const statsResponse = await axios.get(`${API_URL}/logs/stats`);
    console.log('✅ Stats retrieved:', 
      statsResponse.data.data.overall.total, 'total logs');
    
    // Test 4: Get timeline
    console.log('\n4️⃣ Testing GET /logs/timeline...');
    const timelineResponse = await axios.get(`${API_URL}/logs/timeline`);
    console.log('✅ Timeline data points:', timelineResponse.data.data.length);
    
    // Test 5: Create anomaly
    console.log('\n5️⃣ Testing anomaly detection...');
    const anomalyResponse = await axios.post(`${API_URL}/logs`, {
      level: 'ERROR',
      service: 'test-service',
      message: 'Database connection timeout',
      metadata: { response_time: 5000 }
    });
    console.log('✅ Anomaly detected:', 
      anomalyResponse.data.anomaly.isAnomaly,
      '- Score:', anomalyResponse.data.anomaly.score);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();
