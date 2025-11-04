import './style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Importa jQuery e DataTables
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import ptBR from 'datatables.net-plugins/i18n/pt-BR.mjs';

const API_BASE_URL = process.env.BASE_URL;
console.log('API Base URL:', API_BASE_URL);

document.addEventListener('DOMContentLoaded', () => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const path = window.location.pathname;

  const isLoginPage = path.includes('/login');

  // Se não estiver autenticado e não estiver na página de login, redireciona para o login.
  if (!isAuthenticated && !isLoginPage) {
    window.location.href = 'login.html';
    return;
  }

  // Se estiver autenticado e tentar acessar a página de login, redireciona para o index.
  if (isAuthenticated && isLoginPage) { 
    window.location.href = 'index.html';
    return;
  }

  if (isLoginPage) {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', handleLogin);
    }
  } else if (path.includes('/cadastro_produto')) {
    const formProduto = document.getElementById('form-produto');
    if (formProduto) {
      formProduto.addEventListener('submit', handleCadastroProduto);
      verificarModoEdicaoProduto(); // Verifica se está em modo de edição
    }
  } else if (path.includes('/cadastro_pedido')) {
    const formPedido = document.getElementById('form-pedido');
    if (formPedido) {
      formPedido.addEventListener('submit', handleCadastroPedido);
      carregarClientesParaDropdown();
      carregarProdutosParaDropdown();
      carregarFormasPagamentoParaDropdown();
      verificarModoEdicaoPedido();
    }
  } else if (path.includes('/estoque')) {
    carregarEstoque();
  } else if (path.includes('/financeiro')) {
    carregarFinanceiro();
  } else if (path.includes('/pedidos')) {
    carregarVendas();
  } else if (path.includes('/relatorios')) {
    carregarRelatorios();
  }

  if (isAuthenticated && !isLoginPage) {
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

async function handleCadastroPedido(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData.entries());

  const urlParams = new URLSearchParams(window.location.search);
  const pedidoId = urlParams.get('id');

  const method = pedidoId ? 'PUT' : 'POST';
  const endpoint = pedidoId ? `/vendas/${pedidoId}` : '/vendas';

  const submitButton = document.getElementById('btn-salvar');
  const loader = document.getElementById('loader-overlay');

  loader.classList.remove('hidden'); // Mostra o loader
  submitButton.disabled = true;

  // Monta o objeto 'pedido' conforme a especificação da API (VendaDTO)
  const pedido = {
    clienteId: parseInt(formProps.clienteId, 10),
    produtoId: parseInt(formProps.produtoId, 10),
    formaPagamentoId: parseInt(formProps.formaPagamentoId, 10),
    data: formProps.data, // A API espera uma string 'YYYY-MM-DD'
    quantidade: parseInt(formProps.quantidade, 10),
    precoUnitario: parseFloat(formProps.precoUnitario)
  };
  try {
    const resposta = await apiFetch(endpoint, { method, body: JSON.stringify(pedido) });

    if (resposta.ok) {
      alert(`Pedido ${pedidoId ? 'atualizado' : 'cadastrado'} com sucesso!`);
      window.location.href = 'pedidos.html';
    } else {
      const errorData = await resposta.json();
      alert(`Erro ao salvar pedido: ${errorData.message || 'Verifique os dados ou o servidor.'}`);
    }
  } catch (erro) {
    console.error('Erro ao cadastrar pedido:', erro);
    alert('Erro ao conectar com o servidor.');
  } finally {
    loader.classList.add('hidden'); // Esconde o loader
    submitButton.disabled = false;
  }
}

async function handleCadastroProduto(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const produto = Object.fromEntries(formData.entries());
  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get('id');

  const method = produtoId ? 'PUT' : 'POST';
  const endpoint = produtoId ? `/produtos/${produtoId}` : '/produtos';

  // Converte os valores para os tipos corretos que a API espera
  produto.custoUnitario = parseFloat(produto.custoUnitario) || null;
  produto.precoSugerido = parseFloat(produto.precoSugerido) || null;
  produto.pedidoMinimo = parseInt(produto.pedidoMinimo, 10) || null;
  produto.centoPreco = parseFloat(produto.centoPreco) || null;

  const submitButton = document.getElementById('btn-salvar');
  const loader = document.getElementById('loader-overlay');

  loader.classList.remove('hidden');
  submitButton.disabled = true;

  try {
    const resposta = await apiFetch(endpoint, { method, body: JSON.stringify(produto) });

    if (resposta.ok) {
      alert(`Produto ${produtoId ? 'atualizado' : 'cadastrado'} com sucesso!`);
      window.location.href = 'estoque.html';
    } else {
      const errorData = await resposta.json();
      alert(`Erro ao salvar produto: ${errorData.message || 'Verifique os dados ou o servidor.'}`);
    }
  } catch (erro) {
    console.error('Erro ao conectar com o servidor:', erro);
    alert('Erro ao conectar com o servidor.');
  } finally {
    loader.classList.add('hidden');
    submitButton.disabled = false;
  }
}

async function verificarModoEdicaoProduto() {
  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get('id');

  if (produtoId) {
    document.getElementById('titulo-formulario').textContent = 'Editar Produto';
    document.getElementById('btn-salvar').textContent = 'Atualizar Produto';

    try {
      const resposta = await apiFetch(`/produtos/${produtoId}`);
      if (!resposta.ok) {
        throw new Error('Produto não encontrado.');
      }
      const produto = await resposta.json();

      // Preenche o formulário com os dados do produto
      document.getElementById('produto').value = produto.produto || '';
      document.getElementById('categoria').value = produto.categoria || '';
      document.getElementById('custoUnitario').value = produto.custoUnitario || '';
      document.getElementById('precoSugerido').value = produto.precoSugerido || '';
      document.getElementById('pedidoMinimo').value = produto.pedidoMinimo || '';
      document.getElementById('centoPreco').value = produto.centoPreco || '';

    } catch (erro) {
      console.error('Erro ao buscar dados do produto para edição:', erro);
      alert('Não foi possível carregar os dados do produto. Você será redirecionado.');
      window.location.href = 'estoque.html';
    }
  }
}

async function verificarModoEdicaoPedido() {
  const urlParams = new URLSearchParams(window.location.search);
  const pedidoId = urlParams.get('id');

  if (pedidoId) {
    document.getElementById('titulo-formulario').textContent = 'Editar Pedido';
    document.getElementById('btn-salvar').textContent = 'Atualizar Pedido';

    const loader = document.getElementById('loader-overlay');
    loader.classList.remove('hidden');

    try {
      // Aguarda o carregamento dos dropdowns antes de selecionar os valores
      await Promise.all([
        carregarClientesParaDropdown(),
        carregarProdutosParaDropdown(),
        carregarFormasPagamentoParaDropdown()
      ]);

      const resposta = await apiFetch(`/vendas/${pedidoId}`);
      if (!resposta.ok) throw new Error('Pedido não encontrado.');
      
      const pedido = await resposta.json();

      // Preenche o formulário
      document.getElementById('clienteId').value = pedido.cliente.id;
      document.getElementById('produtoId').value = pedido.produto.id;
      document.getElementById('formaPagamentoId').value = pedido.formaPagamento.id;
      document.getElementById('data').value = pedido.data;
      document.getElementById('quantidade').value = pedido.quantidade;
      document.getElementById('precoUnitario').value = pedido.precoUnitario;

    } catch (erro) {
      console.error('Erro ao buscar dados do pedido para edição:', erro);
      alert('Não foi possível carregar os dados do pedido. Você será redirecionado.');
      window.location.href = 'pedidos.html';
    } finally {
      loader.classList.add('hidden');
    }
  }
}

async function carregarClientesParaDropdown() {
  const selectCliente = document.getElementById('clienteId');
  if (!selectCliente) {
    console.warn('Elemento select para clientes não encontrado.');
    return;
  }

  try {
    const resposta = await apiFetch('/clientes');
    if (!resposta.ok) {
      throw new Error('Falha ao carregar clientes');
    }
    const clientes = await resposta.json();

    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.textContent = cliente.nomeCliente;
      selectCliente.appendChild(option);
    });
  } catch (erro) {
    console.error('Erro ao carregar clientes para o dropdown:', erro);
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Erro ao carregar clientes';
    selectCliente.appendChild(option);
    selectCliente.disabled = true;
  }
}

async function carregarProdutosParaDropdown() {
  const selectProduto = document.getElementById('produtoId');
  if (!selectProduto) {
    console.warn('Elemento select para produtos não encontrado.');
    return;
  }

  try {
    const resposta = await apiFetch('/produtos');
    if (!resposta.ok) {
      throw new Error('Falha ao carregar produtos');
    }
    const produtos = await resposta.json();

    produtos.forEach(produto => {
      const option = document.createElement('option');
      option.value = produto.id;
      option.textContent = produto.produto;
      selectProduto.appendChild(option);
    });
  } catch (erro) {
    console.error('Erro ao carregar produtos para o dropdown:', erro);
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Erro ao carregar produtos';
    selectProduto.appendChild(option);
    selectProduto.disabled = true;
  }
}

async function carregarFormasPagamentoParaDropdown() {
  const selectFormaPagamento = document.getElementById('formaPagamentoId');
  if (!selectFormaPagamento) {
    console.warn('Elemento select para formas de pagamento não encontrado.');
    return;
  }

  try {
    const resposta = await apiFetch('/formas-pagamento');
    if (!resposta.ok) {
      throw new Error('Falha ao carregar formas de pagamento');
    }
    const formasPagamento = await resposta.json();

    formasPagamento.forEach(forma => {
      const option = document.createElement('option');
      option.value = forma.id;
      option.textContent = forma.formaPagamento;
      selectFormaPagamento.appendChild(option);
    });
  } catch (erro) {
    console.error('Erro ao carregar formas de pagamento para o dropdown:', erro);
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Erro ao carregar formas de pagamento';
    selectFormaPagamento.appendChild(option);
    selectFormaPagamento.disabled = true;
  }
}

async function carregarVendas() {
  const tabelaPedidos = $('#tabela-pedidos');
  const loader = $('#loader-overlay');
  if (!tabelaPedidos.length || !loader.length) {
    if(loader.length) loader.addClass('hidden');
    return;
  }
  loader.removeClass('hidden'); // Show the loader

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
        { data: 'receitaTotal', render: (data) => data.toFixed(2) },
        {
          data: 'id',
          render: function (data, type, row) {
            return `<a href="cadastro_pedido?id=${data}" class="btn-acao btn-editar">Editar</a>`;
          }
        }
      ],
      destroy: true,
      language: ptBR
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
  if (!tabelaEstoque.length || !loader.length) {
    if(loader.length) loader.addClass('hidden');
    return;
  }
  loader.removeClass('hidden'); // Show the loader

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
        { data: 'centoPreco', render: (data) => data ? data.toFixed(2) : 'N/A' },
        {
          data: 'id',
          render: function (data, type, row) {
            return `<a href="cadastro_produto?id=${data}" class="btn-acao">Editar</a>`;
          }
        }
      ],
      destroy: true,
      language: ptBR
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
  const loader = $('#loader-overlay');
  if (!resumoDiv || !loader.length) {
    if(loader.length) loader.addClass('hidden');
    return;
  }
  loader.removeClass('hidden'); // Show the loader

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
    loader.addClass('hidden');
  }
}

async function carregarRelatorios() {
  const tabelaRelatorios = $('#tabela-relatorios');
  const loader = $('#loader-overlay');
  if (!tabelaRelatorios.length || !loader.length) {
    if(loader.length) loader.addClass('hidden');
    return;
  }
  loader.removeClass('hidden'); // Show the loader

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
      language: ptBR
    });
  } catch (erro) {
    tabelaRelatorios.find('tbody').html('<tr><td colspan="5">Erro ao carregar relatórios.</td></tr>');
    console.error('Erro ao carregar relatórios:', erro);
  } finally {
    loader.addClass('hidden'); // Hide the loader
  }
}