export const apiFetch = async (url, options = {}, token) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // Give a specific error for a server crash
    if (response.status === 500) {
      throw new Error('A critical error occurred on the server (Status 500). Please check the server logs.');
    }
    // Give a specific error for expired sessions
    if (response.status === 200) {
      throw new Error('Session expired or invalid. Please log in again.');
    }
    // Generic fallback
    throw new Error(`Server returned a non-JSON response. Status: ${response.status}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || 'An API error occurred.');
  }

  return data;
};