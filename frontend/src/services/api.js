import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Для ПК используйте localhost
// Для телефона замените на IP вашего компьютера (узнать: ipconfig в терминале)
// Пример: 'http://192.168.1.100:3000/api'
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (email, password, username) =>
    api.post('/auth/register', { email, password, username }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  mealplan: (meals = 4) => api.post('/ai/recommendations/mealplan', { meals }),
  applyMealplan: (plan, date) => api.post('/ai/recommendations/mealplan/apply', { plan, date }),
  workout: (payload = { location: 'gym', duration_min: 45 }) =>
    api.post('/ai/recommendations/workout', payload),
  applyWorkout: (plan) =>
    api.post('/ai/recommendations/workout/apply', { plan }),
};

export const nutritionAPI = {
  searchProducts: (query) =>
    api.get('/nutrition/products/search', { params: { q: query } }),
  
  getProductByBarcode: (code) =>
    api.get(`/nutrition/products/barcode/${code}`),

  getDiary: (date) =>
    api.get('/nutrition/diary', { params: { date } }),

  getDiaryStats: (days = 7) =>
    api.get('/nutrition/diary/stats', { params: { days } }),
  
  addMeal: (mealData) =>
    api.post('/nutrition/meals', mealData),
  
  updateMeal: (mealId, mealData) =>
    api.put(`/nutrition/meals/${mealId}`, mealData),
  
  deleteMeal: (mealId) =>
    api.delete(`/nutrition/meals/${mealId}`),
};

export const workoutsAPI = {
  getExercises: (filters) =>
    api.get('/workouts/exercises', { params: filters }),
  
  getSessions: (filters) =>
    api.get('/workouts/sessions', { params: filters }),
  getSession: (id) =>
    api.get(`/workouts/sessions/${id}`),
  
  createSession: (sessionData) =>
    api.post('/workouts/sessions', sessionData),
  
  getStats: (filters) =>
    api.get('/workouts/stats', { params: filters }),
};

export const usersAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (profileData) =>
    api.put('/users/profile', profileData),
  
  addMeasurement: (measurementData) =>
    api.post('/users/measurements', measurementData),
  
  getMeasurements: () =>
    api.get('/users/measurements'),
};

export default api;
