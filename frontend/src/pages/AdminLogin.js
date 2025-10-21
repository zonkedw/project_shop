import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      navigate('/news');
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (!ok) {
        setError('Не удалось войти');
        return;
      }
      // Проверяем роль через /auth/me
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Ошибка авторизации');
        return;
      }
      const me = await getMe(token);
      if (me?.user?.is_admin) {
        navigate('/news');
      } else {
        setError('Недостаточно прав (требуется администратор)');
      }
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0', maxWidth: 560 }}>
      <h1 className="section-title" style={{ marginBottom: 12 }}>Административный вход</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>Войдите под админ-аккаунтом для управления новостями.</p>

      {error && (
        <div style={{ background: '#ffe9e2', color: '#b33', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={onSubmit} style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'grid', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}>Email</label>
          <input type="email" autoComplete="username" required value={email} onChange={(e)=>setEmail(e.target.value)}
                 style={{ width: '100%', border: '1px solid #e9ecef', borderRadius: 8, padding: '10px 12px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}>Пароль</label>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e)=>setPassword(e.target.value)}
                 style={{ width: '100%', border: '1px solid #e9ecef', borderRadius: 8, padding: '10px 12px' }} />
        </div>
        <button type="submit" className="add-to-cart-btn" disabled={loading} style={{ width: 180 }}>
          {loading ? 'Входим...' : 'Войти как админ'}
        </button>
      </form>

      <div style={{ marginTop: 16, color: '#666', fontSize: 13 }}>
        По умолчанию админ создаётся при инициализации БД. Переопределите логин/пароль через переменные окружения `ADMIN_EMAIL` и `ADMIN_PASSWORD` в `backend/.env`.
      </div>
    </div>
  );
};

export default AdminLogin;
