const { celebrate, Joi, Segments } = require('celebrate');

const chatSchema = celebrate({
  [Segments.BODY]: Joi.object({
    message: Joi.string().min(1).max(2000).required(),
  }),
});

const mealplanSchema = celebrate({
  [Segments.BODY]: Joi.object({
    meals: Joi.number().integer().min(3).max(6).optional(),
  }),
});

const mealplanApplySchema = celebrate({
  [Segments.BODY]: Joi.object({
    date: Joi.string().isoDate().optional(),
    plan: Joi.object({
      date: Joi.string().isoDate().optional(),
      plan: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().allow('', null),
            total_calories: Joi.number().optional(),
            items: Joi.array()
              .items(
                Joi.object({
                  name: Joi.string().required(),
                  grams: Joi.number().min(1).max(2000).optional(),
                  calories: Joi.number().min(0).max(5000).optional(),
                })
              )
              .default([]),
          })
        )
        .min(1)
        .required(),
    }).required(),
  }),
});

const workoutSchema = celebrate({
  [Segments.BODY]: Joi.object({
    location: Joi.string().valid('home', 'gym').optional(),
    duration_min: Joi.number().integer().min(10).max(180).optional(),
  }),
});

const workoutApplySchema = celebrate({
  [Segments.BODY]: Joi.object({
    plan: Joi.object({
      date: Joi.string().isoDate().optional(),
      title: Joi.string().allow('', null),
      duration_min: Joi.number().integer().min(10).max(180).optional(),
      sets: Joi.array()
        .items(
          Joi.object({
            set_number: Joi.number().integer().min(1).optional(),
            reps: Joi.number().integer().min(1).max(100).optional(),
            weight_kg: Joi.number().min(0).max(500).optional(),
            exercise: Joi.object({
              name: Joi.string().required(),
              muscle_group: Joi.string().allow('', null),
            }).required(),
          })
        )
        .min(1)
        .required(),
    }).required(),
  }),
});

module.exports = {
  chatSchema,
  mealplanSchema,
  mealplanApplySchema,
  workoutSchema,
  workoutApplySchema,
};

