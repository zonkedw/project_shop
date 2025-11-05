import React, { useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, safePrice } from '../../utils/priceUtils';
import { Link } from 'react-router-dom';
import { isFavorite, toggleFavorite } from '../../utils/favorites';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [fav, setFav] = useState(isFavorite(product.id));

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product.id);
    setFav(isFavorite(product.id));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} fill="#ffc107" color="#ffc107" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} fill="#ffc107" color="#ffc107" style={{ opacity: 0.5 }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} color="#e0e0e0" />);
    }

    return stars;
  };

  // Защита от некорректных данных
  const safePriceValue = safePrice(product.price);
  const safeOriginalPrice = product.originalPrice ? safePrice(product.originalPrice) : null;
  const safeRating = safePrice(product.rating);

  return (
    <div className="product-card">
      {product.discount && (
        <div className="product-badge discount-badge">
          -{product.discount}%
        </div>
      )}
      {product.isNew && (
        <div className="product-badge new-badge">
          Новинка
        </div>
      )}
      {product.isPopular && (
        <div className="product-badge popular-badge">
          Хит
        </div>
      )}
      
      <button className={`favorite-btn ${fav ? 'active' : ''}`} onClick={handleToggleFavorite} title={fav ? 'Убрать из избранного' : 'В избранное'}>
        <Heart size={18} color="#ff6b35" fill={fav ? '#ff6b35' : 'none'} />
      </button>

      <Link to={`/product/${product.id}`} className="product-image">
        <img src={product.image} alt={product.name} />
      </Link>
      
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        
        <div className="product-rating">
          <div className="stars">
            {renderStars(safeRating)}
          </div>
          <span className="rating-text">
            {safeRating} ({product.reviews || 0})
          </span>
        </div>
        
        <div className="product-price">
          <span className="current-price">{formatPrice(safePriceValue)} ₽</span>
          {safeOriginalPrice && (
            <span className="original-price">{formatPrice(safeOriginalPrice)} ₽</span>
          )}
        </div>
        
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          <ShoppingCart size={18} />
          В корзину
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
