/* ============================================================
   PIZZARIA SABORES ITALIANO - Login do Funcionário
   Página exclusiva da equipe (clientes usam auth/cliente).
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

  function updateDemoHint() {
    if (!demoHint) return;
    if (document.body.classList.contains('demo')) {
      demoHint.style.display = '';
      demoHint.innerHTML =
        'Demo administrador: <b>adm@email.com</b> / <b>admin123</b><br>' +
        'Demo balconista: <b>balcao@email.com</b> / <b>balcao123</b><br>' +
        'Demo pizzaiolo: <b>pizza@email.com</b> / <b>pizza123</b>';
    } else {
      demoHint.style.display = 'none';
    }
  }

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
    var cargo = (s && s.cargo) ? String(s.cargo).toLowerCase() : '';
    var lista = (P.CARGO_PAGES && P.CARGO_PAGES[cargo]) || [];
    var destino = lista.indexOf('pedidos') !== -1 ? 'pedidos' : (lista[0] || 'pedidos');
    location.href = '../../funcionario/' + destino + '/' + destino + '.html';
  }

  /* Funcionários só entram com e-mail corporativo (mesma regra do servidor).
     Em modo demonstração (sem servidor) a regra não se aplica. */
  var EMAIL_FORMATO = /^[\w.+-]+@[\w-]+(\.[\w-]+)*$/;
  var EMAIL_EQUIPE = /@pizzariasabores(\.com(\.br)?)?$/i;
  function validarEmail(email) {
    if (document.body.classList.contains('demo')) return null;
    if (!EMAIL_FORMATO.test(email)) return 'E-mail inválido.';
    if (!EMAIL_EQUIPE.test(email)) {
      return 'Funcionários devem usar o e-mail corporativo @PizzariaSabores.';
    }
    return null;
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
      var problemaEmail = validarEmail(email);
      if (problemaEmail) {
        if (err) {
          err.textContent = problemaEmail;
          err.classList.add('show');
        }
        return;
      }
      if (err) err.classList.remove('show');
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;

      P.login('funcionario', email, senha, document.getElementById('log-remember').checked).then(function (res) {
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
