"use strict";

const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  register({ strapi }) {
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

      if (!entities) return;

      let orderIds = [],
        orders = [];

      entities.results.forEach((e) => {
        if (!e.user) return;
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

      return {
        data: orders.map((order) =>
          sanitizeEntity(order, { model: strapi.getModel("api::order.order") })
        ),
      };
    };

    strapi.controller("api::order.order").findOne = async function (ctx) {
      let entity;

      entity = await strapi.service("api::order.order").findOne(ctx.params.id, {
        populate: ["user"],
      });

      if (!entity) return;

      if (entity.user.id === ctx.state.user.id) {
        entity = await strapi
          .service("api::order.order")
          .findOne(ctx.params.id, {
            populate: ["modifications", "specifications", "specifications.pcb"],
          });
        return {
          data: sanitizeEntity(entity, {
            model: strapi.getModel("api::order.order"),
          }),
        };
      }

      return ctx.forbidden("Order does not belong to authenthicated user.");
    };

    // strapi.controller("plugin::users-permissions.user").update = async function (ctx) {
    //   if (ctx.params.id != ctx.state.user.id) ctx.forbidden("You can only edit your profile.")

    //   console.log("ctx", ctx)
    //   console.log("body", ctx.request.body)

    //   if (strapi.service("plugin::users-permissions.user").edit(ctx.params.id, ctx.request.body)) {
    //     ctx.response.status = 200
    //     ctx.response.message = "Profile updated!"
    //   }
    // }
  },

  bootstrap(/*{ strapi }*/) {},
};
