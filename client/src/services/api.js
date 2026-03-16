import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const logService = {
  // Get logs with filters
  getLogs: async (params = {}) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },
  
  // Get statistics
  getStats: async () => {
    const response = await api.get('/logs/stats');
    return response.data;
  },
  
  // Get timeline
  getTimeline: async (interval = 'hour', limit = 24) => {
    const response = await api.get('/logs/timeline', {
      params: { interval, limit }
    });
    return response.data;
  },
  
  // Get services list
  getServices: async () => {
    const response = await api.get('/logs/services');
    return response.data;
  },
  
  // Create log (for testing)
  createLog: async (logData) => {
    const response = await api.post('/logs', logData);
    return response.data;
  }
};

export default api;
