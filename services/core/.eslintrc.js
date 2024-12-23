/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/server.js"],
  rules: {
    "no-unused-vars": "off",
    "no-undef": "off"
  }
};
