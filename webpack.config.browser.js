var webpack = require('webpack');

module.exports = {
  entry: './index',
  output: {
    libraryTarget: 'umd',
    filename: 'workerpool.browser.js',
    path: __dirname + '/dist'
  },

  target: 'web',

  resolve: {
    extensions: ['.js', '.json']
  },
  node: {
    __dirname: false
  },
  externals: {
    child_process: 'commonjs child_process',
    os: 'commonjs os'
  },
  plugins: [
    new webpack.DefinePlugin({ '__PLATFORM__': JSON.stringify('browser') }),
    new webpack.LoaderOptionsPlugin({ debug: true })
  ],
  module: {
    rules: [

    ]
  },
};
