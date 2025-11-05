import React from 'react';

const Delivery = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Доставка</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Зоны и стоимость</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>В пределах МКАД — бесплатно от 1000 ₽, иначе 199 ₽.</li>
        <li>За МКАД до 10 км — 299 ₽, свыше 10 км — по согласованию.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Сроки</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Курьер: 60–120 минут при наличии товара на ближайшем складе.</li>
        <li>Самовывоз: в день заказа после SMS о готовности (хранение 24 часа).</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Условия доставki</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Доставка до двери/подъезда, подъём — бесплатно при наличии лифта.</li>
        <li>Проверяйте комплектность и сроки годности при получении.</li>
        <li>Охлаждённые и замороженные товары перевозятся в термобоксах.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>График</h2>
      <p>Ежедневно 08:00–23:00. Пиковые интервалы могут быть ограничены.</p>
    </section>
  </div>
);

export default Delivery;
