# Log Analytics API Documentation

Base URL: `http://localhost:5000/api`

## Endpoints

### 1. Create Log
```http
POST /logs
Content-Type: application/json

{
  "level": "ERROR",
  "service": "auth-service",
  "message": "Login failed",
  "metadata": {
    "response_time": 250,
    "user_id": "user_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "anomaly": {
    "isAnomaly": true,
    "score": 0.75,
    "reasons": ["High severity level: ERROR"]
  }
}
```

### 2. Get Logs
```http
GET /logs?service=auth-service&level=ERROR&page=1&limit=50
```

### 3. Get Statistics
```http
GET /logs/stats
```

### 4. Get Timeline
```http
GET /logs/timeline?interval=hour&limit=24
```

### 5. Get Services List
```http
GET /logs/services
```

## Socket.io Events

### Client → Server
- `connect` - Connect to server
- `subscribe(service)` - Subscribe to service logs

### Server → Client
- `newLog` - New log created
- `anomalyDetected` - Anomaly found
- `serviceLog` - Service-specific log
