import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 секунд таймаут
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

// Обработка ошибок ответа
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Обработка 401 (неавторизован) - очищаем токен
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    
    // Улучшаем сообщения об ошибках
    if (error.response) {
      // Сервер вернул ошибку
      error.message = error.response.data?.error || error.response.data?.message || 'Ошибка сервера';
      error.status = error.response.status;
    } else if (error.request) {
      // Запрос отправлен, но ответа нет
      error.message = 'Нет соединения с сервером. Проверьте подключение к интернету.';
      error.status = 0;
    } else {
      // Ошибка при настройке запроса
      error.message = error.message || 'Ошибка запроса';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email, password, username) =>
    api.post('/auth/register', { email, password, username }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

export const nutritionAPI = {
  searchProducts: (query) =>
    api.get('/nutrition/products/search', { params: { q: query } }),
  
  getDiary: (date) =>
    api.get('/nutrition/diary', { params: { date } }),
  
  addMeal: (mealData) =>
    api.post('/nutrition/meals', mealData),
  
  deleteMeal: (mealId) =>
    api.delete(`/nutrition/meals/${mealId}`),
};

export const workoutsAPI = {
  getExercises: (filters) =>
    api.get('/workouts/exercises', { params: filters }),
  
  getSessions: (filters) =>
    api.get('/workouts/sessions', { params: filters }),
  
  getSession: (sessionId) =>
    api.get(`/workouts/sessions/${sessionId}`),
  
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

export const aiAPI = {
  /**
   * Отправка сообщения в AI-чат
   * @param {string} message - Текст сообщения
   */
  chat: (message) =>
    api.post('/ai/chat', { message }),
  
  /**
   * Генерация рациона питания
   * @param {number} meals - Количество приёмов пищи (3-6)
   */
  mealplan: (meals = 4) =>
    api.post('/ai/recommendations/mealplan', { meals }),
  
  /**
   * Применение рациона в дневник
   * @param {Object} plan - План рациона
   * @param {string} date - Дата (опционально)
   */
  applyMealplan: (plan, date) =>
    api.post('/ai/recommendations/mealplan/apply', { plan, date }),
  
  /**
   * Генерация тренировки
   * @param {Object} options - { location: 'home'|'gym', duration_min: number }
   */
  workout: (options = {}) =>
    api.post('/ai/recommendations/workout', options),
  
  /**
   * Применение тренировки в дневник
   * @param {Object} plan - План тренировки
   */
  applyWorkout: (plan) =>
    api.post('/ai/recommendations/workout/apply', { plan }),
};

/**
 * Helper для извлечения данных из унифицированного формата ответа backend
 * Backend теперь возвращает { success: true, data: {...}, message?: "..." }
 * Эта функция извлекает data или возвращает весь response.data для обратной совместимости
 */
export const extractData = (response) => {
  const data = response.data;
  // Если ответ в новом формате { success, data, ... }
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data;
  }
  // Обратная совместимость со старым форматом
  return data;
};

export default api;
