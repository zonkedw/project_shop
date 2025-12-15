/**
 * Единая система отступов и размеров
 * Для модульности и адаптивности
 */

export const spacing = {
  // Базовые отступы
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  
  // Отступы для секций
  sectionVertical: 32,
  sectionVerticalTablet: 40,
  sectionVerticalDesktop: 56,
  
  sectionHorizontal: 20,
  sectionHorizontalTablet: 32,
  sectionHorizontalDesktop: 48,
  
  // Отступы между карточками/модулями
  cardGap: 16,
  cardGapTablet: 20,
  cardGapDesktop: 24,
  
  // Padding для контейнеров
  containerPadding: 20,
  containerPaddingTablet: 32,
  containerPaddingDesktop: 48,
};

export const layout = {
  // Максимальная ширина контента
  maxWidthMobile: '100%',
  maxWidthTablet: 768,
  maxWidthDesktop: 1200,
  maxWidthWide: 1400,
  
  // Breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
  
  // Размеры для grid layouts
  gridColumns: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHover: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default {
  spacing,
  layout,
  borderRadius,
  shadows,
};

