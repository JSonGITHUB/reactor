module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react'] // no "runtime: 'automatic'" because React 16 uses classic JSX transform
    ],
};