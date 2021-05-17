// const HtmlWebpackPlugin = require("html-webpack-plugin")
// const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');

// module.exports = {
//     plugins: [
//         new HtmlWebpackPlugin(),
//         new PreloadWebpackPlugin({})
//     ]
// };

module.exports = {
    externals: [/node_modules/, 'bufferutil', 'utf-8-validate'],
};