Projeto PI Front-end — Gestão e Controle de Estoque
Aplicação web desenvolvida em HTML, CSS e JavaScript puro, com integração a uma API backend para controle de produtos, pedidos, estoque, financeiro e relatórios.

 Autenticação
• 	Tela de login com verificação via API.

🔗 Integração com Backend
O frontend consome dados de uma API REST para todas as operações. A URL da API é configurada via variáveis de ambiente.

---

🛠️ Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd pi-univesp-2025-2-s3-t20-frontend
    ```

2.  **Instale as dependências:**
    É necessário ter o [Node.js](https://nodejs.org/) instalado.
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Renomeie o arquivo `.env.example` para `.env`.
    - Altere o valor de `BASE_URL` para o endereço da sua API backend (ex: `https://protestant-amberly-univesp-pi-2025-s2-832c3de0.koyeb.app`).

4.  **Execute em modo de desenvolvimento:**
    Este comando iniciará um servidor de desenvolvimento (geralmente em `http://localhost:8080`) com recarregamento automático.
    ```bash
    npm start
    ```

5.  **Compile para produção:**
    Este comando gera os arquivos otimizados para produção na pasta `dist/`.
    ```bash
    npm run build
    ```

---

📚 Tecnologias
• 	HTML5
• 	CSS3
• 	JavaScript (ES6)
• 	Fetch API
• 	Webpack
• 	DataTables.net

📞 **SUPORTE**  
Para dúvidas ou melhorias, entre em contato com o desenvolvedores responsáveis.
