import React from 'react';

const Cooperation = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Сотрудничество</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Направления</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>CSR проекты: благотворительность, утилизация продуктов, поддержка локальных сообществ.</li>
        <li>Логистика: совместная оптимизация последней мили.</li>
        <li>Маркетинг: совместные коллаборации с брендами и производителями.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Как предложить проект</h2>
      <p>Напишите на <b>cooperate@foodshop.ru</b> с описанием идеи, целями, KPI и сроками. Рассмотрим в течение 5 рабочих дней.</p>
    </section>
  </div>
);

export default Cooperation;
