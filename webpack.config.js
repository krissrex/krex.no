const glob = require('glob');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const entries = glob.sync(path.resolve(__dirname, 'src/assets/images/posts/*.{png,gif,jpg,jpeg}'));

let cssFileName = 'styles/[name].css';

if (process.env.NODE_ENV === 'production') {
  cssFileName = 'styles/[name].[contenthash].css';
}

module.exports = {
  mode: 'development',
  entry: entries,
  output: {
    path: path.resolve(__dirname, '_site/assets'),
    publicPath: '/assets/',
  },
  optimization: {
    moduleIds: 'deterministic',
  },
  watchOptions: {
    ignored: ['**/node_modules', 'src/_includes/layouts/webpack.ejs'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, 'public'), to: path.resolve(__dirname, '_site') }],
    }),
    new HtmlBundlerPlugin({
      entry: [
        {
          import: './webpack.html',
          filename: '../../../src/_includes/layouts/webpack.ejs',
          data: {},
        },
      ],
      watchFiles: {
        excludes: [/.*\/webpack\.ejs$/],
      },
      minify: 'auto',
      js: {},
      css: {
        filename: cssFileName,
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['css-loader', 'postcss-loader'],
      },
      {
        test: /\.(gif|png|jpg|jpeg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/posts/[name].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 80,
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                optimizationLevel: 3, // 0-7
              },
              pngquant: {
                quality: [0.7, 1],
                speed: 4,
              },
              gifsicle: {
                interlaced: true,
              },
            },
          },
        ],
      },
    ],
  },
};
