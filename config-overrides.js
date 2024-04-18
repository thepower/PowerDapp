const { addExternalBabelPlugin, override } = require('customize-cra');
const webpack = require('webpack');

function myOverrides(config, env) {
  config.resolve.fallback = {
    buffer: require.resolve('buffer'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    vm: require.resolve('vm-browserify'),
    util: require.resolve('util'),
    fs: false,
    path: false,
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  return config;
}

module.exports = override(
  myOverrides,
  addExternalBabelPlugin([
    '@babel/plugin-syntax-import-attributes',
    { deprecatedAssertSyntax: true },
  ]),
);
