const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const glob = require('glob-all');

// PostCSS plugin to remove bare tag selectors (e.g., h1, p, a, button)
const removeBareTagSelectors = () => {
  const bareTags = new Set([
    'html', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'button', 'input', 'select',
    'textarea', 'form', 'label', 'fieldset', 'legend', 'img', 'figure', 'figcaption',
    'blockquote', 'pre', 'code', 'small', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
    'hr', 'br', 'div', 'span', 'article', 'section', 'header', 'footer', 'nav', 'aside',
    'main', 'address', 'summary', 'details', 'progress', 'meter', 'mark', 'time', 'abbr',
  ]);

  return {
    postcssPlugin: 'remove-bare-tag-selectors',
    Rule(rule) {
      // Skip keyframes rules
      if (rule.parent?.type === 'atrule' && rule.parent?.name === 'keyframes') {
        return;
      }

      const selectors = rule.selectors.filter(selector => {
        // Remove selectors that are just bare tags or bare tags with pseudo-elements/classes
        const trimmed = selector.trim();
        // Match bare tags like "h3", "p", "a:hover", "button::-moz-focus-inner"
        const bareTagPattern = /^([a-z][a-z0-9]*)(:[:\w-]+)?$/i;
        const match = trimmed.match(bareTagPattern);
        if (match && bareTags.has(match[1].toLowerCase())) {
          return false; // Remove this selector
        }
        return true; // Keep this selector
      });

      if (selectors.length === 0) {
        rule.remove();
      } else {
        rule.selectors = selectors;
      }
    },
  };
};
removeBareTagSelectors.postcss = true;

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
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [removeBareTagSelectors],
              },
            },
          },
        ],
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
