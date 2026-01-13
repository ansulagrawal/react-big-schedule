const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist-webpack'),
    filename: 'index.js',
    library: {
      name: 'MakulaSchedule',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
    clean: true,
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
    'react-dnd': {
      commonjs: 'react-dnd',
      commonjs2: 'react-dnd',
      amd: 'react-dnd',
      root: 'ReactDnD',
    },
    'react-dnd-html5-backend': {
      commonjs: 'react-dnd-html5-backend',
      commonjs2: 'react-dnd-html5-backend',
      amd: 'react-dnd-html5-backend',
      root: 'ReactDnDHTML5Backend',
    },
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
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/style.css',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
