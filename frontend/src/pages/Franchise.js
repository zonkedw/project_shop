import React from 'react';

const Franchise = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Франшиза</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Формат магазина</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Площадь от 80 до 300 м², первая линия/плотная жилая застройка.</li>
        <li>Холодильное и кассовое оборудование по стандартам сети.</li>
        <li>IT‑системы: учёт, эквайринг, EGAIS/Маркировка для соответствующих групп.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Финансовая модель</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Паушальный взнос: от 300 000 ₽ (в зависимости от города/формата).</li>
        <li>Роялти: 3–5% от оборота.</li>
        <li>Окупаемость: 12–24 месяцев при соблюдении стандартов сети.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Оставить заявку</h2>
      <p>Напишите на <b>franchise@foodshop.ru</b> с презентацией локации (адрес, площадь, фото фасада, трафик).</p>
    </section>
  </div>
);

export default Franchise;
