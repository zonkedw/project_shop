process.env.NODE_ENV = 'test';

const request = require('supertest');

// Мокаем auth, чтобы не требовать реальный JWT
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, _res, next) => {
    req.user = { user_id: 'user-1' };
    next();
  },
}));

// Мокаем БД
const mockQuery = jest.fn();
const mockClientQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => {
  return {
    query: (...args) => mockQuery(...args),
    getClient: async () => ({
      query: (...args) => mockClientQuery(...args),
      release: mockRelease,
    }),
  };
});

// Мокаем fetch, чтобы форсировать fallback
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    json: async () => ({}),
  })
);

const app = require('../server');

const withAuth = (agent) => agent.set('Authorization', 'Bearer test');

beforeEach(() => {
  mockQuery.mockReset();
  mockClientQuery.mockReset();
  mockRelease.mockReset();
  global.fetch.mockClear();
});

// простые ответы для query
const defaultQueryResponder = (text) => {
  if (text.includes('FROM user_profiles')) {
    return { rows: [{ daily_calories_target: 2000, protein_target_g: 120, carbs_target_g: 200, fats_target_g: 60 }] };
  }
  if (text.includes('FROM meals')) {
    return { rows: [] };
  }
  if (text.startsWith('INSERT INTO meals')) {
    return { rows: [{ meal_id: 'meal-1' }] };
  }
  if (text.startsWith('INSERT INTO workout_sessions')) {
    return { rows: [{ session_id: 'sess-1' }] };
  }
  if (text.includes('SELECT exercise_id')) {
    return { rows: [] };
  }
  if (text.startsWith('INSERT INTO exercises')) {
    return { rows: [{ exercise_id: 'ex-1' }] };
  }
  if (text.includes('SELECT product_id')) {
    return { rows: [] };
  }
  if (text.startsWith('INSERT INTO products')) {
    return { rows: [{ product_id: 'prod-1' }] };
  }
  if (text.includes('SELECT calories_per_100')) {
    return { rows: [{ calories_per_100: 100, protein_per_100: 10, carbs_per_100: 10, fats_per_100: 5 }] };
  }
  if (text.includes('SELECT COALESCE(SUM')) {
    return { rows: [{ cal: 100, pr: 10, cb: 10, ft: 5 }] };
  }
  return { rows: [] };
};

mockQuery.mockImplementation((text) => defaultQueryResponder(text));
mockClientQuery.mockImplementation((text) => defaultQueryResponder(text));

describe('AI routes', () => {
  test('chat returns baseline reply', async () => {
    const res = await withAuth(request(app).post('/api/ai/chat')).send({ message: 'Привет' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBeTruthy();
  });

  test('mealplan returns fallback plan', async () => {
    const res = await withAuth(request(app).post('/api/ai/recommendations/mealplan')).send({ meals: 4 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.plan)).toBe(true);
    expect(res.body.plan.length).toBeGreaterThan(0);
  });

  test('mealplan apply writes meals', async () => {
    const res = await withAuth(request(app).post('/api/ai/recommendations/mealplan/apply')).send({
      plan: {
        date: '2025-12-10',
        plan: [
          {
            title: 'Завтрак',
            items: [{ name: 'Яйцо', grams: 50, calories: 70 }],
          },
        ],
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Рацион/);
  });

  test('workout apply writes session', async () => {
    const res = await withAuth(request(app).post('/api/ai/recommendations/workout/apply')).send({
      plan: {
        date: '2025-12-10',
        title: 'Тренировка',
        sets: [
          {
            set_number: 1,
            reps: 10,
            weight_kg: 20,
            exercise: { name: 'Жим', muscle_group: 'chest' },
          },
        ],
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.session_id).toBeTruthy();
  });
});

