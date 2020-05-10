// Used by mocha
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  target: "node",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    plugins: [new TsconfigPathsPlugin()],
  },
};
