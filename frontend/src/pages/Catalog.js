import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import { Link } from 'react-router-dom';
import { getCategoryImage } from '../data/categoryImages';

const Catalog = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 24 }}>Каталог</h1>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {categories.map((c) => (
            <Link key={c} to={`/category/${encodeURIComponent(c)}`} style={{ display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none', color: '#333', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
              <div style={{ height: 140, backgroundImage: `url(${getCategoryImage(c)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: 12, fontWeight: 600 }}>{c}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
