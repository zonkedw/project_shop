import { StyleSheet } from 'react-native';
import { spacing, borderRadius, shadows } from './spacing';

/**
 * Общие стили приложения
 * Модульная система с улучшенной адаптивностью
 * Использует единую систему отступов
 */

// Функция создания стилей с учетом темы
export const createCommonStyles = (theme) => StyleSheet.create({
  // Контейнеры - модульные с правильным spacing
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  
  // Секции - с правильными отступами
  section: {
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.sectionVertical,
  },
  
  sectionTablet: {
    paddingHorizontal: spacing.containerPaddingTablet,
    paddingVertical: spacing.sectionVerticalTablet,
  },
  
  sectionDesktop: {
    paddingHorizontal: spacing.containerPaddingDesktop,
    paddingVertical: spacing.sectionVerticalDesktop,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Карточки - модульные, не слипающиеся
  card: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.cardGap,
    borderWidth: 1.5,
    borderColor: theme.borderLight,
    ...shadows.card,
    shadowColor: theme.shadow.md,
  },
  
  cardTablet: {
    padding: spacing.xxxl,
    marginBottom: spacing.cardGapTablet,
    borderRadius: borderRadius.xxxl,
  },
  
  cardDesktop: {
    padding: spacing.huge,
    marginBottom: spacing.cardGapDesktop,
  },
  
  // Grid layouts - модульные
  grid: {
    flexDirection: 'column',
    gap: spacing.cardGap,
  },
  
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.cardGapTablet,
  },
  
  gridDesktop: {
    gap: spacing.cardGapDesktop,
  },
  
  gridItem: {
    flex: 1,
    minWidth: '100%',
  },
  
  gridItemTablet: {
    minWidth: 'calc(50% - 10px)',
    maxWidth: 'calc(50% - 10px)',
  },
  
  gridItemDesktop: {
    minWidth: 'calc(33.333% - 16px)',
    maxWidth: 'calc(33.333% - 16px)',
  },
  
  // Текст - с правильными отступами
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  
  titleLarge: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: spacing.lg,
  },
  
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  
  body: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 24,
    fontWeight: '500',
  },
  
  bodySecondary: {
    color: theme.textSecondary,
  },
  
  caption: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Кнопки - менее контрастные, мягкие
  button: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...shadows.button,
  },
  
  buttonPrimary: {
    backgroundColor: theme.buttonPrimaryBg,
  },
  
  buttonSecondary: {
    backgroundColor: theme.buttonSecondaryBg,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  buttonTextSecondary: {
    color: theme.text,
  },
  
  // Инпуты - модульные
  input: {
    backgroundColor: theme.input.bg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1.5,
    borderColor: theme.input.border,
    fontWeight: '500',
  },
  
  inputFocused: {
    borderColor: theme.input.borderFocus,
    backgroundColor: theme.input.bg,
  },
  
  // Разделители - для неслипшихся модулей
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: spacing.xl,
  },
  
  dividerThick: {
    height: 2,
    marginVertical: spacing.xxl,
  },
  
  // Отступы - утилиты
  mb0: { marginBottom: 0 },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },
  mb6: { marginBottom: spacing.xxl },
  mb8: { marginBottom: spacing.xxxl },
  
  mt0: { marginTop: 0 },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },
  mt6: { marginTop: spacing.xxl },
  mt8: { marginTop: spacing.xxxl },
  
  // Адаптивные контейнеры
  contentContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: spacing.containerPadding,
  },
  
  contentContainerTablet: {
    paddingHorizontal: spacing.containerPaddingTablet,
  },
  
  contentContainerDesktop: {
    paddingHorizontal: spacing.containerPaddingDesktop,
  },
});

// Для обратной совместимости - экспорт базовых стилей без темы
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.sectionVertical,
  },
});

export default createCommonStyles;
