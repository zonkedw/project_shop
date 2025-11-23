const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

/**
 * POST /api/ai/chat
 * Body: { message: string }
 * Returns: { reply: string }
 * Simple rule-based assistant using user profile and today's diary.
 */
router.post('/chat', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { message = '' } = req.body || {};

    const userMessage = String(message).slice(0, 2000); // ограничим ввод

    // Load profile
    const profileRes = await query(
      `SELECT daily_calories_target, protein_target_g, carbs_target_g, fats_target_g,
              current_weight_kg, height_cm, goal, activity_level
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    const p = profileRes.rows[0] || {};

    // Load today's totals
    const today = new Date().toISOString().split('T')[0];
    const mealsRes = await query(
      `SELECT total_calories, total_protein, total_carbs, total_fats
       FROM meals WHERE user_id = $1 AND meal_date = $2`,
      [userId, today]
    );

    const totals = mealsRes.rows.reduce((acc, r) => ({
      calories: acc.calories + (Number(r.total_calories) || 0),
      protein: acc.protein + (Number(r.total_protein) || 0),
      carbs: acc.carbs + (Number(r.total_carbs) || 0),
      fats: acc.fats + (Number(r.total_fats) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

/**
 * POST /api/ai/recommendations/mealplan/apply
 * Body: { plan: { date, plan: [ { title, items:[{ name, grams, calories }], total_calories } ] }, date?: string }
 * Применяет рацион: создаёт продукты (если нет) и добавляет приёмы пищи на дату.
 */
router.post('/recommendations/mealplan/apply', async (req, res) => {
  const client = await query('BEGIN').catch(() => null) && (await require('../config/database').getClient());
  // Надежнее явно получить клиент
  const db = await require('../config/database').getClient();
  try {
    await db.query('BEGIN');
    const userId = req.user.user_id;
    const bodyPlan = req.body?.plan || {};
    const date = (req.body?.date || bodyPlan.date || new Date().toISOString().split('T')[0]);
    const meals = Array.isArray(bodyPlan.plan) ? bodyPlan.plan : [];

    const titleToType = (title='') => {
      const t = title.toLowerCase();
      if (t.includes('завтрак')) return 'breakfast';
      if (t.includes('обед')) return 'lunch';
      if (t.includes('ужин')) return 'dinner';
      return 'snack';
    };

    for (const meal of meals) {
      const mealType = titleToType(meal.title || '');
      const insMeal = await db.query(
        `INSERT INTO meals (user_id, meal_date, meal_type, notes) VALUES ($1,$2,$3,$4) RETURNING meal_id` ,
        [userId, date, mealType, 'added_by_ai']
      );
      const mealId = insMeal.rows[0].meal_id;

      for (const it of (meal.items || [])) {
        const name = (it.name || '').trim();
        if (!name) continue;
        // поиск продукта по имени (приближенно)
        let prod = await db.query('SELECT product_id, calories_per_100, protein_per_100, carbs_per_100, fats_per_100 FROM products WHERE LOWER(name)=LOWER($1) LIMIT 1',[name]);
        let productId;
        if (prod.rows.length === 0) {
          const grams = Number(it.grams)||100;
          const kcal = Number(it.calories)||Math.round(grams*1.5);
          const per100 = Math.max(0, Math.round(kcal*100/Math.max(1,grams)));
          const insert = await db.query(
            `INSERT INTO products (name, calories_per_100, protein_per_100, carbs_per_100, fats_per_100, category, is_verified)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING product_id`,
            [name, per100, 0, 0, 0, 'ai', false]
          );
          productId = insert.rows[0].product_id;
        } else {
          productId = prod.rows[0].product_id;
        }

        const qty = Number(it.grams)||100;
        // пересчёт нутриентов будет выполнен триггером из /nutrition/meals логики — здесь повторим как в nutrition.js
        const p = await db.query('SELECT calories_per_100, protein_per_100, carbs_per_100, fats_per_100 FROM products WHERE product_id=$1',[productId]);
        const pr = p.rows[0]||{calories_per_100:0,protein_per_100:0,carbs_per_100:0,fats_per_100:0};
        const mult = qty/100;
        await db.query(
          `INSERT INTO meal_items (meal_id, product_id, quantity_g, calories, protein, carbs, fats)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [mealId, productId, qty, pr.calories_per_100*mult, pr.protein_per_100*mult, pr.carbs_per_100*mult, pr.fats_per_100*mult]
        );
      }

      // обновить итоги
      const sum = await db.query(
        `SELECT COALESCE(SUM(calories),0) cal, COALESCE(SUM(protein),0) pr, COALESCE(SUM(carbs),0) cb, COALESCE(SUM(fats),0) ft FROM meal_items WHERE meal_id=$1`,
        [mealId]
      );
      await db.query(
        `UPDATE meals SET total_calories=$1,total_protein=$2,total_carbs=$3,total_fats=$4 WHERE meal_id=$5`,
        [sum.rows[0].cal, sum.rows[0].pr, sum.rows[0].cb, sum.rows[0].ft, mealId]
      );
    }

    await db.query('COMMIT');
    res.json({ message: 'Рацион добавлен в дневник', date, meals_added: meals.length });
  } catch (err) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    console.error('AI apply mealplan error:', err);
    res.status(500).json({ error: 'Ошибка добавления рациона в дневник' });
  } finally {
    db.release();
  }
});

    // Generate simple guidance (локальный baseline)
    const lines = [];
    lines.push('Привет! Вот быстрый разбор на сегодня:');
    if (p.daily_calories_target) {
      const remain = Math.round(p.daily_calories_target - totals.calories);
      lines.push(`• Калории: ${Math.round(totals.calories)} / ${p.daily_calories_target} (остаток ${remain > 0 ? remain : 0}).`);
    }
    if (p.protein_target_g) {
      const pr = Math.round(totals.protein);
      const diff = Math.round(p.protein_target_g - pr);
      lines.push(`• Белок: ${pr} / ${p.protein_target_g} г (осталось ${diff > 0 ? diff : 0} г).`);
      if (diff > 0) lines.push('  Совет: добавьте источник белка (курица, творог, яйца, протеин).');
    }
    if (p.carbs_target_g) {
      const cb = Math.round(totals.carbs);
      const diff = Math.round(p.carbs_target_g - cb);
      if (diff < -30) lines.push('  Внимание: углеводов заметно больше цели — уменьшите сладкое/мучное к вечеру.');
    }
    if (p.fats_target_g) {
      const ft = Math.round(totals.fats);
      const diff = Math.round(p.fats_target_g - ft);
      if (diff < -20) lines.push('  Жиры выше цели — контролируйте масла/орехи/сыр.');
    }

    // Goal-based tip
    if (p.goal === 'lose_weight') lines.push('Цель похудение: держите дефицит ~500 ккал, шаги 8–10к и 2–3 силовые в неделю.');
    if (p.goal === 'gain_weight' || p.goal === 'gain_muscle') lines.push('Цель набор: профицит ~300 ккал, белок 1.8–2.2 г/кг, прогрессия весов.');

    if (userMessage.trim()) {
      lines.push('Ваш вопрос учтён. На данном MVP я даю общие подсказки по текущим данным.');
    }

    const baseline = lines.join('\n');

    // Если подключен внешний AI, попробуем обогатить ответ
    const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
    if (AI_API_URL && AI_API_KEY) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        const payload = {
          model: AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Ты фитнес-ассистент. Дай краткие и практичные рекомендации, без медицины.' },
            { role: 'user', content: `Контекст профиля: ${JSON.stringify(p)}\nИтоги сегодня: ${JSON.stringify(totals)}\nВопрос: ${userMessage || 'Сформируй краткий план на сегодня.'}` },
          ],
          temperature: 0.6,
          max_tokens: 400,
        };
        const resp = await fetch(AI_API_URL.replace(/\/$/, '') + '/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_API_KEY}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (resp.ok) {
          const data = await resp.json();
          const aiText = data.choices?.[0]?.message?.content?.trim();
          if (aiText) return res.json({ reply: aiText, baseline });
        }
      } catch (e) {
        // тихо фолбэкаемся на baseline
      }
    }

    res.json({ reply: baseline });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Ошибка AI‑ассистента' });
  }
});

module.exports = router;
/**
 * POST /api/ai/recommendations/mealplan
 * Body: { meals?: number }
 * Returns: { date, target_calories, target_macros, plan: [ { title, items: [ { name, grams, calories } ], total_calories } ] }
 */
router.post('/recommendations/mealplan', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const mealsCount = Math.min(Math.max(parseInt(req.body?.meals || 4, 10), 3), 6);

    // Load targets from profile
    const profileRes = await query(
      `SELECT daily_calories_target, protein_target_g, carbs_target_g, fats_target_g
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    const p = profileRes.rows[0] || {};
    const targetKcal = p.daily_calories_target || 2200;
    const date = new Date().toISOString().split('T')[0];

    const basePlan = () => {
      // Simple split of calories across meals, generic items
      const perMeal = Math.round(targetKcal / mealsCount);
      const titles = ['Завтрак', 'Обед', 'Ужин', 'Перекус', 'Перекус 2', 'Перекус 3'];
      const demoItems = [
        { name: 'Овсянка', grams: 80, calories: 300 },
        { name: 'Куриная грудка', grams: 150, calories: 240 },
        { name: 'Рис', grams: 150, calories: 180 },
        { name: 'Овощи', grams: 200, calories: 60 },
        { name: 'Творог', grams: 200, calories: 220 },
      ];
      const plan = Array.from({ length: mealsCount }).map((_, i) => ({
        title: titles[i] || `Приём ${i + 1}`,
        items: [demoItems[i % demoItems.length]],
        total_calories: perMeal,
      }));
      return plan;
    };

    // Try external AI for detailed structured meal plan
    const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
    if (AI_API_URL && AI_API_KEY) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        const sys = 'Ты нутриционный ассистент. Верни ТОЛЬКО JSON без текста с полями: { date, target_calories, target_macros: {protein,carbs,fats}, plan: [ { title, items: [ { name, grams, calories } ], total_calories } ] }';
        const usr = `Составь рацион на ${mealsCount} приёмов на ${targetKcal} ккал. Цели: ${JSON.stringify({ protein: p.protein_target_g, carbs: p.carbs_target_g, fats: p.fats_target_g })}. Локальный рынок РФ, простые продукты.`;
        const payload = {
          model: AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: usr },
          ],
          temperature: 0.4,
          max_tokens: 700,
          response_format: { type: 'json_object' },
        };
        const resp = await fetch(AI_API_URL.replace(/\/$/, '') + '/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          try {
            const parsed = JSON.parse(text);
            return res.json(parsed);
          } catch (_) {}
        }
      } catch (_) {
        // fall back below
      }
    }

    // Baseline rule-based plan
    const plan = basePlan();
    return res.json({
      date,
      target_calories: targetKcal,
      target_macros: { protein: p.protein_target_g, carbs: p.carbs_target_g, fats: p.fats_target_g },
      plan,
    });
  } catch (err) {
    console.error('AI mealplan error:', err);
    res.status(500).json({ error: 'Ошибка генерации рациона' });
  }
});

/**
 * POST /api/ai/recommendations/workout
 * Body: { location?: 'home'|'gym', duration_min?: number }
 * Returns: { date, title, sets: [ { exercise: { name, muscle_group }, set_number, reps, weight_kg } ] }
 */
router.post('/recommendations/workout', async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const { location = 'gym', duration_min = 45 } = req.body || {};

    const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
    if (AI_API_URL && AI_API_KEY) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        const sys = 'Ты фитнес-тренер. Верни ТОЛЬКО JSON: { date, title, sets:[{ exercise:{ name, muscle_group }, set_number, reps, weight_kg }] }';
        const usr = `Составь тренировку на ${duration_min} мин для ${location}. Дай 5-8 рабочих подходов.`;

        const payload = {
          model: AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: usr },
          ],
          temperature: 0.5,
          max_tokens: 700,
          response_format: { type: 'json_object' },
        };

        const resp = await fetch(AI_API_URL.replace(/\/$/, '') + '/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          const parsed = JSON.parse(text);
          parsed.date = parsed.date || date;
          return res.json(parsed);
        }
      } catch (_) { /* fallback ниже */ }
    }

    // Fallback
    const sets = [
      { exercise: { name: 'Жим гантелей лёжа', muscle_group: 'chest' }, set_number: 1, reps: 10, weight_kg: 20 },
      { exercise: { name: 'Тяга верхнего блока', muscle_group: 'back' }, set_number: 2, reps: 12, weight_kg: 35 },
      { exercise: { name: 'Приседания с гантелями', muscle_group: 'legs' }, set_number: 3, reps: 12, weight_kg: 24 },
      { exercise: { name: 'Жим гантелей сидя', muscle_group: 'shoulders' }, set_number: 4, reps: 12, weight_kg: 16 },
      { exercise: { name: 'Скручивания', muscle_group: 'abs' }, set_number: 5, reps: 15, weight_kg: 0 },
    ];
    res.json({ date, title: 'Силовая (база)', sets });
  } catch (err) {
    console.error('AI workout error:', err);
    res.status(500).json({ error: 'Ошибка генерации тренировки' });
  }
});

/**
 * POST /api/ai/recommendations/workout/apply
 * Body: { plan: { date, title, sets: [...] } }
 * Создаёт тренировочную сессию и подходы; создаёт упражнение при необходимости.
 */
router.post('/recommendations/workout/apply', async (req, res) => {
  const db = await require('../config/database').getClient();
  try {
    await db.query('BEGIN');
    const userId = req.user.user_id;
    const plan = req.body?.plan || {};
    const date = plan.date || new Date().toISOString().split('T')[0];
    const sets = Array.isArray(plan.sets) ? plan.sets : [];

    const sess = await db.query(
      `INSERT INTO workout_sessions (user_id, session_date, start_time, notes)
       VALUES ($1,$2,$3,$4) RETURNING session_id`,
      [userId, date, new Date(), plan.title || 'AI тренировка']
    );
    const sessionId = sess.rows[0].session_id;

    let setNum = 1;
    for (const s of sets) {
      const exName = (s.exercise?.name || '').trim();
      if (!exName) continue;
      let ex = await db.query('SELECT exercise_id FROM exercises WHERE LOWER(name)=LOWER($1) LIMIT 1',[exName]);
      let exId;
      if (ex.rows.length === 0) {
        const insert = await db.query(
          `INSERT INTO exercises (name, muscle_group, equipment, difficulty, created_by)
           VALUES ($1,$2,$3,$4,$5) RETURNING exercise_id`,
          [exName, s.exercise?.muscle_group || null, null, null, userId]
        );
        exId = insert.rows[0].exercise_id;
      } else exId = ex.rows[0].exercise_id;

      await db.query(
        `INSERT INTO workout_sets (session_id, exercise_id, set_number, reps, weight_kg)
         VALUES ($1,$2,$3,$4,$5)`,
        [sessionId, exId, s.set_number || setNum, s.reps || null, s.weight_kg || null]
      );
      setNum++;
    }

    const estimatedMinutes = Math.max(15, Math.min(120, Number(plan.duration_min) || (sets.length * 3) || 45));
    await db.query(
      `UPDATE workout_sessions SET end_time=$1, duration_min=$2, total_volume_kg=COALESCE(total_volume_kg,0), completed=true WHERE session_id=$3`,
      [new Date(), estimatedMinutes, sessionId]
    );

    await db.query('COMMIT');
    res.json({ message: 'Тренировка добавлена', session_id: sessionId, date });
  } catch (err) {
    try { await db.query('ROLLBACK'); } catch(_) {}
    console.error('AI apply workout error:', err);
    res.status(500).json({ error: 'Ошибка добавления тренировки' });
  } finally {
    db.release();
  }
});