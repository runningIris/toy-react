const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require('webpack');

const DIST = path.join(__dirname, './dist');

module.exports = {
  mode: "development",
  entry: {
    main: path.join(__dirname, "./src/main.js"),
  },
  output: {
    path: DIST,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  pragma: "ToyReact.createElement",
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/main.html",
    }),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  optimization: {
    minimize: false,
  },
  devServer: {
    contentBase: DIST,
    port: 5000,
    open: true,
  },
  stats: 'errors-only'
};
