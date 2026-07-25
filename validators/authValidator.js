const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().trim().allow(""),
  identifier: Joi.string().trim().allow(""),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  }),
}).custom((value, helpers) => {
  if (!value.username && !value.identifier) {
    return helpers.error("any.custom");
  }

  return value;
}, "login identifier check").messages({
  "any.custom": "Email/username and password are required.",
});

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).allow(""),
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters.",
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  }),
});

module.exports = {
  loginSchema,
  signupSchema,
};
