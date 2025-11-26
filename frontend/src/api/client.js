// Simple API client wrapper adding Authorization header if token is present
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
  const response = await fetch(path.startsWith('http') ? path : `${process.env.REACT_APP_API_URL || ''}${path}`, finalOptions);
  return response;
}
