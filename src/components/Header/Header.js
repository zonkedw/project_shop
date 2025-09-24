import React, { useState } from 'react';
import { Search, User, ShoppingCart, MapPin, Phone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = ({ onCartClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, totalPrice } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    // Здесь будет логика поиска
    console.log('Поиск:', searchQuery);
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
              <a href="#delivery">Доставка</a>
              <a href="#payment">Оплата</a>
              <a href="#about">О нас</a>
              <a href="#contacts">Контакты</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <div className="logo">
              <span className="logo-text">🛒 FoodShop</span>
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
              <button className="header-action-btn">
                <User size={24} />
                <span>Войти</span>
              </button>
              
              <button className="header-action-btn cart-btn" onClick={onCartClick}>
                <div className="cart-icon-wrapper">
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span className="cart-badge">{totalItems}</span>
                  )}
                </div>
                <div className="cart-info">
                  <span>Корзина</span>
                  <span className="cart-price">{totalPrice.toFixed(2)} ₽</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="header-nav">
        <div className="container">
          <nav className="main-nav">
            <a href="#catalog" className="nav-link">Каталог</a>
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
