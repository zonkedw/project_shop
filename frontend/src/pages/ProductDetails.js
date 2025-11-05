import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct, getRelatedProducts } from '../services/api';
import { getAllProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice, safePrice } from '../utils/priceUtils';
import ProductCard from '../components/ProductCard/ProductCard';
import { isFavorite, toggleFavorite } from '../utils/favorites';

const Rating = ({ value = 0 }) => {
  const stars = [];
  const full = Math.floor(value);
  const hasHalf = value % 1 !== 0;
  for (let i = 0; i < full; i++) stars.push('★');
  if (hasHalf) stars.push('☆');
  while (stars.length < 5) stars.push('✩');
  return <span style={{ color: '#ffb400' }}>{stars.join(' ')}</span>;
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [fav, setFav] = useState(false);
  const { addToCart } = useCart();

  const load = async (pid) => {
    try {
      const p = await getProduct(pid);
      setProduct(p);
      setFav(isFavorite(p.id));
    } catch {
      const p = getAllProducts().find((x) => String(x.id) === String(pid));
      if (p) {
        setProduct(p);
        setFav(isFavorite(p.id));
      }
    }
    try {
      const rel = await getRelatedProducts(pid);
      setRelated(Array.isArray(rel) ? rel : []);
    } catch {
      const base = getAllProducts();
      const curr = base.find((x) => String(x.id) === String(pid));
      if (curr) setRelated(base.filter((x) => x.id !== curr.id).slice(0, 8));
    }
  };

  useEffect(() => { load(id); /* eslint-disable-next-line */ }, [id]);

  const add = () => product && addToCart(product);
  const toggleFav = () => { if (product) { toggleFavorite(product.id); setFav(isFavorite(product.id)); } };

  const price = useMemo(() => product ? safePrice(product.price) : 0, [product]);
  const original = useMemo(() => product?.originalPrice ? safePrice(product.originalPrice) : null, [product]);

  if (!product) return <div className="container" style={{ padding: '24px 0' }}>Загрузка...</div>;

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <nav style={{ marginBottom: 16, color: '#999', fontSize: 14 }}>Главная / Каталог / {product.category || 'Товар'} / <b>{product.name}</b></nav>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} />
        </div>
        <div>
          <h1 className="section-title" style={{ marginBottom: 8 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#666', marginBottom: 12 }}>
            <Rating value={safePrice(product.rating)} />
            <span>{safePrice(product.rating)} · {product.reviews || 0} отзывов</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 800 }}>{formatPrice(price)} ₽</div>
            {original && <div style={{ textDecoration: 'line-through', color: '#999' }}>{formatPrice(original)} ₽</div>}
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button className="add-to-cart-btn" onClick={add} style={{ maxWidth: 220 }}>В корзину</button>
            <button className={`btn ${fav ? 'btn-primary' : ''}`} onClick={toggleFav} style={{ border: '1px solid #ff6b35', color: fav ? '#fff' : '#ff6b35', background: fav ? '#ff6b35' : '#fff' }}>{fav ? 'В избранном' : 'В избранное'}</button>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <h3 style={{ marginBottom: 8 }}>Описание</h3>
            <p style={{ color: '#555', lineHeight: 1.6 }}>{product.description || 'Качественный продукт по выгодной цене. Свежесть и проверенное качество.'}</p>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 32 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>С этим товаром покупают</h2>
        <div className="products-grid">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Отзывы</h2>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <p style={{ color: '#666' }}>Пока нет отзывов. Вы можете быть первым!</p>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
