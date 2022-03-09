const { createWebpackAliases } = require("./webpack.helpers");

module.exports = createWebpackAliases({
  "@": "src/renderer",
  "@common": "src/common",
  "@img": "src/renderer/resource/img",
  "@main": "src/main",
  "@schema": "src/renderer/state/schema",
});
