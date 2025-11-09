const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

/**
 * @route   GET /api/users/profile
 * @desc    Получить профиль текущего пользователя
 * @access  Private
 */
router.get('/profile', async (req, res) => {
  try {
    const result = await query(
      `SELECT up.*, u.email, u.username 
       FROM user_profiles up
       JOIN users u ON up.user_id = u.user_id
       WHERE up.user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Обновить профиль
 * @access  Private
 */
router.put('/profile', async (req, res) => {
  try {
    const {
      full_name, date_of_birth, gender, height_cm, current_weight_kg,
      target_weight_kg, activity_level, goal, training_location,
      available_equipment, water_target_ml
    } = req.body;

    // Проверка существования профиля
    const existingProfile = await query(
      'SELECT profile_id FROM user_profiles WHERE user_id = $1',
      [req.user.user_id]
    );

    if (existingProfile.rows.length === 0) {
      // Создать профиль если не существует
      const createResult = await query(
        `INSERT INTO user_profiles (user_id) VALUES ($1) RETURNING profile_id`,
        [req.user.user_id]
      );
    }

    // Рассчитать целевые значения если заданы основные параметры
    let daily_calories_target, protein_target_g, carbs_target_g, fats_target_g;
    
    if (height_cm && current_weight_kg && activity_level && goal) {
      // Базовый метаболизм (упрощенная формула)
      const bmr = 10 * current_weight_kg + 6.25 * height_cm - 5 * 25; // предполагаем 25 лет
      
      // Коэффициент активности
      const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
      };
      
      let calories = bmr * (activityMultipliers[activity_level] || 1.2);
      
      // Корректировка по цели
      if (goal === 'lose_weight') {
        calories -= 500;
      } else if (goal === 'gain_weight' || goal === 'gain_muscle') {
        calories += 300;
      }
      
      daily_calories_target = Math.round(calories);
      protein_target_g = Math.round(current_weight_kg * 2); // 2г на кг
      fats_target_g = Math.round(daily_calories_target * 0.25 / 9); // 25% от калорий
      carbs_target_g = Math.round((daily_calories_target - protein_target_g * 4 - fats_target_g * 9) / 4);
    }

    // Обновить профиль
    const result = await query(
      `UPDATE user_profiles SET
        full_name = COALESCE($1, full_name),
        date_of_birth = COALESCE($2, date_of_birth),
        gender = COALESCE($3, gender),
        height_cm = COALESCE($4, height_cm),
        current_weight_kg = COALESCE($5, current_weight_kg),
        target_weight_kg = COALESCE($6, target_weight_kg),
        activity_level = COALESCE($7, activity_level),
        goal = COALESCE($8, goal),
        training_location = COALESCE($9, training_location),
        available_equipment = COALESCE($10, available_equipment),
        water_target_ml = COALESCE($11, water_target_ml),
        daily_calories_target = COALESCE($12, daily_calories_target),
        protein_target_g = COALESCE($13, protein_target_g),
        carbs_target_g = COALESCE($14, carbs_target_g),
        fats_target_g = COALESCE($15, fats_target_g)
       WHERE user_id = $16
       RETURNING *`,
      [
        full_name, date_of_birth, gender, height_cm, current_weight_kg,
        target_weight_kg, activity_level, goal, training_location,
        available_equipment, water_target_ml,
        daily_calories_target, protein_target_g, carbs_target_g, fats_target_g,
        req.user.user_id
      ]
    );

    res.json({
      message: 'Профиль обновлен',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

/**
 * @route   POST /api/users/measurements
 * @desc    Добавить замер тела
 * @access  Private
 */
router.post('/measurements', async (req, res) => {
  try {
    const {
      measurement_date, weight_kg, body_fat_percent, muscle_mass_kg,
      waist_cm, chest_cm, hips_cm, biceps_cm, thighs_cm, notes
    } = req.body;

    if (!measurement_date || !weight_kg) {
      return res.status(400).json({ error: 'Дата и вес обязательны' });
    }

    const result = await query(
      `INSERT INTO body_measurements (
        user_id, measurement_date, weight_kg, body_fat_percent, muscle_mass_kg,
        waist_cm, chest_cm, hips_cm, biceps_cm, thighs_cm, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.user_id, measurement_date, weight_kg, body_fat_percent, muscle_mass_kg,
        waist_cm, chest_cm, hips_cm, biceps_cm, thighs_cm, notes
      ]
    );

    // Обновить текущий вес в профиле
    await query(
      'UPDATE user_profiles SET current_weight_kg = $1 WHERE user_id = $2',
      [weight_kg, req.user.user_id]
    );

    res.status(201).json({
      message: 'Замер добавлен',
      measurement: result.rows[0]
    });
  } catch (error) {
    console.error('Add measurement error:', error);
    res.status(500).json({ error: 'Ошибка добавления замера' });
  }
});

/**
 * @route   GET /api/users/measurements
 * @desc    Получить историю замеров
 * @access  Private
 */
router.get('/measurements', async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const result = await query(
      `SELECT * FROM body_measurements 
       WHERE user_id = $1 
       ORDER BY measurement_date DESC 
       LIMIT $2`,
      [req.user.user_id, parseInt(limit)]
    );

    res.json({
      measurements: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({ error: 'Ошибка получения замеров' });
  }
});

module.exports = router;
