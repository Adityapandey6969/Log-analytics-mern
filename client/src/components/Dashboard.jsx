import React, { useState, useEffect } from 'react';
import { logService } from '../services/api';
import socketService from '../services/socket';
import StatsCards from './StatsCards';
import LogsTable from './LogsTable';
import LogsChart from './LogsChart';
import AnomalyAlert from './AnomalyAlert';
import './Dashboard.css';

function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    service: '',
    level: '',
    page: 1,
    limit: 50
  });

  // Initial data load
  useEffect(() => {
    fetchData();
    
    // Setup Socket.io listeners
    socketService.connect();
    
    socketService.on('newLog', (log) => {
      setLogs(prev => [log, ...prev].slice(0, filters.limit));
    });
    
    socketService.on('anomalyDetected', (data) => {
      setAnomalies(prev => [data, ...prev].slice(0, 10));
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('Anomaly Detected!', {
          body: `${data.log.service}: ${data.log.message}`,
          icon: '/alert-icon.png'
        });
      }
    });
    
    // Refresh stats every 30 seconds
    const statsInterval = setInterval(fetchStats, 30000);
    
    return () => {
      socketService.disconnect();
      clearInterval(statsInterval);
    };
  }, [filters.limit]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLogs(),
        fetchStats(),
        fetchTimeline()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    const response = await logService.getLogs(filters);
    setLogs(response.data);
  };

  const fetchStats = async () => {
    const response = await logService.getStats();
    setStats(response.data);
  };

  const fetchTimeline = async () => {
    const response = await logService.getTimeline('hour', 24);
    setTimeline(response.data);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Log Analytics Dashboard</h1>
        <div className="header-info">
          <span className="status-indicator">●</span>
          <span>Real-time monitoring active</span>
        </div>
      </header>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="anomaly-alerts-container">
          {anomalies.map((anomaly, idx) => (
            <AnomalyAlert 
              key={idx} 
              data={anomaly}
              onDismiss={() => {
                setAnomalies(prev => prev.filter((_, i) => i !== idx));
              }}
            />
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Timeline Chart */}
      {timeline && <LogsChart timeline={timeline} />}

      {/* Filters */}
      <div className="filters-container">
        <select 
          value={filters.service}
          onChange={(e) => handleFilterChange('service', e.target.value)}
          className="filter-select"
        >
          <option value="">All Services</option>
          <option value="auth-service">Auth Service</option>
          <option value="payment-service">Payment Service</option>
          <option value="user-service">User Service</option>
          <option value="notification-service">Notification Service</option>
        </select>

        <select 
          value={filters.level}
          onChange={(e) => handleFilterChange('level', e.target.value)}
          className="filter-select"
        >
          <option value="">All Levels</option>
          <option value="ERROR">ERROR</option>
          <option value="WARN">WARN</option>
          <option value="INFO">INFO</option>
          <option value="DEBUG">DEBUG</option>
        </select>

        <button 
          onClick={() => setFilters({ service: '', level: '', page: 1, limit: 50 })}
          className="btn-secondary"
        >
          Clear Filters
        </button>

        <button 
          onClick={fetchData}
          className="btn-primary"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Logs Table */}
      <LogsTable 
        logs={logs} 
        onPageChange={handlePageChange}
        currentPage={filters.page}
      />
    </div>
  );
}

export default Dashboard;
