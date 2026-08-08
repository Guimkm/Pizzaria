/* ============================================================
   PIZZARIA SABORES ITALIANO - Carrinho (cliente)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var list = document.getElementById('cart-items');
  var empty = document.getElementById('cart-empty');
  var wrap = document.getElementById('cart-content');
  var taxa = 8.90;

  P.loadConfig().then(function (cfg) {
    taxa = Number(cfg.taxaEntrega) || 8.90;
    document.getElementById('taxa-val').textContent = P.fmtCurrency(taxa);
    var addr = document.getElementById('cart-addr');
    if (addr) addr.textContent = P.getClient().endereco;
    render();
  });

  function render() {
    var items = P.Cart.read();
    if (!items.length) {
      if (empty) empty.style.display = '';
      if (wrap) wrap.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (wrap) wrap.style.display = '';
    list.innerHTML = items.map(function (it) {
      return (
        '<div class="cart-item">' +
        '<img src="' + it.img + '" alt="' + P.escapeHtml(it.name) + '">' +
        '<div class="info">' +
        '<h4>' + P.escapeHtml(it.name) + '</h4>' +
        '<p class="desc">' + P.escapeHtml(it.desc || '') + '</p>' +
        '<div class="qty">' +
        '<button type="button" class="minus" data-dec="' + it.id + '"><svg class="ic"><use href="#minus"/></svg></button>' +
        '<span>' + it.qty + '</span>' +
        '<button type="button" class="plus" data-inc="' + it.id + '"><svg class="ic"><use href="#plus"/></svg></button>' +
        '</div>' +
        '</div>' +
        '<div class="total">' +
        '<p class="price">' + P.fmtCurrency(it.price * it.qty) + '</p>' +
        '<button type="button" class="btn-ghost" data-remove="' + it.id + '"><svg class="ic ic-sm"><use href="#trash"/></svg> Remover</button>' +
        '</div>' +
        '</div>'
      );
    }).join('');

    var sub = P.Cart.total();
    document.getElementById('sub-val').textContent = P.fmtCurrency(sub);
    document.getElementById('tot-val').textContent = P.fmtCurrency(sub + taxa);
    document.getElementById('cart-count-line').textContent = items.length + (items.length === 1 ? ' item' : ' itens');

    Array.prototype.forEach.call(list.querySelectorAll('[data-inc]'), function (b) {
      b.addEventListener('click', function () {
        P.Cart.setQty(parseInt(b.getAttribute('data-inc'), 10), P.Cart.read().filter(function (i) { return i.id === parseInt(b.getAttribute('data-inc'), 10); })[0].qty + 1);
        render();
      });
    });
    Array.prototype.forEach.call(list.querySelectorAll('[data-dec]'), function (b) {
      b.addEventListener('click', function () {
        var id = parseInt(b.getAttribute('data-dec'), 10);
        var cur = P.Cart.read().filter(function (i) { return i.id === id; })[0].qty;
        if (cur > 1) P.Cart.setQty(id, cur - 1);
        else P.Cart.remove(id);
        render();
      });
    });
    Array.prototype.forEach.call(list.querySelectorAll('[data-remove]'), function (b) {
      b.addEventListener('click', function () {
        P.Cart.remove(parseInt(b.getAttribute('data-remove'), 10));
        render();
      });
    });
  }

  var finalizar = document.getElementById('btn-finalizar');
  var PAYMENTS = {
    pix: 'Pix',
    credito: 'Cartão de Crédito',
    debito: 'Cartão de Débito',
    dinheiro: 'Dinheiro',
  };

  /* ---------------- Forma de pagamento ---------------- */
  var radios = Array.prototype.slice.call(document.querySelectorAll('input[name="pagamento"]'));
  var trocoBox = document.getElementById('pay-troco');
  var trocoInput = document.getElementById('troco-input');

  function paymentName(v) { return PAYMENTS[v] || 'Pix'; }

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

  if (finalizar) {
    finalizar.addEventListener('click', function () {
      if (!P.Cart.count()) return;
      var pay = sessionStorage.getItem('pizzaria.payment') || 'pix';
      var msg = 'Pedido confirmado! Pagamento: ' + paymentName(pay) + '.';
      if (pay === 'dinheiro' && trocoInput && trocoInput.value.trim()) {
        msg += ' Troco para ' + trocoInput.value.trim() + '.';
      }
      P.Cart.clear();
      sessionStorage.setItem('pizzaria.step', '0');
      P.toast(msg, 'success');
      setTimeout(function () {
        location.href = '../rastreio/rastreio.html';
      }, 900);
    });
  }
})();
