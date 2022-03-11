'use strict';

/**
 * pcb service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pcb.pcb');
