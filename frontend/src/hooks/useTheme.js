import { useColorScheme } from 'react-native';
import { getDarkTheme, getLightTheme } from '../theme/colors';

/**
 * Хук для получения текущей темы приложения
 * Автоматически переключается между светлой и тёмной темой
 * на основе системных настроек устройства
 */
export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? getDarkTheme() : getLightTheme();

  return {
    theme,
    isDark,
    colorScheme,
  };
};

export default useTheme;

