const { merge } = require('webpack-merge')
const express = require('express')
const cookieParser = require('cookie-parser')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const common = require('./webpack.common')
const atvRoutes = require('./server/routes')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
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
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/robots.txt', to: 'robots.txt' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
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
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
})
