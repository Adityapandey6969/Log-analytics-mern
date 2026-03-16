# ✅ Pre-Demo Checklist

## Backend
- [x] MongoDB running
- [x] Server starts without errors (`npm run dev` in `/server`)
- [x] All API endpoints tested (see `test/api.test.js` and `API.md`)
- [x] Socket.io connections working (test with `node test/socketClient.js`)
- [x] Log generator producing data (`npm run generate`)
- [x] Anomaly detection triggering (included in generator)

## Frontend
- [x] React app builds successfully (`npm start` in `/client`)
- [x] Dashboard displays data
- [x] Real-time updates working (Socket.io `newLog` event)
- [x] Charts rendering correctly (Chart.js Line + Bar)
- [x] Filters functioning (service, level, page size dropdowns)
- [x] Anomaly alerts appearing (AnomalyAlert component)
- [x] No console errors

## Docker
- [ ] docker-compose builds all services (`docker-compose up --build`)
- [ ] All containers running (mongo, backend, frontend)
- [ ] Can access frontend at http://localhost:3000
- [ ] Can access backend at http://localhost:5000
- [ ] MongoDB persisting data (named volume `mongodb_data`)

## Documentation
- [x] README.md complete
- [x] API.md documented (comprehensive — all 8 endpoints + Socket.io events)
- [x] Code comments added (server-side routes and services)
- [ ] Screenshots taken
- [ ] Demo script prepared

## Portfolio Presentation
- [ ] GitHub repo published
- [ ] Live demo URL (if deployed)
- [ ] Resume updated with project
- [ ] Talking points prepared

---

## Quick Start Commands

```bash
# Start backend
cd server && npm install && npm run dev

# In a new terminal — Start frontend
cd client && npm install && npm start

# In a new terminal — generate sample logs
cd server && npm run generate

# Or generate 500 historical logs
cd server && node utils/logGenerator.js historical 500

# Run API tests (backend must be running)
cd server && node test/api.test.js

# Watch live socket events
cd server && node test/socketClient.js
```
