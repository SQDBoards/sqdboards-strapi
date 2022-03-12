"use strict";

const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    strapi.service("plugin::users-permissions.user").fetchAuthenticatedUser =
      function (id) {
        return strapi.query("plugin::users-permissions.user").findOne({
          where: { id },
          populate: ["role", "orders"],
        });
      };
    strapi.controller("api::order.order").find = async function (ctx) {
      let entities;

      if (ctx.query._q) {
        entities = await strapi.service("api::order.order").search(ctx.query);
      } else {
        entities = await strapi.service("api::order.order").find({
          id: ctx.query,
          populate: ["user"],
        });
      }

      let orderIds = [],
        orders = [];

      entities.results.forEach((e) => {
        if (ctx.state.user.id === e.user.id) orderIds.push(e.id);
      });

      for (let id of orderIds) {
        let entry;
        entry = await strapi.service("api::order.order").findOne(id, {
          populate: ["modifications", "specifications", "specifications.pcb"],
          // populate field to change when new relations are added
        });
        orders.push(entry);
      }

      return orders;
    };
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};
