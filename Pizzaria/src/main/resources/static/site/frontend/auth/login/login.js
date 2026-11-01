/* ============================================================
   PIZZARIA SABORES ITALIANO - Login
   Login de cliente e funcionário.
   Botão para trocar entre Cliente e Funcionário.
   O cargo do funcionário é detectado automaticamente pelo servidor.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Pizzaria;

  var form = document.getElementById('form-login');
  var err = document.getElementById('log-erro');
  var emailInput = document.getElementById('log-email');
  var senhaInput = document.getElementById('log-senha');
  var demoHint = document.getElementById('log-demo');

  var toggleBtns = Array.prototype.slice.call(document.querySelectorAll('.toggle-btn'));
  var perfilAtual = 'cliente';

  function updateDemoHint() {
    if (!demoHint) return;
    if (document.body.classList.contains('demo')) {
      demoHint.style.display = '';
      var clientes = 'Demo cliente: <b>ana@email.com</b> / <b>1234</b>';
      var adm = 'Demo administrador: <b>adm@email.com</b> / <b>admin123</b>';
      var balconista = 'Demo balconista: <b>balcao@email.com</b> / <b>balcao123</b>';
      var pizzaiolo = 'Demo pizzaiolo: <b>pizza@email.com</b> / <b>pizza123</b>';
      if (perfilAtual === 'funcionario') {
        demoHint.innerHTML = adm + '<br>' + balconista + '<br>' + pizzaiolo;
      } else {
        demoHint.innerHTML = clientes;
      }
    } else {
      demoHint.style.display = 'none';
    }
  }

  function setPerfil(p) {
    perfilAtual = p;
    toggleBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-perfil') === p);
    });
    /* Funcionario nao tem cadastro: esconde o link e mostra a nota */
    var signup = document.getElementById('signup-line');
    var nota = document.getElementById('func-note');
    if (signup) signup.style.display = p === 'funcionario' ? 'none' : '';
    if (nota) nota.style.display = p === 'funcionario' ? 'block' : 'none';
    updateDemoHint();
  }

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPerfil(btn.getAttribute('data-perfil'));
    });
  });

  setPerfil(perfilAtual);

  /* Botao olho: mostra / esconde a senha */
  var eyeBtn = document.getElementById('log-eye');
  if (eyeBtn && senhaInput) {
    eyeBtn.addEventListener('click', function () {
      var mostrar = senhaInput.type === 'password';
      senhaInput.type = mostrar ? 'text' : 'password';
      eyeBtn.classList.toggle('showing', mostrar);
      eyeBtn.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      var use = eyeBtn.querySelector('use');
      if (use) use.setAttribute('href', mostrar ? '#eye' : '#eye-off');
      senhaInput.focus();
    });
  }

  function goToDashboard(s) {
    var perfil = s && s.perfil ? s.perfil : 'cliente';
    var cargo = (s && s.cargo) ? String(s.cargo).toLowerCase() : '';

    if (perfil === 'cliente') {
      location.href = '../../cliente/home/home.html';
      return;
    }

    if (perfil === 'funcionario') {
      location.href = '../../funcionario/pedidos/pedidos.html';
      return;
    }

    location.href = '../../cliente/home/home.html';
  }

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

      P.login(perfilAtual, email, senha).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          P.setSession(res.data);
          P.toast('Bem-vindo, ' + res.data.nome + '!', 'success');
          setTimeout(function () { goToDashboard(res.data); }, 700);
        } else {
          if (err) {
            err.textContent = (res.data && res.data.erro) || 'E-mail ou senha incorretos.';
            err.classList.add('show');
          }
        }
      });
    });
  }
})();