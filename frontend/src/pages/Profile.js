import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api';
import { LogOut, User } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token, user, logout } = useAuth();

  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    getMe(token)
      .then((data) => {
        // backend /auth/me returns { user: { id, name, email } }
        if (data && data.user) setProfile(data.user);
      })
      .catch((e) => setError(e.message || 'Не удалось загрузить профиль'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-top">
          <h1 className="profile-title">Профиль пользователя</h1>
          <p className="profile-subtitle">Данные аккаунта и настройки</p>
        </div>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <div className="profile-title">
              <h2>Основная информация</h2>
              <p>Управляйте своим аккаунтом</p>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Выйти">
              <LogOut size={18} />
              <span>Выйти</span>
            </button>
          </div>

          {error && <div className="profile-error">{error}</div>}

          {loading ? (
            <div className="profile-loading">
              <div className="profile-spinner" /> Загрузка профиля...
            </div>
          ) : (
            <div className="profile-content">
              <div className="profile-row">
                <span className="label">Имя</span>
                <span className="value">{profile?.name || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="label">Email</span>
                <span className="value">{profile?.email}</span>
              </div>
              <div className="profile-row">
                <span className="label">ID</span>
                <span className="value mono">{profile?.id}</span>
              </div>

              <div className="profile-actions">
                <button type="button" className="profile-primary-btn">Редактировать профиль</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
