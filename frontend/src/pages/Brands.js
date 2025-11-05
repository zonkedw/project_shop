import React from 'react';

const BRANDS = [
  { name: 'Danone', img: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Danone_logo.svg' },
  { name: 'Heinz', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Heinz_logo.svg' },
  { name: 'Nestlé', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Nestle_textlogo_blue.svg' },
  { name: 'Barilla', img: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Barilla_logo.svg' },
  { name: 'Coca-Cola', img: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Coca-Cola_logo.svg' },
  { name: 'Pepsi', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Pepsi_logo_2014.svg' },
  { name: 'Lactalis', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lactalis_logo.svg' },
  { name: 'Unilever', img: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Unilever.svg' },
];

const Brands = () => {
  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>Бренды</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        {BRANDS.map(b => (
          <div key={b.name} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
            <img src={b.img} alt={b.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Brands;
