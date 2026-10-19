/* ============================================================
   PIZZARIA SABORES ITALIANO - Menu (cliente)
   Filtro por categoria e adicao ao carrinho.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;

  var pills = document.querySelectorAll('.pill');
  var cards = document.querySelectorAll('.pizza-card');
  Array.prototype.forEach.call(pills, function (p) {
    p.addEventListener('click', function () {
      Array.prototype.forEach.call(pills, function (x) { x.classList.remove('active'); });
      p.classList.add('active');
      var cat = p.getAttribute('data-cat');
      Array.prototype.forEach.call(cards, function (c) {
        var show = cat === 'Todos' || c.getAttribute('data-cat') === cat;
        c.style.display = show ? '' : 'none';
      });
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-add]'), function (btn) {
    btn.addEventListener('click', function () {
      var id = parseInt(btn.getAttribute('data-add'), 10);
      for (var i = 0; i < P.PIZZAS.length; i++) {
        if (P.PIZZAS[i].id === id) {
          P.Cart.add(P.PIZZAS[i]);
          P.toast(P.PIZZAS[i].name + ' adicionada ao carrinho', 'success', 'check');
          btn.classList.add('in-cart');
          btn.innerHTML = 'No carrinho';
          break;
        }
      }
    });
  });
})();
