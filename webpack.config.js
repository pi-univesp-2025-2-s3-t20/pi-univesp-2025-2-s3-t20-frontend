const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './src/script.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true,
    },
    devServer: {
      static: './dist',
      open: true,
      historyApiFallback: {
        rewrites: [
          { from: /^\/$/, to: '/index.html' },
          { from: /^\/login$/, to: '/login.html' },
        ],
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        filename: 'index.html',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'login.html'),
        filename: 'login.html',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'cadastro_pedido.html'),
        filename: 'cadastro_pedido.html',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'pedidos.html'),
        filename: 'pedidos.html',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'estoque.html'),
        filename: 'estoque.html',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'financeiro.html'),
        filename: 'financeiro.html',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'relatorios.html'),
        filename: 'relatorios.html',
        chunks: ['main'],
      }),
      new Dotenv({
        path: path.resolve(__dirname, '.env.production'),
        systemvars: true,
      }),
      new CopyPlugin({
        patterns: [
          { from: 'src/img', to: 'img' },
        ],
      }),
    ],
    mode: isProduction ? 'production' : 'development',
  };
};