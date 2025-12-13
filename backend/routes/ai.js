const express = require('express');
const rateLimit = require('express-rate-limit');
const { celebrate } = require('celebrate');
const { query, getClient } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const {
  chatSchema,
  mealplanSchema,
  mealplanApplySchema,
  workoutSchema,
  workoutApplySchema,
} = require('../validators/aiValidators');
const { logUserMessage, logAssistantMessage, extractTokensFromResponse } = require('../services/aiLogger');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.user_id || req.ip,
});

router.use(authMiddleware, aiLimiter);

const safeJson = (data) => {
  try {
    return JSON.stringify(data);
  } catch (_) {
    return '{}';
  }
};

// Определение, связан ли вопрос с фитнесом
const isFitnessRelated = (message) => {
  if (!message || !message.trim()) return false;
  const fitnessKeywords = [
    'калории', 'ккал', 'калорий', 'тренировка', 'тренировок', 'упражнение', 'упражнений',
    'питание', 'питания', 'диета', 'диеты', 'белок', 'белков', 'протеин', 'жир', 'жиров',
    'углевод', 'углеводов', 'вес', 'веса', 'похудение', 'похудеть', 'набор', 'набрать',
    'мышцы', 'мышц', 'фитнес', 'спорт', 'спортом', 'рацион', 'рациона', 'приём пищи',
    'БЖУ', 'макро', 'макросы', 'жим', 'присед', 'становая', 'подтягивание', 'отжимание',
    'кардио', 'силовая', 'выносливость', 'гибкость', 'растяжка', 'разминка', 'заминка',
    'протеин', 'креатин', 'витамины', 'минералы', 'вода', 'гидратация', 'восстановление',
    'перетренированность', 'периодизация', 'суперсет', 'дропсет', 'отказ', 'подход',
    'повтор', 'повторов', 'сет', 'сетов', 'разминка', 'заминка', 'восстановление'
  ];
  const lowerMessage = message.toLowerCase();
  return fitnessKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
};

const callExternalAI = async ({ system, user, temperature = 0.5, maxTokens = 400, timeoutMs = 12000, responseFormat = null }) => {
  const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
  if (!AI_API_URL || !AI_API_KEY) return { text: null, tokens: null };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const payload = {
      model: AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    };
    if (responseFormat) {
      payload.response_format = responseFormat;
    }
    const resp = await fetch(AI_API_URL.replace(/\/$/, '') + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!resp.ok) return { text: null, tokens: null };
    const data = await resp.json();
    const tokens = extractTokensFromResponse(data);
    return {
      text: data.choices?.[0]?.message?.content?.trim() || null,
      tokens,
    };
  } catch (_) {
    return { text: null, tokens: null };
  } finally {
    clearTimeout(timer);
  }
};

// POST /api/ai/chat
router.post('/chat', chatSchema, async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { message } = req.body;
    const userMessage = String(message || '').slice(0, 2000);

    // Логируем запрос пользователя
    const profileRes = await query(
      `SELECT daily_calories_target, protein_target_g, carbs_target_g, fats_target_g,
              current_weight_kg, height_cm, goal, activity_level
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    const p = profileRes.rows[0] || {};

    const today = new Date().toISOString().split('T')[0];
    const mealsRes = await query(
      `SELECT total_calories, total_protein, total_carbs, total_fats
       FROM meals WHERE user_id = $1 AND meal_date = $2`,
      [userId, today]
    );
    const totals = mealsRes.rows.reduce(
      (acc, r) => ({
        calories: acc.calories + (Number(r.total_calories) || 0),
        protein: acc.protein + (Number(r.total_protein) || 0),
        carbs: acc.carbs + (Number(r.total_carbs) || 0),
        fats: acc.fats + (Number(r.total_fats) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const context = { profile: p, totals, date: today };
    await logUserMessage(userId, userMessage, context);

    // Определяем, связан ли вопрос с фитнесом для baseline
    const isFitnessQuestion = isFitnessRelated(userMessage);

    // Определяем тип запроса (до использования в baseline)
    const modificationKeywords = ['переделай', 'измени', 'изменить', 'другой', 'другое', 'меньше', 'больше', 'уменьши', 'увеличь', 'добавь', 'убери', 'замени'];
    const isModificationRequest = modificationKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    // Улучшенные baseline ответы - более контекстные и разнообразные
    let baseline = '';
    if (!userMessage.trim()) {
      // Приветственное сообщение
      const greetings = [
        'Привет! Я AI-ассистент FitPilot. Могу помочь вам с вопросами о фитнесе, питании, тренировках, а также ответить на любые другие вопросы. Что вас интересует?',
        'Здравствуйте! Я ваш персональный AI-помощник FitPilot. Готов помочь с фитнесом, питанием, тренировками и многим другим. Чем могу помочь?',
        'Приветствую! Я FitPilot - ваш умный помощник в вопросах здоровья и фитнеса. Также могу ответить на любые другие ваши вопросы. Что вас интересует?'
      ];
      baseline = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (isFitnessQuestion && userMessage.trim()) {
      // Умные baseline ответы на основе контекста и ключевых слов
      const lowerMsg = userMessage.toLowerCase();
      const lines = [];
      
      // Обработка запросов о дефиците калорий
      if (lowerMsg.includes('дефицит') || lowerMsg.includes('меньше калорий') || lowerMsg.includes('похудеть')) {
        const targetCal = Number(p.daily_calories_target) || 2000;
        const deficitCal = Math.max(300, Math.min(700, Math.round(targetCal * 0.2))); // Дефицит 15-25%
        const newTarget = Math.max(1200, targetCal - deficitCal); // Минимум 1200 ккал
        const proteinTarget = Math.round(newTarget * 0.25 / 4); // 25% белка
        const carbsTarget = Math.round(newTarget * 0.4 / 4); // 40% углеводов
        const fatsTarget = Math.round(newTarget * 0.35 / 9); // 35% жиров
        
        lines.push(`📊 Рацион на дефиците калорий:`);
        lines.push(`\n🎯 Целевая калорийность: ${newTarget} ккал/день (дефицит ~${deficitCal} ккал)`);
        lines.push(`\n📋 Рекомендуемое распределение БЖУ:`);
        lines.push(`• Белок: ${proteinTarget}г (важно для сохранения мышц)`);
        lines.push(`• Углеводы: ${carbsTarget}г (энергия для тренировок)`);
        lines.push(`• Жиры: ${fatsTarget}г (гормоны и насыщение)`);
        lines.push(`\n🍽️ Примерный план на день:`);
        lines.push(`1. Завтрак (~${Math.round(newTarget * 0.25)} ккал): овсянка 60г + яйца 2шт + овощи`);
        lines.push(`2. Обед (~${Math.round(newTarget * 0.35)} ккал): куриная грудка 150г + гречка 80г + салат`);
        lines.push(`3. Ужин (~${Math.round(newTarget * 0.25)} ккал): рыба 150г + овощи на пару`);
        lines.push(`4. Перекус (~${Math.round(newTarget * 0.15)} ккал): творог 150г или протеиновый коктейль`);
        lines.push(`\n💡 Советы:`);
        lines.push(`• Пейте 2-3 литра воды в день`);
        lines.push(`• Делайте 8-10к шагов ежедневно`);
        lines.push(`• Силовые тренировки 2-3 раза в неделю (сохраняют мышцы)`);
        lines.push(`• Не снижайте калории ниже 1200 ккал`);
      }
      // Обработка запросов о профиците/наборе массы
      else if (lowerMsg.includes('профицит') || lowerMsg.includes('набор') || lowerMsg.includes('набрать')) {
        const targetCal = Number(p.daily_calories_target) || 2500;
        const surplusCal = Math.max(200, Math.min(500, Math.round(targetCal * 0.15))); // Профицит 10-20%
        const newTarget = targetCal + surplusCal;
        const proteinTarget = Math.round(newTarget * 0.3 / 4); // 30% белка
        const carbsTarget = Math.round(newTarget * 0.45 / 4); // 45% углеводов
        const fatsTarget = Math.round(newTarget * 0.25 / 9); // 25% жиров
        
        lines.push(`📊 Рацион для набора массы:`);
        lines.push(`\n🎯 Целевая калорийность: ${newTarget} ккал/день (профицит ~${surplusCal} ккал)`);
        lines.push(`\n📋 Рекомендуемое распределение БЖУ:`);
        lines.push(`• Белок: ${proteinTarget}г (1.8-2.2 г/кг веса)`);
        lines.push(`• Углеводы: ${carbsTarget}г (энергия для роста)`);
        lines.push(`• Жиры: ${fatsTarget}г (гормоны)`);
        lines.push(`\n🍽️ Примерный план на день:`);
        lines.push(`1. Завтрак (~${Math.round(newTarget * 0.25)} ккал): овсянка 100г + яйца 3шт + банан`);
        lines.push(`2. Обед (~${Math.round(newTarget * 0.35)} ккал): говядина 200г + рис 150г + овощи`);
        lines.push(`3. Ужин (~${Math.round(newTarget * 0.25)} ккал): курица 200г + картофель 150г + салат`);
        lines.push(`4. Перекус (~${Math.round(newTarget * 0.15)} ккал): творог 200г + орехи 30г`);
        lines.push(`\n💡 Советы:`);
        lines.push(`• Тренировки 3-4 раза в неделю с прогрессией весов`);
        lines.push(`• Ешьте каждые 3-4 часа`);
        lines.push(`• Пейте протеиновый коктейль после тренировки`);
      }
      // Обработка запросов о тренировках
      else if (lowerMsg.includes('тренировк') || lowerMsg.includes('упражнен')) {
        const workoutTypes = [
          'Силовая тренировка (грудь + трицепс): жим лёжа 4х8-10, отжимания 3х12, разводка гантелей 3х12, французский жим 3х10',
          'Тренировка спины: подтягивания 4х8-10, тяга штанги в наклоне 4х8, тяга верхнего блока 3х10, тяга гантели одной рукой 3х12',
          'Ноги: приседания со штангой 4х8-10, жим ногами 3х12, выпады 3х10 на каждую, румынская тяга 3х10',
          'Плечи: жим штанги стоя 4х8, махи гантелями в стороны 3х12, тяга к подбородку 3х10, разводка в наклоне 3х12'
        ];
        lines.push(`💪 План тренировки:`);
        lines.push(`\n${workoutTypes[Math.floor(Math.random() * workoutTypes.length)]}`);
        lines.push(`\n⏱️ Структура:`);
        lines.push(`• Разминка: 5-10 минут (кардио + суставы)`);
        lines.push(`• Основная часть: 45-60 минут`);
        lines.push(`• Заминка: растяжка 10 минут`);
        lines.push(`\n💡 Рекомендации:`);
        lines.push(`• Отдых между подходами: 60-90 секунд`);
        lines.push(`• Прогрессия: добавляйте вес или повторения каждую неделю`);
        lines.push(`• Восстановление: 48 часов между тренировками одной группы мышц`);
      }
      // Общие фитнес-ответы
      else {
        // Разные варианты начала в зависимости от типа запроса
        if (isModificationRequest) {
          lines.push('Понял, учту ваши пожелания и создам новый вариант.');
        } else {
          const intros = [
            'Анализирую вашу ситуацию:',
            'Вот что у вас на сегодня:',
            'Давайте посмотрим на ваш прогресс:'
          ];
          lines.push(intros[Math.floor(Math.random() * intros.length)]);
        }
        
        if (p.daily_calories_target) {
          const remain = Math.round(p.daily_calories_target - totals.calories);
          const percent = Math.round((totals.calories / p.daily_calories_target) * 100);
          lines.push(`• Калории: ${Math.round(totals.calories)} / ${p.daily_calories_target} (${percent}%, осталось ${remain > 0 ? remain : 0} ккал)`);
        }
        if (p.protein_target_g) {
          const pr = Math.round(totals.protein);
          const diff = Math.round(p.protein_target_g - pr);
          lines.push(`• Белок: ${pr} / ${p.protein_target_g} г (${diff > 0 ? `не хватает ${diff} г` : 'норма'})`);
          if (diff > 0) {
            const tips = [
              '  💡 Совет: добавьте источник белка (курица, творог, яйца, протеин)',
              '  💡 Рекомендация: включите в рацион белковые продукты',
              '  💡 Подсказка: можно добавить протеиновый коктейль или творог'
            ];
            lines.push(tips[Math.floor(Math.random() * tips.length)]);
          }
        }
        if (p.goal === 'lose_weight') {
          const tips = [
            '🎯 Цель похудение: создайте дефицит ~500 ккал, делайте 8–10к шагов, 2–3 силовые в неделю',
            '🎯 Для похудения: дефицит калорий ~500 ккал, активность 8–10к шагов, силовые тренировки 2–3 раза'
          ];
          lines.push(tips[Math.floor(Math.random() * tips.length)]);
        }
        if (p.goal === 'gain_weight' || p.goal === 'gain_muscle') {
          const tips = [
            '🎯 Цель набор массы: профицит ~300 ккал, белок 1.8–2.2 г/кг, прогрессия весов в тренировках',
            '🎯 Для набора: профицит ~300 ккал, высокий белок (1.8–2.2 г/кг), постепенное увеличение нагрузки'
          ];
          lines.push(tips[Math.floor(Math.random() * tips.length)]);
        }
      }
      baseline = lines.join('\n');
    } else if (userMessage.trim()) {
      // Baseline для общих вопросов - более разнообразный
      const responses = [
        'Обрабатываю ваш запрос...',
        'Думаю над ответом...',
        'Анализирую информацию...'
      ];
      baseline = responses[Math.floor(Math.random() * responses.length)];
    }

    // Получаем историю тренировок
    let workouts = { count: 0, last_date: null };
    try {
      const workoutsRes = await query(
        `SELECT COUNT(*) as count, MAX(session_date) as last_date
         FROM workout_sessions WHERE user_id = $1 AND session_date >= CURRENT_DATE - INTERVAL '7 days'`,
        [userId]
      );
      workouts = workoutsRes.rows[0] || { count: 0, last_date: null };
    } catch (err) {
      console.error('Failed to get workouts history:', err.message);
      // Продолжаем с дефолтными значениями
    }

    // Получаем последние сообщения для контекста
    let conversationHistory = [];
    try {
      const recentMessagesRes = await query(
        `SELECT message_type, message_text 
         FROM ai_interactions 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 6`,
        [userId]
      );
      
      // Группируем сообщения по парам (user, assistant)
      const messages = recentMessagesRes.rows.reverse();
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].message_type === 'user' && messages[i + 1].message_type === 'assistant') {
          conversationHistory.push({
            user: messages[i].message_text,
            assistant: messages[i + 1].message_text
          });
        }
      }
      // Берем только последние 3 пары
      conversationHistory = conversationHistory.slice(-3);
    } catch (err) {
      // Если не удалось получить историю, продолжаем без неё
      console.error('Failed to get conversation history:', err.message);
      conversationHistory = [];
    }

    // Универсальный промпт для ответов на любые вопросы
    const systemPrompt = `Ты универсальный AI-ассистент FitPilot - умный, дружелюбный, эрудированный и КРЕАТИВНЫЙ помощник.

ТВОЯ РОЛЬ:
Ты можешь отвечать на АБСОЛЮТНО ЛЮБЫЕ вопросы пользователя. Твоя специализация - фитнес, питание и здоровье, но ты также можешь помочь с:
- Общими вопросами и разговорами
- Образовательными темами
- Техническими вопросами
- Творческими задачами
- И многим другим

КРИТИЧЕСКИ ВАЖНО - РАЗНООБРАЗИЕ ОТВЕТОВ:
- НИКОГДА не повторяй одни и те же фразы или формулировки
- Каждый ответ должен быть УНИКАЛЬНЫМ и ПЕРСОНАЛИЗИРОВАННЫМ
- Меняй стиль ответа в зависимости от контекста
- Используй разные подходы к объяснению
- Будь КРЕАТИВНЫМ и ЖИВЫМ в общении

ПРИ ОТВЕТАХ НА ФИТНЕС-ВОПРОСЫ:
- Анализируй данные пользователя (цели, прогресс, питание, тренировки)
- Дай КОНКРЕТНЫЕ и ПРАКТИЧНЫЕ советы с конкретными цифрами, продуктами, упражнениями
- Учитывай контекст дня (что уже съедено, какие тренировки были)
- Называй конкретные продукты, упражнения, цифры, рекомендации
- Если пользователь просит тренировку - дай конкретный план упражнений
- Если просит рацион - дай конкретные блюда и продукты
- Если пользователь просит ИЗМЕНИТЬ или ПЕРЕДЕЛАТЬ что-то - учти предыдущий контекст и дай НОВОЕ решение

ПРИ ЗАПРОСАХ НА ИЗМЕНЕНИЕ/ПЕРЕДЕЛКУ:
- Внимательно проанализируй, что именно пользователь хочет изменить
- Если просит "меньше калорий" - создай новый рацион с меньшей калорийностью
- Если просит "переделай" - создай ПОЛНОСТЬЮ НОВЫЙ вариант, не повторяй предыдущий
- Учитывай предыдущий контекст, но давай НОВОЕ решение
- Будь конкретным и предложи реальные изменения

ПРИ ОТВЕТАХ НА ОБЩИЕ ВОПРОСЫ:
- Отвечай полно, информативно и полезно
- Используй свои знания для предоставления точной информации
- Если не знаешь ответа - честно скажи об этом
- Предлагай альтернативные решения, если возможно
- Меняй стиль и подход в зависимости от темы

ОБЩИЕ ПРАВИЛА:
- ВСЕГДА давай КОНКРЕТНЫЙ и ПОЛЕЗНЫЙ ответ на вопрос пользователя
- НИКОГДА не используй общие фразы типа "Ваш вопрос учтён" или "На MVP даю общие подсказки"
- НИКОГДА не повторяй одни и те же формулировки
- Отвечай на русском языке, дружелюбно но профессионально
- Будь мотивирующим и поддерживающим
- Если вопрос не связан с фитнесом - всё равно дай полезный ответ
- Будь ЖИВЫМ собеседником, а не роботом с шаблонными ответами

ВАЖНО: Ты универсальный помощник, который может помочь с любыми вопросами, но особенно хорошо разбираешься в фитнесе и здоровье. Твои ответы должны быть РАЗНООБРАЗНЫМИ, КРЕАТИВНЫМИ и ПЕРСОНАЛИЗИРОВАННЫМИ.`;

    // Формируем контекст истории разговора
    let historyContext = '';
    if (conversationHistory.length > 0) {
      try {
        historyContext = '\n\nИСТОРИЯ РАЗГОВОРА (последние сообщения):\n';
        conversationHistory.forEach((msg, idx) => {
          const userMsg = (msg.user || '').trim();
          const assistantMsg = (msg.assistant || '').trim();
          if (userMsg && assistantMsg) {
            historyContext += `${idx + 1}. Пользователь: ${userMsg.substring(0, 150)}\n`;
            historyContext += `   AI: ${assistantMsg.substring(0, 200)}...\n\n`;
          }
        });
      } catch (err) {
        console.error('Error formatting conversation history:', err.message);
        historyContext = '';
      }
    }

    // Безопасное формирование промпта с проверками
    let userPrompt = '';
    try {
      if (isFitnessQuestion) {
        const targetCal = Number(p.daily_calories_target) || 0;
        const eatenCal = Math.round(Number(totals.calories) || 0);
        const remainCal = Math.max(0, targetCal - eatenCal);
        const proteinEaten = Math.round(Number(totals.protein) || 0);
        const proteinTarget = Number(p.protein_target_g) || 0;
        const carbsEaten = Math.round(Number(totals.carbs) || 0);
        const carbsTarget = Number(p.carbs_target_g) || 0;
        const fatsEaten = Math.round(Number(totals.fats) || 0);
        const fatsTarget = Number(p.fats_target_g) || 0;
        
        userPrompt = `ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Цель: ${String(p.goal || 'не указана')} (lose_weight/gain_weight/maintain_weight/gain_muscle)
- Вес: ${String(p.current_weight_kg || 'не указан')} кг
- Рост: ${String(p.height_cm || 'не указан')} см
- Активность: ${String(p.activity_level || 'не указана')}
- Цель калорий: ${targetCal} ккал/день
- Цели БЖУ: 
  * Белок: ${proteinTarget}г/день
  * Углеводы: ${carbsTarget}г/день
  * Жиры: ${fatsTarget}г/день

ПРОГРЕСС СЕГОДНЯ (${today}):
- Съедено калорий: ${eatenCal} из ${targetCal} (осталось ${remainCal})
- Белок: ${proteinEaten}г из ${proteinTarget}г (${proteinEaten < proteinTarget ? 'не хватает' : 'достаточно'})
- Углеводы: ${carbsEaten}г из ${carbsTarget}г
- Жиры: ${fatsEaten}г из ${fatsTarget}г

ТРЕНИРОВКИ (последние 7 дней):
- Количество: ${Number(workouts.count) || 0}
- Последняя тренировка: ${String(workouts.last_date || 'не было')}${historyContext}

ВОПРОС ПОЛЬЗОВАТЕЛЯ: "${String(userMessage)}"

${isModificationRequest ? '⚠️ ВАЖНО: Пользователь просит ИЗМЕНИТЬ или ПЕРЕДЕЛАТЬ что-то. Учти предыдущий контекст из истории разговора и создай ПОЛНОСТЬЮ НОВОЕ решение, не повторяя предыдущие варианты. ' : ''}Это вопрос связан с фитнесом. Проанализируй данные пользователя и дай КОНКРЕТНЫЙ, ПЕРСОНАЛИЗИРОВАННЫЙ, УНИКАЛЬНЫЙ ответ с учетом его профиля и прогресса. НЕ повторяй предыдущие ответы, будь креативным!`;
      } else {
        userPrompt = `ВОПРОС ПОЛЬЗОВАТЕЛЯ: "${String(userMessage)}"${historyContext}

Это общий вопрос (не связан напрямую с фитнесом). Дай полный, информативный, УНИКАЛЬНЫЙ и полезный ответ на вопрос пользователя. Используй свои знания для предоставления точной информации. НЕ повторяй предыдущие ответы, будь креативным!`;
      }
    } catch (err) {
      console.error('Error building user prompt:', err.message);
      // Fallback на простой промпт
      userPrompt = `ВОПРОС ПОЛЬЗОВАТЕЛЯ: "${String(userMessage)}"

Дай полный, информативный и полезный ответ на вопрос пользователя.`;
    }

    const aiResult = await callExternalAI({
      system: systemPrompt,
      user: userPrompt,
      temperature: isModificationRequest ? 1.0 : 0.95, // Выше температура для запросов на изменение
      maxTokens: 1500, // Больше токенов для более развернутых ответов
      timeoutMs: 20000,
    });

    const reply = aiResult.text || baseline;
    await logAssistantMessage(userId, reply, context, aiResult.tokens);

    if (aiResult.text) {
      return res.json({
        success: true,
        data: { reply: aiResult.text, baseline },
      });
    }
    return res.json({
      success: true,
      data: { reply: baseline },
    });
  } catch (err) {
    console.error('AI chat error:', err);
    // Логируем ошибку для отладки
    if (err.message) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    // Возвращаем понятное сообщение об ошибке
    res.status(500).json({
      success: false,
      error: 'Ошибка при обработке запроса AI',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Внутренняя ошибка сервера',
    });
  }
});

// POST /api/ai/recommendations/mealplan
router.post('/recommendations/mealplan', mealplanSchema, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const mealsCount = Math.min(Math.max(parseInt(req.body?.meals || 4, 10), 3), 6);

    const profileRes = await query(
      `SELECT daily_calories_target, protein_target_g, carbs_target_g, fats_target_g
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    const p = profileRes.rows[0] || {};
    const targetKcal = p.daily_calories_target || 2200;
    const date = new Date().toISOString().split('T')[0];

    const basePlan = () => {
      const perMeal = Math.round(targetKcal / mealsCount);
      const titles = ['Завтрак', 'Обед', 'Ужин', 'Перекус', 'Перекус 2', 'Перекус 3'];
      const demoItems = [
        { name: 'Овсянка', grams: 80, calories: 300 },
        { name: 'Куриная грудка', grams: 150, calories: 240 },
        { name: 'Рис', grams: 150, calories: 180 },
        { name: 'Овощи', grams: 200, calories: 60 },
        { name: 'Творог', grams: 200, calories: 220 },
      ];
      return Array.from({ length: mealsCount }).map((_, i) => ({
        title: titles[i] || `Приём ${i + 1}`,
        items: [demoItems[i % demoItems.length]],
        total_calories: perMeal,
      }));
    };

    // Получаем дополнительные данные профиля
    const fullProfileRes = await query(
      `SELECT goal, current_weight_kg, activity_level, height_cm
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    const fullProfile = fullProfileRes.rows[0] || {};

    const systemPrompt = `Ты профессиональный нутрициолог и диетолог. Твоя задача - создать сбалансированный и разнообразный рацион питания.
Верни ТОЛЬКО валидный JSON без дополнительного текста:
{
  "date": "YYYY-MM-DD",
  "target_calories": 2200,
  "target_macros": {
    "protein": 150,
    "carbs": 250,
    "fats": 70
  },
  "plan": [
    {
      "title": "Завтрак",
      "items": [
        {
          "name": "Название продукта на русском",
          "grams": 100,
          "calories": 200
        }
      ],
      "total_calories": 550
    }
  ]
}
ВАЖНО: 
- Используй РЕАЛЬНЫЕ продукты, доступные в РФ
- Распредели калории равномерно между приёмами
- Включи разнообразие: белки, углеводы, овощи, фрукты
- Учитывай цели пользователя (набор/похудение/поддержание)
- Каждый приём должен быть сытным и сбалансированным`;

    const userPrompt = `СОЗДАЙ РАЦИОН ПИТАНИЯ:
- Количество приёмов: ${mealsCount}
- Целевая калорийность: ${targetKcal} ккал
- Цели БЖУ:
  * Белок: ${p.protein_target_g || Math.round(targetKcal * 0.15 / 4)}г
  * Углеводы: ${p.carbs_target_g || Math.round(targetKcal * 0.5 / 4)}г
  * Жиры: ${p.fats_target_g || Math.round(targetKcal * 0.3 / 9)}г

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Цель: ${fullProfile.goal || 'поддержание веса'}
- Вес: ${fullProfile.current_weight_kg || 'не указан'} кг
- Активность: ${fullProfile.activity_level || 'умеренная'}

ТРЕБОВАНИЯ:
- Используй продукты, доступные в российских магазинах
- Включи разнообразие: крупы, мясо/рыба, овощи, фрукты, молочные продукты
- Сделай рацион сытным и сбалансированным
- Распредели калории: завтрак ~25%, обед ~35%, ужин ~25%, перекусы ~15%
- Укажи конкретные граммы и калории для каждого продукта

Верни ТОЛЬКО JSON, никакого дополнительного текста.`;

    const aiResult = await callExternalAI({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.5,
      maxTokens: 1200,
      timeoutMs: 15000,
      responseFormat: { type: 'json_object' },
    });

    if (aiResult.text) {
      try {
        const parsed = JSON.parse(aiResult.text);
        // Логируем генерацию плана
        await logAssistantMessage(
          userId,
          `Generated mealplan: ${mealsCount} meals, ${targetKcal} kcal`,
          { mealsCount, targetKcal, macros: p },
          aiResult.tokens
        );
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (_) {
        // fallback
      }
    }

    const plan = basePlan();
    return res.json({
      success: true,
      data: {
        date,
        target_calories: targetKcal,
        target_macros: { protein: p.protein_target_g, carbs: p.carbs_target_g, fats: p.fats_target_g },
        plan,
      },
    });
  } catch (err) {
    console.error('AI mealplan error:', err);
    res.status(500).json({
      success: false,
      error: 'Ошибка генерации рациона',
    });
  }
});

// POST /api/ai/recommendations/mealplan/apply
router.post('/recommendations/mealplan/apply', mealplanApplySchema, async (req, res) => {
  const db = await getClient();
  try {
    await db.query('BEGIN');
    const userId = req.user.user_id;
    const bodyPlan = req.body?.plan || {};
    const date = req.body?.date || bodyPlan.date || new Date().toISOString().split('T')[0];
    const meals = Array.isArray(bodyPlan.plan) ? bodyPlan.plan : [];

    const titleToType = (title = '') => {
      const t = title.toLowerCase();
      if (t.includes('завтрак')) return 'breakfast';
      if (t.includes('обед')) return 'lunch';
      if (t.includes('ужин')) return 'dinner';
      return 'snack';
    };

    for (const meal of meals) {
      const mealType = titleToType(meal.title || '');
      const insMeal = await db.query(
        `INSERT INTO meals (user_id, meal_date, meal_type, notes) VALUES ($1,$2,$3,$4) RETURNING meal_id`,
        [userId, date, mealType, 'added_by_ai']
      );
      const mealId = insMeal.rows[0].meal_id;

      for (const it of meal.items || []) {
        const name = (it.name || '').trim();
        if (!name) continue;
        let prod = await db.query(
          'SELECT product_id, calories_per_100, protein_per_100, carbs_per_100, fats_per_100 FROM products WHERE LOWER(name)=LOWER($1) LIMIT 1',
          [name]
        );
        let productId;
        if (prod.rows.length === 0) {
          const grams = Number(it.grams) || 100;
          const kcal = Number(it.calories) || Math.round(grams * 1.5);
          const per100 = Math.max(0, Math.round((kcal * 100) / Math.max(1, grams)));
          const insert = await db.query(
            `INSERT INTO products (name, calories_per_100, protein_per_100, carbs_per_100, fats_per_100, category, is_verified)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING product_id`,
            [name, per100, 0, 0, 0, 'ai', false]
          );
          productId = insert.rows[0].product_id;
        } else {
          productId = prod.rows[0].product_id;
        }

        const qty = Number(it.grams) || 100;
        const p = await db.query(
          'SELECT calories_per_100, protein_per_100, carbs_per_100, fats_per_100 FROM products WHERE product_id=$1',
          [productId]
        );
        const pr = p.rows[0] || { calories_per_100: 0, protein_per_100: 0, carbs_per_100: 0, fats_per_100: 0 };
        const mult = qty / 100;
        await db.query(
          `INSERT INTO meal_items (meal_id, product_id, quantity_g, calories, protein, carbs, fats)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [mealId, productId, qty, pr.calories_per_100 * mult, pr.protein_per_100 * mult, pr.carbs_per_100 * mult, pr.fats_per_100 * mult]
        );
      }

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
    res.json({
      success: true,
      message: 'Рацион добавлен в дневник',
      data: { date, meals_added: meals.length },
    });
  } catch (err) {
    try {
      await db.query('ROLLBACK');
    } catch (_) {}
    console.error('AI apply mealplan error:', err);
    res.status(500).json({
      success: false,
      error: 'Ошибка добавления рациона в дневник',
    });
  } finally {
    db.release();
  }
});

// POST /api/ai/recommendations/workout
router.post('/recommendations/workout', workoutSchema, async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const { location = 'gym', duration_min = 45 } = req.body || {};

    const userId = req.user.user_id;
    // Получаем профиль пользователя для персонализации
    const profileRes = await query(
      `SELECT goal, current_weight_kg, activity_level, height_cm
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    const profile = profileRes.rows[0] || {};

    // Получаем историю тренировок для контекста
    const recentWorkouts = await query(
      `SELECT notes, duration_min FROM workout_sessions 
       WHERE user_id = $1 ORDER BY session_date DESC LIMIT 3`,
      [userId]
    );

    const systemPrompt = `Ты профессиональный фитнес-тренер. Твоя задача - создать персонализированную тренировку.
Верни ТОЛЬКО валидный JSON без дополнительного текста:
{
  "date": "YYYY-MM-DD",
  "title": "Название тренировки",
  "sets": [
    {
      "exercise": {
        "name": "Название упражнения на русском",
        "muscle_group": "группа мышц (chest, back, legs, shoulders, arms, abs)"
      },
      "set_number": 1,
      "reps": 10,
      "weight_kg": 20
    }
  ]
}
Важно: дай 5-8 разнообразных упражнений, учитывай локацию (${location}), длительность (${duration_min} мин).`;

    const userPrompt = `СОЗДАЙ ТРЕНИРОВКУ:
- Локация: ${location === 'home' ? 'дома без оборудования' : location === 'gym' ? 'в зале' : location}
- Длительность: ${duration_min} минут
- Профиль пользователя:
  * Цель: ${profile.goal || 'не указана'}
  * Вес: ${profile.current_weight_kg || 'не указан'} кг
  * Рост: ${profile.height_cm || 'не указан'} см
  * Активность: ${profile.activity_level || 'не указана'}

${location === 'home' ? 'ВАЖНО: Используй только упражнения без оборудования (отжимания, приседания, планка, выпады, берпи, скручивания и т.д.)' : ''}
${location === 'gym' ? 'Используй разнообразное оборудование зала (штанги, гантели, тренажёры)' : ''}

Создай полноценную тренировку с разминкой и заминкой. Упражнения должны быть конкретными и выполнимыми.
Верни ТОЛЬКО JSON, никакого дополнительного текста.`;

    const aiResult = await callExternalAI({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.6,
      maxTokens: 1000,
      timeoutMs: 15000,
      responseFormat: { type: 'json_object' },
    });

    if (aiResult.text) {
      try {
        const parsed = JSON.parse(aiResult.text);
        parsed.date = parsed.date || date;
        // Логируем генерацию тренировки
        await logAssistantMessage(
          userId,
          `Generated workout: ${parsed.title || 'Workout'}, ${duration_min} min, ${location}`,
          { location, duration_min, date },
          aiResult.tokens
        );
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (_) {
        // fallback
      }
    }

    const sets = [
      { exercise: { name: 'Жим гантелей лёжа', muscle_group: 'chest' }, set_number: 1, reps: 10, weight_kg: 20 },
      { exercise: { name: 'Тяга верхнего блока', muscle_group: 'back' }, set_number: 2, reps: 12, weight_kg: 35 },
      { exercise: { name: 'Приседания с гантелями', muscle_group: 'legs' }, set_number: 3, reps: 12, weight_kg: 24 },
      { exercise: { name: 'Жим гантелей сидя', muscle_group: 'shoulders' }, set_number: 4, reps: 12, weight_kg: 16 },
      { exercise: { name: 'Скручивания', muscle_group: 'abs' }, set_number: 5, reps: 15, weight_kg: 0 },
    ];
    res.json({
      success: true,
      data: { date, title: 'Силовая (база)', sets },
    });
  } catch (err) {
    console.error('AI workout error:', err);
    res.status(500).json({
      success: false,
      error: 'Ошибка генерации тренировки',
    });
  }
});

// POST /api/ai/recommendations/workout/apply
router.post('/recommendations/workout/apply', workoutApplySchema, async (req, res) => {
  const db = await getClient();
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
      let ex = await db.query('SELECT exercise_id FROM exercises WHERE LOWER(name)=LOWER($1) LIMIT 1', [exName]);
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

    const estimatedMinutes = Math.max(15, Math.min(120, Number(plan.duration_min) || sets.length * 3 || 45));
    await db.query(
      `UPDATE workout_sessions SET end_time=$1, duration_min=$2, total_volume_kg=COALESCE(total_volume_kg,0), completed=true WHERE session_id=$3`,
      [new Date(), estimatedMinutes, sessionId]
    );

    await db.query('COMMIT');
    res.json({
      success: true,
      message: 'Тренировка добавлена',
      data: { session_id: sessionId, date },
    });
  } catch (err) {
    try {
      await db.query('ROLLBACK');
    } catch (_) {}
    console.error('AI apply workout error:', err);
    res.status(500).json({
      success: false,
      error: 'Ошибка добавления тренировки',
    });
  } finally {
    db.release();
  }
});

module.exports = router;