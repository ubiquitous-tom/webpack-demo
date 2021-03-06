const path = require('path')
const { ProvidePlugin } = require('webpack')
// const {EnvironmentPlugin } = require('webpack')
const DotenvWebpack = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const TerserWebpackPlugin = require('terser-webpack-plugin')
// const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const NodeJsonMinify = require('node-json-minify')
const cookieParser = require('cookie-parser')
const express = require('express')
const atvRoutes = require('./server/routes')
// const lang = require('./server/routes/lang')

module.exports = function (env) {
  return {
    mode: env.production ? 'production' : 'development',
    entry: {
      index: './src/app.js',
    },
    output: {
      filename: '[name].[hash].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    resolve: {
      alias: {
        // add as many aliases as you like!
        img: path.resolve(__dirname, './src/assets/images'),
        // font: path.resolve(__dirname, './src/assets/fonts'),
        core: path.resolve(__dirname, './src/core'),
        shared: path.resolve(__dirname, './src/shared/components'),
        components: path.resolve(__dirname, './src/components'),
        routers: path.resolve(__dirname, './src/routers'),
        // models: path.resolve(__dirname, './src/models'),
        // views: path.resolve(__dirname, './src/views'),
      },
    },
    devtool: env.production ? 'source-map' : 'cheap-module-eval-source-map',
    devServer: {
      static: './dist',
      hot: true,
      compress: true,
      host: 'localhost',
      port: 3000,
      onBeforeSetupMiddleware: (devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined')
        }
        devServer.app.use(cookieParser())
        devServer.app.use(express.json())
        devServer.app.use(express.urlencoded({
          extended: true,
        }))
        devServer.app.use('/', atvRoutes)
      },
    },
    plugins: [
      new DotenvWebpack({
        // path: './.env',
        safe: true,
        systemvars: true,
      }),
      new HtmlWebpackPlugin({
        // title: 'Acorn TV',
        filename: 'index.html',
        template: './public/index.html',
        favicon: './src/assets/images/favicon.ico',
        minify: {
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        },
      }),
      new HtmlWebpackPlugin({
        // title: 'Acorn TV',
        filename: 'index.jsp',
        template: './public/index.html',
        favicon: './src/assets/images/favicon.ico',
        minify: {
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        },
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
        chunkFilename: '[id].css',
        ignoreOrder: false,
      }),
      new ESLintWebpackPlugin(),
      new CleanWebpackPlugin({
        verbose: true,
        cleanOnceBeforeBuildPatterns: ['**/*', '!manifest.json'],
      }),
      new ProvidePlugin({
        jQuery: 'jquery',
        $: 'jquery',
        // jquery: 'jquery',
        // _: 'underscore',
        // Backbone: 'backbone',
      }),

      // new EnvironmentPlugin({

      // }),
      // new webpack.DefinePlugin({
      //   'process.env': JSON.stringify(process.env)
      // }),

      new CopyWebpackPlugin({
        patterns: [
          // { from: 'src/assets/fonts', to: 'font' },
          // { from: 'src/assets/images', to: 'img' },
          // { from: 'src/assets/images/atvlogo.png', to: 'img' },
          // { from: 'public/lang.json', to: 'lang.json' },
          {
            from: 'public/lang.json',
            transform: (content) => (NodeJsonMinify(content.toString())),
            to: 'lang.json',
          },
        ],
      }),

      // // https://stackoverflow.com/questions/44232366/how-do-i-build-a-json-file-with-webpack/54700817
      // new WebpackManifestPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.js$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          // include: path.resolve(__dirname, 'src'),
          use: [
            env.production ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'postcss-preset-env',
                    'autoprefixer',
                  ],
                },
              },
            },
          ],
        },
        { test: /\.less$/i, loaders: ['style-loader', 'css-loder', 'less-loader'] },
        {
          test: /\.s[ac]ss$/i,
          // include: path.resolve(__dirname, 'src'),
          use: [
            env.production ? MiniCssExtractPlugin.loader : { loader: 'style-loader' /* inject CSS to page */ },
            { loader: 'css-loader' /* translates CSS into CommonJS modules */ },
            {
              loader: 'postcss-loader', // Run postcss actions
              options: {
                // plugins: function () { // postcss plugins, can be exported to postcss.config.js
                //   return [
                //     require('autoprefixer')
                //   ]
                // }
                postcssOptions: {
                  plugins: [
                    'postcss-preset-env',
                    'autoprefixer',
                  ],
                },
              },
            },
            { loader: 'sass-loader' /* compiles Sass to CSS */ },
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/i,
          use: [
            { loader: 'url-loader', options: { limit: 8192 /* in bytes */ } },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          use: [
            { loader: 'url-loader', options: { limit: 8192 /* in bytes */ } },
          ],
        },
        // { test: /bootstrap\/dist\/js\/umd\//, loader: 'imports?jQuery=jquery' }
        { test: /\.(htm|html)$/i, use: ['html-loader'] },
        { test: /\.(hbs)$/i, use: ['handlebars-loader'] },
      ],
    },
    optimization: {
      // runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
      // // production only
      // minimize: true,
      // minimizer: [
      //   new TerserWebpackPlugin({
      //     minify: TerserWebpackPlugin.uglifyJsMinify,
      //     terserOptions: {
      //       drop_console: env.production ? true : false,
      //       drop_debugger: env.production ? true : false,
      //     }
      //   })
      // ]
    },
  }
}
