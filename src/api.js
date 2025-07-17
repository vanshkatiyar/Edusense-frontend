const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL && process.env.NODE_ENV === 'development') {
  console.warn("REACT_APP_API_URL is not defined. Using localhost as fallback.");
}

export const apiFetch = async (url, options = {}, token) => {
  const fullUrl = `${API_BASE_URL || 'http://127.0.0.1:5000'}${url}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, { ...options, headers });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (response.status === 500) {
      throw new Error('A critical error occurred on the server (Status 500). Please check the server logs.');
    }
    const text = await response.text();
    if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
         throw new Error('Session expired or invalid. Please log in again.');
    }
    throw new Error(`Server returned a non-JSON response. Status: ${response.status}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || 'An API error occurred.');
  }

  return data;
};