'use strict';

const ApiError = require('../utils/ApiError');


function validate(schema) {
  return (req, res, next) => {
    const toValidate = ['body', 'params', 'query'].filter((key) => schema[key]);
    const errors = [];

    for (const key of toValidate) {
      const { error, value } = schema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        errors.push(
          ...error.details.map((d) => ({
            field: `${key}.${d.path.join('.')}`,
            message: d.message.replace(/"/g, "'"),
          }))
        );
      } else {
        req[key] = value;
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation failed.', 'VALIDATION_ERROR', errors));
    }

    next();
  };
}

module.exports = validate;
