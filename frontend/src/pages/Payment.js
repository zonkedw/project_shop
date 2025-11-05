import React from 'react';

const Payment = () => (
  <div className="container" style={{ padding: '24px 0' }}>
    <h1 className="section-title" style={{ marginBottom: 16 }}>Оплата</h1>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Доступные способы</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Банковские карты: MIR, Visa, MasterCard (онлайн и курьеру).</li>
        <li>SBP (Система быстрых платежей) — по QR‑коду у курьера.</li>
        <li>Наличными — при самовывозе из магазина.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Безопасность</h2>
      <ul style={{ lineHeight: 1.6 }}>
        <li>Онлайн-платежи проходят через сертифицированный платёжный шлюз (PCI DSS).</li>
        <li>Данные карт не хранятся на наших серверах.</li>
      </ul>
    </section>

    <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Возврат средств</h2>
      <p>При отмене заказа или частичном возврате деньги поступают тем же способом в течение 1–10 рабочих дней в зависимости от банка.</p>
    </section>
  </div>
);

export default Payment;
