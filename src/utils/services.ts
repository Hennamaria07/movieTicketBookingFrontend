import axios from 'axios';
import { LoginData, SocialLoginData } from '../types/user';
import { API_BASE_URL } from './api';

const API_URL = API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  // For verifying the token returned from social login callback
  verifySocialToken: async (token: string) => {
    const response = await api.post('/auth/verify-social-token', { token });
    if (token) {
      localStorage.setItem('token', token);
    }
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { 
      token,
      newPassword
    });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};