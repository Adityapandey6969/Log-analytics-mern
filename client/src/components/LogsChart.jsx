import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './LogsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function LogsChart({ timeline }) {
  // Prepare data for charts
  const labels = timeline.map(item => {
    if (item._id.hour !== undefined) {
      return `${item._id.hour}:00`;
    }
    return `${item._id.day}/${item._id.month}`;
  }).reverse();

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Total Logs',
        data: timeline.map(item => item.count).reverse(),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      },
      {
        label: 'Errors',
        data: timeline.map(item => item.errors).reverse(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3
      },
      {
        label: 'Anomalies',
        data: timeline.map(item => item.anomalies).reverse(),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.3
      }
    ]
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Errors',
        data: timeline.map(item => item.errors).reverse(),
        backgroundColor: 'rgba(255, 99, 132, 0.7)'
      },
      {
        label: 'Warnings',
        data: timeline.map(item => item.warnings).reverse(),
        backgroundColor: 'rgba(255, 206, 86, 0.7)'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="charts-section">
      <div className="chart-container">
        <h3>📈 Log Volume Over Time</h3>
        <div className="chart-wrapper">
          <Line data={lineChartData} options={options} />
        </div>
      </div>

      <div className="chart-container">
        <h3>📊 Errors & Warnings Distribution</h3>
        <div className="chart-wrapper">
          <Bar data={barChartData} options={options} />
        </div>
      </div>
    </div>
  );
}

export default LogsChart;
