module.exports = {
  entry: './index',
  output: {
    libraryTarget: 'umd',
    filename: 'workerpool.browser.js',
    path: __dirname + '/dist'
  },

  target: 'web',

  resolve: {
    extensions: ['.js']
  },
  node: {
    __dirname: false
  },

  module: {
    rules: [

    ]
  },
};
