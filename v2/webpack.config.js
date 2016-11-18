const path = require('path');

const config = {
  entry: './src/hound.js',

  output: {
    filename: 'hound.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'houndjs',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js)$/,
        use: [
          {
            loader: 'eslint-loader',
            options: {
              exclude: /node_modules/,
              cache: true
            }
          }
        ]
      },
      {
        test: /\.(js)$/,
        use: 'babel-loader'
      }
    ]
  },

  externals: {
    'form-data': 'form-data',
    'base-64': 'base-64'
  }
};

module.exports = config;
