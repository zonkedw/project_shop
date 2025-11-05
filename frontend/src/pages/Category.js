import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { getCategories, searchProducts } from '../services/api';
import './Category.css';

const pageSizeDefault = 12;

const Category = () => {
  const { name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isNew = searchParams.get('isNew') || '';
  const hasDiscount = searchParams.get('hasDiscount') || '';
  const sort = searchParams.get('sort') || '';

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState([]);

  const pageSize = pageSizeDefault;

  const load = async () => {
    setLoading(true);
    try {
      const res = await searchProducts({ q: '', category: name, minPrice, maxPrice, sort, page, pageSize, isNew, isPopular: '', hasDiscount });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { (async () => {
    try { const c = await getCategories(); setCats(Array.isArray(c) ? c : []); } catch { setCats([]); }
  })(); }, []);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [name, minPrice, maxPrice, sort, page, isNew, hasDiscount]);

  const onApply = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = new URLSearchParams(searchParams);
    next.set('minPrice', data.get('minPrice') || '');
    next.set('maxPrice', data.get('maxPrice') || '');
    next.set('sort', data.get('sort') || '');
    next.set('isNew', data.get('isNew') ? 'true' : '');
    next.set('hasDiscount', data.get('hasDiscount') ? 'true' : '');
    next.set('page', '1');
    setSearchParams(next);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const gotoPage = (p) => { const next = new URLSearchParams(searchParams); next.set('page', String(p)); setSearchParams(next); };

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <nav style={{ marginBottom: 12, color: '#999', fontSize: 14 }}>Главная / Каталог / <b>{name}</b></nav>
      <h1 className="section-title" style={{ marginBottom: 16 }}>{name}</h1>
      <div className="category-layout">
        <form onSubmit={onApply} className="sidebar-card">
          <div className="form-group">
            <label>Цена</label>
            <div className="price-row">
              <input name="minPrice" defaultValue={minPrice} placeholder="от" type="number" min="0" className="price-input" />
              <input name="maxPrice" defaultValue={maxPrice} placeholder="до" type="number" min="0" className="price-input" />
            </div>
          </div>
          <div className="form-group">
            <label>Фильтры</label>
            <label className="check-row"><input type="checkbox" name="isNew" defaultChecked={isNew === 'true'} /> Новинки</label>
            <label className="check-row"><input type="checkbox" name="hasDiscount" defaultChecked={hasDiscount === 'true'} /> Со скидкой</label>
          </div>
          <div className="form-group">
            <label>Сортировка</label>
            <select name="sort" defaultValue={sort} className="select-input">
              <option value="">По новизне</option>
              <option value="price_asc">Цена по возрастанию</option>
              <option value="price_desc">Цена по убыванию</option>
              <option value="rating_desc">По рейтингу</option>
            </select>
          </div>
          <button className="add-to-cart-btn" type="submit" style={{ width: '100%' }}>Применить</button>
        </form>
        <div>
          {loading ? (
            <p>Загрузка...</p>
          ) : (
            <>
              <div className="products-grid">
                {items.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1; const active = p === page;
                  return (
                    <button key={p} onClick={() => gotoPage(p)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e9ecef', background: active ? '#ff6b35' : '#fff', color: active ? '#fff' : '#333' }}>{p}</button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
