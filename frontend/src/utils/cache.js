import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@fitpilot_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 минут

/**
 * Кэш для API запросов
 */
export const cache = {
  /**
   * Получить данные из кэша
   */
  async get(key) {
    try {
      const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      
      // Проверяем срок действия
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        await this.remove(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Сохранить данные в кэш
   */
  async set(key, data) {
    try {
      const cached = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Удалить из кэша
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  /**
   * Очистить весь кэш
   */
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

