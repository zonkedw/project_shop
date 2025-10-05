import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, MapPin, Phone, CreditCard, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/priceUtils';
import useFormValidation, { validationRules } from '../hooks/useFormValidation';
import { createOrder } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Хуки должны вызываться до любых условных возвратов
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll
  } = useFormValidation(
    {
      firstName: user?.name || '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      deliveryMethod: 'courier',
      paymentMethod: 'card',
      comment: ''
    },
    {
      firstName: [
        validationRules.required('Имя обязательно'),
        validationRules.minLength(2, 'Минимум 2 символа')
      ],
      lastName: [
        validationRules.required('Фамилия обязательна'),
        validationRules.minLength(2, 'Минимум 2 символа')
      ],
      email: [
        validationRules.required(),
        validationRules.email()
      ],
      phone: [
        validationRules.required('Телефон обязателен'),
        validationRules.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Неверный формат телефона')
      ],
      address: [
        validationRules.required('Адрес обязателен'),
        validationRules.minLength(10, 'Минимум 10 символов')
      ],
      city: [
        validationRules.required('Город обязателен')
      ],
      postalCode: [
        validationRules.required('Почтовый индекс обязателен'),
        validationRules.pattern(/^\d{6}$/, 'Индекс должен содержать 6 цифр')
      ]
    }
  );


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone
        },
        delivery: {
          method: values.deliveryMethod,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode
        },
        payment: {
          method: values.paymentMethod
        },
        totalPrice,
        totalItems,
        comment: values.comment
      };

      console.log('Создание заказа:', orderData);

      const result = await createOrder(orderData, token);
      console.log('Заказ создан:', result);

      // Очищаем корзину
      clearCart();
      setSuccess(true);

    } catch (err) {
      console.error('Ошибка создания заказа:', err);
      setError(err.message || 'Ошибка при оформлении заказа');
    } finally {
      setSubmitting(false);
    }
  };

  // Если корзина пуста и это не страница успеха, показываем сообщение
  if (items.length === 0 && !success) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <h1>Корзина пуста</h1>
            <p>Добавьте товары в корзину для оформления заказа</p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Вернуться к покупкам
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="checkout-success">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">
              <Check size={64} />
            </div>
            <h1>Заказ успешно оформлен!</h1>
            <p>Спасибо за покупку! Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
            <div className="success-actions">
              <button 
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Вернуться к покупкам
              </button>
              <button 
                onClick={() => navigate('/orders')}
                className="btn-secondary"
              >
                Мои заказы
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>
            <ShoppingCart size={32} />
            Оформление заказа
          </h1>
          <p>Заполните данные для доставки и оплаты</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="checkout-content">
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              
              {/* Контактные данные */}
              <div className="form-section">
                <h3>
                  <User size={20} />
                  Контактные данные
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Имя *</label>
                    <input
                      type="text"
                      value={values.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      className={errors.firstName ? 'error' : ''}
                      placeholder="Введите имя"
                    />
                    {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Фамилия *</label>
                    <input
                      type="text"
                      value={values.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      className={errors.lastName ? 'error' : ''}
                      placeholder="Введите фамилию"
                    />
                    {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={values.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={errors.email ? 'error' : ''}
                      placeholder="example@mail.ru"
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Телефон *</label>
                    <input
                      type="tel"
                      value={values.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className={errors.phone ? 'error' : ''}
                      placeholder="+7 (999) 123-45-67"
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Адрес доставки */}
              <div className="form-section">
                <h3>
                  <MapPin size={20} />
                  Адрес доставки
                </h3>
                <div className="form-group">
                  <label>Способ доставки</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="courier"
                        checked={values.deliveryMethod === 'courier'}
                        onChange={(e) => handleChange('deliveryMethod', e.target.value)}
                      />
                      <span>Курьерская доставка (300 ₽)</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={values.deliveryMethod === 'pickup'}
                        onChange={(e) => handleChange('deliveryMethod', e.target.value)}
                      />
                      <span>Самовывоз (бесплатно)</span>
                    </label>
                  </div>
                </div>
                
                {values.deliveryMethod === 'courier' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Город *</label>
                        <input
                          type="text"
                          value={values.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          onBlur={() => handleBlur('city')}
                          className={errors.city ? 'error' : ''}
                          placeholder="Москва"
                        />
                        {errors.city && <span className="field-error">{errors.city}</span>}
                      </div>
                      <div className="form-group">
                        <label>Почтовый индекс *</label>
                        <input
                          type="text"
                          value={values.postalCode}
                          onChange={(e) => handleChange('postalCode', e.target.value)}
                          onBlur={() => handleBlur('postalCode')}
                          className={errors.postalCode ? 'error' : ''}
                          placeholder="123456"
                        />
                        {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Адрес *</label>
                      <input
                        type="text"
                        value={values.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        onBlur={() => handleBlur('address')}
                        className={errors.address ? 'error' : ''}
                        placeholder="Улица, дом, квартира"
                      />
                      {errors.address && <span className="field-error">{errors.address}</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Способ оплаты */}
              <div className="form-section">
                <h3>
                  <CreditCard size={20} />
                  Способ оплаты
                </h3>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={values.paymentMethod === 'card'}
                      onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    />
                    <span>Банковская карта</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={values.paymentMethod === 'cash'}
                      onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    />
                    <span>Наличные при получении</span>
                  </label>
                </div>
              </div>

              {/* Комментарий */}
              <div className="form-section">
                <div className="form-group">
                  <label>Комментарий к заказу</label>
                  <textarea
                    value={values.comment}
                    onChange={(e) => handleChange('comment', e.target.value)}
                    placeholder="Дополнительная информация для курьера"
                    rows={3}
                  />
                </div>
              </div>

            </form>
          </div>

          {/* Сводка заказа */}
          <div className="order-summary">
            <h3>Ваш заказ</h3>
            <div className="order-items">
              {items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.quantity} шт. × {formatPrice(item.price)} ₽</p>
                  </div>
                  <div className="item-total">
                    {formatPrice(item.price * item.quantity)} ₽
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-line">
                <span>Товары ({totalItems} шт.)</span>
                <span>{formatPrice(totalPrice)} ₽</span>
              </div>
              <div className="total-line">
                <span>Доставка</span>
                <span>{values.deliveryMethod === 'courier' ? '300 ₽' : 'Бесплатно'}</span>
              </div>
              <div className="total-line final">
                <span>Итого</span>
                <span>
                  {formatPrice(totalPrice + (values.deliveryMethod === 'courier' ? 300 : 0))} ₽
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              onClick={handleSubmit}
              disabled={submitting || items.length === 0}
              className="checkout-btn"
            >
              {submitting ? 'Оформляем заказ...' : 'Оформить заказ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
