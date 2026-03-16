# Log Analytics API Documentation

Base URL: `http://localhost:5000/api`

---

## Health Check

```http
GET http://localhost:5000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Log Analytics API",
  "connectedClients": 3
}
```

---

## Endpoints

### 1. Create Log

```http
POST /logs
Content-Type: application/json
```

**Request Body:**
```json
{
  "level": "ERROR",
  "service": "auth-service",
  "message": "Login failed for user",
  "metadata": {
    "response_time": 250,
    "user_id": "user_123",
    "ip_address": "192.168.1.1",
    "endpoint": "/login",
    "error_code": "AUTH_FAILED"
  }
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `level` | string | ✅ | `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `service` | string | ✅ | Any service name |
| `message` | string | ✅ | Log message |
| `metadata.response_time` | number | ❌ | Response time in ms |
| `metadata.user_id` | string | ❌ | User identifier |
| `metadata.ip_address` | string | ❌ | Client IP address |
| `metadata.endpoint` | string | ❌ | API endpoint hit |
| `metadata.error_code` | string | ❌ | Error code |
| `timestamp` | ISO date | ❌ | Defaults to `Date.now()` |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "level": "ERROR",
    "service": "auth-service",
    "message": "Login failed for user",
    "metadata": { "response_time": 250 },
    "isAnomaly": true,
    "anomalyScore": 0.75,
    "anomalyReasons": ["High severity level: ERROR"],
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "anomaly": {
    "isAnomaly": true,
    "score": 0.75,
    "reasons": ["High severity level: ERROR"]
  }
}
```

---

### 2. Get Logs (with filters & pagination)

```http
GET /logs?service=auth-service&level=ERROR&page=1&limit=50&anomalyOnly=false
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `service` | string | — | Filter by service name |
| `level` | string | — | Filter by log level (`DEBUG/INFO/WARN/ERROR`) |
| `startDate` | ISO date | — | Filter logs from this date |
| `endDate` | ISO date | — | Filter logs until this date |
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `50` | Results per page (max 100 recommended) |
| `anomalyOnly` | boolean | `false` | If `true`, return only anomalous logs |

**Response (200):**
```json
{
  "success": true,
  "count": 50,
  "total": 1234,
  "totalPages": 25,
  "currentPage": 1,
  "data": [ /* array of log objects */ ]
}
```

---

### 3. Get Statistics

```http
GET /logs/stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overall": {
      "total": 5000,
      "errors": 450,
      "anomalies": 120
    },
    "byService": [
      {
        "_id": "auth-service",
        "totalLogs": 1200,
        "errorCount": 100,
        "warnCount": 80,
        "anomalyCount": 30,
        "avgResponseTime": 145.5,
        "maxResponseTime": 4500
      }
    ]
  }
}
```

---

### 4. Get Timeline Data

```http
GET /logs/timeline?interval=hour&limit=24
```

**Query Parameters:**

| Parameter | Type | Default | Values |
|-----------|------|---------|--------|
| `interval` | string | `hour` | `minute`, `hour`, `day` |
| `limit` | number | `24` | Number of time buckets to return |

**Response (200):**
```json
{
  "success": true,
  "interval": "hour",
  "data": [
    {
      "_id": { "year": 2024, "month": 1, "day": 1, "hour": 14 },
      "count": 45,
      "errors": 5,
      "warnings": 8,
      "anomalies": 2
    }
  ]
}
```

---

### 5. Get Services List

```http
GET /logs/services
```

**Response (200):**
```json
{
  "success": true,
  "count": 4,
  "data": ["auth-service", "payment-service", "user-service", "notification-service"]
}
```

---

### 6. Get Single Log

```http
GET /logs/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* single log object */ }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Log not found"
}
```

---

### 7. Delete Old Logs (Cleanup)

```http
DELETE /logs/cleanup?daysOld=7
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `daysOld` | number | `7` | Delete logs older than this many days |

**Response (200):**
```json
{
  "success": true,
  "deleted": 342,
  "message": "Deleted logs older than 7 days"
}
```

---

### 8. Debug — View Anomaly Baselines

```http
GET /logs/debug/baselines
```

Returns the current in-memory service response-time baselines used by the anomaly detector.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "auth-service": { "avg": 145.2, "stdDev": 40.1, "count": 250 },
    "payment-service": { "avg": 230.5, "stdDev": 85.3, "count": 180 }
  }
}
```

---

## Socket.io Events

### Connection

```javascript
const socket = io('http://localhost:5000');
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `connect` | — | Connect to server |
| `subscribe` | `"service-name"` | Subscribe to service-specific log channel |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `newLog` | Log object | Emitted when any new log is created |
| `anomalyDetected` | `{ log, score, reasons }` | Emitted when an anomaly is detected |
| `serviceLog` | Log object | Emitted to room of the log's service only |

### Example (Node.js client)
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

socket.on('connect', () => console.log('Connected'));
socket.on('newLog', (log) => console.log(log.service, log.message));
socket.on('anomalyDetected', (data) => console.log('ANOMALY:', data.score));

// Subscribe to a specific service
socket.emit('subscribe', 'auth-service');
socket.on('serviceLog', (log) => console.log('Auth log:', log.message));
```

---

## Anomaly Detection Rules

The detector uses a multi-factor weighted scoring system. A log is flagged as an anomaly when its composite score reaches **0.60 (60%)**.

| Rule | Weight | Trigger |
|------|--------|---------|
| Log level severity | 30% | `WARN` = 0.20, `ERROR` = 0.30 |
| Response time outlier | 40% | > 3 std deviations from service mean = 0.40; > 2 std deviations = 0.20 |
| Time-based (off-hours) | 10% | 2 AM–5 AM; `ERROR` = 0.10, `WARN` = 0.05 |
| Critical error patterns | 20% | Keywords: `timeout`, `refused`, `out of memory`, `deadlock`, `panic`, `fatal`, `unauthorized`, `forbidden`, `sql injection` |

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 404 | Resource not found |
| 500 | Internal server error |
