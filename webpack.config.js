const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './src/script.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].[contenthash].js',
      publicPath: '/', // Garante que os caminhos dos assets sejam absolutos
      clean: true,
    },
    cache: false, // Desabilita o cache para forçar a releitura dos arquivos
    optimization: {
      minimize: false,
    },
    devServer: {
      static: './dist',
      open: true,
      historyApiFallback: true, // Habilita o fallback para todas as rotas
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        filename: 'index.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'login.html'),
        filename: 'login.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'cadastro_produto.html'),
        filename: 'cadastro_produto.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'cadastro_pedido.html'),
        filename: 'cadastro_pedido.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'pedidos.html'),
        filename: 'pedidos.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'estoque.html'),
        filename: 'estoque.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'financeiro.html'),
        filename: 'financeiro.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'relatorios.html'),
        filename: 'relatorios.html',
        inject: 'body',
        minify: {
          removeRedundantAttributes: false,
        },
        publicPath: '/',
        chunks: ['main'],
      }),
      new Dotenv({
        // Carrega .env.production apenas em desenvolvimento local
        path: !isProduction ? path.resolve(__dirname, '.env.production') : undefined,
        systemvars: true, // Permite que variáveis do sistema (Netlify) tenham prioridade
      }),
      new CopyPlugin({
        patterns: [
          { from: 'src/img', to: 'img' },
        ],
      }),
      new CopyPlugin({
        patterns: [
          { from: 'serve.json', to: 'serve.json' },
        ],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    mode: isProduction ? 'production' : 'development',
  };
};