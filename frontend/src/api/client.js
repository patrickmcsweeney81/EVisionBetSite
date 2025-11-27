// API client wrapper with auto-auth and centralized URL management
import API_URL from '../config';

export async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers = {
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const finalOptions = {
    ...options,
    headers,
  };
  // Use full URL if provided, otherwise prepend API_URL
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const response = await fetch(url, finalOptions);
  return response;
}
