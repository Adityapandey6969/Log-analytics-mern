# 📊 Log Analytics MERN

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for real-time log monitoring, analysis, and anomaly detection with an interactive dashboard.

## ✨ Features

- ✅ **Real-time Log Ingestion** - Send logs via REST API and monitor in real-time
- ✅ **Anomaly Detection** - ML-based intelligent anomaly detection system
- ✅ **Interactive Dashboard** - Beautiful, responsive UI with real-time updates
- ✅ **Service-wise Analytics** - Monitor logs by different services
- ✅ **Real-time Alerts** - WebSocket (Socket.io) for instant notifications
- ✅ **Advanced Filtering** - Filter by service, log level, time range
- ✅ **Pagination Support** - Handle large log datasets efficiently
- ✅ **Docker Support** - One-command deployment with Docker Compose
- ✅ **Statistical Analysis** - Timeline charts, log trends, error patterns

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Socket.io Client** - Real-time communication
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js & Express** - Server runtime and framework
- **MongoDB** - NoSQL database
- **Socket.io** - WebSocket functionality
- **Mongoose** - MongoDB ODM
- **Dotenv** - Environment configuration

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 7+ ([Download](https://www.mongodb.com/try/download/community))
- **Docker & Docker Compose** (Optional, for containerized deployment)
- **Git** ([Download](https://git-scm.com/))

## 🚀 Quick Start

### Option 1: Docker (Recommended) ⭐

```bash
# Clone the repository
git clone https://github.com/yourusername/Log-analytics-mers.git
cd Log-analytics-mers

# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# Generate sample logs
docker exec -it log-analytics-backend npm run generate
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Local Development

#### Backend Setup
```bash
cd server
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://127.0.0.1:27017/log-analytics" >> .env
echo "NODE_ENV=development" >> .env

# Start backend server
npm run dev
```

#### Frontend Setup (New Terminal)
```bash
cd client
npm install
npm start
```

#### Generate Sample Data (New Terminal)
```bash
cd server
npm run generate
```

## 📊 Project Structure

```
Log-analytics-mers/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   ├── LogsTable.jsx   # Logs table view
│   │   │   ├── LogsChart.jsx   # Charts visualization
│   │   │   ├── StatsCards.jsx  # Statistics cards
│   │   │   └── AnomalyAlert.jsx # Alert component
│   │   ├── services/           # API & Socket Services
│   │   │   ├── api.js         # REST API calls
│   │   │   └── socket.js      # Socket.io connection
│   │   ├── App.jsx            # Main app component
│   │   ├── index.js           # React entry point
│   │   └── config.js          # Configuration
│   ├── public/                 # Static files
│   ├── Dockerfile             # Frontend container
│   ├── nginx.conf             # Nginx config
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── models/
│   │   └── Log.js            # MongoDB log schema
│   ├── routes/
│   │   └── logs.js           # API routes
│   ├── services/
│   │   └── anomalyDetector.js # Anomaly detection logic
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── utils/
│   │   └── logGenerator.js   # Sample data generator
│   ├── test/                 # Tests
│   ├── server.js             # Express app setup
│   ├── Dockerfile            # Backend container
│   ├── API.md                # API documentation
│   └── package.json
│
├── docker-compose.yml         # Docker services definition
├── .gitignore                # Git ignore rules
├── README.md                 # This file
└── CHECKLIST.md             # Development checklist
```

## 📡 API Endpoints

### Log Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/logs` | Create a new log |
| `GET` | `/api/logs` | Get logs (supports filtering & pagination) |
| `GET` | `/api/logs/:id` | Get log by ID |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/logs/stats` | Get statistics (total, error count, etc.) |
| `GET` | `/api/logs/timeline` | Get timeline data for charts |
| `GET` | `/api/logs/services` | Get list of all services |

### Query Parameters
- `service` - Filter by service name
- `level` - Filter by log level (DEBUG, INFO, WARN, ERROR)
- `startTime` - Start timestamp filter
- `endTime` - End timestamp filter
- `page` - Page number (default: 1)
- `limit` - Logs per page (default: 50)
- `anomaly` - Filter anomalies only (true/false)

**Example:**
```bash
GET /api/logs?service=auth-service&level=ERROR&limit=20
```

## 🎯 Anomaly Detection Algorithm

The system uses a **multi-factor scoring system** (0-100%):

| Factor | Weight | Details |
|--------|--------|---------|
| **Log Level** | 30% | ERROR logs score higher than DEBUG/INFO |
| **Response Time** | 40% | Statistical outlier detection (Z-score) |
| **Time-based** | 10% | Off-hours activity detection |
| **Error Patterns** | 20% | Critical keywords in message |

**Threshold:** Score ≥ 60% = Marked as anomaly

**Example Anomalies:**
- High response times during normal hours
- Errors on critical services
- Unusual activity outside business hours
- Multiple failures in sequence

## 📈 Usage Guide

1. **Start the Application**
   - Use Docker Compose or local development setup
   
2. **Access Dashboard**
   - Open http://localhost:3000
   - View real-time logs and statistics

3. **Generate Logs**
   - Run `npm run generate` in server folder
   - Watch logs appear in real-time dashboard

4. **Monitor Anomalies**
   - Red alerts appear for detected anomalies
   - Filter by anomaly status for quick review

5. **Analyze Trends**
   - View charts for log distribution
   - Check service-wise statistics
   - Monitor response time trends

## 🔧 Configuration

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/log-analytics

# Optional: CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (src/config.js)
```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
```

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Run specific test file
npm test -- api.test.js
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f log-analytics-backend
docker-compose logs -f log-analytics-frontend

# Stop services
docker-compose down

# Remove volumes (clean database)
docker-compose down -v

# Restart services
docker-compose restart
```

## 🚀 Deployment

### Production Build (Docker)
```bash
# Build images
docker-compose build

# Start in production mode
docker-compose up -d
```

### Local Production
```bash
# Backend
cd server
NODE_ENV=production npm start

# Frontend
cd client
npm run build
npm install -g serve
serve -s build -l 3000
```

## 📚 API Documentation

See [server/API.md](server/API.md) for detailed API documentation with examples.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🆘 Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB Connection Error
Solution: Ensure MongoDB is running (mongod) and accessible at mongodb://127.0.0.1:27017
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
Solution: Change PORT in .env or run: lsof -i :5000 (Mac/Linux) or netstat -ano | findstr :5000 (Windows)
```

### Docker Issues
```
Solution: Run 'docker-compose down -v' to clean up and restart
```

### Real-time Updates Not Working
```
Solution: Check Socket.io connection in browser console (F12 -> Console)
Ensure backend is running on correct port
```

## 📞 Support

For issues and questions:
- Check existing [Issues](https://github.com/yourusername/Log-analytics-mers/issues)
- Create a new issue with detailed description
- Include error logs and system info

## 🎓 Learning Resources

- [MERN Stack Guide](https://www.mongodb.com/languages/mern-stack)
- [Socket.io Documentation](https://socket.io/docs/)
- [Chart.js Guide](https://www.chartjs.org/docs/latest/)
- [Express.js Guide](https://expressjs.com/)

---

**Made with ❤️ for real-time log analytics**
