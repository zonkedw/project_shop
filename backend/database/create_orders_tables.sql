-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled')),
    total_price DECIMAL(10,2) NOT NULL,
    total_items INTEGER NOT NULL,
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('courier', 'pickup')),
    delivery_price DECIMAL(10,2) DEFAULT 0,
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_postal_code VARCHAR(10),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'cash')),
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100),
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров в заказе
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в таблице orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных (опционально)
-- INSERT INTO orders (user_id, order_number, total_price, total_items, delivery_method, payment_method, customer_first_name, customer_email, customer_phone)
-- VALUES (1, 'ORD-TEST-001', 1250.50, 3, 'courier', 'card', 'Тест', 'test@example.com', '+7 999 123 45 67');

COMMENT ON TABLE orders IS 'Таблица заказов';
COMMENT ON TABLE order_items IS 'Таблица товаров в заказах';
COMMENT ON COLUMN orders.status IS 'Статус заказа: pending, confirmed, preparing, delivering, completed, cancelled';
COMMENT ON COLUMN orders.delivery_method IS 'Способ доставки: courier, pickup';
COMMENT ON COLUMN orders.payment_method IS 'Способ оплаты: card, cash';
