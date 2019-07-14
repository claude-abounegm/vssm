const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/StateMachine.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    }
};