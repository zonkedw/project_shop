const { celebrate, Joi, Segments } = require('celebrate');

const email = Joi.string().email().max(150).required();
const password = Joi.string().min(6).max(100).required();
const username = Joi.string().min(2).max(50).required();

module.exports = {
  registerSchema: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email,
      password,
      username,
    }),
  }),
  loginSchema: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email,
      password,
    }),
  }),
};

