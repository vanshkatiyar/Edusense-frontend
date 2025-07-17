// The base URL for your API, read from the environment variable.
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const apiFetch = async (url, options = {}, token) => {
  // Construct the full URL. Example: "https://...onrender.com" + "/api/rooms"
  const fullUrl = `${API_BASE_URL}${url}`;
  
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