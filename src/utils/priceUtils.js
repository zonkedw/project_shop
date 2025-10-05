/**
 * Утилиты для безопасной работы с ценами
 */

/**
 * Преобразует значение в безопасное число для цены
 * @param {any} value - значение для преобразования
 * @param {number} defaultValue - значение по умолчанию (0)
 * @returns {number} безопасное число
 */
export const safePrice = (value, defaultValue = 0) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : defaultValue;
  }
  
  return defaultValue;
};

/**
 * Форматирует цену с защитой от ошибок
 * @param {any} price - цена для форматирования
 * @param {number} decimals - количество знаков после запятой (2)
 * @returns {string} отформатированная цена
 */
export const formatPrice = (price, decimals = 2) => {
  return safePrice(price).toFixed(decimals);
};

/**
 * Проверяет, является ли товар валидным для отображения
 * @param {object} product - объект товара
 * @returns {boolean} true если товар валидный
 */
export const isValidProduct = (product) => {
  return (
    product &&
    typeof product === 'object' &&
    product.id &&
    product.name &&
    (product.price !== undefined && product.price !== null)
  );
};
