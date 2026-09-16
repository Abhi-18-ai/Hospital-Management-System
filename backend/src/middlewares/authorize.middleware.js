'use strict';

const ApiError = require('../utils/ApiError');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication is required before authorization.', 'AUTH_REQUIRED'));
    }

    if (allowedRoles.length === 0) {
      // No roles specified means any authenticated user is allowed.
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not permitted to perform this action.`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
}

 
function authorizeOwnership(resolver, bypassRoles = []) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(ApiError.unauthorized('Authentication is required before authorization.', 'AUTH_REQUIRED'));
      }

      if (bypassRoles.includes(req.user.role)) {
        return next();
      }

      const allowed = await resolver(req);
      if (!allowed) {
        return next(
          ApiError.forbidden('You are not permitted to access this resource.', 'RESOURCE_ACCESS_DENIED')
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authorize, authorizeOwnership };
