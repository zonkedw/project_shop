const express = require('express');
const router = express.Router();
const { celebrate } = require('celebrate');
const { query, getClient } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const {
  getExercisesSchema,
  exerciseIdSchema,
  createExerciseSchema,
  createSessionSchema,
  getSessionsSchema,
  sessionIdSchema,
  getStatsSchema,
} = require('../validators/workoutsValidators');

// Все роуты требуют авторизации
router.use(authMiddleware);

/**
 * @route   GET /api/workouts/exercises
 * @desc    Получить список упражнений
 * @access  Private
 */
router.get('/exercises', celebrate(getExercisesSchema), async (req, res, next) => {
  try {
    const { muscle_group, equipment, difficulty, search, limit = 50, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (muscle_group) {
      paramCount++;
      queryText += ` AND muscle_group = $${paramCount}`;
      params.push(muscle_group);
    }

    if (equipment) {
      paramCount++;
      queryText += ` AND equipment = $${paramCount}`;
      params.push(equipment);
    }

    if (difficulty) {
      paramCount++;
      queryText += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
    }

    if (search) {
      paramCount++;
      queryText += ` AND name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY is_verified DESC, name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        exercises: result.rows,
        count: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/workouts/exercises/:id
 * @desc    Получить упражнение по ID
 * @access  Private
 */
router.get('/exercises/:id', celebrate(exerciseIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM exercises WHERE exercise_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Упражнение не найдено',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get exercise error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/workouts/exercises
 * @desc    Создать упражнение
 * @access  Private
 */
router.post('/exercises', celebrate(createExerciseSchema), async (req, res, next) => {
  try {
    const {
      name, description, muscle_group, equipment,
      difficulty, video_url, instructions
    } = req.body;

    const result = await query(
      `INSERT INTO exercises (name, description, muscle_group, equipment, difficulty, video_url, instructions, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, muscle_group, equipment, difficulty, video_url, instructions, req.user.user_id]
    );

    res.status(201).json({
      success: true,
      message: 'Упражнение создано',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/workouts/muscle-groups
 * @desc    Получить список мышечных групп
 * @access  Private
 */
router.get('/muscle-groups', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT DISTINCT muscle_group FROM exercises WHERE muscle_group IS NOT NULL ORDER BY muscle_group'
    );

    res.json({
      success: true,
      data: {
        muscle_groups: result.rows.map(row => row.muscle_group),
      },
    });
  } catch (error) {
    console.error('Get muscle groups error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/workouts/sessions
 * @desc    Создать тренировочную сессию
 * @access  Private
 */
router.post('/sessions', celebrate(createSessionSchema), async (req, res, next) => {
  const client = await getClient();

  try {
    const {
      session_date, plan_id, start_time, sets, notes
    } = req.body;

    await client.query('BEGIN');

    // Создать сессию
    const sessionResult = await client.query(
      `INSERT INTO workout_sessions (user_id, plan_id, session_date, start_time, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING session_id`,
      [req.user.user_id, plan_id, session_date, start_time, notes]
    );

    const sessionId = sessionResult.rows[0].session_id;

    // Добавить подходы
    let totalVolume = 0;

    for (const set of sets) {
      const {
        exercise_id, set_number, reps, weight_kg,
        duration_sec, distance_m, rest_sec, is_warmup, notes: setNotes
      } = set;

      if (!exercise_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'exercise_id обязателен для каждого подхода',
        });
      }

      await client.query(
        `INSERT INTO workout_sets 
         (session_id, exercise_id, set_number, reps, weight_kg, duration_sec, distance_m, rest_sec, is_warmup, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [sessionId, exercise_id, set_number, reps, weight_kg, duration_sec, distance_m, rest_sec, is_warmup, setNotes]
      );

      // Расчет объема (подходы * повторы * вес)
      if (reps && weight_kg && !is_warmup) {
        totalVolume += reps * weight_kg;
      }
    }

    // Обновить сессию с общим объемом
    const endTime = new Date();
    const startTimeDate = start_time ? new Date(start_time) : new Date();
    const durationMin = Math.round((endTime - startTimeDate) / 60000);

    await client.query(
      `UPDATE workout_sessions 
       SET end_time = $1, duration_min = $2, total_volume_kg = $3, completed = true
       WHERE session_id = $4`,
      [endTime, durationMin, totalVolume, sessionId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Тренировка создана',
      data: {
        session_id: sessionId,
        total_volume_kg: totalVolume,
        duration_min: durationMin,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create session error:', error);
    next(error);
  } finally {
    client.release();
  }
});

/**
 * @route   GET /api/workouts/sessions
 * @desc    Получить историю тренировок
 * @access  Private
 */
router.get('/sessions', celebrate(getSessionsSchema), async (req, res, next) => {
  try {
    const { start_date, end_date, limit = 20, offset = 0 } = req.query;

    let queryText = `
      SELECT ws.*, COUNT(wset.set_id) as total_sets
      FROM workout_sessions ws
      LEFT JOIN workout_sets wset ON ws.session_id = wset.session_id
      WHERE ws.user_id = $1
    `;
    const params = [req.user.user_id];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      queryText += ` AND ws.session_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      queryText += ` AND ws.session_date <= $${paramCount}`;
      params.push(end_date);
    }

    queryText += ` GROUP BY ws.session_id ORDER BY ws.session_date DESC, ws.start_time DESC
                   LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Для каждой сессии получить подходы с упражнениями
    const sessions = [];
    for (const session of result.rows) {
      const setsResult = await query(
        `SELECT wset.*, e.name as exercise_name, e.muscle_group, e.equipment
         FROM workout_sets wset
         JOIN exercises e ON wset.exercise_id = e.exercise_id
         WHERE wset.session_id = $1
         ORDER BY wset.set_number`,
        [session.session_id]
      );

      sessions.push({
        ...session,
        sets: setsResult.rows
      });
    }

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/workouts/sessions/:id
 * @desc    Получить детали тренировочной сессии
 * @access  Private
 */
router.get('/sessions/:id', celebrate(sessionIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const sessionResult = await query(
      'SELECT * FROM workout_sessions WHERE session_id = $1 AND user_id = $2',
      [id, req.user.user_id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Тренировка не найдена',
      });
    }

    const session = sessionResult.rows[0];

    // Получить подходы
    const setsResult = await query(
      `SELECT wset.*, e.name as exercise_name, e.muscle_group, e.equipment
       FROM workout_sets wset
       JOIN exercises e ON wset.exercise_id = e.exercise_id
       WHERE wset.session_id = $1
       ORDER BY wset.set_number`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...session,
        sets: setsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get session error:', error);
    next(error);
  }
});

/**
 * @route   DELETE /api/workouts/sessions/:id
 * @desc    Удалить тренировочную сессию
 * @access  Private
 */
router.delete('/sessions/:id', celebrate(sessionIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM workout_sessions WHERE session_id = $1 AND user_id = $2 RETURNING session_id',
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Тренировка не найдена',
      });
    }

    res.json({
      success: true,
      message: 'Тренировка удалена',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/workouts/stats
 * @desc    Получить статистику тренировок
 * @access  Private
 */
router.get('/stats', celebrate(getStatsSchema), async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let queryText = `
      SELECT 
        COUNT(DISTINCT session_id) as total_workouts,
        SUM(total_volume_kg) as total_volume,
        AVG(duration_min) as avg_duration,
        SUM(duration_min) as total_minutes
      FROM workout_sessions
      WHERE user_id = $1 AND completed = true
    `;
    const params = [req.user.user_id];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      queryText += ` AND session_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      queryText += ` AND session_date <= $${paramCount}`;
      params.push(end_date);
    }

    const statsResult = await query(queryText, params);

    // Статистика по мышечным группам
    let muscleStatsQuery = `
      SELECT e.muscle_group, COUNT(*) as exercise_count
      FROM workout_sets ws
      JOIN exercises e ON ws.exercise_id = e.exercise_id
      JOIN workout_sessions wss ON ws.session_id = wss.session_id
      WHERE wss.user_id = $1
    `;
    const muscleParams = [req.user.user_id];
    let muscleParamCount = 1;

    if (start_date) {
      muscleParamCount++;
      muscleStatsQuery += ` AND wss.session_date >= $${muscleParamCount}`;
      muscleParams.push(start_date);
    }

    if (end_date) {
      muscleParamCount++;
      muscleStatsQuery += ` AND wss.session_date <= $${muscleParamCount}`;
      muscleParams.push(end_date);
    }

    muscleStatsQuery += ' GROUP BY e.muscle_group ORDER BY exercise_count DESC';
    const muscleResult = await query(muscleStatsQuery, muscleParams);

    res.json({
      success: true,
      data: {
        overall: statsResult.rows[0],
        by_muscle_group: muscleResult.rows,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    next(error);
  }
});

module.exports = router;
