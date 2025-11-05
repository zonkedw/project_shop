import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders, cancelOrder, applyDiscount } from '../services/api';
import { formatPrice } from '../utils/priceUtils';

const statusLabels = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждён',
  preparing: 'Готовится',
  delivering: 'Доставка',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

const Orders = () => {
  const { isAuthenticated, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState({}); // { [orderId]: code }
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const data = await getOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isAuthenticated, token]);

  const canCancel = (status) => ['pending', 'confirmed'].includes(status);

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 12 }}>Мои заказы</h1>
      {error && <div style={{ background: '#ffe9e2', color: '#b33', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Заказ {o.order_number || `#${o.id}`}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{statusLabels[o.status] || o.status} • {new Date(o.created_at || o.createdAt).toLocaleString('ru-RU')}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{formatPrice(o.total_price || o.totalPrice)} ₽</div>
              </div>

              <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
                {(o.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: 14 }}>
                    <div>{it.name} × {it.quantity}</div>
                    <div>{formatPrice(it.price * it.quantity)} ₽</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {canCancel(o.status) && (
                  <button
                    className="btn"
                    disabled={busyId === o.id}
                    onClick={async () => {
                      if (!window.confirm('Отменить заказ?')) return;
                      try {
                        setBusyId(o.id);
                        await cancelOrder(o.id, token);
                        await load();
                      } catch (e) {
                        setError(e.message);
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >Отменить</button>
                )}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Промокод"
                    value={discountCode[o.id] || ''}
                    onChange={(e)=> setDiscountCode({ ...discountCode, [o.id]: e.target.value })}
                    style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: '8px 10px' }}
                  />
                  <button
                    className="btn"
                    disabled={busyId === o.id}
                    onClick={async ()=>{
                      try {
                        setBusyId(o.id);
                        const code = (discountCode[o.id] || '').trim();
                        if (!code) return;
                        await applyDiscount(o.id, code, token);
                        await load();
                      } catch (e) { setError(e.message); } finally { setBusyId(null); }
                    }}
                  >Применить</button>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div style={{ background: '#fff', border: '1px dashed #e9ecef', borderRadius: 12, padding: 24, color: '#666' }}>
              У вас пока нет заказов.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
