import React from 'react';

const Partners = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Партнёрам</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Форматы сотрудничества</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Ритейл‑партнёрство: совместные акции, кросс‑промо, размещение на полке.</li>
        <li>Локальные производители: приоритет локальным фермерам и ремесленным производствам.</li>
        <li>IT‑интеграции: обмен остатками, прайсами, промокампании через API.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Контакты отдела партнёрств</h2>
      <p>E‑mail: partners@foodshop.ru, тел.: 8 (800) 555‑35‑35 (доб. 3)</p>
    </section>
  </div>
);

export default Partners;
