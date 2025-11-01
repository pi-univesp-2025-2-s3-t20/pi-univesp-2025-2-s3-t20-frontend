// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

// Nomes dos arquivos HTML que você tem na pasta src
const htmlFiles = [
  'index', 'login', 'cadastro_pedido', 'estoque', 
  'financeiro', 'pedidos', 'relatorios'
];

module.exports = {
  // O modo será definido pelo script no package.json
  mode: 'development',

  // Pontos de entrada: Webpack começará a empacotar a partir daqui
  entry: {
    main: path.resolve(__dirname, 'src', 'script.js'), // Ponto de entrada principal com caminho absoluto
  },

  // Configuração do servidor de desenvolvimento
  devServer: {
    static: './dist', // Pasta que o servidor irá servir
    port: 8080, // Porta do servidor de dev
    open: 'login.html', // Abre esta página ao iniciar
    hot: true, // Habilita live-reload
  },

  // Onde o Webpack colocará os arquivos empacotados
  output: {
    filename: '[name].bundle.js', // ex: login.bundle.js, index.bundle.js
    path: path.resolve(__dirname, 'dist'), // Pasta de saída 'dist'
    clean: true, // Limpa a pasta 'dist' antes de cada build
  },

  // Plugins
  plugins: [
    // Plugin para carregar as variáveis de ambiente
    new Dotenv({
      // Carrega o arquivo .env apropriado para o ambiente local
      path: `./.env${process.env.NODE_ENV === 'production' ? '.production' : ''}`,
      // Permite que variáveis de ambiente do sistema (como as do Netlify) sobrescrevam as dos arquivos .env
      systemvars: true
    }),

    // Gera os arquivos HTML na pasta 'dist' automaticamente
    ...htmlFiles.map(file => 
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', `${file}.html`), // Usando caminho absoluto para o template
        filename: `${file}.html`,      // Arquivo de destino
        chunks: ['main'],              // Injeta o bundle 'main.bundle.js' em todos os HTMLs
      })
    )
  ],
  
  // Otimização para separar código de vendors (bibliotecas) se necessário no futuro
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
