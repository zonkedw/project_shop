import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, LogIn } from 'lucide-react';
import { getNews, addNews, testNewsAPI, testJSON } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './News.css';

const News = () => {
  const { isAuthenticated, token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNews();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Не удалось загрузить новости');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const testJSONParsing = async () => {
    setTesting(true);
    setError(null);
    
    try {
      console.log('Тестирование JSON парсинга...');
      const result = await testJSON();
      console.log('Тест JSON успешен:', result);
      setError(`✅ JSON парсинг работает! Сервер получил: ${JSON.stringify(result.receivedBody)}`);
    } catch (e) {
      console.error('Ошибка JSON парсинга:', e);
      setError(`❌ Ошибка JSON парсинга: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testAPI = async () => {
    if (!isAuthenticated || !token) {
      setError('Необходима авторизация для тестирования API');
      return;
    }

    setTesting(true);
    setError(null);
    
    try {
      console.log('Тестирование News API...');
      const result = await testNewsAPI(token);
      console.log('Тест News API успешен:', result);
      setError(`✅ News API работает! Сервер получил данные: ${JSON.stringify(result.receivedBody)}`);
    } catch (e) {
      console.error('Ошибка тестирования News API:', e);
      setError(`❌ Ошибка News API: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  // НОВАЯ ПРОСТАЯ ВЕРСИЯ onSubmit
  const onSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMIT ===');
    console.log('Title:', title);
    console.log('Content:', content);
    console.log('Auth:', isAuthenticated);
    console.log('Token:', token ? 'Есть' : 'Нет');
    
    if (!isAuthenticated || !token) {
      setError('Войдите в систему');
      return;
    }
    
    if (!title || !content) {
      setError('Заполните все поля');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('Вызываем addNews...');
      const result = await addNews({ title, content }, token);
      console.log('Результат:', result);
      
      // Очищаем форму
      setTitle('');
      setContent('');
      
      // Перезагружаем новости
      await load();
      
      setError('✅ Новость успешно добавлена!');
    } catch (error) {
      console.error('Ошибка:', error);
      setError(`❌ ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="news-page">
      <div className="news-container">
        <div className="news-header">
          <h1 className="news-title">Новости FoodShop</h1>
          <p className="news-subtitle">
            Будьте в курсе последних событий и акций нашего магазина
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="news-grid">
            {items.map((newsItem) => (
              <article key={newsItem.id || newsItem._id} className="news-card">
                <h2 className="news-card-title">{newsItem.title}</h2>
                <div className="news-card-meta">
                  <div className="news-card-date">
                    <Calendar size={16} />
                    {formatDate(newsItem.createdAt)}
                  </div>
                  {newsItem.author && (
                    <div className="news-card-author">
                      <User size={16} />
                      {newsItem.author}
                    </div>
                  )}
                </div>
                <p className="news-card-content">{newsItem.content}</p>
              </article>
            ))}
            
            {items.length === 0 && (
              <div className="news-empty">
                <div className="news-empty-icon">📰</div>
                <p className="news-empty-text">Пока нет новостей</p>
              </div>
            )}
          </div>
        )}

        {isAuthenticated ? (
          <div className="news-form-section">
            <div className="news-form-header">
              <h3 className="news-form-title">Добавить новость</h3>
              <p className="news-form-author">
                Автор: {user?.name || user?.email}
              </p>
              {/* Отладочная информация */}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Статус: {isAuthenticated ? '✅ Авторизован' : '❌ Не авторизован'} | 
                Токен: {token ? '✅ Есть' : '❌ Нет'} | 
                ID пользователя: {user?.id || 'Нет'}
              </div>
              
              {/* Кнопки тестирования */}
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                <button 
                  onClick={testJSONParsing}
                  disabled={testing}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: testing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {testing ? 'Тестирование...' : '🔧 Тест JSON'}
                </button>
                
                <button 
                  onClick={testAPI}
                  disabled={testing || !isAuthenticated}
                  style={{
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: testing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {testing ? 'Тестирование...' : '🧪 Тест News API'}
                </button>
              </div>
            </div>
            
            <form className="news-form" onSubmit={onSubmit}>
              <div className="news-form-group">
                <label className="news-form-label">Заголовок</label>
                <input
                  type="text"
                  className="news-form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите заголовок новости"
                  required
                />
              </div>
              
              <div className="news-form-group">
                <label className="news-form-label">Содержание</label>
                <textarea
                  className="news-form-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Напишите текст новости..."
                  required
                  rows={6}
                />
              </div>
              
              <button 
                type="submit" 
                className={`news-form-button ${submitting ? 'loading' : ''}`}
                disabled={submitting}
              >
                {submitting ? '' : 'Опубликовать новость'}
              </button>
            </form>
          </div>
        ) : (
          <div className="news-login-prompt">
            <p className="news-login-text">
              Хотите добавить новость? Войдите в свой аккаунт
            </p>
            <Link to="/login" className="news-login-link">
              <LogIn size={18} />
              Войти в аккаунт
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
