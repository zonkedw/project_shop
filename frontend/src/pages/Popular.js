import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { searchProducts } from '../services/api';

const Popular = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // сортируем по рейтингу как на бэке (rating_desc)
        const res = await searchProducts({ isPopular: true, sort: 'rating_desc', page: 1, pageSize: 48 });
        setItems(res.items || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>Популярное</h1>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="products-grid">
          {items.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
          {items.length === 0 && <p>Пока нет популярных товаров.</p>}
        </div>
      )}
    </div>
  );
};

export default Popular;
