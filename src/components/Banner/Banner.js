import React from 'react';
import { Truck } from 'lucide-react';
import './Banner.css';

const Banner = () => {
  return (
    <div className="banner">
      <div className="container">
        <div className="banner-content">
          <div className="banner-icon">
            <Truck size={48} />
          </div>
          <div className="banner-text">
            <h2>Доставка бесплатно от 1000 ₽</h2>
            <p>Быстрая доставка продуктов прямо к вашему дому</p>
          </div>
          <div className="banner-image">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
              alt="Свежие продукты в корзине" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
