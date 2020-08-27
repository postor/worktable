const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./web/app.tsx",
  output: {
    path: path.resolve(__dirname, "./public"),
    filename: "[name].[contenthash].js",
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      // All files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
  plugins: [new HtmlWebpackPlugin({
    templateContent: `<html><head></head><body><div id="app"></div></body></html>`,
  })],
};
