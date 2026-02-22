// API configuration with environment auto-detection
// Production backend URL (FastAPI service on Render)
const PROD_API = 'https://evision-api.onrender.com';
// Local development backend URL
const LOCAL_API = 'http://localhost:8000';

// Build-time override (Netlify/CI)
const ENV_API = (process.env.REACT_APP_API_URL || '').trim();

// Decide based on hostname; prefer local for localhost, otherwise prefer ENV override
const isLocalhost =
	typeof window !== 'undefined' &&
	(window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1');

const API_URL = isLocalhost ? LOCAL_API : (ENV_API || PROD_API);

export default API_URL;
