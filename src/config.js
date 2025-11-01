// O valor é injetado pelo Webpack a partir do arquivo .env durante o build.
// Atribuímos a uma variável global (window) para que fique acessível nos scripts inline dos HTMLs.
window.API_BASE_URL = process.env.API_BASE_URL;