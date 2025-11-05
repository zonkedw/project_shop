import React from 'react';

const Advertising = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Реклама</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Возможности размещения</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Полка в магазине: бренд‑полки, стопперы, вобблеры, ценники.</li>
        <li>Digital: главная страница, категории, карточки товара, push/рассылки.</li>
        <li>Оффлайн POSM: каталоги, листовки, промостолы и дегустации.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Требования к макетам</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Форматы: SVG/PNG/JPG, 2x ретина желательна.</li>
        <li>Соблюдение брендбука сети и законодательства о рекламе.</li>
        <li>Срок подачи макетов — не менее 5 рабочих дней до старта кампании.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Контакты рекламного отдела</h2>
      <p>E‑mail: <b>ads@foodshop.ru</b>, тел.: 8 (800) 555‑35‑35 (доб. 5)</p>
    </section>
  </div>
);

export default Advertising;
