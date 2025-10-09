import React from 'react';
import './YandexMap.css';

const YandexMap = () => {
  const stores = [
    {
      id: 1,
      name: "FoodShop Центральный",
      address: "г. Москва, ул. Тверская, 15",
      phone: "+7 (495) 123-45-67",
      hours: "Ежедневно 8:00 - 22:00",
      metro: "м. Тверская"
    },
    {
      id: 2,
      name: "FoodShop Арбатский",
      address: "г. Москва, ул. Арбат, 25",
      phone: "+7 (495) 234-56-78",
      hours: "Ежедневно 9:00 - 21:00",
      metro: "м. Арбатская"
    },
    {
      id: 3,
      name: "FoodShop Сокольники",
      address: "г. Москва, ул. Сокольническая, 10",
      phone: "+7 (495) 345-67-89",
      hours: "Ежедневно 8:00 - 23:00",
      metro: "м. Сокольники"
    }
  ];

  return (
    <section className="yandex-map-section">
      <div className="container">
        <h2 className="section-title">Наши магазины</h2>
        
        <div className="map-content">
          {/* Яндекс.Карта */}
          <div className="yandex-map-container">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A8c2f6f4b4c8c4e4e4e4e4e4e4e4e4e4e&amp;source=constructor"
              width="100%"
              height="400"
              frameBorder="0"
              style={{ borderRadius: '12px' }}
              title="Карта магазинов FoodShop"
            ></iframe>
            
            {/* Альтернативный вариант - простая карта Москвы */}
            <div className="map-fallback">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.617700%2C55.755800&z=11&l=map"
                width="100%"
                height="400"
                frameBorder="0"
                style={{ borderRadius: '12px' }}
                title="Карта Москвы"
              ></iframe>
            </div>
          </div>

          {/* Список магазинов */}
          <div className="stores-list">
            <h3>Адреса и контакты</h3>
            {stores.map(store => (
              <div key={store.id} className="store-card">
                <h4 className="store-name">{store.name}</h4>
                <div className="store-info">
                  <p className="store-address">
                    <span className="icon">📍</span>
                    {store.address}
                  </p>
                  <p className="store-metro">
                    <span className="icon">🚇</span>
                    {store.metro}
                  </p>
                  <p className="store-phone">
                    <span className="icon">📞</span>
                    <a href={`tel:${store.phone}`}>{store.phone}</a>
                  </p>
                  <p className="store-hours">
                    <span className="icon">🕒</span>
                    {store.hours}
                  </p>
                </div>
                <div className="store-actions">
                  <button 
                    className="route-btn"
                    onClick={() => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(store.address)}`, '_blank')}
                  >
                    Маршрут
                  </button>
                  <button 
                    className="call-btn"
                    onClick={() => window.open(`tel:${store.phone}`)}
                  >
                    Позвонить
                  </button>
                </div>
              </div>
            ))}
            
            <div className="delivery-info">
              <h4>🚚 Доставка</h4>
              <p>Бесплатная доставка от 1000 ₽</p>
              <p>Время доставки: 30-60 минут</p>
              <p>Зона доставки: в пределах МКАД</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YandexMap;
