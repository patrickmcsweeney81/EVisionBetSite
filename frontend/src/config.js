// API configuration with environment auto-detection
// Production backend URL (FastAPI service on Render)
const PROD_API = 'https://evision-api.onrender.com';
// Local development backend URL
const LOCAL_API = 'http://localhost:8000';

// Decide based on hostname; fallback to production
const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
	? LOCAL_API
	: PROD_API;

export default API_URL;
