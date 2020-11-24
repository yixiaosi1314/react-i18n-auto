const path = require("path");
let entry = {
  index: path.resolve(__dirname, "./src/index.js"),
};
module.exports = {
  entry: Object.keys(entry).reduce((acc, cur) => {
    acc[cur] = [
      // 语言包也可以选择懒加载的方式，但然要确保是最先加载
      path.resolve(__dirname, "./locale/en_US/locale.js"),
      path.resolve(__dirname, "./locale/localePolyfill.js"),
    ].concat(entry[cur]);
    return acc;
  }, {}),

  output: {
    path: path.resolve(__dirname, "./dist"),
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
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
};
