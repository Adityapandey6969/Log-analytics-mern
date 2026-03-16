import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Keep a ref to the current limit so socket handler always has fresh value
  const limitRef = useRef(filters.limit);
  useEffect(() => {
    limitRef.current = filters.limit;
  }, [filters.limit]);

  // ── Fetch helpers ──────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (currentFilters) => {
    try {
      const response = await logService.getLogs(currentFilters);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await logService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchTimeline = useCallback(async () => {
    try {
      const response = await logService.getTimeline('hour', 24);
      setTimeline(response.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  }, []);

  const fetchData = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLogs(currentFilters),
        fetchStats(),
        fetchTimeline()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchLogs, fetchStats, fetchTimeline]);

  // ── Initial load + socket setup (runs once) ────────────────────────────
  useEffect(() => {
    fetchData(filters);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Socket listeners
    socketService.connect();

    const handleNewLog = (log) => {
      setLogs(prev => [log, ...prev].slice(0, limitRef.current));
    };

    const handleAnomaly = (data) => {
      setAnomalies(prev => [data, ...prev].slice(0, 10));
      if (Notification.permission === 'granted') {
        new Notification('Anomaly Detected!', {
          body: `${data.log.service}: ${data.log.message}`
        });
      }
    };

    socketService.on('newLog', handleNewLog);
    socketService.on('anomalyDetected', handleAnomaly);

    // Refresh stats every 30 seconds
    const statsInterval = setInterval(fetchStats, 30000);

    return () => {
      socketService.off('newLog', handleNewLog);
      socketService.off('anomalyDetected', handleAnomaly);
      socketService.disconnect();
      clearInterval(statsInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch logs whenever filters change (but not on initial mount) ───
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchLogs(filters);
  }, [filters, fetchLogs]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    fetchData(filters);
  };

  const handleClearFilters = () => {
    const cleared = { service: '', level: '', page: 1, limit: 50 };
    setFilters(cleared);
  };

  // ── Render ─────────────────────────────────────────────────────────────
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

        <select
          value={filters.limit}
          onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
          className="filter-select"
        >
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>

        <button onClick={handleClearFilters} className="btn-secondary">
          Clear Filters
        </button>

        <button onClick={handleRefresh} className="btn-primary">
          🔄 Refresh
        </button>
      </div>

      {/* Logs Table */}
      <LogsTable
        logs={logs}
        onPageChange={handlePageChange}
        currentPage={filters.page}
        pageLimit={filters.limit}
      />
    </div>
  );
}

export default Dashboard;
