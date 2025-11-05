import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>О компании</h3>
            <ul>
              <li><Link to="/about">О нас</Link></li>
              <li><Link to="/vacancies">Вакансии</Link></li>
              <li><Link to="/news">Новости</Link></li>
              <li><a href="#investors">Инвесторам</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Покупателям</h3>
            <ul>
              <li><Link to="/delivery">Доставка</Link></li>
              <li><Link to="/payment">Оплата</Link></li>
              <li><Link to="/returns">Возврат товара</Link></li>
              <li><Link to="/favorites">Избранное</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Партнёрам</h3>
            <ul>
              <li><Link to="/suppliers">Поставщикам</Link></li>
              <li><Link to="/franchise">Франшиза</Link></li>
              <li><Link to="/advertising">Реклама</Link></li>
              <li><Link to="/cooperation">Сотрудничество</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3><Link to="/contacts" style={{ color: '#ff6b35' }}>Контакты</Link></h3>
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
