// Warning: this configuration is only
// used while testing, the real compilation
// is made with raw typescript command
// (see package.json)

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
};
