/**
 * Validation Middleware
 * Handles request input validation using Joi schemas
 */

import Joi from 'joi'
import { AppError, ValidationError } from './errorHandler.js'

export const validationMiddleware = (schema) => (req, res, next) => {
  const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };

  const { error, value } = schema.validate(req.body, options);

  if (error) {
    const errors = error.details.map(detail => detail.message);
    throw new ValidationError('Validation failed', errors);
  }

  req.validatedBody = value;
  next();
}; 