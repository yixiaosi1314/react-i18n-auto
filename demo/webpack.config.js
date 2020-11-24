const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
let entry = {
  index: path.resolve(__dirname, "./src/index.js"),
};
module.exports = {
  entry: Object.keys(entry).reduce((acc, cur) => {
    acc[cur] = [
      path.resolve(__dirname, "./locale/localePolyfill.js"),
    ].concat(entry[cur]);
    return acc;
  }, {}),

  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/",
    filename: "[name].min.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: "babel-loader",
        // 排除locale，不需要翻译
        exclude: /node_modules|locale/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "国际化",
      filename: "index.html",
      template: "./src/index.html",
    }),
  ],
};
