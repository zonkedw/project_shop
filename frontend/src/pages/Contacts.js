import React from 'react';

const Contacts = () => {
  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>Контакты</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h3>Головной офис</h3>
          <p style={{ color: '#555', marginTop: 8 }}>Москва, ул. Примерная, 123</p>
          <p style={{ marginTop: 8 }}><b>Тел.:</b> 8 (800) 777-33-35</p>
          <p style={{ marginTop: 8 }}><b>E-mail:</b> info@foodshop.ru</p>
          <p style={{ marginTop: 8 }}><b>Режим работы:</b> Ежедневно 8:00 - 23:00</p>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h3>Обратная связь</h3>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Спасибо! Мы свяжемся с вами.');}} style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <input placeholder="Ваше имя" required style={{ padding: '10px 12px', border: '1px solid #e9ecef', borderRadius: 8 }} />
            <input placeholder="Email" type="email" required style={{ padding: '10px 12px', border: '1px solid #e9ecef', borderRadius: 8 }} />
            <textarea placeholder="Сообщение" rows={4} required style={{ padding: '10px 12px', border: '1px solid #e9ecef', borderRadius: 8 }} />
            <button className="add-to-cart-btn" type="submit" style={{ width: 180 }}>Отправить</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
