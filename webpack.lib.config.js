const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const glob = require('glob-all');

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
    new PurgeCSSPlugin({
      paths: glob.sync([
        path.join(__dirname, 'src/**/*.{js,jsx}'),
      ], { nodir: true }),
      safelist: {
        // Only keep antd classes for components actually used in the library:
        // Popover, Calendar, Col, Row, Radio, Space, Spin
        deep: [
          /ant-popover/,
          /ant-picker/,    // Calendar uses picker
          /ant-radio/,
          /ant-spin/,
          /ant-space/,
          /ant-row/,
          /ant-col/,
          /ant-slide/,     // Popover animations
          /ant-zoom/,      // Popover animations
        ],
      },
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
