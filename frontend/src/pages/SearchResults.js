import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { getAllProducts } from '../data/products';
import { getCategories, searchProducts } from '../services/api';

const pageSizeDefault = 12;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isNew = searchParams.get('isNew') || '';
  const isPopular = searchParams.get('isPopular') || '';
  const hasDiscount = searchParams.get('hasDiscount') || '';
  const sort = searchParams.get('sort') || '';

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const pageSize = pageSizeDefault;

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await searchProducts({ q, category, minPrice, maxPrice, sort, page, pageSize, isNew, isPopular, hasDiscount });
      if (res && Array.isArray(res.items)) {
        setItems(res.items);
        setTotal(res.total || 0);
        return;
      }
      throw new Error('bad format');
    } catch {
      // Fallback на локальные данные
      const all = getAllProducts();
      let filtered = all.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
      if (category) filtered = filtered.filter(p => p.category === category);
      if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
      if (isNew === 'true') filtered = filtered.filter(p => p.isNew);
      if (isPopular === 'true') filtered = filtered.filter(p => p.isPopular);
      if (hasDiscount === 'true') filtered = filtered.filter(p => (p.discount || 0) > 0);
      if (sort === 'price_asc') filtered.sort((a,b)=>a.price-b.price);
      else if (sort === 'price_desc') filtered.sort((a,b)=>b.price-a.price);
      setTotal(filtered.length);
      const start = (page-1)*pageSize;
      setItems(filtered.slice(start, start+pageSize));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, category, minPrice, maxPrice, sort, page, isNew, isPopular, hasDiscount]);

  const onApply = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = new URLSearchParams(searchParams);
    next.set('q', data.get('q') || '');
    next.set('category', data.get('category') || '');
    next.set('minPrice', data.get('minPrice') || '');
    next.set('maxPrice', data.get('maxPrice') || '');
    next.set('sort', data.get('sort') || '');
    next.set('isNew', data.get('isNew') ? 'true' : '');
    next.set('isPopular', data.get('isPopular') ? 'true' : '');
    next.set('hasDiscount', data.get('hasDiscount') ? 'true' : '');
    next.set('page', '1');
    setSearchParams(next);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const gotoPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>Результат поиска</h1>
      {q && (
        <p style={{ color: '#666', marginTop: -8, marginBottom: 24 }}>по запросу <b>{q}</b></p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <form onSubmit={onApply} style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', position: 'sticky', top: 100, height: 'fit-content' }}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Поиск</label>
            <input name="q" defaultValue={q} className="search-input" style={{ width: '100%', borderRadius: 8, border: '1px solid #e9ecef', padding: '10px 12px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Категория</label>
            <select name="category" defaultValue={category} style={{ width: '100%', borderRadius: 8, border: '1px solid #e9ecef', padding: '10px 12px' }}>
              <option value="">Все</option>
              {categories.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Цена</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input name="minPrice" defaultValue={minPrice} placeholder="от" type="number" min="0" style={{ flex: 1, borderRadius: 8, border: '1px solid #e9ecef', padding: '10px 12px' }} />
              <input name="maxPrice" defaultValue={maxPrice} placeholder="до" type="number" min="0" style={{ flex: 1, borderRadius: 8, border: '1px solid #e9ecef', padding: '10px 12px' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 12, display: 'grid', gap: 8 }}>
            <label>Фильтры</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="isNew" defaultChecked={isNew === 'true'} /> Новинки</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="isPopular" defaultChecked={isPopular === 'true'} /> Популярные</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="hasDiscount" defaultChecked={hasDiscount === 'true'} /> Со скидкой</label>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Сортировка</label>
            <select name="sort" defaultValue={sort} style={{ width: '100%', borderRadius: 8, border: '1px solid #e9ecef', padding: '10px 12px' }}>
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
                  const p = idx + 1;
                  const active = p === page;
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

export default SearchResults;
