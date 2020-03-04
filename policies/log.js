'use strict';

const log = async (request, h) => {
  request.server.log(['policy', 'info'], 'Log come on pre response');
  return h.continue;
};
log.applyPoint = 'onPreResponse';
module.exports = log;