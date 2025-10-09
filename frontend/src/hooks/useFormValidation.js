import { useState, useCallback } from 'react';

const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  }, [validationRules, values]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      newErrors[name] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return isValid;
  }, [validationRules, validateField, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.values(errors).every(error => !error)
  };
};

// Готовые правила валидации
export const validationRules = {
  required: (message = 'Поле обязательно для заполнения') => (value) => {
    return !value || value.trim() === '' ? message : '';
  },

  email: (message = 'Введите корректный email') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : '';
  },

  minLength: (min, message) => (value) => {
    const msg = message || `Минимум ${min} символов`;
    return value && value.length < min ? msg : '';
  },

  maxLength: (max, message) => (value) => {
    const msg = message || `Максимум ${max} символов`;
    return value && value.length > max ? msg : '';
  },

  pattern: (regex, message) => (value) => {
    return value && !regex.test(value) ? message : '';
  },

  confirmPassword: (message = 'Пароли не совпадают') => (value, allValues) => {
    return value !== allValues.password ? message : '';
  }
};

export default useFormValidation;
