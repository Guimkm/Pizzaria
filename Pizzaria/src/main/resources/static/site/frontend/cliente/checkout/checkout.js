/* ============================================================
   PIZZARIA SABORES ITALIANO - Checkout (cliente)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var listEl = document.getElementById('co-items');
  var confirmar = document.getElementById('btn-confirmar');
  var taxa = 6.00;
  var total = 0;
  var sub = 0;
  var enviando = false;

  var PAY_LABEL = {
    pix: 'Pagamento via Pix',
    credito: 'Pagamento no cartão',
    debito: 'Pagamento no cartão',
    dinheiro: 'Pagamento em dinheiro',
  };
  var PAY_ICON = {
    pix: 'pix',
    credito: 'card',
    debito: 'card',
    dinheiro: 'dollar',
  };
  var PAY_NAME = {
    pix: 'Pix',
    credito: 'Cartão de crédito',
    debito: 'Cartão de débito',
    dinheiro: 'Dinheiro',
  };
  var PAY_NOTE = {
    pix: 'Ao confirmar, você será direcionado ao código Pix. Seu pedido será enviado à cozinha assim que o pagamento for confirmado.',
    credito: 'O pagamento é feito na entrega, na maquininha. Aceitamos crédito e débito, sem taxa adicional.',
    debito: 'O pagamento é feito na entrega, na maquininha. Aceitamos crédito e débito, sem taxa adicional.',
    dinheiro: 'Prepare o valor se precisar de troco. Você pode informar o troco logo abaixo.',
  };

  /* ---------------- Meta do item ---------------- */
  function metaOf(it) {
    var bebida = /refri|coca|suco|água|agua|cerveja|drink|limonada/i.test(String(it.name)) ||
      String(it.category || '').toLowerCase() === 'bebida';
    if (bebida) {
      return [it.desc || 'Bebida gelada', it.category || 'Tradicional'].filter(Boolean).join(' • ');
    }
    var partes = [];
    var s = it.size === 'G' ? 'Grande' : it.size === 'M' ? 'Média' : it.size === 'P' || it.size === 'B' ? 'Broto' : '';
    if (s) partes.push(s);
    partes.push('8 fatias');
    partes.push('Sem borda extra');
    return partes.join(' • ');
  }

  /* ---------------- Dados do cliente ---------------- */
  (function fillCliente() {
    var c = P.getClient();
    var addr = document.getElementById('co-addr');
    if (addr && c.endereco) addr.textContent = c.endereco;
    var contato = document.getElementById('co-contato');
    if (contato) {
      var nome = c.nome || 'John Luke';
      var fone = c.telefone || '(11) 99942-6310';
      contato.textContent = nome + ' · ' + fone;
    }
  })();

  /* ---------------- Render do pedido ---------------- */
  function render() {
    var items = P.Cart.read();
    if (!items.length) {
      location.replace('../carrinho/carrinho.html');
      return;
    }

    if (listEl) {
      listEl.innerHTML = items.map(function (it) {
        var thumb = it.img
          ? '<img class="oi-thumb" src="' + it.img + '" alt="' + P.escapeHtml(it.name) + '">'
          : '<span class="oi-thumb" style="display:flex;align-items:center;justify-content:center;background:var(--green-soft);color:var(--green)"><svg class="ic"><use href="#pizza"/></svg></span>';
        return (
          '<div class="order-item">' +
          thumb +
          '<div class="oi-main">' +
          '<b>' + it.qty + ' × ' + P.escapeHtml(it.name) + '</b>' +
          '<small>' + P.escapeHtml(metaOf(it)) + '</small>' +
          '</div>' +
          '<span class="oi-price">' + P.fmtCurrency(it.price * it.qty) + '</span>' +
          '</div>'
        );
      }).join('');
    }

    sub = P.Cart.total();
    var cupom = sessionStorage.getItem('pizzaria.cupom');
    taxa = cupom ? 0 : taxaBase;
    total = sub + taxa;

    setText('sub-val', P.fmtCurrency(sub));
    setText('taxa-val', P.fmtCurrency(taxa));
    setText('tot-val', P.fmtCurrency(total));
    setText('co-taxa', P.fmtCurrency(taxa));
    if (confirmar) confirmar.textContent = 'Confirmar pedido - ' + P.fmtCurrency(total);
  }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  var taxaBase = 6.00;
  P.loadConfig().then(function (cfg) {
    taxaBase = Number(cfg.taxaEntrega) || 6.00;
    render();
  });

  /* ---------------- Forma de pagamento ---------------- */
  var radios = Array.prototype.slice.call(document.querySelectorAll('input[name="pagamento"]'));
  var trocoBox = document.getElementById('pay-troco');
  var note = document.getElementById('pay-note');

  function applyPayment() {
    var sel = radios.filter(function (r) { return r.checked; })[0];
    var v = sel ? sel.value : 'pix';
    sessionStorage.setItem('pizzaria.payment', v);

    Array.prototype.forEach.call(document.querySelectorAll('.pay-opt'), function (o) {
      var input = o.querySelector('input');
      o.classList.toggle('active', !!(input && input.checked));
    });

    setText('pay-pill-txt', PAY_LABEL[v] || PAY_LABEL.pix);
    var pill = document.getElementById('pay-pill');
    if (pill) {
      var use = pill.querySelector('use');
      if (use) use.setAttribute('href', '#' + (PAY_ICON[v] || 'pix'));
    }
    if (note) note.textContent = PAY_NOTE[v] || PAY_NOTE.pix;
    if (trocoBox) trocoBox.style.display = v === 'dinheiro' ? '' : 'none';
  }

  radios.forEach(function (r) {
    r.addEventListener('change', applyPayment);
  });
  (function restorePayment() {
    var saved = sessionStorage.getItem('pizzaria.payment') || 'pix';
    radios.forEach(function (r) { r.checked = r.value === saved; });
    if (!radios.some(function (r) { return r.checked; }) && radios[0]) radios[0].checked = true;
    applyPayment();
  })();

  /* ---------------- Confirmar pedido ---------------- */
  if (confirmar) {
    confirmar.addEventListener('click', function () {
      if (enviando) return;
      if (!P.Cart.count()) {
        P.toast('Seu carrinho está vazio.', 'warning', 'alert');
        location.replace('../carrinho/carrinho.html');
        return;
      }
      enviando = true;

      var items = P.Cart.read();
      var sel = radios.filter(function (r) { return r.checked; })[0];
      var pay = sel ? sel.value : 'pix';
      var troco = document.getElementById('troco-input');
      var cliente = P.getClient();
      var enderecoEl = document.querySelector('.addr-block .addr-txt');

      var pedido = {
        numero: 'Pedido #' + (1040 + Math.floor(Math.random() * 60)),
        data: new Date().toISOString(),
        cliente: cliente.nome || 'John Luke',
        telefone: cliente.telefone || '',
        endereco: enderecoEl ? enderecoEl.textContent.replace(/\s+/g, ' ').trim() : (cliente.endereco || ''),
        itens: items.map(function (it) {
          return {
            id: it.id,
            nome: it.name,
            qtd: it.qty,
            preco: it.price,
            subtotal: it.price * it.qty,
            detalhes: metaOf(it),
          };
        }),
        subtotal: sub,
        taxa: taxa,
        total: total,
        pagamento: PAY_NAME[pay] || 'Pix',
        troco: pay === 'dinheiro' && troco && troco.value.trim() ? troco.value.trim() : null,
        cupom: sessionStorage.getItem('pizzaria.cupom') || null,
        status: 'Recebido',
        previsao: '30-45 min',
      };

      try {
        localStorage.setItem('pizzaria.pedido', JSON.stringify(pedido));
        var hist = JSON.parse(localStorage.getItem('pizzaria.pedidos') || '[]');
        if (!Array.isArray(hist)) hist = [];
        hist.unshift(pedido);
        localStorage.setItem('pizzaria.pedidos', JSON.stringify(hist));
      } catch (e) {}

      P.Cart.clear();
      sessionStorage.setItem('pizzaria.step', '0');
      sessionStorage.removeItem('pizzaria.cupom');

      P.toast('Pedido confirmado! Pagamento: ' + (PAY_NAME[pay] || 'Pix') + '.', 'success', 'check');
      setTimeout(function () {
        location.href = '../rastreio/rastreio.html';
      }, 900);
    });
  }

  /* Botao do carrinho no topo: "N itens" */
  (function updateCartBtn() {
    var badge = document.querySelector('.page-head .cart-btn .count');
    if (!badge) return;
    var n = P.Cart.count();
    badge.textContent = n + (n === 1 ? ' item' : ' itens');
  })();
})();
