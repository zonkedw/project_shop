/**
 * Единая цветовая палитра приложения FitPilot
 * Улучшенный дизайн с четким различием между темной и светлой темой
 * Мягкие кнопки, лучшая адаптивность, модульность
 */

// Функции для получения темы
export const getDarkTheme = () => ({
  // Основные цвета - приглушенные для темной темы
  primary: '#7B82F2',        // Indigo - мягче
  primaryDark: '#5C63D9',    
  primaryLight: '#9DA3F7',   
  
  secondary: '#ED73A8',      // Pink - мягче
  accent: '#3DD598',         // Green - мягкий
  accentBlue: '#5B9AFF',     // Blue - ярче для темной
  accentPurple: '#B87FF5',   // Purple - мягкий
  accentOrange: '#FFB454',   // Orange - теплее
  accentCyan: '#4DD4E8',     // Cyan - ярче
  
  // Фон и поверхности - с большим контрастом
  bg: '#0D0F18',             // Очень темный
  bgSecondary: '#151822',    // Чуть светлее
  surface: '#1D2030',        // Карточки - заметнее
  surfaceLight: '#252838',   // Еще светлее
  panel: '#181C2E',          // Панели
  
  // Границы - более заметные
  border: '#2D3448',         
  borderLight: '#3A4158',
  borderActive: '#7B82F2',
  
  // Текст - лучший контраст
  text: '#F5F7FA',           // Почти белый
  textSecondary: '#CFD5E2',  // Светлый серый
  textMuted: '#9BA5B8',      // Приглушенный
  textDisabled: '#6B7488',   
  
  // Статусы - мягче
  success: '#3DD598',        
  error: '#F87171',          // Мягче
  warning: '#FFB454',        
  info: '#5B9AFF',           
  
  // Градиенты - трехцветные, мягкие
  gradients: {
    primary: ['#7B82F2', '#9DA3F7', '#B87FF5'],
    secondary: ['#ED73A8', '#F58FB7', '#F8A5C6'],
    success: ['#3DD598', '#5FE2B0', '#81EFC8'],
    ocean: ['#5B9AFF', '#7DB0FF', '#9FC6FF'],
    sunset: ['#FFB454', '#FFC978', '#FFDE9C'],
    purple: ['#B87FF5', '#C89FF8', '#D8BFFA'],
    cyan: ['#4DD4E8', '#72E0EF', '#97ECF6'],
    hero: ['#7B82F2', '#B87FF5', '#0D0F18'],
  },
  
  // Glassmorphism - мягче
  glass: {
    weak: 'rgba(29, 32, 48, 0.5)',
    medium: 'rgba(29, 32, 48, 0.7)',
    strong: 'rgba(29, 32, 48, 0.9)',
    border: 'rgba(123, 130, 242, 0.2)',
  },
  
  // Тени - мягче
  shadow: {
    sm: 'rgba(123, 130, 242, 0.08)',
    md: 'rgba(123, 130, 242, 0.15)',
    lg: 'rgba(123, 130, 242, 0.25)',
    xl: 'rgba(123, 130, 242, 0.35)',
  },
  
  // Input поля
  input: {
    bg: 'rgba(29, 32, 48, 0.7)',
    border: 'rgba(123, 130, 242, 0.25)',
    borderFocus: '#7B82F2',
    placeholder: '#9BA5B8',
  },
  
  // Overlay
  overlay: 'rgba(13, 15, 24, 0.85)',
  overlayLight: 'rgba(13, 15, 24, 0.6)',
  
  // Для кнопок - менее контрастные
  buttonPrimaryBg: '#7B82F2',
  buttonSecondaryBg: 'rgba(29, 32, 48, 0.7)',
  buttonDisabledBg: '#6B7488',
});

export const getLightTheme = () => ({
  // Основные цвета - насыщенные для светлой темы
  primary: '#5558D9',        // Indigo - темнее и насыщеннее
  primaryDark: '#4244C7',    
  primaryLight: '#6B6FE5',   
  
  secondary: '#D63384',      // Pink - насыщенный
  accent: '#10B981',         // Green - яркий
  accentBlue: '#2563EB',     // Blue - темнее
  accentPurple: '#9333EA',   // Purple - ярче
  accentOrange: '#EA580C',   // Orange - насыщеннее
  accentCyan: '#0891B2',     // Cyan - темнее
  
  // Фон и поверхности - чистые, воздушные
  bg: '#FAFBFC',             // Почти белый с оттенком
  bgSecondary: '#F3F5F8',    // Легкий серо-голубой
  surface: '#FFFFFF',        // Чистый белый
  surfaceLight: '#F8F9FB',   // Очень светлый
  panel: '#FFFFFF',          
  
  // Границы - более видимые
  border: '#DDE1E8',         
  borderLight: '#E9ECF1',
  borderActive: '#5558D9',
  
  // Текст - максимальный контраст
  text: '#0A0D14',           // Почти черный
  textSecondary: '#3E4555',  // Темный серый
  textMuted: '#5F6877',      // Средний серый
  textDisabled: '#9BA3AF',   
  
  // Статусы - яркие
  success: '#10B981',        
  error: '#DC2626',          // Насыщенный
  warning: '#EA580C',        
  info: '#2563EB',           
  
  // Градиенты - более яркие
  gradients: {
    primary: ['#5558D9', '#6B6FE5', '#9333EA'],
    secondary: ['#D63384', '#E85C9F', '#F285BA'],
    success: ['#10B981', '#34D399', '#6EE7B7'],
    ocean: ['#2563EB', '#3B82F6', '#60A5FA'],
    sunset: ['#EA580C', '#FB923C', '#FDB36C'],
    purple: ['#9333EA', '#A855F7', '#C084FC'],
    cyan: ['#0891B2', '#06B6D4', '#22D3EE'],
    hero: ['#E0E7FF', '#DDD6FE', '#FAFBFC'],
  },
  
  // Glassmorphism - для светлой темы
  glass: {
    weak: 'rgba(255, 255, 255, 0.6)',
    medium: 'rgba(255, 255, 255, 0.8)',
    strong: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(85, 88, 217, 0.12)',
  },
  
  // Тени - темнее и заметнее
  shadow: {
    sm: 'rgba(10, 13, 20, 0.06)',
    md: 'rgba(10, 13, 20, 0.12)',
    lg: 'rgba(10, 13, 20, 0.18)',
    xl: 'rgba(10, 13, 20, 0.25)',
  },
  
  // Input поля
  input: {
    bg: '#FFFFFF',
    border: '#DDE1E8',
    borderFocus: '#5558D9',
    placeholder: '#9BA3AF',
  },
  
  // Overlay
  overlay: 'rgba(10, 13, 20, 0.5)',
  overlayLight: 'rgba(10, 13, 20, 0.25)',
  
  // Для кнопок - мягче
  buttonPrimaryBg: '#5558D9',
  buttonSecondaryBg: '#F3F5F8',
  buttonDisabledBg: '#CBD2D9',
});

// Устаревшие экспорты для обратной совместимости
export const colors = getDarkTheme();

export default colors;
