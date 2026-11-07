/* ============================================================
   PIZZARIA SABORES ITALIANO - Login do Cliente
   Página exclusiva do cliente (a equipe usa auth/funcionario).
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
      demoHint.innerHTML = 'Demo cliente: <b>ana@email.com</b> / <b>1234</b>';
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

  /* Mesmas regras de e-mail que o servidor: cliente não usa @PizzariaSabores.
     Em modo demonstração (sem servidor) a regra não se aplica. */
  var EMAIL_FORMATO = /^[\w.+-]+@[\w-]+(\.[\w-]+)*$/;
  var EMAIL_EQUIPE = /@pizzariasabores(\.com(\.br)?)?$/i;
  function validarEmail(email) {
    if (document.body.classList.contains('demo')) return null;
    if (!EMAIL_FORMATO.test(email)) return 'E-mail inválido.';
    if (EMAIL_EQUIPE.test(email)) {
      return 'E-mails @PizzariaSabores são exclusivos de funcionários. Use o acesso de funcionário.';
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

      P.login('cliente', email, senha, document.getElementById('log-remember').checked).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          P.setSession(res.data);
          P.toast('Bem-vindo, ' + res.data.nome + '!', 'success');
          setTimeout(function () {
            location.href = '../../cliente/home/home.html';
          }, 700);
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
