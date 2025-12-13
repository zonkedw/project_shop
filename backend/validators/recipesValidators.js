const Joi = require('joi');

const recipeIdSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const getRecipesSchema = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),
};

const createRecipeSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(2000).allow('', null),
    servings: Joi.number().integer().min(1).max(50).default(1),
    cooking_time_min: Joi.number().integer().min(1).max(600).allow(null),
    instructions: Joi.string().trim().max(5000).allow('', null),
    is_public: Joi.boolean().default(false),
    ingredients: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number().integer().positive().required(),
          quantity_g: Joi.number().positive().allow(null),
          quantity_ml: Joi.number().positive().allow(null),
        }).or('quantity_g', 'quantity_ml')
      )
      .min(1)
      .required(),
  }),
};

const updateRecipeSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(2000).allow('', null),
    servings: Joi.number().integer().min(1).max(50),
    cooking_time_min: Joi.number().integer().min(1).max(600).allow(null),
    instructions: Joi.string().trim().max(5000).allow('', null),
    is_public: Joi.boolean(),
  }).min(1),
};

const deleteRecipeSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

module.exports = {
  recipeIdSchema,
  getRecipesSchema,
  createRecipeSchema,
  updateRecipeSchema,
  deleteRecipeSchema,
};

