import React from 'react';

const Suppliers = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Поставщикам</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Требования к продукции</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Наличие полного пакета документов (сертификаты, декларации соответствия, ветеринарные сопроводительные документы).</li>
        <li>Маркировка по ТР ТС, сроки годности и условия хранения.</li>
        <li>Стабильные поставки, согласованный график, палетные места/тарооборот.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Как начать сотрудничество</h2>
      <ol style={{ lineHeight: 1.6 }}>
        <li>Отправьте каталог и коммерческое предложение на <b>suppliers@foodshop.ru</b>.</li>
        <li>Приложите прайс, минимальные партии и условия логистики.</li>
        <li>После первичной оценки назначим тестовые поставки и дегустацию (для fresh‑категорий).</li>
      </ol>
    </section>
  </div>
);

export default Suppliers;
