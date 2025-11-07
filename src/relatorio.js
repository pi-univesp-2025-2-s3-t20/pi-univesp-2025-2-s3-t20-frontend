import './relatorio.css';
import './style.css';

import $ from "jquery";
import 'datatables.net-dt';
import ptBR from 'datatables.net-plugins/i18n/pt-BR.mjs';

const BASE_URL = process.env.BASE_URL;

$(async () => {

    const token = localStorage.getItem('authToken');
    const isAuthenticated = !!token;
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

    let vendas;

    const vendas_api = await fetch(`${BASE_URL}/vendas`, {   // api's
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    let tmp;

    if (vendas_api.ok) {                                // data from api's
        tmp = await vendas_api.json()

        if (tmp) {
            vendas = tmp
        }
    }

    const info_unidades = $('.unidades-info')
    const info_receita = $('.vendas-info')

    const produtosGraph = $('#grafico-produtos')[0].getContext('2d') // vendas relatorio
    const vendasMesGraph = $('#grafico-vendas-mes')[0].getContext('2d')

    const clienteRankGraph = $('#grafico-clientes-rank')[0].getContext('2d') // cliente relatorio
    const clienteMesTable = $('#tabela-cliente-mes')

    const pagamentoGraph = $("#grafico-pagamento")[0].getContext('2d') // pagamento relatorio
    const pagamentoUnidadesGraph = $("#grafico-pagamento-unidades")[0].getContext('2d')

    const { default: Chart } = await import('chart.js/auto')

    //info

    const info_base = vendas.reduce((acc, v) => {
        
        acc.receita += Number(v.receitaTotal);
        acc.quantidade += Number(v.quantidade);

        return acc;
    }, { receita: 0, quantidade: 0 })

    info_receita.text(`R$ ${parseFloat(info_base.receita)}`)
    info_unidades.text(`${Number(info_base.quantidade)} unidades`)

    // vendas relatorio

    const vendas_produto = vendas.map(venda => {

        const produto = venda.produto

        if (!produto) return null;
        return {
            ...venda,
            categoria: produto.categoria,
            produto: produto.produto
        }

    })
        .filter(Boolean)

    const grafico_quantidade_produto = vendas_produto.reduce((acc, v) => {
        acc[v.categoria] = (acc[v.categoria] || 0) + Number(v.quantidade);
        return acc;
    }, {});

    new Chart(produtosGraph, {

        type: 'bar',
        data: {
            datasets: [{
                label: 'quantidade',
                data: Object.values(grafico_quantidade_produto),
                backgroundColor: '#faee02'
            }],
            labels: Object.keys(grafico_quantidade_produto)
        }
        ,
        options: {
            plugins: {
                title: {
                    text: 'Vendas por Produto (Unidades)',
                    display: true
                }
            },
            responsive: true
        }
    })

    let vendas_mes = vendas_produto.reduce((acc, v) => {

        const [year, month, day] = v.data.split('-').map(Number);
        const data = new Date(year, month - 1, day);

        const nomeDoMes = data.toLocaleString('pt-BR', { month: 'long' });

        acc[nomeDoMes] = (acc[nomeDoMes] || 0) + parseFloat(v.receitaTotal);

        return acc;
    }, {})

    new Chart(vendasMesGraph, {

        type: 'bar',
        data: {
            datasets: [{
                label: 'Vendas',
                data: Object.values(vendas_mes),
                backgroundColor: '#faee02'
            }],
            labels: Object.keys(vendas_mes)
        }
        ,
        options: {
            plugins: {
                title: {
                    text: 'Vendas por Mês (Receita)',
                    display: true
                }
            },
            responsive: true
        }
    })

    // cliente relatorio

    let clienterank = vendas.map(venda => {

        const cliente = venda.cliente

        if (!cliente) return null;
        return {
            ...venda,
            cidade: cliente.cidade,
            cliente: cliente.nomeCliente
        }

    })
        .filter(Boolean)

    clienterank = clienterank.reduce((acc, item) => {

        if (!acc[item.cliente]) {
            acc[item.cliente] = {
                cliente: item.cliente,
                cidade: item.cidade,
                quantidade: 0,
                receita_total: 0
            };
        }

        acc[item.cliente].receita_total += parseFloat(item.receitaTotal);
        acc[item.cliente].quantidade += item.quantidade;

        return acc;
    }, {});

    clienterank = Object.values(clienterank);

    clienterank = clienterank.sort((a, b) => b.receita_total - a.receita_total).slice(0, 10);

    new Chart(clienteRankGraph, {
        type: 'bar',
        data: {
            datasets: [
                {
                    label: 'Receita',
                    data: clienterank.map(el => el.receita_total),
                    backgroundColor: '#faee02'
                }
            ],
            labels: clienterank.map(el => el.cliente)
        },
        options: {
            responsive: true
        }
    })

    clienteMesTable.DataTable({
        data: clienterank,
        columns: [
            { data: 'cliente' },
            { data: 'cidade' },
            { data: 'quantidade' },
            { data: 'receita_total' }
        ],
        destroy: true,
        language: ptBR,
        searching: false,
        info: false,
        pageLength: 7,
        lengthChange: false
    })

    // pagamento relatorio

    let pagamento_vendas = vendas.map(venda => {

        const pagamento = venda.formaPagamento

        if (!pagamento) return null;

        return {
            receita: venda.receitaTotal,
            quantidade: venda.quantidade,
            pagamento: pagamento.formaPagamento
        }

    })
        .filter(Boolean)

    pagamento_vendas = pagamento_vendas.reduce((acc, p) => {

        if (!acc[p.pagamento]) {
            acc[p.pagamento] = {
                pagamento: p.pagamento,
                receita: 0,
                quantidade: 0
            };
        }

        acc[p.pagamento].receita += p.receita;
        acc[p.pagamento].quantidade += p.quantidade;

        return acc;
    }, {})

    pagamento_vendas = Object.values(pagamento_vendas)

    new Chart(pagamentoGraph, {
        type: 'bar',
        data: {
            datasets: [
                {
                    label: 'receita',
                    data: pagamento_vendas.map(item => item.receita),
                    backgroundColor: '#faee02'
                }
            ],
            labels: pagamento_vendas.map(item => item.pagamento)
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Vendas Total por Meio de Pagamento'
                }
            },
            responsive: true
        }
    })

    new Chart(pagamentoUnidadesGraph, {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    label: 'receita',
                    data: pagamento_vendas.map(item => item.quantidade),
                }
            ],
            labels: pagamento_vendas.map(item => item.pagamento)
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Unidades vendidas por Meio de Pagamento'
                }
            },
            responsive: true
        }
    })

});
