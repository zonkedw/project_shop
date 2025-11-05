import React from 'react';

const About = () => {
  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>О компании FoodShop</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h2 style={{ marginBottom: 12 }}>Мы непрерывно развиваемся</h2>
          <p style={{ color: '#555', lineHeight: 1.7 }}>
            FoodShop — современная сеть продуктовых магазинов, где качество и доступность стоят на первом месте. 
            Мы заботимся о клиентах и постоянно совершенствуем сервис, ассортимент и скорость доставки.
          </p>
          <ul style={{ marginTop: 16, color: '#444', lineHeight: 1.8 }}>
            <li>Более 20 лет в розничной торговле</li>
            <li>Максимальное качество товаров и услуг по доступной цене</li>
            <li>Поддержка локальных производителей и фермеров</li>
          </ul>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="https://assets-global.website-files.com/5dba9f3d47be886d6b97511b/61f2b14e0db18a0e4f5b5f0e_team-illustration.svg" alt="Команда" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      </div>
      <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 16, marginTop: 24, color: '#2e7d32' }}>
        Спасибо, что вы с нами. FoodShop — везет всегда!
      </div>
    </div>
  );
};

export default About;
