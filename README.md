# 📊 Log Analytics Platform

A full-stack MERN application for real-time log monitoring and anomaly detection.

## 🚀 Features

- ✅ Real-time log ingestion and monitoring
- ✅ ML-based anomaly detection
- ✅ Interactive dashboard with charts
- ✅ Service-wise statistics
- ✅ Real-time alerts via Socket.io
- ✅ Filtering and pagination
- ✅ Docker deployment

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Socket.io Client
- Chart.js
- Axios

**Backend:**
- Node.js & Express
- MongoDB
- Socket.io
- Custom anomaly detection

## 📦 Installation

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Generate sample logs
docker exec -it log-analytics-backend npm run generate
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- MongoDB

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm start
```

**Generate Logs:**
```bash
cd server
npm run generate
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logs` | Create log |
| GET | `/api/logs` | Get logs (with filters) |
| GET | `/api/logs/stats` | Get statistics |
| GET | `/api/logs/timeline` | Get timeline data |
| GET | `/api/logs/services` | Get service list |

## 🎯 Anomaly Detection

The platform uses a multi-factor scoring system:

- **Log Level** (30%): ERROR logs score higher
- **Response Time** (40%): Statistical outlier detection
- **Time-based** (10%): Off-hours activity
- **Error Patterns** (20%): Critical keywords

Threshold: 60% score = anomaly

## 📈 Usage

1. Start the application
2. Generate sample logs (or send real logs to the API)
3. View real-time dashboard updates
4. Monitor anomaly alerts
5. Filter logs by service/level
6. Analyze trends with charts

## 📝 Project Structure

```text
log-analytics-mern/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API & Socket services
│   │   └── App.jsx
│   └── Dockerfile
├── server/              # Node.js backend
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

>>
