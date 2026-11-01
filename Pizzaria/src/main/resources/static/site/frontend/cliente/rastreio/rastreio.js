/* ============================================================
   PIZZARIA SABORES ITALIANO - Rastreio do pedido (cliente)
   Hooks preservados: .step, #eta-box, .simulate [data-step],
   #mover, #eta-val, #status-val
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;

  /* Posicao do entregador na trilha do banner (%) por etapa */
  var MOVER_POS = [12.5, 37.5, 62.5, 87.5];

  /* Faixa de previsao exibida no banner por etapa */
  var ETA_VAL = ['19:55 – 20:15', '20:00 – 20:15', '20:10 – 20:20', '20:18'];

  /* Situacao exibida no chip branco do banner */
  var STATUS_TXT = [
    'Pedido recebido',
    'Sua pizza está no forno',
    'A caminho da sua casa',
    'Entregue! Bom apetite.',
  ];
  var STATUS_COLOR = [
    'var(--brand-ink)',
    'var(--brand-ink)',
    'var(--ink)',
    'var(--green-ink)',
  ];

  var step = parseInt(sessionStorage.getItem('pizzaria.step'), 10);
  if (isNaN(step)) step = 2;
  var mover = document.getElementById('mover');

  function setStep(s) {
    step = s;
    sessionStorage.setItem('pizzaria.step', String(s));

    /* Etapas: concluidas (done) e atual (current) */
    var steps = document.querySelectorAll('.step');
    Array.prototype.forEach.call(steps, function (el, i) {
      el.classList.toggle('done', i <= s);
      el.classList.toggle('current', i === s);
      var dot = el.querySelector('.dot');
      if (dot) {
        dot.style.boxShadow = i === s ? '0 0 0 5px rgba(245, 161, 30, 0.22)' : 'none';
      }
    });

    /* Chip de situacao do banner */
    var chip = document.getElementById('status-val');
    if (chip) {
      chip.textContent = STATUS_TXT[s] || STATUS_TXT[0];
      chip.style.color = STATUS_COLOR[s] || 'var(--ink)';
    }

    /* Previsao de chegada */
    var eta = document.getElementById('eta-val');
    if (eta) eta.textContent = ETA_VAL[s] || ETA_VAL[0];

    var etaBox = document.getElementById('eta-box');
    if (etaBox) {
      var phrase = etaBox.querySelector('.eta-phrase');
      if (phrase) {
        phrase.textContent = s === 3
          ? 'Pedido entregue. Bom apetite e até a próxima!'
          : 'Seu pedido já saiu. Pode ir preparando a mesa!';
      }
    }

    /* Entregador na trilha */
    if (mover) {
      mover.style.left = MOVER_POS[s] + '%';
      mover.style.top = '50%';
      mover.style.background = s === 3 ? 'var(--green)' : '#fff';
      mover.style.color = s === 3 ? '#fff' : 'var(--brand-ink)';
    }

    /* Botoes da simulacao */
    var sims = document.querySelectorAll('.simulate [data-step]');
    Array.prototype.forEach.call(sims, function (b) {
      b.classList.toggle('on', parseInt(b.getAttribute('data-step'), 10) === s);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-step]'), function (b) {
    b.addEventListener('click', function () {
      setStep(parseInt(b.getAttribute('data-step'), 10));
    });
  });

  /* Comprovante (demonstracao) */
  var btnComp = document.getElementById('btn-comprovante');
  if (btnComp && P) {
    btnComp.addEventListener('click', function () {
      P.toast('Comprovante do pedido #1048 enviado para o seu e-mail.', 'success', 'check');
    });
  }

  setStep(step);
})();
