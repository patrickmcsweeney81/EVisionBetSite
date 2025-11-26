// API configuration
// Production: Use Python backend on Render
// Development: Use local backend
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://evisionbet-api.onrender.com' 
    : 'http://localhost:8000');

export default API_URL;
