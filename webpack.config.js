const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const path = require("path");

// Common webpack config
let commonConfig = {
  node: {
    __dirname: true,
  },
  mode: process.env.ENV || "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.s?[ac]ss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

module.exports = [
  // Main config
  Object.assign({}, commonConfig, {
    target: "electron-main",
    entry: {
      main: "./src/main/index.ts",
    },
    output: {
      filename: "[name]-bundle.js",
      path: path.resolve(__dirname, "src/main/dist"),
    },
  }),

  // Renderer config
  Object.assign({}, commonConfig, {
    target: "electron-renderer",
    entry: {
      renderer: "./src/renderer/index.ts",
      scss: "./src/renderer/scss/app.scss",
    },
    output: {
      filename: "[name]-bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, "src/renderer/tsconfig.json"),
        }),
      ],
    },
    plugins: [
      new CopyPlugin([
        {
          from: path.resolve(__dirname, "src/renderer/index.html"),
          to: "index.html",
        },
      ]),
      new MiniCssExtractPlugin({
        filename: "app.css",
      }),
    ],
  }),
];
