const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        library: {
            type: 'umd',
            name: 'add',
        },
        // prevent error: `Uncaught ReferenceError: self is not define`
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimizer: [
            new TerserPlugin()
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            util: require.resolve("util/")
        }
    }
};
