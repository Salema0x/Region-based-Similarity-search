const path = require("path");
const BundleTracker = require("webpack-bundle-tracker");

module.exports = {
  entry: {
    frontend: "./frontend/src/index.js",
  },
  output: {
    path: path.resolve("./frontend/static/"),
    filename: "[name]-[fullhash].js",
    publicPath: "static/",
    clean: true,
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: "./webpack-stats.json",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'ts-loader',
        
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
      // Add rules for other file types below if needed (e.g., images, fonts)
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx','.css'],
  },
    watchOptions: {
    aggregateTimeout: 200, // Delay before rebuilding
    ignored: /node_modules/, // Ignore changes to node_modules
    poll: 1000, // Check for changes every second
  },
};
