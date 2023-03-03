const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: {
    node: './source/index-node.js',
  },
  output: {
    path: path.resolve(__dirname, 'packages'),
    filename: '[name]/dist/index.js',
    globalObject: 'this',
    libraryTarget: 'umd'
  },
  mode: 'production',
  module: {
    rules: []
  },
  externals: {
    'fs': 'fs',
    'canvas': 'canvas',
    'sqlite3': 'sqlite3',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: __dirname + '/source/mold',
          to: __dirname + '/packages/node/dist/mold'
        },
        {
          from: __dirname + '/source/config',
          to: __dirname + '/packages/node/dist/config'
        },
        {
          from: __dirname + '/source/types',
          to: __dirname + '/packages/node/dist/types'
        },
      ]
    })
  ]
}

module.exports = config