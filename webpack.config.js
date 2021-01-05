const path = require('path');

module.exports = {
    mode: 'production',
    entry: './views/js/main.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'release.js'
    }
};