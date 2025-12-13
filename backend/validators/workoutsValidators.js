const Joi = require('joi');

const getExercisesSchema = {
  query: Joi.object({
    muscle_group: Joi.string().trim().max(100),
    equipment: Joi.string().trim().max(100),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
    search: Joi.string().trim().min(1).max(200),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
  }),
};

const exerciseIdSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const createExerciseSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(2000).allow('', null),
    muscle_group: Joi.string().trim().max(100).required(),
    equipment: Joi.string().trim().max(100).allow('', null),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').allow(null),
    video_url: Joi.string().uri().max(500).allow('', null),
    instructions: Joi.string().trim().max(5000).allow('', null),
  }),
};

const createSessionSchema = {
  body: Joi.object({
    session_date: Joi.string().isoDate().required(),
    plan_id: Joi.number().integer().positive().allow(null),
    start_time: Joi.string().isoDate().allow(null),
    notes: Joi.string().trim().max(2000).allow('', null),
    sets: Joi.array()
      .items(
        Joi.object({
          exercise_id: Joi.number().integer().positive().required(),
          set_number: Joi.number().integer().min(1).default(1),
          reps: Joi.number().integer().min(0).allow(null),
          weight_kg: Joi.number().positive().allow(null),
          duration_sec: Joi.number().integer().min(0).allow(null),
          distance_m: Joi.number().positive().allow(null),
          rest_sec: Joi.number().integer().min(0).allow(null),
          is_warmup: Joi.boolean().default(false),
          notes: Joi.string().trim().max(500).allow('', null),
        })
      )
      .min(1)
      .required(),
  }),
};

const getSessionsSchema = {
  query: Joi.object({
    start_date: Joi.string().isoDate(),
    end_date: Joi.string().isoDate(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),
};

const sessionIdSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const getStatsSchema = {
  query: Joi.object({
    start_date: Joi.string().isoDate(),
    end_date: Joi.string().isoDate(),
  }),
};

module.exports = {
  getExercisesSchema,
  exerciseIdSchema,
  createExerciseSchema,
  createSessionSchema,
  getSessionsSchema,
  sessionIdSchema,
  getStatsSchema,
};

