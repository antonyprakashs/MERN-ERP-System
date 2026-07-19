const Joi = require('joi');

// Helper to validate ObjectId hex strings
const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid MongoDB ObjectId');
  }
  return value;
};

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'Sales', 'Inventory').required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  product: Joi.object({
    title: Joi.string().required(),
    SKU: Joi.string().required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().min(0).default(0),
    reorderLevel: Joi.number().min(0).default(10)
  }),
  customerSupplier: Joi.object({
    name: Joi.string().required(),
    contact: Joi.string().allow('', null),
    address: Joi.string().allow('', null)
  }),
  order: Joi.object({
    customer: Joi.string().custom(objectId).optional(),
    supplier: Joi.string().custom(objectId).optional(),
    products: Joi.array().items(
      Joi.object({
        product: Joi.string().custom(objectId).required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required(),
    status: Joi.string().valid('Pending', 'Completed', 'Received').optional()
  })
};

// Middleware function
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new Error(`Validation schema '${schemaName}' not found`));
    }

    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: messages 
      });
    }
    next();
  };
};

module.exports = { validate };
