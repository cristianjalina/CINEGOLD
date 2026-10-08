const API_URL = `${process.env.API_ORIGIN || 'http://localhost:5000'}/api`;

export const apiClient = async (endpoint, method = 'GET', data = null, isAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  
  if (isAuth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) })
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en la petición al servidor');
  }
  
  return response.json();
};
