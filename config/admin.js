module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "e3b8eeb71807743c13312b48a6b67a0b"),
  },
});
