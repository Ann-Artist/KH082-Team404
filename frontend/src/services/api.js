const BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, isFormData = false } = options;

  const config = {
    method,
    headers: {
      ...headers
    }
  };

  if (!isFormData && body) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  } else if (isFormData && body) {
    config.body = body;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err);
    throw err;
  }
}
