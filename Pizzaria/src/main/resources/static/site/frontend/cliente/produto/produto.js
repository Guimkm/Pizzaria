/* ============================================================
   PIZZARIA SABORES ITALIANO - Detalhe do produto (cliente)
   Monta a pizza "do seu jeito": tamanho, borda, opcionais,
   observacoes, quantidade e adicao ao carrinho
   (Pizzaria.Cart.add), voltando em seguida para o menu.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  if (!P) return;

  function esc(s) {
    return P.escapeHtml ? P.escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s);
  }

  /* Itens doces que nao existem no catalogo de pizzas */
  var DOCES = [
    {
      id: 'brigadeiro',
      name: 'Brigadeiro',
      price: 39.9,
      img: window.BASE + 'img/promo.png',
      desc: 'Chocolate cremoso com granulado colorido',
      category: 'Doce',
    },
  ];

  /* ---------------- Produto (parametro ?id=) ---------------- */
  var idParam = null;
  try {
    idParam = new URLSearchParams(window.location.search).get('id');
  } catch (e) {}

  var produto = null;
  var i;
  if (idParam !== null && idParam !== '') {
    var num = parseInt(idParam, 10);
    if (!isNaN(num)) {
      for (i = 0; i < P.PIZZAS.length; i++) {
        if (P.PIZZAS[i].id === num) { produto = P.PIZZAS[i]; break; }
      }
    }
    if (!produto) {
      for (i = 0; i < DOCES.length; i++) {
        if (String(DOCES[i].id) === idParam) { produto = DOCES[i]; break; }
      }
    }
  }
  if (!produto) produto = P.PIZZAS[4] || P.PIZZAS[0]; /* padrao: Calabresa */

  var DEFAULT_DESC = 'Molho, mussarela e calabresa fatiada. Uma combinação clássica com massa leve e borda douradinha.';

  function fill(sel, value) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      el.textContent = value;
    });
  }

  fill('[data-p-name]', produto.name);
  fill('[data-p-desc]', produto.desc || DEFAULT_DESC);
  fill('[data-p-price]', P.fmtCurrency(produto.price));
  fill('[data-p-cat]', produto.category === 'Doce' ? 'Pizzas Doces' : produto.category === 'Bebida' ? 'Bebidas' : 'Pizzas Salgadas');

  var img = document.querySelector('[data-p-img]');
  if (img && produto.img) {
    img.src = produto.img;
    img.alt = produto.name;
  }

  /* ---------------- Nome do cliente no perfil ---------------- */
  var cliente = P.getClient ? P.getClient() : null;
  var nome = (cliente && cliente.nome) || 'John Luke';
  var partes = String(nome).trim().split(/\s+/);
  var primeiro = partes[0] || 'Cliente';
  var ultimo = partes.length > 1 ? partes[partes.length - 1] : '';
  var meio = partes.length > 2 ? partes.slice(1, partes.length - 1).join(' ') : '';
  var who = document.querySelector('.profile .who');
  if (who) {
    who.innerHTML = esc(primeiro) + (meio ? ' ' + esc(meio) : '') + (ultimo ? ' <b>' + esc(ultimo) + '</b>' : '');
  }

  /* ---------------- Tamanhos ---------------- */
  var sizeBtns = document.querySelectorAll('.size-opt');
  var sizeName = 'Grande';
  var sizePrice = produto.price;

  Array.prototype.forEach.call(sizeBtns, function (b) {
    var base = produto.price + (parseFloat(b.getAttribute('data-delta')) || 0);
    if (base < 0) base = 0;
    var priceEl = b.querySelector('[data-size-price]');
    if (priceEl) priceEl.textContent = P.fmtCurrency(base);

    b.addEventListener('click', function () {
      Array.prototype.forEach.call(sizeBtns, function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      sizeName = b.getAttribute('data-size');
      sizePrice = base;
      update();
    });
  });

  var sizeDefault = document.querySelector('.size-opt.active');
  if (sizeDefault) {
    sizeName = sizeDefault.getAttribute('data-size');
    sizePrice = produto.price + (parseFloat(sizeDefault.getAttribute('data-delta')) || 0);
  }

  /* ---------------- Borda e opcionais ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.opt-row input'), function (input) {
    input.addEventListener('change', function () {
      var list = input.closest('.opt-list');
      if (input.type === 'radio') {
        Array.prototype.forEach.call(list.querySelectorAll('.opt-row'), function (r) {
          r.classList.remove('active');
        });
        var row = input.closest('.opt-row');
        if (row) row.classList.add('active');
      } else {
        var crow = input.closest('.opt-row');
        if (crow) crow.classList.toggle('active', input.checked);
      }
      update();
    });
  });

  /* Busca de opcionais */
  var buscaExtra = document.getElementById('busca-extra');
  if (buscaExtra) {
    buscaExtra.addEventListener('input', function () {
      var q = buscaExtra.value.trim().toLowerCase();
      Array.prototype.forEach.call(document.querySelectorAll('#extras-list .opt-row'), function (r) {
        var nome = (r.getAttribute('data-extra-name') || r.textContent).toLowerCase();
        r.style.display = !q || nome.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }

  /* Observacoes: contador */
  var obs = document.getElementById('obs');
  var obsCount = document.getElementById('obs-count');
  if (obs && obsCount) {
    obs.addEventListener('input', function () {
      obsCount.textContent = obs.value.length;
    });
  }

  /* ---------------- Quantidade ---------------- */
  var qty = 1;
  var qtyEl = document.querySelector('[data-qty]');
  Array.prototype.forEach.call(document.querySelectorAll('[data-step]'), function (btn) {
    btn.addEventListener('click', function () {
      qty += parseInt(btn.getAttribute('data-step'), 10) || 0;
      if (qty < 1) qty = 1;
      if (qty > 20) qty = 20;
      if (qtyEl) qtyEl.textContent = qty;
      update();
    });
  });

  /* ---------------- Totais ---------------- */
  function extrasTotal() {
    var total = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.opt-row input:checked'), function (input) {
      total += parseFloat(input.getAttribute('data-extra')) || 0;
    });
    return total;
  }

  function update() {
    var extra = extrasTotal();
    var unit = sizePrice + extra;
    fill('[data-p-size]', sizeName);
    fill('[data-p-price]', P.fmtCurrency(sizePrice));
    fill('[data-sum-base]', P.fmtCurrency(sizePrice));
    fill('[data-sum-extra]', P.fmtCurrency(extra));
    fill('[data-total]', P.fmtCurrency(unit * qty));
    if (qtyEl) qtyEl.textContent = qty;
    return unit;
  }

  update();

  /* ---------------- Adicionar ao carrinho ---------------- */
  var addBtn = document.getElementById('btn-add');
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      var unit = update();
      var item = {
        id: produto.id,
        name: produto.name,
        price: unit,
        img: produto.img,
        desc: produto.desc || DEFAULT_DESC,
        size: sizeName,
        category: produto.category || 'Tradicional',
      };
      for (var n = 0; n < qty; n++) P.Cart.add(item);
      P.toast(qty + 'x ' + produto.name + ' (' + sizeName + ') adicionada ao carrinho', 'success', 'check');
      addBtn.disabled = true;
      setTimeout(function () {
        window.location.href = '../menu/menu.html';
      }, 800);
    });
  }
})();
