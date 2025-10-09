import React, { useState } from 'react';
import { Search, User, ShoppingCart, MapPin, Phone, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/priceUtils';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onCartClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, totalPrice } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Здесь будет логика поиска
    console.log('Поиск:', searchQuery);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-contacts">
              <span className="contact-item">
                <MapPin size={16} />
                Москва
              </span>
              <span className="contact-item">
                <Phone size={16} />
                8 (800) 555-35-35
              </span>
            </div>
            <div className="header-links">
              <Link to="/">Главная</Link>
              <Link to="/news">Новости</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <div className="logo">
              <Link className="logo-text" to="/">🛒 FoodShop</Link>
            </div>
            
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <Search size={20} />
                </button>
              </div>
            </form>
            
            <div className="header-actions">
              {isAuthenticated ? (
                <div className="header-action-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link to="/profile" className="header-action-btn" title="Профиль" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={24} />
                    <span>{user?.name || user?.email}</span>
                  </Link>
                  <button onClick={handleLogout} className="header-action-btn" title="Выйти" style={{ marginLeft: 8 }}>
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link className="header-action-btn" to="/login">
                  <User size={24} />
                  <span>Войти</span>
                </Link>
              )}
              
              <button className="header-action-btn cart-btn" onClick={onCartClick}>
                <div className="cart-icon-wrapper">
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span className="cart-badge">{totalItems}</span>
                  )}
                </div>
                <div className="cart-info">
                  <span>Корзина</span>
                  <span className="cart-price">{formatPrice(totalPrice)} ₽</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="header-nav">
        <div className="container">
          <nav className="main-nav">
            <Link to="/" className="nav-link">Каталог</Link>
            <a href="#sales" className="nav-link">Акции</a>
            <a href="#new" className="nav-link">Новинки</a>
            <a href="#popular" className="nav-link">Популярное</a>
            <a href="#brands" className="nav-link">Бренды</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

