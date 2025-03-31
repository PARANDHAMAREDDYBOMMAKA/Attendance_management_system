import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/user_management/login/', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/user_management/logout/');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove items from localStorage even if the API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.user_type === 'admin';
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};