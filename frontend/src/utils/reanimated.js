import { Platform } from 'react-native';

/**
 * Проверка поддержки react-native-reanimated на платформе
 */
export const isReanimatedSupported = Platform.OS !== 'web';

/**
 * Безопасный импорт reanimated
 */
let Reanimated;
try {
  if (isReanimatedSupported) {
    Reanimated = require('react-native-reanimated');
  }
} catch (e) {
  console.warn('react-native-reanimated not available:', e);
}

export default Reanimated;

