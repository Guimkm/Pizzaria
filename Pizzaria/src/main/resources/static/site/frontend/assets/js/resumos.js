(function () {
  'use strict';

  var P = window.Pizzaria;
  if (!P || !P.Api) return;

  var page = document.body.getAttribute('data-tab');
  var money = P.fmtCurrency;
  var esc = P.escapeHtml;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setText(selector, value) {
    var el = $(selector);
    if (el) el.textContent = value;
  }

  function setKpi(key, value, detail) {
    setText('[data-kpi="' + key + '"]', value);
    if (detail != null) setText('[data-kpi-detail="' + key + '"]', detail);
  }

  function setPill(text, tone) {
    var el = $('[data-summary="pill"], [data-summary="periodo"]');
    if (!el) return;
    el.className = 'status-pill ' + (tone || 'pill-green');
    el.innerHTML = '<span class="dot"></span>' + esc(text);
  }

  function setTabCount(filter, count) {
    var tab = $('.tab[data-count="' + filter + '"]');
    if (!tab) return;
    var label = tab.getAttribute('data-label') || tab.textContent.replace(/\s*\(\d+\)\s*$/, '');
    tab.textContent = label + ' (' + count + ')';
  }

  function plural(n, singular, pluralForm) {
    return n + ' ' + (n === 1 ? singular : pluralForm);
  }

  function fillPedidos(d) {
    setKpi('pedidos-hoje', d.hoje,
      d.entreguesHoje + ' entregues · ' + d.emAndamentoHoje + ' em andamento');
    setKpi('vendas-dia', money(d.vendasHoje), 'Soma dos pedidos de hoje');
    setKpi('em-andamento', d.emAndamentoHoje,
      d.recebidosHoje + ' recebidos · ' + d.preparoHoje + ' em preparo · ' + d.entregaHoje + ' na rua');
    setKpi('ticket-medio', money(d.ticketMedioHoje),
      'Vendas · pedidos do dia');

    setTabCount('todos', d.todos);
    setTabCount('recebido', d.recebidos);
    setTabCount('preparo', d.preparo);
    setTabCount('entrega', d.entrega);
    setTabCount('entregue', d.entregues);

    setText('[data-summary="foot"]',
      d.todos + ' pedidos · Soma dos totais: ' + money(d.vendasTotal));
    setText('[data-summary="sync"]', 'Sincronizado com o banco');
  }

  function fillClientes(d) {
    setPill(plural(d.total, 'cadastrado', 'cadastrados'), 'pill-green');
    setKpi('clientes-total', d.total,
      plural(d.novosMes, 'novo', 'novos') + ' em ' + d.mesAtual);
    setKpi('clientes-novos', d.novosMes,
      'Cadastros de ' + d.inicioMes + ' a ' + d.fimMes);
    setKpi('clientes-recorrentes', d.recorrentes, 'Dois pedidos ou mais');
    setKpi('clientes-ticket', money(d.ticketMedioHoje), 'Média dos pedidos de hoje');

    setTabCount('todos', d.total);
    setTabCount('novo', d.novosCompradores);
    setTabCount('recorrente', d.recorrentes);
    setTabCount('sempedido', d.semPedidos);

    setText('[data-summary="foot"]',
      plural(d.total, 'cliente', 'clientes') + ' · Dados do banco');
    setText('[data-summary="sync"]', 'Atualizado agora');
  }

  function fillCardapio(d) {
    setPill(plural(d.disponiveis, 'item disponível', 'itens disponíveis'),
      d.disponiveis > 0 ? 'pill-green' : 'pill-red');

    var categorias = [];
    if (d.tradicionais) categorias.push(plural(d.tradicionais, 'tradicional', 'tradicionais'));
    if (d.especiais) categorias.push(plural(d.especiais, 'especial', 'especiais'));
    if (d.doces) categorias.push(plural(d.doces, 'doce', 'doces'));
    if (d.bebidas) categorias.push(plural(d.bebidas, 'bebida', 'bebidas'));

    setKpi('cardapio-total', d.total,
      categorias.length ? categorias.join(' · ') : 'Nenhum item cadastrado');
    setKpi('cardapio-disponiveis', d.disponiveis,
      d.indisponiveis === 0 ? 'Todos disponíveis'
        : plural(d.indisponiveis, 'item fora do cardápio', 'itens fora do cardápio'));
    setKpi('cardapio-preco', money(d.precoMedio),
      'De ' + money(d.precoMin) + ' a ' + money(d.precoMax));
    setKpi('cardapio-mais-vendida', d.maisVendida || 'Sem vendas',
      d.maisVendida
        ? plural(d.maisVendidaQtd, 'unidade nos últimos 7 dias', 'unidades nos últimos 7 dias')
        : 'Ainda sem vendas no período');

    setTabCount('todos', d.total);
    setTabCount('tradicional', d.tradicionaisAtivos);
    setTabCount('especial', d.especiaisAtivos);
    setTabCount('indisponivel', d.indisponiveis);

    setText('[data-summary="foot"]',
      plural(d.total, 'item', 'itens') + ' · ' + d.disponiveis + ' disponíveis');
    setText('[data-summary="sync"]', 'Preços do cardápio atual');
  }

  function fillEstoque(d) {
    setPill(plural(d.criticos, 'item crítico', 'itens críticos'),
      d.criticos > 0 ? 'pill-red' : 'pill-green');
    setKpi('estoque-itens', d.itens,
      plural(d.criticos, 'crítico', 'críticos') + ' · ' + d.ok + ' dentro do nível');
    setKpi('estoque-reposicao', d.criticos,
      d.criticosLista.length
        ? d.criticosLista.map(function (i) { return i.nome; }).slice(0, 3).join(', ')
        : 'Nenhum item crítico');
    setKpi('estoque-valor', money(d.valorTotal), 'Soma de quantidade × preço unitário');
    setKpi('estoque-risco', money(d.valorCritico), 'Soma dos itens críticos');

    var warn = $('[data-summary="warn"]');
    if (warn) {
      if (d.criticosLista.length) {
        var nomes = d.criticosLista.map(function (i) {
          return esc(i.nome) + ' (' + String(i.quantidade).replace('.', ',') + ' ' + esc(i.unidade || '') + ')';
        });
        warn.innerHTML = '<b>' + plural(d.criticos, 'ingrediente com estoque crítico',
          'ingredientes com estoque crítico') + ':</b> ' + nomes.join(', ') + '.';
      } else {
        warn.innerHTML = '<b>Nenhum ingrediente em nível crítico.</b> Estoque dentro do esperado.';
      }
    }

    setTabCount('todos', d.itens);
    setTabCount('critico', d.criticos);
    setTabCount('ok', d.ok);

    setText('[data-summary="foot"]',
      plural(d.itens, 'item', 'itens') + ' · ' + d.criticos + ' com estoque crítico');
    setText('[data-summary="sync"]', 'Sincronizado com o banco');
  }

  function renderColumns(chart, rows, valueLabel) {
    if (!chart) return;
    if (!rows.length) {
      chart.style.setProperty('--cols', 1);
      chart.innerHTML = '<div class="col" style="grid-column:1/-1"><span class="lbl">Sem dados no período</span></div>';
      return;
    }
    var max = 0;
    rows.forEach(function (r) { max = Math.max(max, Number(valueLabel(r)) || 0); });
    chart.style.setProperty('--cols', rows.length);
    chart.innerHTML = rows.map(function (r) {
      var valor = Number(valueLabel(r)) || 0;
      var altura = max > 0 ? Math.max(3, Math.round(valor / max * 100)) : 0;
      return '<div class="col">' +
        '<span class="val">' + esc(r.display) + '</span>' +
        '<span class="bar" style="height:' + altura + '%"></span>' +
        '<span class="lbl">' + esc(r.label) + '</span>' +
        '</div>';
    }).join('');
  }

  function renderTop(rows) {
    var panel = $('.report-panel[data-panel="top"]');
    if (!panel) return;
    var antigos = panel.querySelectorAll('.bar-row');
    for (var i = 0; i < antigos.length; i++) antigos[i].remove();

    var vazio = panel.querySelector('[data-top-empty]');
    if (vazio) vazio.remove();

    if (!rows.length) {
      var p = document.createElement('p');
      p.className = 'panel-sub';
      p.setAttribute('data-top-empty', '');
      p.textContent = 'Nenhuma pizza vendida nos últimos 7 dias.';
      panel.appendChild(p);
      return;
    }

    var max = 1;
    rows.forEach(function (r) { max = Math.max(max, Number(r.quantidade) || 0); });
    rows.forEach(function (r, index) {
      var row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = '<span class="rank">' + (index + 1) + '</span>' +
        '<span class="name">' + esc(r.nome) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' +
        Math.max(4, Math.round((Number(r.quantidade) || 0) / max * 100)) + '%"></span></span>' +
        '<span class="qty">' + esc(String(r.quantidade)) + '</span>';
      panel.appendChild(row);
    });
  }

  function fillRelatorios(d) {
    var semana = d.semana;
    setPill(d.mesAno || 'Período atual', 'pill-orange');
    setKpi('rel-faturamento', money(d.faturamentoHoje),
      plural(d.pedidosHoje, 'pedido hoje', 'pedidos hoje'));
    setKpi('rel-pedidos', d.pedidosHoje,
      d.canceladosHoje + ' cancelados hoje');
    setKpi('rel-ticket', money(d.ticketMedioHoje),
      'Faturamento ÷ pedidos de hoje');
    setKpi('rel-novos', d.novosClientesMes > 0 ? '+' + d.novosClientesMes : '0',
      'Cadastros feitos no mês');

    setText('[data-summary="periodo-semana"]',
      'De ' + semana.inicio + ' a ' + semana.fim + ' · atualizado agora');

    var tag = $('[data-report-tag="vendas"]');
    if (tag) {
      if (semana.variacao == null) {
        tag.className = 'tag';
        tag.textContent = 'Sem base na semana anterior';
      } else {
        tag.className = 'tag ' + (semana.variacao >= 0 ? 'tag-green' : 'tag-yellow');
        tag.textContent = (semana.variacao >= 0 ? '+' : '') + semana.variacao +
          '% vs. semana anterior';
      }
    }

    renderColumns($('.report-panel[data-panel="vendas"] .chart'),
      semana.vendasPorDia.map(function (dia) {
        return { label: dia.dia, display: money(dia.valor), valor: dia.valor };
      }), function (r) { return r.valor; });

    setText('[data-stat="vendas-total"]', money(semana.totalVendas));
    setText('[data-stat="vendas-melhor-dia"]', semana.melhorDia);
    setText('[data-stat="vendas-pedidos"]', semana.pedidos);
    setText('[data-stat="vendas-cancelamentos"]', semana.cancelamentos);

    renderTop(semana.topPizzas || []);

    renderColumns($('.report-panel[data-panel="horario"] .chart'),
      (semana.horarios || []).map(function (h) {
        return { label: h.label, display: String(h.pedidos), pedidos: h.pedidos };
      }), function (r) { return r.pedidos; });

    setText('[data-stat="entrega-tempo"]', '—');
    setText('[data-stat="entrega-hoje"]', semana.entreguesHoje);
    setText('[data-stat="entrega-em-curso"]', semana.emEntregaHoje);
    setText('[data-stat="entrega-cancelados"]', semana.canceladosHoje);

    setText('[data-summary="relatorio-foot"]',
      plural(semana.pedidos, 'pedido no período', 'pedidos no período') + ' · Valores brutos, sem ajustes');
    setText('[data-summary="relatorio-sync"]', 'Sincronizado com o banco');
  }

  var handlers = {
    pedidos: function (d) { fillPedidos(d.pedidos); },
    clientes: function (d) { fillClientes(d.clientes); },
    pizzas: function (d) { fillCardapio(d.cardapio); },
    estoque: function (d) { fillEstoque(d.estoque); },
    relatorios: function (d) { fillRelatorios(d.relatorios); },
  };

  var handler = handlers[page];
  if (!handler) return;

  function carregarResumo() {
    P.Api.get('/api/resumos').then(function (res) {
      if (!res.ok || !res.data) return;
      handler(res.data);
    });
  }

  carregarResumo();
  document.addEventListener('pizzaria:updated', carregarResumo);
})();
