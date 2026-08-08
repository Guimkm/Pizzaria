/* ============================================================
   PIZZARIA SABORES ITALIANO - Login
   Seleção de perfil (Cliente / Funcionário) + autenticação.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.role-tab'));
  var form = document.getElementById('form-login');
  var err = document.getElementById('log-erro');
  var emailInput = document.getElementById('log-email');
  var senhaInput = document.getElementById('log-senha');
  var demoHint = document.getElementById('log-demo');

  /* perfil inicial: ?perfil=funcionario da URL, senao cliente */
  var perfil = (window.location.search.match(/perfil=(\w+)/) || [])[1] || 'cliente';
  if (perfil !== 'funcionario') perfil = 'cliente';

  function updateDemoHint() {
    if (!demoHint) return;
    if (document.body.classList.contains('demo')) {
      demoHint.style.display = '';
      demoHint.innerHTML = perfil === 'funcionario'
        ? 'Demo funcionário: <b>adm@email.com</b> / <b>admin123</b>'
        : 'Demo cliente: <b>ana@email.com</b> / <b>1234</b>';
    } else {
      demoHint.style.display = 'none';
    }
  }

  function setPerfil(p) {
    perfil = p;
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-role') === p);
    });
    var sub = document.querySelector('[data-login-sub]');
    if (sub) sub.textContent = p === 'funcionario' ? 'Acesso do funcionário' : 'Faça seu login para continuar';
    var cad = document.querySelector('[data-cad]');
    if (cad) cad.setAttribute('href', '../cadastro/cadastro.html?perfil=' + p);
    updateDemoHint();
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      setPerfil(t.getAttribute('data-role'));
    });
  });

  setPerfil(perfil);

  P.detectServer().then(function () {
    updateDemoHint();
  });

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = emailInput.value.trim();
      var senha = senhaInput.value;
      if (!email || !senha) {
        if (err) {
          err.textContent = 'Informe seu e-mail e senha.';
          err.classList.add('show');
        }
        return;
      }
      if (err) err.classList.remove('show');
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      P.login(perfil, email, senha).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          P.setSession(res.data);
          P.toast('Bem-vindo, ' + res.data.nome + '!', 'success');
          setTimeout(function () {
            location.href = perfil === 'funcionario'
              ? '../funcionario/clientes/clientes.html'
              : '../cliente/home/home.html';
          }, 700);
        } else {
          if (err) {
            err.textContent = (res.data && res.data.erro) || 'Não foi possível entrar.';
            err.classList.add('show');
          }
        }
      });
    });
  }
})();
