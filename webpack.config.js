
module.exports = {
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        query: {
          presets: ["react", "es2015"],
          plugins: ["syntax-async-functions", "transform-regenerator"]
        }
      }
    ]
  }
};

