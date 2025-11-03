const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  // Define o caminho para o arquivo .env
  // Em produção, as variáveis virão do ambiente do servidor.
  // Localmente, usaremos .env.production.
  const envPath = isProduction ? null : path.resolve(__dirname, '.env.production');

  return {
    // Ponto de entrada da sua aplicação
    entry: {
      main: './src/script.js',
    },
    // Onde o Webpack colocará os arquivos empacotados
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js', // Usa hash para cache busting
      clean: true, // Limpa o diretório 'dist' antes de cada build
    },
    devServer: {
      static: './dist',
      open: true, // Abre o navegador automaticamente
      // Redireciona requisições não encontradas para a página principal
      historyApiFallback: {
        rewrites: [
          { from: /^\/$/, to: '/index.html' },
          { from: /^\/login$/, to: '/login.html' },
        ],
      },
    },
    plugins: [
      // Gera o index.html com o script injetado
      new HtmlWebpackPlugin({
        template: './src/index.html', // Seu template HTML
        filename: 'index.html',
        chunks: ['main'],
      }),
      // Gera o login.html com o script injetado
      new HtmlWebpackPlugin({
        template: './src/login.html', // Seu template de login
        filename: 'login.html',
        chunks: ['main'],
      }),
      // Carrega as variáveis de ambiente
      new Dotenv({
        path: envPath, // Caminho para o arquivo .env
        systemvars: true, // Permite que variáveis de ambiente do sistema sobrescrevam as do .env
      }),
    ],
    mode: isProduction ? 'production' : 'development',
  };
};