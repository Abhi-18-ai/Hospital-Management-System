'use strict';

const Joi = require('joi');
const { objectIdRequired, paginationQuery } = require('../../utils/joiCommon');

const listNotifications = {
  query: Joi.object({
    ...paginationQuery,
    unreadOnly: Joi.boolean(),
  }),
};

const markAsRead = {
  params: Joi.object({ id: objectIdRequired }),
};

module.exports = { listNotifications, markAsRead };
