import React from 'react';
import './AnomalyAlert.css';

function AnomalyAlert({ data, onDismiss }) {
  const { log, score, reasons } = data;

  return (
    <div className="anomaly-alert">
      <div className="alert-icon">🚨</div>
      <div className="alert-content">
        <h4>Anomaly Detected!</h4>
        <p className="alert-service">{log.service}</p>
        <p className="alert-message">{log.message}</p>
        <div className="alert-meta">
          <span className="alert-score">Score: {score.toFixed(2)}</span>
          <span className="alert-time">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {reasons.length > 0 && (
          <ul className="alert-reasons">
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
      <button className="alert-dismiss" onClick={onDismiss}>×</button>
    </div>
  );
}

export default AnomalyAlert;
