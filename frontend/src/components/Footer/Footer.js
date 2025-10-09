import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>О компании</h3>
            <ul>
              <li><a href="#about">О нас</a></li>
              <li><a href="#career">Карьера</a></li>
              <li><a href="#news">Новости</a></li>
              <li><a href="#investors">Инвесторам</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Покупателям</h3>
            <ul>
              <li><a href="#delivery">Доставка</a></li>
              <li><a href="#payment">Оплата</a></li>
              <li><a href="#returns">Возврат товара</a></li>
              <li><a href="#help">Помощь</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Партнёрам</h3>
            <ul>
              <li><a href="#suppliers">Поставщикам</a></li>
              <li><a href="#franchise">Франшиза</a></li>
              <li><a href="#advertising">Реклама</a></li>
              <li><a href="#cooperation">Сотрудничество</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Контакты</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={16} />
                <span>8 (800) 555-35-35</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>info@foodshop.ru</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>Москва, ул. Примерная, 123</span>
              </div>
              <div className="contact-item">
                <Clock size={16} />
                <span>Ежедневно 8:00 - 23:00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 FoodShop. Все права защищены.</p>
            <div className="footer-links">
              <a href="#privacy">Политика конфиденциальности</a>
              <a href="#terms">Пользовательское соглашение</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
