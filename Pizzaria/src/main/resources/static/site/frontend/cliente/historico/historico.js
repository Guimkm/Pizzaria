/* ============================================================
   PIZZARIA SABORES ITALIANO - Historico de pedidos (cliente)
   Filtros, busca e "Repetir pedido"
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var list = document.getElementById('hist-list');
  var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.hist-card')) : [];
  var input = document.getElementById('hist-search');
  var month = document.getElementById('hist-month');
  var empty = document.getElementById('hist-empty');
  var showing = document.getElementById('hist-showing');
  var chip = document.getElementById('hist-chip-entregues');
  var TOTAL = cards.length;

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function apply() {
    var q = input ? norm(input.value).trim() : '';
    var mes = month ? month.value : '';
    var vis = 0;

    cards.forEach(function (card) {
      var okMes = !mes || card.getAttribute('data-mes') === mes;
      var okTxt = !q || norm(card.textContent).indexOf(q) !== -1;
      var show = okMes && okTxt;
      card.style.display = show ? '' : 'none';
      if (show) vis += 1;
    });

    if (empty) empty.style.display = vis ? 'none' : '';
    if (showing) {
      showing.textContent = 'Mostrando ' + vis + ' de ' + TOTAL + ' pedidos entregues neste mês';
    }
    if (chip) chip.textContent = 'Entregues (' + vis + ')';
  }

  if (input) input.addEventListener('input', apply);
  if (month) month.addEventListener('change', apply);
  if (chip) {
    chip.addEventListener('click', function () {
      chip.classList.add('on');
      if (input) input.value = '';
      if (month) month.value = '2026-10';
      apply();
    });
  }

  /* Repetir pedido: leva os itens de volta para o carrinho */
  Array.prototype.forEach.call(document.querySelectorAll('.hc-repeat'), function (btn) {
    btn.addEventListener('click', function () {
      var ids = (btn.getAttribute('data-items') || '').split(',');
      var n = 0;
      ids.forEach(function (id) {
        var pid = parseInt(id, 10);
        var pizza = null;
        (P && P.PIZZAS ? P.PIZZAS : []).forEach(function (pz) {
          if (pz.id === pid) pizza = pz;
        });
        if (pizza && P.Cart) {
          P.Cart.add(pizza);
          n += 1;
        }
      });
      if (P && P.toast) {
        P.toast(
          n ? 'Pedido repetido! ' + n + ' item(ns) no carrinho.' : 'Pedido adicionado ao carrinho.',
          'success',
          'check'
        );
      }
    });
  });

  apply();
})();
