const { celebrate, Joi, Segments } = require('celebrate');

const pagination = {
  limit: Joi.number().integer().min(1).max(200).default(20),
  offset: Joi.number().integer().min(0).default(0),
};

module.exports = {
  searchProductsSchema: celebrate({
    [Segments.QUERY]: Joi.object().keys({
      q: Joi.string().min(2).required(),
      category: Joi.string().max(100).allow(null, ''),
      limit: pagination.limit,
      offset: pagination.offset,
    }),
  }),
  getProductByIdSchema: celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.number().integer().required(),
    }),
  }),
  getProductByBarcodeSchema: celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      barcode: Joi.string().min(3).max(100).required(),
    }),
  }),
  createProductSchema: celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().max(200).required(),
      brand: Joi.string().max(100).allow(null, ''),
      barcode: Joi.string().max(100).allow(null, ''),
      serving_size_g: Joi.number().min(0).max(2000).allow(null),
      serving_size_ml: Joi.number().min(0).max(2000).allow(null),
      calories_per_100: Joi.number().required(),
      protein_per_100: Joi.number().required(),
      carbs_per_100: Joi.number().required(),
      fats_per_100: Joi.number().required(),
      fiber_per_100: Joi.number().allow(null),
      sugar_per_100: Joi.number().allow(null),
      category: Joi.string().max(100).allow(null, ''),
    }),
  }),
  addMealSchema: celebrate({
    [Segments.BODY]: Joi.object().keys({
      meal_date: Joi.date().required(),
      meal_type: Joi.string().max(50).required(),
      notes: Joi.string().allow(null, ''),
      items: Joi.array().items(
        Joi.object().keys({
          product_id: Joi.number().integer().allow(null),
          recipe_id: Joi.number().integer().allow(null),
          quantity_g: Joi.number().min(0).max(5000).allow(null),
          quantity_ml: Joi.number().min(0).max(5000).allow(null),
        }).custom((val, helpers) => {
          if (!val.product_id && !val.recipe_id) {
            return helpers.error('any.invalid');
          }
          return val;
        }, 'product_or_recipe')
      ).min(1).required(),
    }),
  }),
  diarySchema: celebrate({
    [Segments.QUERY]: Joi.object().keys({
      date: Joi.date().required(),
    }),
  }),
};

