const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      
      try {
        const errorData = await res.text();
        if (errorData) {
          try {
            const parsed = JSON.parse(errorData);
            errorMessage = parsed.error || parsed.message || errorMessage;
          } catch {
            errorMessage = errorData || errorMessage;
          }
        }
      } catch {
        // Если не удается прочитать тело ответа, используем статус
      }
      
      console.error('API Error:', {
        url: `${BASE_URL}/api${path}`,
        status: res.status,
        statusText: res.statusText,
        message: errorMessage,
        headers: Object.fromEntries(res.headers.entries())
      });
      
      throw new Error(errorMessage);
    }
    
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Не удается подключиться к серверу. Проверьте, что backend запущен.');
    }
    throw error;
  }
}

// Products
export async function getProducts() {
  // GET /api/products -> [{ id, name, price, image, rating, ... }]
  return request('/products');
}

export async function getProductsGrouped() {
  // GET /api/products/categories/grouped -> { sales: [], new: [], popular: [] }
  return request('/products/categories/grouped');
}

// Auth
export async function login({ email, password }) {
  // POST /auth/login -> { token, user }
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register({ name, email, password }) {
  // POST /auth/register -> { token, user }
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getMe(token) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// News
export async function getNews() {
  // GET /news -> [{ id, title, content, createdAt }]
  return request('/news');
}

// Тестовая функция для проверки JSON парсинга
export async function testJSON() {
  const res = await fetch(`${BASE_URL}/test-json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      title: 'Тестовый заголовок', 
      content: 'Тестовое содержание',
      test: true
    }),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}

// Тестовая функция для диагностики
export async function testNewsAPI(token) {
  return request('/news/test', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      title: 'Тестовый заголовок', 
      content: 'Тестовое содержание',
      test: true
    }),
  });
}

// НОВАЯ ПРОСТАЯ ВЕРСИЯ addNews
export async function addNews({ title, content }, token) {
  console.log('=== CLIENT: Отправка новости ===');
  console.log('Данные:', { title, content });
  console.log('Токен:', token ? 'Есть' : 'Нет');
  
  if (!token) {
    throw new Error('Нет токена авторизации');
  }
  
  if (!title || !content) {
    throw new Error('Заполните все поля');
  }

  const newsData = {
    title: title.trim(),
    content: content.trim()
  };

  console.log('Отправляем:', newsData);

  try {
    const response = await fetch(`${BASE_URL}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newsData)
    });

    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(data);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = data || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('CLIENT ERROR:', error);
    throw error;
  }
}

// Orders
export async function createOrder(orderData, token) {
  console.log('=== CLIENT: Создание заказа ===');
  console.log('Данные заказа:', orderData);
  
  if (!token) {
    throw new Error('Необходима авторизация для создания заказа');
  }

  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(data);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = data || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('ORDER ERROR:', error);
    throw error;
  }
}

export async function getOrders(token) {
  return request('/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getOrder(orderId, token) {
  return request(`/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
