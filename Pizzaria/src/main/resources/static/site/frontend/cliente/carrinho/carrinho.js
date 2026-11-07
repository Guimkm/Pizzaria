/* ============================================================
   PIZZARIA SABORES ITALIANO - Carrinho (cliente)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var list = document.getElementById('cart-items');
  var empty = document.getElementById('cart-empty');
  var wrap = document.getElementById('cart-content');
  var taxa = 6.00;
  var taxaBase = 6.00;

  /* ---------------- Infraestrutura do pedido ---------------- */
  P.loadConfig().then(function (cfg) {
    taxaBase = Number(cfg.taxaEntrega) || 6.00;
    taxa = cupomAtivo() ? 0 : taxaBase;
    var addr = document.getElementById('cart-addr');
    if (addr && P.getClient().endereco) addr.textContent = P.getClient().endereco;
    render();
  });

  function cupomAtivo() {
    return !!sessionStorage.getItem('pizzaria.cupom');
  }

  /* ---------------- Meta do item (tamanho / detalhes) -------- */
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

  function thumbOf(it) {
    if (it.img) {
      return '<img class="ci-thumb" src="' + it.img + '" alt="' + P.escapeHtml(it.name) + '">';
    }
    return '<span class="ci-thumb ph"><svg class="ic"><use href="#pizza"/></svg></span>';
  }

  /* ---------------- Render ---------------- */
  function render() {
    var items = P.Cart.read();
    updateCartBtn(items);

    if (!items.length) {
      if (empty) empty.style.display = '';
      if (wrap) wrap.style.display = 'none';
      var line0 = document.getElementById('cart-count-line');
      if (line0) line0.textContent = '0 itens';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (wrap) wrap.style.display = '';

    list.innerHTML = items.map(function (it) {
      return (
        '<div class="cart-item">' +
        thumbOf(it) +
        '<div class="ci-main">' +
        '<h4>' + P.escapeHtml(it.name) + '</h4>' +
        '<p class="ci-meta">' + P.escapeHtml(metaOf(it)) + '</p>' +
        '<a class="ci-edit" href="../produto/produto.html?id=' + it.id + '">Editar item</a>' +
        '</div>' +
        '<div class="ci-side">' +
        '<p class="ci-price">' + P.fmtCurrency(it.price * it.qty) + '</p>' +
        '<div class="ci-actions">' +
        '<button type="button" class="ci-remove" data-remove="' + it.id + '">' +
        '<svg class="ic"><use href="#trash"/></svg> Remover</button>' +
        '<div class="qty">' +
        '<button type="button" class="minus" data-dec="' + it.id + '" aria-label="Diminuir">' +
        '<svg class="ic"><use href="#minus"/></svg></button>' +
        '<span>' + it.qty + '</span>' +
        '<button type="button" class="plus" data-inc="' + it.id + '" aria-label="Aumentar">' +
        '<svg class="ic"><use href="#plus"/></svg></button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    }).join('');

    var sub = P.Cart.total();
    document.getElementById('sub-val').textContent = P.fmtCurrency(sub);
    document.getElementById('taxa-val').textContent = P.fmtCurrency(taxa);
    document.getElementById('tot-val').textContent = P.fmtCurrency(sub + taxa);
    var line = document.getElementById('cart-count-line');
    if (line) line.textContent = items.length + (items.length === 1 ? ' item' : ' itens');

    bind('[data-inc]', function (el) {
      var id = parseInt(el.getAttribute('data-inc'), 10);
      var cur = P.Cart.read().filter(function (i) { return i.id === id; })[0];
      if (cur) P.Cart.setQty(id, cur.qty + 1);
      render();
    });
    bind('[data-dec]', function (el) {
      var id = parseInt(el.getAttribute('data-dec'), 10);
      var cur = P.Cart.read().filter(function (i) { return i.id === id; })[0];
      if (!cur) return;
      if (cur.qty > 1) P.Cart.setQty(id, cur.qty - 1);
      else P.Cart.remove(id);
      render();
    });
    bind('[data-remove]', function (el) {
      P.Cart.remove(parseInt(el.getAttribute('data-remove'), 10));
      render();
    });
  }

  function bind(sel, fn) {
    Array.prototype.forEach.call(list.querySelectorAll(sel), function (b) {
      b.addEventListener('click', function () { fn(b); });
    });
  }

  /* Botao do carrinho no topo: "3 itens" */
  function updateCartBtn(items) {
    var badge = document.querySelector('.page-head .cart-btn .count');
    if (!badge) return;
    var n = items.reduce(function (s, i) { return s + i.qty; }, 0);
    badge.textContent = n + (n === 1 ? ' item' : ' itens');
  }

  /* ---------------- Enderecos (radios) ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.addr-opt'), function (opt) {
    opt.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.addr-opt'), function (o) {
        o.classList.remove('active');
        var r = o.querySelector('input');
        if (r) r.checked = false;
      });
      opt.classList.add('active');
      var input = opt.querySelector('input');
      if (input) input.checked = true;
      sessionStorage.setItem('pizzaria.endereco', input ? input.value : 'casa');
    });
  });

  /* ---------------- Cupom (frete gratis) ---------------- */
  var btnCupom = document.getElementById('btn-cupom');
  var inputCupom = document.getElementById('cupom-input');
  if (btnCupom) {
    if (cupomAtivo() && inputCupom) inputCupom.value = sessionStorage.getItem('pizzaria.cupom');
    btnCupom.addEventListener('click', function () {
      var cod = (inputCupom && inputCupom.value || '').trim();
      if (!cod) {
        P.toast('Digite um cupom para aplicar.', 'warning', 'alert');
        return;
      }
      sessionStorage.setItem('pizzaria.cupom', cod.toUpperCase());
      taxa = 0;
      render();
      P.toast('Cupom ' + cod.toUpperCase() + ' aplicado: entrega grátis!', 'success', 'check');
    });
  }

  /* ---------------- Banner docinho ---------------- */
  var docinho = document.getElementById('btn-docinho');
  if (docinho) {
    docinho.addEventListener('click', function () {
      P.Cart.add({
        id: 99,
        name: 'Pizza de Brigadeiro',
        price: 39.90,
        img: window.BASE + 'img/promo.png',
        desc: 'Chocolate cremoso e granulado colorido',
        size: 'G',
        category: 'Doce',
      });
      render();
      P.toast('Pizza de Brigadeiro adicionada ao carrinho', 'success', 'check');
    });
  }

  /* ---------------- Pagamento (ids mantidos / usado no checkout) */
  var finalizar = document.getElementById('btn-finalizar');
  var radios = Array.prototype.slice.call(document.querySelectorAll('input[name="pagamento"]'));
  var trocoBox = document.getElementById('pay-troco');
  var trocoInput = document.getElementById('troco-input');

  function applyPayment() {
    var sel = radios.filter(function (r) { return r.checked; })[0];
    var v = sel ? sel.value : 'pix';
    sessionStorage.setItem('pizzaria.payment', v);
    if (trocoBox) trocoBox.style.display = v === 'dinheiro' ? '' : 'none';
  }

  (function restorePayment() {
    var saved = sessionStorage.getItem('pizzaria.payment') || 'pix';
    radios.forEach(function (r) { r.checked = r.value === saved; });
    applyPayment();
    radios.forEach(function (r) { r.addEventListener('change', applyPayment); });
  })();

  /* Ir para o checkout */
  if (finalizar) {
    finalizar.addEventListener('click', function () {
      if (!P.Cart.count()) {
        P.toast('Seu carrinho está vazio. Adicione algo antes de continuar.', 'warning', 'alert');
        return;
      }
      applyPayment();
      location.href = '../checkout/checkout.html';
    });
  }

  /* Endereco salvo para o checkout */
  (function restoreEndereco() {
    var saved = sessionStorage.getItem('pizzaria.endereco') || 'casa';
    Array.prototype.forEach.call(document.querySelectorAll('.addr-opt'), function (o) {
      var r = o.querySelector('input');
      var on = r && r.value === saved;
      o.classList.toggle('active', !!on);
      if (r) r.checked = !!on;
    });
  })();
})();
