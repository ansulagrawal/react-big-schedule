const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/examples/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(svg|png|jpe?g|gif|woff|woff2|eot|ttf|otf|pdf)$/i,
        type: 'asset', // Use the asset module
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // Files smaller than 8 KB will be inlined as base64
          },
        },
        generator: {
          filename: 'assets/[name][ext][query]', // Control output path for assets
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/examples/index.html',
      favicon: './src/examples/assets/banner.png',
    }),
    new ESLintPlugin({
      emitError: true,
      emitWarning: false,
      failOnError: true,
      extensions: ['js', 'jsx'],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    historyApiFallback: true,
  },
  mode: 'development',
  devtool: 'source-map',
};
