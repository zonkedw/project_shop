const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Получить все заказы пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.product_id,
            'name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});

// Отмена заказа пользователем
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const orderRes = await pool.query('SELECT id, user_id, status FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Заказ не найден' });
    const order = orderRes.rows[0];
    if (order.user_id !== userId) return res.status(403).json({ error: 'Нет доступа к заказу' });
    if (!['pending','confirmed'].includes(order.status)) return res.status(400).json({ error: 'Нельзя отменить заказ в текущем статусе' });
    const upd = await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', ['cancelled', id]);
    res.json({ success: true, order: upd.rows[0] });
  } catch (error) {
    console.error('Ошибка отмены заказа:', error);
    res.status(500).json({ error: 'Ошибка отмены заказа' });
  }
});

// Применение скидочного кода
router.post('/:id/discount', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Не указан скидочный код' });

    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Заказ не найден' });
    const order = orderRes.rows[0];

    const isOwner = order.user_id === req.user.id;
    const isAdmin = !!req.user.is_admin;
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Нет доступа к заказу' });
    if (['completed','cancelled'].includes(order.status)) return res.status(400).json({ error: 'Нельзя применить скидку к этому заказу' });

    const itemsSumRes = await pool.query('SELECT COALESCE(SUM(price * quantity),0) AS sum FROM order_items WHERE order_id = $1', [id]);
    const itemsSum = Number(itemsSumRes.rows[0].sum || 0);
    const baseTotal = itemsSum + Number(order.delivery_price || 0);

    const codes = { 'SALE5': 5, 'SALE10': 10, 'SALE15': 15 };
    let discountAmount = 0;
    if (codes[code]) {
      discountAmount = Math.round((baseTotal * codes[code] / 100) * 100) / 100;
    } else if (code === 'FREESHIP') {
      discountAmount = Number(order.delivery_price || 0);
    } else {
      return res.status(400).json({ error: 'Неизвестный промокод' });
    }

    const newTotal = Math.max(0, baseTotal - discountAmount);
    const upd = await pool.query(
      'UPDATE orders SET discount_code = $1, discount_amount = $2, total_price = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [code, discountAmount, newTotal, id]
    );
    res.json({ success: true, order: upd.rows[0] });
  } catch (error) {
    console.error('Ошибка применения скидки:', error);
    res.status(500).json({ error: 'Ошибка применения скидки' });
  }
});

// Все заказы (админ)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, q, page = 1, pageSize = 20 } = req.query;
    const params = [];
    let where = '1=1';
    if (status) { params.push(status); where += ` AND o.status = $${params.length}`; }
    if (q) { params.push(`%${q}%`); where += ` AND o.order_number ILIKE $${params.length}`; }
    const limit = Math.min(parseInt(pageSize) || 20, 100);
    const offset = ((parseInt(page) || 1) - 1) * limit;
    params.push(limit);
    params.push(offset);

    const result = await pool.query(`
      SELECT o.*, 
             json_agg(json_build_object('id', oi.product_id, 'name', oi.product_name, 'price', oi.price, 'quantity', oi.quantity)) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${where}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения всех заказов:', error);
    res.status(500).json({ error: 'Ошибка получения всех заказов' });
  }
});

// Удалить заказ (админ)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT id FROM orders WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Заказ не найден' });
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления заказа:', error);
    res.status(500).json({ error: 'Ошибка удаления заказа' });
  }
});

// Получить заказ по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.product_id,
            'name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    res.status(500).json({ error: 'Ошибка получения заказа' });
  }
});

// Создать новый заказ
router.post('/', authenticateToken, async (req, res) => {
  console.log('=== СОЗДАНИЕ ЗАКАЗА ===');
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      items,
      customer,
      delivery,
      payment,
      totalPrice,
      totalItems,
      comment
    } = req.body;

    // Валидация
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    if (!customer || !customer.firstName || !customer.email || !customer.phone) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }

    if (delivery.method === 'courier' && (!delivery.address || !delivery.city)) {
      return res.status(400).json({ error: 'Для курьерской доставки необходим адрес' });
    }

    // Вычисляем стоимость доставки
    const deliveryPrice = delivery.method === 'courier' ? 300 : 0;
    const subtotal = totalPrice;
    const finalPrice = subtotal + deliveryPrice;

    // Создаем заказ
    const orderResult = await client.query(`
      INSERT INTO orders (
        user_id,
        order_number,
        status,
        subtotal_price,
        total_price,
        total_items,
        delivery_method,
        delivery_price,
        delivery_address,
        delivery_city,
        delivery_postal_code,
        payment_method,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        comment,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *
    `, [
      req.user.id,
      `ORD-${Date.now()}`, // Генерируем номер заказа
      'pending',
      subtotal,
      finalPrice,
      totalItems,
      delivery.method,
      deliveryPrice,
      delivery.address || null,
      delivery.city || null,
      delivery.postalCode || null,
      payment.method,
      customer.firstName,
      customer.lastName || '',
      customer.email,
      customer.phone,
      comment || null
    ]);

    const order = orderResult.rows[0];

    // Добавляем товары заказа
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          price,
          quantity
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        order.id,
        item.id,
        item.name,
        item.price,
        item.quantity
      ]);
    }

    await client.query('COMMIT');

    console.log('SUCCESS: Заказ создан:', order.id);

    // Возвращаем созданный заказ с товарами
    const fullOrderResult = await pool.query(`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.product_id,
            'name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [order.id]);

    res.status(201).json({
      success: true,
      order: fullOrderResult.rows[0],
      message: 'Заказ успешно создан'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ERROR: Ошибка создания заказа:', error);
    res.status(500).json({ 
      error: 'Ошибка создания заказа',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Обновить статус заказа (только для администраторов)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Неверный статус заказа' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json({
      success: true,
      order: result.rows[0],
      message: 'Статус заказа обновлен'
    });
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    res.status(500).json({ error: 'Ошибка обновления статуса заказа' });
  }
});

module.exports = router;
