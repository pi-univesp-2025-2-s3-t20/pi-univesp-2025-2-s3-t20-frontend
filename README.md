# Projeto PI Front-end — Gestão e Controle de Estoque

Aplicação web desenvolvida em HTML, CSS e JavaScript puro, com integração a uma API backend para controle de produtos, pedidos, estoque, financeiro e relatórios.

Este projeto utiliza **Webpack** para empacotamento de módulos, gerenciamento de dependências e para fornecer um servidor de desenvolvimento moderno.

## 📚 Tecnologias

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Node.js & npm**: Para gerenciamento de dependências e execução de scripts.
- **Webpack**: Para o build do projeto e servidor de desenvolvimento (`webpack-dev-server`).
- **Fetch API**: Para comunicação com o backend REST.

## 🛠️ Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento.

### 1. Clone o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd pi-univesp-2025-2-s3-t20-frontend
```

### 2. Instale as Dependências
Com o Node.js e o npm instalados, execute o comando abaixo na raiz do projeto para instalar as dependências do Webpack e outros pacotes necessários.
```bash
npm install
```

### 3. Configure as Variáveis de Ambiente
O projeto utiliza arquivos `.env` para gerenciar a URL da API.

1.  **Crie o arquivo de desenvolvimento:** Na raiz do projeto, crie um arquivo chamado `.env` e adicione a URL da sua API local.
    ```
    # .env
    API_BASE_URL=http://localhost:3000
    ```

2.  **Crie o arquivo de produção:** Crie um segundo arquivo chamado `.env.production` e adicione a URL da sua API de produção.
    ```
    # .env.production
    API_BASE_URL=https://sua-api-de-producao.com
    ```
> **Nota:** Esses arquivos não são enviados para o repositório (`.gitignore`) por segurança. Em ambientes de deploy como o Netlify, essas variáveis devem ser configuradas na interface da plataforma.

### 4. Execute o Servidor de Desenvolvimento
Para iniciar o projeto em modo de desenvolvimento, use o script `start`. Ele iniciará um servidor local (geralmente em `http://localhost:8080`) com live-reload.
```bash
npm start
```

### Outros Scripts Disponíveis

- **Build para Produção:** Para gerar os arquivos otimizados para produção na pasta `dist`.
  ```bash
  npm run build
  ```

- **Rodar localmente com API de Produção:** Para testar o front-end localmente conectado à API de produção.
  ```bash
  npm run start:prd
  ```

## 📞 SUPORTE
Para dúvidas ou melhorias, entre em contato com o desenvolvedores responsáveis.
