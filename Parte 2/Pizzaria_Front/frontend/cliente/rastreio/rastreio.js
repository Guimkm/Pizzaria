/* ============================================================
   PIZZARIA SABORES ITALIANO - Rastreio do pedido (cliente)
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;
  var MAP_POS = [
    { x: 62, y: 302 },
    { x: 90, y: 182 },
    { x: 199, y: 109 },
    { x: 300, y: 52 },
  ];
  var step = parseInt(sessionStorage.getItem('pizzaria.step'), 10);
  if (isNaN(step)) step = 2;
  var mover = document.getElementById('mover');

  function setStep(s) {
    step = s;
    sessionStorage.setItem('pizzaria.step', String(s));
    var steps = document.querySelectorAll('.step');
    Array.prototype.forEach.call(steps, function (el, i) {
      el.classList.toggle('done', i <= s);
      el.classList.toggle('current', i === s);
      var dot = el.querySelector('.dot');
      if (dot) dot.style.boxShadow = i === s ? '0 0 0 5px rgba(193,59,40,0.18)' : 'none';
    });
    var label = document.getElementById('status-val');
    if (label) {
      var names = ['Recebido', 'Em Preparo', 'Saiu para Entrega', 'Entregue'];
      label.textContent = names[s];
      label.style.color = s === 3 ? 'var(--green)' : 'var(--red)';
    }
    var eta = document.getElementById('eta-val');
    if (eta) eta.textContent = s === 0 ? '35-40' : s === 1 ? '20-25' : s === 2 ? '8-12' : '0';
    var etaBox = document.getElementById('eta-box');
    if (etaBox) etaBox.style.display = s === 3 ? 'none' : '';
    if (mover) {
      mover.style.left = (MAP_POS[s].x / 400 * 100) + '%';
      mover.style.top = (MAP_POS[s].y / 340 * 100) + '%';
      mover.style.background = s === 3 ? 'var(--green)' : 'var(--red)';
    }
    var sims = document.querySelectorAll('[data-step]');
    Array.prototype.forEach.call(sims, function (b) {
      b.classList.toggle('on', parseInt(b.getAttribute('data-step'), 10) === s);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-step]'), function (b) {
    b.addEventListener('click', function () {
      setStep(parseInt(b.getAttribute('data-step'), 10));
    });
  });
  setStep(step);
})();
