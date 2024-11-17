const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup.js',
    background: './src/background.js',
    classifier: './src/classifier.js',
    search: './src/search.js',
    content: './src/content.js',
    offscreen: './src/offscreen.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [{
        test: /\.wasm$/,
        type: 'asset/resource'
    }]
  },
  experiments: {
      asyncWebAssembly: true
  },
  plugins: [
      new CopyPlugin({
          patterns: [
              { from: "public" },
              { 
                  from: 'node_modules/onnxruntime-web/dist/*.wasm',
                  to: '[name][ext]'
              },
              { from: 'src/offscreen.html', to: 'offscreen.html' }
          ]
      }),
      new Dotenv()
  ]
};