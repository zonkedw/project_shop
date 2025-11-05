import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm, { FormGroup, FormInput } from '../components/AuthForm/AuthForm';
import useFormValidation, { validationRules } from '../hooks/useFormValidation';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll
  } = useFormValidation(
    { email: '', password: '' },
    {
      email: [
        validationRules.required(),
        validationRules.email()
      ],
      password: [
        validationRules.required(),
        validationRules.minLength(6, 'Пароль должен содержать минимум 6 символов')
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
      await login(values.email, values.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    }
  };

  return (
    <AuthForm
      title="Добро пожаловать!"
      subtitle="Войдите в свой аккаунт"
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      buttonText="Войти"
      linkText={
        <>
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </>
      }
    >
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
          placeholder="Введите пароль"
          autoComplete="current-password"
          error={errors.password}
        />
      </FormGroup>
    </AuthForm>
  );
};

export default Login;
