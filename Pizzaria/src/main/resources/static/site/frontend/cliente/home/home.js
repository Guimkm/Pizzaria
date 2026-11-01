/* ============================================================
   PIZZARIA SABORES ITALIANO - Home (cliente)
   Identidade do cliente e contador do carrinho sao aplicados
   automaticamente pelo base.js (data-page="cliente").
   Aqui: saudacao com sobrenome em laranja, data do dia,
   busca que leva ao menu e botao "+" (data-add) dos cards.
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
      size: 'G',
      category: 'Doce',
    },
  ];

  /* ---------------- Saudacao (nome + sobrenome em laranja) ---------------- */
  var cliente = P.getClient ? P.getClient() : null;
  var nome = (cliente && cliente.nome) || 'John Luke';
  var partes = String(nome).trim().split(/\s+/);
  var primeiro = partes[0] || 'Olá';
  var ultimo = partes.length > 1 ? partes[partes.length - 1] : '';
  var meio = partes.length > 2 ? partes.slice(1, partes.length - 1).join(' ') : '';

  function nomeComSobrenome(destaque) {
    var html = esc(primeiro);
    if (meio) html += ' ' + esc(meio);
    if (ultimo) html += destaque ? ' <b>' + esc(ultimo) + '</b>' : ' ' + esc(ultimo);
    return html;
  }

  var greeting = document.getElementById('greeting');
  if (greeting) greeting.innerHTML = 'Olá, ' + nomeComSobrenome(true) + '!';

  var who = document.querySelector('.profile .who');
  if (who) who.innerHTML = nomeComSobrenome(true);

  var welcome = document.getElementById('welcome-name');
  if (welcome) welcome.textContent = 'Olá, ' + nome + '!';

  /* ---------------- Data de hoje ---------------- */
  var dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var hoje = document.getElementById('hoje');
  if (hoje) {
    var d = new Date();
    hoje.textContent =
      dias[d.getDay()].charAt(0).toUpperCase() + dias[d.getDay()].slice(1) +
      ', ' + d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear() +
      ' · O que você vai pedir hoje?';
  }

  /* ---------------- Busca no topo -> menu ---------------- */
  var busca = document.getElementById('busca-home');
  if (busca) {
    busca.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = busca.value.trim();
        window.location.href = '../menu/menu.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      }
    });
  }

  /* ---------------- Filtro por categoria (cards de categoria) ---------------- */
  var catCards = document.querySelectorAll('.cat-card[data-cat]');
  var prodCards = document.querySelectorAll('.prod-card[data-cat]');
  var catEmpty = document.getElementById('cat-empty');

  function filtrarCategoria(cat) {
    var visiveis = 0;
    Array.prototype.forEach.call(prodCards, function (card) {
      var mostra = !cat || card.getAttribute('data-cat') === cat;
      card.style.display = mostra ? '' : 'none';
      if (mostra) visiveis++;
    });
    if (catEmpty) catEmpty.style.display = visiveis ? 'none' : 'block';
    Array.prototype.forEach.call(catCards, function (c) {
      c.classList.toggle('active', cat && c.getAttribute('data-cat') === cat);
    });
  }

  Array.prototype.forEach.call(catCards, function (card) {
    card.addEventListener('click', function (e) {
      var cat = card.getAttribute('data-cat');
      var atual = card.classList.contains('active');
      /* Clique de novo na mesma categoria volta a mostrar tudo */
      e.preventDefault();
      filtrarCategoria(atual ? null : cat);
      var alvo = document.getElementById('mais');
      if (alvo && alvo.scrollIntoView) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------------- Adicionar ao carrinho (botao +) ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-add]'), function (btn) {
    btn.addEventListener('click', function () {
      var raw = btn.getAttribute('data-add');
      var num = parseInt(raw, 10);
      var item = null;
      var i;

      if (!isNaN(num)) {
        for (i = 0; i < P.PIZZAS.length; i++) {
          if (P.PIZZAS[i].id === num) { item = P.PIZZAS[i]; break; }
        }
      }
      if (!item) {
        for (i = 0; i < DOCES.length; i++) {
          if (String(DOCES[i].id) === raw) { item = DOCES[i]; break; }
        }
      }
      if (!item) {
        var card = btn.closest ? btn.closest('.prod-card') : null;
        if (card && card.getAttribute('data-name')) {
          item = {
            id: raw,
            name: card.getAttribute('data-name'),
            price: parseFloat(card.getAttribute('data-price')) || 0,
            img: card.getAttribute('data-img'),
            desc: card.getAttribute('data-desc'),
            size: 'G',
            category: card.getAttribute('data-cat') || 'Especial',
          };
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
})();
