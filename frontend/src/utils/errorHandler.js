/**
 * Утилиты для обработки ошибок
 */

/**
 * Получает понятное сообщение об ошибке из объекта ошибки
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Произошла неизвестная ошибка';
  
  // Если это строка
  if (typeof error === 'string') return error;
  
  // Если есть message
  if (error.message) return error.message;
  
  // Если есть response с данными
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Статус-коды
  if (error.status === 0 || error.code === 'ECONNABORTED') {
    return 'Нет соединения с сервером. Проверьте подключение к интернету.';
  }
  
  if (error.status === 401) {
    return 'Сессия истекла. Пожалуйста, войдите снова.';
  }
  
  if (error.status === 403) {
    return 'Доступ запрещен';
  }
  
  if (error.status === 404) {
    return 'Ресурс не найден';
  }
  
  if (error.status === 429) {
    return 'Слишком много запросов. Попробуйте позже.';
  }
  
  if (error.status >= 500) {
    return 'Ошибка сервера. Попробуйте позже.';
  }
  
  return 'Произошла ошибка. Попробуйте еще раз.';
};

/**
 * Проверяет, является ли ошибка сетевой
 */
export const isNetworkError = (error) => {
  return (
    error?.code === 'ECONNABORTED' ||
    error?.status === 0 ||
    error?.message?.includes('Network') ||
    error?.message?.includes('network')
  );
};

/**
 * Проверяет, является ли ошибка ошибкой авторизации
 */
export const isAuthError = (error) => {
  return error?.status === 401 || error?.response?.status === 401;
};

