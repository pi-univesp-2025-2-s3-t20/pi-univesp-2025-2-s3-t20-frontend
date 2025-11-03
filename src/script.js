const API_BASE_URL = process.env.BASE_URL;
console.log('API Base URL:', API_BASE_URL);

document.addEventListener('DOMContentLoaded', () => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const path = window.location.pathname;

  if (!isAuthenticated && !path.endsWith('/login.html')) {
    window.location.href = 'login.html';
    return;
  }

  if (isAuthenticated && path.endsWith('/login.html')) {
    window.location.href = 'index.html';
    return;
  }

  if (path.endsWith('/login.html')) {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', handleLogin);
    }
  } else if (path.endsWith('/cadastro_pedido.html')) {
    const formProduto = document.getElementById('form-produto');
    if (formProduto) {
      formProduto.addEventListener('submit', handleCadastroProduto);
    }
  } else if (path.endsWith('/pedidos.html')) {
    carregarVendas();
  } else if (path.endsWith('/estoque.html')) {
    carregarEstoque();
  } else if (path.endsWith('/financeiro.html')) {
    carregarFinanceiro();
  } else if (path.endsWith('/relatorios.html')) {
    carregarRelatorios();
  }

  if (isAuthenticated) {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
      });
    }
  }
});

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const loginButton = e.target.querySelector('button[type="submit"]');
  const loader = document.getElementById('loader-overlay');

  loader.classList.remove('hidden');
  loginButton.disabled = true;

  try {
    const resposta = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (resposta.ok) {
      const data = await resposta.json();
      const token = data.token || data.accessToken;

      if (token) {
        localStorage.setItem('authToken', token);
        alert('Login realizado com sucesso!');
        window.location.href = 'index.html';
      } else {
        alert('Login bem-sucedido, mas o token de autenticação não foi recebido.');
      }
    } else {
      alert('Credenciais inválidas ou servidor recusou o login.');
    }
  } catch (erro) {
    console.error('Erro ao conectar com o servidor:', erro);
    alert('Erro ao conectar com o servidor. Verifique se a API está ativa.');
  } finally {
    loader.classList.add('hidden');
    loginButton.disabled = false;
  }
}

async function handleCadastroProduto(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const produto = Object.fromEntries(formData.entries());

  try {
    const resposta = await apiFetch('/produtos', { method: 'POST', body: JSON.stringify(produto) });

    if (resposta.status === 201) {
      alert('Produto cadastrado com sucesso!');
      e.target.reset();
    } else {
      const errorData = await resposta.json();
      alert(`Erro ao salvar produto: ${errorData.message || 'Verifique os dados ou o servidor.'}`);
    }
  } catch (erro) {
    console.error('Erro ao conectar com o servidor:', erro);
    alert('Erro ao conectar com o servidor.');
  }
}

async function carregarVendas() {
  const tabelaPedidos = $('#tabela-pedidos');
  const loader = $('#loader-overlay');
  if (!tabelaPedidos.length || !loader.length) { if(loader.length) loader.addClass('hidden'); return; }

  try {
    const resposta = await apiFetch('/vendas');
    if (!resposta.ok) {
      throw new Error('Falha ao carregar vendas');
    }
    const vendas = await resposta.json();
    
    const table = tabelaPedidos.DataTable({
      data: vendas,
      columns: [
        { data: 'idVenda' },
        { data: 'data', render: (data) => new Date(data).toLocaleDateString() },
        { data: 'cliente.nomeCliente' },
        { data: 'produto.produto' },
        { data: 'quantidade' },
        { data: 'precoUnitario', render: (data) => data.toFixed(2) },
        { data: 'formaPagamento.formaPagamento' },
        { data: 'receitaTotal', render: (data) => data.toFixed(2) }
      ],
      destroy: true,
      language: { url: '//cdn.datatables.net/plug-ins/2.0.8/i18n/pt-BR.json' }
    });
  } catch (erro) {
    tabelaPedidos.find('tbody').html('<tr><td colspan="8">Erro ao carregar vendas.</td></tr>');
    console.error('Erro ao carregar vendas:', erro);
  } finally {
    loader.addClass('hidden');
  }
}

/**
 * Função auxiliar para fazer requisições à API, incluindo o token de autenticação.
 * @param {string} endpoint - O endpoint da API (ex: '/vendas').
 * @param {object} options - As opções da requisição fetch (method, body, etc.).
 * @returns {Promise<Response>}
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
}

async function carregarEstoque() {
  const tabelaEstoque = $('#tabela-estoque');
  const loader = $('#loader-overlay');
  if (!tabelaEstoque.length || !loader.length) { if(loader.length) loader.addClass('hidden'); return; }

  try {
    const resposta = await apiFetch('/produtos');
    if (!resposta.ok) {
      throw new Error('Falha ao carregar produtos');
    }
    const produtos = await resposta.json();

    tabelaEstoque.DataTable({
      data: produtos,
      columns: [
        { data: 'produto' },
        { data: 'categoria' },
        { data: 'custoUnitario', render: (data) => data ? data.toFixed(2) : 'N/A' },
        { data: 'precoSugerido', render: (data) => data ? data.toFixed(2) : 'N/A' },
        { data: 'pedidoMinimo', render: (data) => data || 'N/A' },
        { data: 'centoPreco', render: (data) => data ? data.toFixed(2) : 'N/A' }
      ],
      destroy: true,
      language: { url: '//cdn.datatables.net/plug-ins/2.0.8/i18n/pt-BR.json' }
    });
  } catch (erro) {
    tabelaEstoque.find('tbody').html('<tr><td colspan="6">Erro ao carregar produtos do estoque.</td></tr>');
    console.error('Erro ao carregar estoque:', erro);
  } finally {
    loader.addClass('hidden');
  }
}

async function carregarFinanceiro() {
  const resumoDiv = document.getElementById('resumo');
  const loader = document.getElementById('loader-overlay');
  if (!resumoDiv || !loader) { if(loader) loader.classList.add('hidden'); return; }

  try {
    const resposta = await apiFetch('/vendas/resumo');
    if (!resposta.ok) {
      throw new Error('Falha ao carregar resumo financeiro');
    }
    const resumo = await resposta.json();

    resumoDiv.innerHTML = `
      <p><strong>Receita Total:</strong> R$ ${resumo.receitaTotal.toFixed(2)}</p>
      <p><strong>Total de Vendas:</strong> ${resumo.totalVendas}</p>
    `;
  } catch (erro) {
    resumoDiv.innerHTML = '<p>Erro ao carregar o resumo financeiro.</p>';
    console.error('Erro ao carregar financeiro:', erro);
  } finally {
    loader.classList.add('hidden');
  }
}

async function carregarRelatorios() {
  const tabelaRelatorios = $('#tabela-relatorios');
  const loader = $('#loader-overlay');
  if (!tabelaRelatorios.length || !loader.length) { if(loader.length) loader.addClass('hidden'); return; }

  try {
    const resposta = await apiFetch('/vendas');
    if (!resposta.ok) {
      throw new Error('Falha ao carregar relatórios');
    }
    const vendas = await resposta.json();

    tabelaRelatorios.DataTable({
      data: vendas,
      columns: [
        { data: 'data', render: (data) => new Date(data).toLocaleDateString() },
        { data: 'idVenda' },
        { data: 'cliente.nomeCliente' },
        { data: 'produto.produto' },
        { data: 'receitaTotal', render: (data) => data.toFixed(2) }
      ],
      destroy: true,
      language: { url: '//cdn.datatables.net/plug-ins/2.0.8/i18n/pt-BR.json' }
    });
  } catch (erro) {
    tabelaRelatorios.find('tbody').html('<tr><td colspan="5">Erro ao carregar relatórios.</td></tr>');
    console.error('Erro ao carregar relatórios:', erro);
  } finally {
    loader.addClass('hidden');
  }
}