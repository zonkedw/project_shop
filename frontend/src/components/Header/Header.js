import React, { useEffect, useRef, useState } from 'react';
import { Search, User, ShoppingCart, MapPin, Phone, LogOut, Heart, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/priceUtils';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { suggestProducts, getCategories } from '../../services/api';

const Header = ({ onCartClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const closeTimer = useRef(null);
  const { totalItems, totalPrice } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSuggest(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Debounced suggestions
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const s = await suggestProducts(q);
        setSuggestions(Array.isArray(s) ? s : []);
        setShowSuggest(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Catalog hover logic with small delay
  const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setCatalogOpen(false), 180); };
  const openCatalog = async () => {
    cancelClose();
    setCatalogOpen(true);
    if (categories.length === 0) {
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories([]);
      }
    }
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
              {isAuthenticated && <Link to="/orders">Мои заказы</Link>}
              {isAdmin && <Link to="/admin/orders">Заказы (админ)</Link>}
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
                  onFocus={() => searchQuery && setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                />
                <button type="submit" className="search-button">
                  <Search size={20} />
                </button>
              </div>
              {showSuggest && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.slice(0,6).map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      className="suggest-item"
                      onMouseDown={() => navigate(`/product/${s.id}`)}
                    >
                      <img src={s.image} alt="" />
                      <span className="suggest-name">{s.name}</span>
                      <span className="suggest-price">{formatPrice(s.price)} ₽</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="suggest-item suggest-footer"
                    onMouseDown={() => navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                  >
                    <span className="suggest-name">Показать все результаты</span>
                  </button>
                </div>
              )}
            </form>
            
            <div className="header-actions">
              <Link className="header-action-btn" to="/favorites" title="Избранное">
                <Heart size={22} />
                <span>Избранное</span>
              </Link>
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
            <div
              className="nav-link catalog-trigger"
              onMouseEnter={openCatalog}
              onMouseLeave={scheduleClose}
            >
              <Link to="/catalog" className="nav-link" onMouseEnter={openCatalog}>
                Каталог
              </Link>
              <ChevronDown size={16} style={{ marginLeft: 6 }} />
              {catalogOpen && (
                <div className="catalog-dropdown" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                  <div className="catalog-grid">
                    {categories.map((c) => (
                      <Link key={c} to={`/category/${encodeURIComponent(c)}`} className="catalog-item">
                        <div className="catalog-thumb" />
                        <span>{c}</span>
                      </Link>
                    ))}
                    {categories.length === 0 && (
                      <div className="catalog-empty">Категории недоступны</div>
                    )}
                  </div>
                </div>
              )}
            </div>
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

