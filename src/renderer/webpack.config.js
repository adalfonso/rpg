/**
 * Additional config needed for renderer. electron-webpack imports this in
 * addition to its own default config
 */
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".ts", ".js", ".json"],
    plugins: [new TsconfigPathsPlugin()],
  },
};
