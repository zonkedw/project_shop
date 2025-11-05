import React from 'react';

const Returns = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Возврат товара</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Общие правила</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Непродовольственные товары — по закону о защите прав потребителей.</li>
        <li>Продовольственные товары надлежащего качества возврату не подлежат.</li>
        <li>Возврат возможен при нарушении целостности упаковки на момент получения, несоответствии сроков годности, комплектации.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Как оформить</h2>
      <ol style={{ lineHeight: 1.6 }}>
        <li>Свяжитесь с поддержкой в течение 24 часов после получения заказа.</li>
        <li>Подготовьте фото/видео и чек (или номер заказа).</li>
        <li>Курьер заберёт товар или оформите возврат в магазине.</li>
      </ol>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Сроки</h2>
      <p>Рассмотрение обращения — до 3 рабочих дней, возврат средств — 1–10 рабочих дней.</p>
    </section>
  </div>
);

export default Returns;
