import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm, { FormGroup, FormInput } from '../components/AuthForm/AuthForm';
import useFormValidation, { validationRules } from '../hooks/useFormValidation';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll
  } = useFormValidation(
    { name: '', email: '', password: '', confirmPassword: '' },
    {
      name: [
        validationRules.required('Имя обязательно для заполнения'),
        validationRules.minLength(2, 'Имя должно содержать минимум 2 символа'),
        validationRules.maxLength(50, 'Имя не должно превышать 50 символов')
      ],
      email: [
        validationRules.required(),
        validationRules.email()
      ],
      password: [
        validationRules.required(),
        validationRules.minLength(6, 'Пароль должен содержать минимум 6 символов'),
        validationRules.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Пароль должен содержать минимум одну заглавную букву, одну строчную и одну цифру'
        )
      ],
      confirmPassword: [
        validationRules.required('Подтвердите пароль'),
        validationRules.confirmPassword()
      ]
    }
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateAll()) {
      return;
    }

    try {
      await register({ 
        name: values.name, 
        email: values.email, 
        password: values.password 
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    }
  };

  return (
    <AuthForm
      title="Создать аккаунт"
      subtitle="Присоединяйтесь к FoodShop"
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      buttonText="Зарегистрироваться"
      linkText={
        <>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </>
      }
    >
      <FormGroup label="Имя" error={errors.name}>
        <FormInput
          type="text"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="Введите ваше имя"
          autoComplete="name"
          error={errors.name}
        />
      </FormGroup>

      <FormGroup label="Email" error={errors.email}>
        <FormInput
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="Введите ваш email"
          autoComplete="email"
          error={errors.email}
        />
      </FormGroup>

      <FormGroup label="Пароль" error={errors.password}>
        <FormInput
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="Создайте пароль"
          autoComplete="new-password"
          error={errors.password}
        />
      </FormGroup>

      <FormGroup label="Подтвердите пароль" error={errors.confirmPassword}>
        <FormInput
          type="password"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="Повторите пароль"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
      </FormGroup>
    </AuthForm>
  );
};

export default Register;
