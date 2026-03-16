import React from 'react';
import './LogsTable.css';

function LogsTable({ logs, onPageChange, currentPage }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const getLevelClass = (level) => {
    const classes = {
      'ERROR': 'level-error',
      'WARN': 'level-warn',
      'INFO': 'level-info',
      'DEBUG': 'level-debug'
    };
    return classes[level] || 'level-default';
  };

  return (
    <div className="logs-table-container">
      <div className="table-header">
        <h2>📋 Recent Logs</h2>
        <span className="log-count">{logs.length} logs</span>
      </div>

      <div className="table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Service</th>
              <th>Level</th>
              <th>Message</th>
              <th>Response Time</th>
              <th>Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr 
                key={log._id} 
                className={log.isAnomaly ? 'anomaly-row' : ''}
              >
                <td className="time-cell">
                  {formatTime(log.timestamp)}
                </td>
                <td className="service-cell">
                  <span className="service-badge">{log.service}</span>
                </td>
                <td>
                  <span className={`level-badge ${getLevelClass(log.level)}`}>
                    {log.level}
                  </span>
                </td>
                <td className="message-cell" title={log.message}>
                  {log.message}
                </td>
                <td className="response-time-cell">
                  {log.metadata?.response_time ? (
                    <span className={
                      log.metadata.response_time > 1000 
                        ? 'slow-response' 
                        : 'normal-response'
                    }>
                      {log.metadata.response_time}ms
                    </span>
                  ) : 'N/A'}
                </td>
                <td className="anomaly-cell">
                  {log.isAnomaly && (
                    <span className="anomaly-indicator" title={`Score: ${log.anomalyScore}`}>
                      ⚠️ {log.anomalyScore?.toFixed(2)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-pagination"
        >
          ← Previous
        </button>
        <span className="page-info">Page {currentPage}</span>
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          className="btn-pagination"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default LogsTable;
