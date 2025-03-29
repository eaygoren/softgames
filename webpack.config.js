const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./project/src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "project/dist"),
  },
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: path.resolve(__dirname, "project/dist"),
    hot: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./project/public/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, "assets"), to: "assets" }
      ],
    }),
  ],
};