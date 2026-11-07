/* ============================================================
   PIZZARIA SABORES ITALIANO - Menu (cliente)
   Filtro por categoria (.pill[data-cat] x .pizza-card[data-cat]),
   busca no topo e adicao ao carrinho (data-add).
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  if (!P) return;

  var pills = document.querySelectorAll('.pill');
  var cards = document.querySelectorAll('.pizza-card');
  var search = document.querySelector('[data-menu-search]');
  var empty = document.getElementById('grid-empty');
  var activeCat = 'Todos';

  /* activeCat pode ter varias categorias separadas por virgula
     (ex.: o card "Pizzas Salgadas" = Tradicional,Especial) */
  function catAtende(catCard) {
    if (!activeCat || activeCat === 'Todos') return true;
    var lista = String(activeCat).split(',');
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].trim() === catCard) return true;
    }
    return false;
  }

  function apply() {
    var q = ((search && search.value) || '').trim().toLowerCase();
    var visible = 0;
    Array.prototype.forEach.call(cards, function (c) {
      var okCat = catAtende(c.getAttribute('data-cat'));
      var okText = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
      var show = okCat && okText;
      c.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }

  Array.prototype.forEach.call(pills, function (p) {
    p.addEventListener('click', function () {
      Array.prototype.forEach.call(pills, function (x) { x.classList.remove('active'); });
      p.classList.add('active');
      activeCat = p.getAttribute('data-cat');
      Array.prototype.forEach.call(document.querySelectorAll('.cat-card[data-cat]'), function (c) {
        c.classList.toggle('active', c.getAttribute('data-cat') === activeCat);
      });
      apply();
    });
  });

  /* Cards de categoria (la em cima) tambem filtram a grade */
  Array.prototype.forEach.call(document.querySelectorAll('.cat-card[data-cat]'), function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      var cat = card.getAttribute('data-cat') || 'Todos';
      var ativo = card.classList.contains('active');
      activeCat = ativo ? 'Todos' : cat;
      Array.prototype.forEach.call(document.querySelectorAll('.cat-card[data-cat]'), function (c) {
        c.classList.toggle('active', !ativo && c === card);
      });
      Array.prototype.forEach.call(pills, function (x) {
        x.classList.toggle('active', x.getAttribute('data-cat') === activeCat);
      });
      if (search) search.value = '';
      apply();
      var alvo = document.getElementById('grid');
      if (alvo && alvo.scrollIntoView) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (search) {
    search.addEventListener('input', apply);
    try {
      var q0 = new URLSearchParams(window.location.search).get('q');
      if (q0) search.value = q0;
    } catch (e) {}
  }

  /* Saudacao no topo + nome do cliente no perfil (sobrenome em laranja) */
  var cliente = P.getClient ? P.getClient() : null;
  var nome = (cliente && cliente.nome) || 'John Luke';
  var partes = String(nome).trim().split(/\s+/);
  var primeiro = partes[0] || 'Cliente';
  var ultimo = partes.length > 1 ? partes[partes.length - 1] : '';
  var meio = partes.length > 2 ? partes.slice(1, partes.length - 1).join(' ') : '';
  var esc = function (s) { return P.escapeHtml(String(s)); };

  var greet = document.getElementById('greet');
  if (greet) {
    greet.innerHTML = 'Olá, ' + esc(primeiro) + (ultimo ? ' <b>' + esc(ultimo) + '</b>' : '') + '! O que vai ser hoje?';
  }
  var who = document.querySelector('.profile .who');
  if (who) {
    who.innerHTML = esc(primeiro) + (meio ? ' ' + esc(meio) : '') + (ultimo ? ' <b>' + esc(ultimo) + '</b>' : '');
  }

  /* Itens do cardapio que nao estao no catalogo de pizzas (doces e bebidas) */
  var EXTRAS = {
    brigadeiro: { id: 'brigadeiro', name: 'Brigadeiro', price: 39.9, img: (window.BASE || '../../assets/') + 'img/promo.png', desc: 'Chocolate cremoso com granulado colorido', size: 'G', category: 'Doce' },
    coca: { id: 'coca', name: 'Coca-Cola lata', price: 8.0, img: '', desc: 'Lata 350ml gelada', size: '350ml', category: 'Bebida' },
    guarana: { id: 'guarana', name: 'Guaraná lata', price: 7.5, img: '', desc: 'Guaraná gelado 350ml', size: '350ml', category: 'Bebida' },
  };

  /* Adicionar ao carrinho (botao circular +) */
  Array.prototype.forEach.call(document.querySelectorAll('[data-add]'), function (btn) {
    btn.addEventListener('click', function () {
      var raw = btn.getAttribute('data-add');
      var item = EXTRAS[raw];
      if (!item) {
        var id = parseInt(raw, 10);
        for (var i = 0; i < P.PIZZAS.length; i++) {
          if (P.PIZZAS[i].id === id) { item = P.PIZZAS[i]; break; }
        }
      }
      if (!item) return;
      P.Cart.add(item);
      P.toast(item.name + ' adicionada ao carrinho', 'success', 'check');
      btn.classList.add('in-cart');
      btn.innerHTML = '<svg class="ic"><use href="#check"/></svg>';
      btn.setAttribute('aria-label', item.name + ' no carrinho');
    });
  });

  apply();
})();
