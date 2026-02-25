import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
    ? '' // Use relative path in production
    : 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authAPI = {
    signup: (userData) => api.post('/auth/signup', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    verifyMfa: (mfaData) => api.post('/auth/verify-mfa', mfaData),
    updateMfa: (data) => api.post('/auth/update-mfa', data),
    setupAppMfa: () => api.get('/auth/setup-app-mfa'),
    getUser: () => api.get('/auth/user'),
};

export const cibilAPI = {
    analyze: (data) => api.post('/analyze', data),
    getUsers: () => api.get('/users'),
    deleteUser: (id) => api.delete(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    uploadCSV: (formData) => api.post('/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
