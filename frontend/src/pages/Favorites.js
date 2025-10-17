import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { getProductsByIds } from '../services/api';
import { getAllProducts } from '../data/products';
import { getFavorites } from '../utils/favorites';

const Favorites = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const ids = getFavorites();
      if (!ids.length) { setItems([]); return; }
      const res = await getProductsByIds(ids);
      if (Array.isArray(res)) {
        // Сортируем по порядку добавления (последние сверху)
        const order = new Map(ids.map((id, i) => [Number(id), i]));
        setItems([...res].sort((a,b)=> (order.get(b.id)||0) - (order.get(a.id)||0) ));
        return;
      }
      throw new Error('bad');
    } catch {
      const all = getAllProducts();
      const ids = new Set(getFavorites());
      setItems(all.filter(p => ids.has(Number(p.id))));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>Избранное</h1>
      {loading ? (
        <p>Загрузка...</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#666' }}>Список избранного пуст. Добавляйте товары сердечком на карточке.</p>
      ) : (
        <div className="products-grid">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Favorites;
