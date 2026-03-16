import React from 'react';
import './StatsCards.css';

function StatsCards({ stats }) {
  const { byService = [], overall = { total: 0, errors: 0, anomalies: 0 } } = stats || {};

  const calculateErrorRate = (service) => {
    if (service.totalLogs === 0) return 0;
    return ((service.errorCount / service.totalLogs) * 100).toFixed(1);
  };

  return (
    <div className="stats-section">
      {/* Overall Stats */}
      <div className="overall-stats">
        <div className="stat-card overall">
          <h3>Total Logs</h3>
          <p className="stat-value">{overall.total.toLocaleString()}</p>
        </div>
        <div className="stat-card errors">
          <h3>Total Errors</h3>
          <p className="stat-value">{overall.errors.toLocaleString()}</p>
        </div>
        <div className="stat-card anomalies">
          <h3>Anomalies Detected</h3>
          <p className="stat-value">{overall.anomalies.toLocaleString()}</p>
        </div>
      </div>

      {/* Service-specific Stats */}
      <div className="services-stats">
        <h2>📦 Services Overview</h2>
        <div className="service-cards-grid">
          {byService.map(service => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <h4>{service._id}</h4>
                <span className={`error-rate ${service.errorCount > 10 ? 'high' : 'low'}`}>
                  {calculateErrorRate(service)}% errors
                </span>
              </div>
              <div className="service-stats">
                <div className="stat-row">
                  <span>Total Logs:</span>
                  <strong>{service.totalLogs}</strong>
                </div>
                <div className="stat-row">
                  <span>Errors:</span>
                  <strong className="error-count">{service.errorCount}</strong>
                </div>
                <div className="stat-row">
                  <span>Warnings:</span>
                  <strong className="warn-count">{service.warnCount}</strong>
                </div>
                <div className="stat-row">
                  <span>Anomalies:</span>
                  <strong className="anomaly-count">{service.anomalyCount}</strong>
                </div>
                <div className="stat-row">
                  <span>Avg Response:</span>
                  <strong>{service.avgResponseTime?.toFixed(0) || 'N/A'}ms</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
