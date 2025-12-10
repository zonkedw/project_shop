import { StyleSheet } from 'react-native';
import { colors } from './colors';

/**
 * Общие стили приложения
 */

export const commonStyles = StyleSheet.create({
  // Контейнеры
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  containerDark: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  
  // Карточки
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  
  cardDark: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  
  // Текст
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  
  titleDark: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  
  subtitleDark: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 8,
  },
  
  // Кнопки
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  // Инпуты
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.textDark,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  
  inputDark: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#334155',
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
});

export default commonStyles;

