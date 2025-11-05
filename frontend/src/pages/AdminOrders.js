import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllOrdersAdmin, updateOrderStatus, deleteOrderAdmin } from '../services/api';
import { formatPrice } from '../utils/priceUtils';

const statuses = ['pending','confirmed','preparing','delivering','completed','cancelled'];
const statusLabel = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждён',
  preparing: 'Готовится',
  delivering: 'Доставка',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

const AdminOrders = () => {
  const { isAuthenticated, isAdmin, token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    if (!isAuthenticated || !isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const data = await getAllOrdersAdmin({ status: status || undefined, q: q || undefined }, token);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isAuthenticated, isAdmin, token, status]);

  if (!isAuthenticated) return <div className="container" style={{ padding: '24px 0' }}>Требуется авторизация</div>;
  if (!isAdmin) return <div className="container" style={{ padding: '24px 0' }}>Недостаточно прав</div>;

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <h1 className="section-title" style={{ marginBottom: 12 }}>Заказы — админ</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: '8px 10px' }}>
          <option value="">Все статусы</option>
          {statuses.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Поиск по номеру заказа" style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: '8px 10px', flex: 1 }} />
        <button className="btn" onClick={load}>Обновить</button>
      </div>

      {error && <div style={{ background: '#ffe9e2', color: '#b33', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {list.map((o) => (
            <div key={o.id} style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Заказ {o.order_number || `#${o.id}`}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{statusLabel[o.status] || o.status} • {new Date(o.created_at || o.createdAt).toLocaleString('ru-RU')}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>Покупатель: {o.customer_first_name} {o.customer_last_name || ''} • {o.customer_phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {o.discount_amount > 0 && (
                    <div style={{ color: '#28a745', fontSize: 12 }}>Скидка: −{formatPrice(o.discount_amount)} ₽</div>
                  )}
                  <div style={{ fontWeight: 700 }}>{formatPrice(o.total_price)} ₽</div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
                {(o.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: 14 }}>
                    <div>{it.name} × {it.quantity}</div>
                    <div>{formatPrice(it.price * it.quantity)} ₽</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={o.status}
                  onChange={async (e)=>{
                    try {
                      setBusyId(o.id);
                      await updateOrderStatus(o.id, e.target.value, token);
                      await load();
                    } catch (err) { setError(err.message); } finally { setBusyId(null); }
                  }}
                  disabled={busyId === o.id}
                  style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: '6px 8px' }}
                >
                  {statuses.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>

                <button
                  className="btn"
                  style={{ border: '1px solid #dc3545', color: '#dc3545', background: '#fff', marginLeft: 'auto' }}
                  disabled={busyId === o.id}
                  onClick={async ()=>{
                    if (!window.confirm('Удалить заказ?')) return;
                    try {
                      setBusyId(o.id);
                      await deleteOrderAdmin(o.id, token);
                      await load();
                    } catch (err) { setError(err.message); } finally { setBusyId(null); }
                  }}
                >Удалить</button>
              </div>
            </div>
          ))}

          {list.length === 0 && (
            <div style={{ background: '#fff', border: '1px dashed #e9ecef', borderRadius: 12, padding: 24, color: '#666' }}>
              Заказы не найдены.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
