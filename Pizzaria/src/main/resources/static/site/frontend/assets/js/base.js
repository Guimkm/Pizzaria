/* ============================================================
   PIZZARIA SABORES ITALIANO - base.js (compartilhado)
   Utilitarios, API client, configuracao, carrinho, identidade,
   catalogo demo, helpers de tabela e exportacao global.
   Cada pagina carrega seu proprio <script> apos este.
   ============================================================ */
(function () {
  'use strict';

  /* Caminho base para assets, via atributo data-base no <script>.
     Ex.: data-base="../../assets/" -> BASE="../../assets/".
     Para navegacao entre paginas os scripts usam caminhos relativos. */
  var script = document.querySelector('script[data-base]');
  var BASE = (script && script.getAttribute('data-base')) || '';
  window.BASE = BASE;

  /* ---------------- Utilitarios ---------------- */
  function fmtCurrency(v) {
    return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(msg, type, icon) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.className = 'toast ' + (type || 'info') + ' show';
    el.innerHTML =
      '<svg class="ic"><use href="#' + (icon || 'check') + '"/></svg>' +
      '<span>' + escapeHtml(msg) + '</span>';
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove('show');
    }, 3200);
  }

  function maskTelefone(input) {
    if (!input) return;
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 10) {
        d = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      } else if (d.length > 6) {
        d = '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      } else if (d.length > 2) {
        d = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      }
      input.value = d;
    });
  }

  function maskCEP(input) {
    if (!input) return;
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 8);
      if (d.length > 5) d = d.slice(0, 5) + '-' + d.slice(5);
      input.value = d;
    });
  }

  /* ---------------- Cliente da API ---------------- */
  var Api = {
    get: function (url) {
      return fetch(url, { headers: { Accept: 'application/json' } })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, status: r.status, data: data };
          }).catch(function () {
            return { ok: r.ok, status: r.status, data: null };
          });
        })
        .catch(function () {
          return { ok: false, status: 0, data: null };
        });
    },
    send: function (method, url, body) {
      return fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, status: r.status, data: data };
          }).catch(function () {
            return { ok: r.ok, status: r.status, data: {} };
          });
        })
        .catch(function () {
          return { ok: false, status: 0, data: null };
        });
    },
  };

  var SERVER = null; // null = ainda checando, true/false depois

  function detectServer() {
    return Api.get('/api/health').then(function (res) {
      SERVER = res.ok && res.data && res.data.database === true;
      if (!SERVER) document.body.classList.add('demo');
      return SERVER;
    });
  }

  /* ---------------- Configuracao ---------------- */
  var DEFAULT_CONFIG = {
    nomePizzaria: 'Pizzaria Sabores Italiano',
    slogan: 'A verdadeira pizza artesanal',
    endereco: 'Rua das Flores, 123',
    cidade: 'Sao Paulo, SP',
    cep: '01310-100',
    telefone: '(11) 3456-7890',
    whatsapp: '(11) 99999-1234',
    horario: 'Ter a Dom, 18h as 23h',
    taxaEntrega: 8.90,
  };

  var CONFIG = null;

  function loadConfig() {
    if (CONFIG) return Promise.resolve(CONFIG);
    return Api.get('/api/config').then(function (res) {
      if (res.ok && res.data) CONFIG = res.data;
      else CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      return CONFIG;
    });
  }

  function applyConfig() {
    var el = document.querySelectorAll('[data-config]');
    Array.prototype.forEach.call(el, function (node) {
      var key = node.getAttribute('data-config');
      var val = CONFIG[key] != null ? CONFIG[key] : '';
      if (node.tagName === 'INPUT' || node.tagName === 'SELECT' || node.tagName === 'TEXTAREA') {
        node.value = val;
      } else {
        node.textContent = val;
      }
    });
    var preview = document.getElementById('config-preview');
    if (preview) updatePreview();
  }

  function updatePreview() {
    var preview = document.getElementById('config-preview');
    if (!preview) return;
    var p = {
      nomePizzaria: CONFIG.nomePizzaria,
      slogan: CONFIG.slogan,
      endereco: CONFIG.endereco,
      cidade: CONFIG.cidade,
      cep: CONFIG.cep,
      telefone: CONFIG.telefone,
      whatsapp: CONFIG.whatsapp,
      horario: CONFIG.horario,
      taxaEntrega: CONFIG.taxaEntrega,
    };
    ['nomePizzaria', 'slogan', 'endereco', 'cidade', 'telefone', 'horario'].forEach(function (k) {
      var el = document.getElementById('pv-' + k);
      if (el) el.textContent = p[k];
    });
    var t = document.getElementById('pv-taxa');
    if (t) t.textContent = fmtCurrency(Number(p.taxaEntrega) || 0);
  }

  /* ---------------- Carrinho (localStorage) ---------------- */
  var Cart = {
    read: function () {
      try {
        return JSON.parse(localStorage.getItem('pizzaria.cart') || '[]');
      } catch (e) {
        return [];
      }
    },
    write: function (list) {
      localStorage.setItem('pizzaria.cart', JSON.stringify(list));
    },
    add: function (pizza) {
      var list = Cart.read();
      var found = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === pizza.id) {
          list[i].qty += 1;
          found = true;
          break;
        }
      }
      if (!found) {
        list.push({
          id: pizza.id,
          name: pizza.name,
          price: pizza.price,
          img: pizza.img,
          desc: pizza.desc,
          size: pizza.size,
          category: pizza.category,
          qty: 1,
        });
      }
      Cart.write(list);
      Cart.renderCount();
    },
    setQty: function (id, qty) {
      var list = Cart.read();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i].qty = Math.max(1, qty);
          break;
        }
      }
      Cart.write(list);
      Cart.renderCount();
    },
    remove: function (id) {
      Cart.write(Cart.read().filter(function (i) {
        return i.id !== id;
      }));
      Cart.renderCount();
    },
    clear: function () {
      Cart.write([]);
      Cart.renderCount();
    },
    count: function () {
      return Cart.read().reduce(function (s, i) { return s + i.qty; }, 0);
    },
    total: function () {
      return Cart.read().reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    },
    renderCount: function () {
      var badges = document.querySelectorAll('[data-cart-count]');
      var n = Cart.count();
      Array.prototype.forEach.call(badges, function (el) {
        el.textContent = n;
        el.style.display = n > 0 ? 'flex' : 'none';
      });
    },
  };

  /* ---------------- Identidade do cliente ---------------- */
  var DEFAULT_CLIENT = {
    id: 1,
    nome: 'Ana Silva',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123',
    email: 'ana@email.com',
  };

  function getClient() {
    try {
      var c = JSON.parse(localStorage.getItem('pizzaria.cliente'));
      if (c && c.nome) return c;
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CLIENT));
  }

  function setClient(c) {
    localStorage.setItem('pizzaria.cliente', JSON.stringify(c));
  }

  function applyClient() {
    var c = getClient();
    Array.prototype.forEach.call(document.querySelectorAll('[data-client-nome]'), function (el) {
      el.textContent = c.nome;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-client-endereco]'), function (el) {
      el.textContent = c.endereco;
    });
  }

  /* ---------------- Banco de pizzas (demonstracao) ---------------- */
  var IMG = function (n) { return BASE + 'img/' + n; };
  var PIZZAS = [
    { id: 1, name: 'Margherita', category: 'Tradicional', size: 'G', price: 45.90, active: true, img: IMG('margherita.png'), desc: 'Molho de tomate, mussarela e manjericão fresco' },
    { id: 2, name: 'Pepperoni', category: 'Especial', size: 'G', price: 52.90, active: true, img: IMG('pepperoni.png'), desc: 'Molho de tomate, mussarela e pepperoni artesanal' },
    { id: 3, name: 'Quatro Queijos', category: 'Especial', size: 'G', price: 48.90, active: true, img: IMG('quatro-queijos.png'), desc: 'Mussarela, gorgonzola, parmesão e catupiry' },
    { id: 4, name: 'Portuguesa', category: 'Tradicional', size: 'G', price: 47.90, active: true, img: IMG('portuguesa.png'), desc: 'Presunto, ovos, cebola, azeitona e mussarela' },
    { id: 5, name: 'Calabresa', category: 'Tradicional', size: 'M', price: 39.90, active: true, img: IMG('calabresa.png'), desc: 'Calabresa fatiada, cebola caramelizada e mussarela' },
    { id: 6, name: 'Frango Catupiry', category: 'Especial', size: 'G', price: 54.90, active: false, img: IMG('frango-catupiry.png'), desc: 'Frango desfiado, catupiry cremoso e azeitona' },
  ];
  var RECO = PIZZAS[1];

  function statusClass(status) {
    var m = {
      'Entregue': 'badge-green',
      'Em Preparo': 'badge-yellow',
      'Saiu para Entrega': 'badge-blue',
      'Pronto': 'badge-indigo',
      'Recebido': 'badge-indigo',
      'Pendente': 'badge-gray',
      'Cancelado': 'badge-red',
    };
    return m[status] || 'badge-gray';
  }

  function badge(status) {
    return '<span class="badge ' + statusClass(status) + '">' + escapeHtml(status) + '</span>';
  }

  function catBadge(cat) {
    var c = String(cat || '');
    if (c === 'Doce' || c === 'Especial') {
      return '<span class="tag tag-yellow">' + escapeHtml(c) + '</span>';
    }
    return '<span class="tag tag-green">Tradicional</span>';
  }

  /* ---------------- Autenticacao / Sessao ---------------- */
  var DEMO_USERS = [
    { perfil: 'cliente', nome: 'Ana Silva', telefone: '(11) 98765-4321', endereco: 'Rua das Flores, 123', email: 'ana@email.com', senha: '1234' },
    { perfil: 'funcionario', nome: 'Administrador', cargo: 'administrador', email: 'adm@email.com', senha: 'admin123' },
    { perfil: 'funcionario', nome: 'Carlos Souza', cargo: 'balconista', email: 'balcao@email.com', senha: 'balcao123' },
    { perfil: 'funcionario', nome: 'Marcos Lima', cargo: 'pizzaiolo', email: 'pizza@email.com', senha: 'pizza123' },
  ];

  /* Paginas permitidas por cargo de funcionario */
  var CARGO_PAGES = {
    administrador: ['clientes', 'pizzas', 'estoque', 'pedidos', 'relatorios', 'config'],
    balconista:    ['clientes', 'pedidos'],
    pizzaiolo:     ['pizzas', 'estoque'],
  };

  function seedUsers() {
    var u;
    try { u = JSON.parse(localStorage.getItem('pizzaria.usuarios')); } catch (e) {}
    if (!Array.isArray(u)) u = [];
    /* Garante que os usuarios demo continuem iguais as credenciais exibidas no login */
    DEMO_USERS.forEach(function (d) {
      var idx = -1;
      u.forEach(function (x, i) {
        if (x && x.email && String(x.email).toLowerCase() === String(d.email).toLowerCase()) idx = i;
      });
      if (idx >= 0) u[idx] = d;
      else u.push(d);
    });
    localStorage.setItem('pizzaria.usuarios', JSON.stringify(u));
  }

  function readUsers() {
    seedUsers();
    try { return JSON.parse(localStorage.getItem('pizzaria.usuarios')); } catch (e) { return []; }
  }

  function writeUsers(list) {
    localStorage.setItem('pizzaria.usuarios', JSON.stringify(list));
  }

  function login(perfil, email, senha, lembrar) {
    var ehFuncionario = perfil === 'funcionario';
    email = (email || '').trim().toLowerCase();
    var endpoint = ehFuncionario ? '/api/funcionarios/login' : '/api/clientes/login';
    return Api.send('POST', endpoint, { email: email, senha: senha, lembrar: !!lembrar }).then(function (res) {
      if (res.ok && res.data && res.data.ok) {
        var u = res.data.usuario || {};
        return { ok: true, status: res.status, data: { perfil: perfil, nome: u.nome || 'Usuário', cargo: ehFuncionario ? (u.cargo || 'administrador') : null, email: email, telefone: u.telefone, endereco: u.endereco, id: u.idCliente || u.id } };
      }
      /* Sem backend Java (estatico / API fora do ar / 404-405-5xx): modo demo */
      var semBackend = !res.ok && (res.status === 0 || res.status === 404 || res.status === 405 || res.status === 503);
      if (semBackend) {
        /* servidor offline / endpoint inexistente: modo demonstracao */
        var found = null;
        readUsers().forEach(function (u2) {
          if (u2.perfil === perfil && String(u2.email).toLowerCase() === email && String(u2.senha) === String(senha)) {
            found = u2;
          }
        });
        if (found) {
          var cargo = ehFuncionario ? (found.cargo || 'administrador') : null;
          if (ehFuncionario && String(cargo).toUpperCase() === 'PENDENTE') {
            return { ok: false, status: 403, data: { erro: 'Email em processamento' } };
          }
          return { ok: true, status: 200, data: { perfil: perfil, nome: found.nome, cargo: cargo, email: email, telefone: found.telefone, endereco: found.endereco, id: found.id } };
        }
        return { ok: false, status: 401, data: { erro: 'E-mail ou senha incorretos.' } };
      }
      return { ok: false, status: res.status, data: res.data };
    });
  }

  function register(usuario) {
    var endpoint = usuario.perfil === 'funcionario' ? '/api/funcionarios' : '/api/clientes';
    return Api.send('POST', endpoint, {
      nome: usuario.nome,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
      tipoTelefone: usuario.tipoTelefone,
      endereco: usuario.endereco,
      rua: usuario.rua,
      numero: usuario.numero,
      bairro: usuario.bairro,
      cidade: usuario.cidade,
      cep: usuario.cep,
      email: (usuario.email || '').trim().toLowerCase(),
      cargo: usuario.cargo,
      senha: usuario.senha,
      confirmarSenha: usuario.confirmarSenha,
    }).then(function (res) {
      var cargoNovo = usuario.perfil === 'funcionario' ? 'PENDENTE' : null;
      if (res.ok && res.data && (res.data.ok || res.data.id != null)) {
        return { ok: true, status: res.status, data: { perfil: usuario.perfil, nome: usuario.nome, email: usuario.email, cargo: cargoNovo, telefone: usuario.telefone, endereco: usuario.endereco, id: res.data.id } };
      }
      if (res.status === 409) {
        return { ok: false, status: 409, data: res.data };
      }
      if (!res.ok && (res.status === 0 || res.status === 404 || res.status === 405 || res.status === 503)) {
        /* modo demonstracao: salva localmente */
        var list = readUsers();
        var email = (usuario.email || '').trim().toLowerCase();
        var dup = false;
        list.forEach(function (u) {
          if (u.perfil === usuario.perfil && String(u.email).toLowerCase() === email) dup = true;
        });
        if (dup) return { ok: false, status: 409, data: { erro: 'E-mail já cadastrado.' } };
        var novo = {
          id: list.length + 1,
          perfil: usuario.perfil,
          nome: usuario.nome,
          telefone: usuario.telefone,
          endereco: usuario.endereco,
          email: email,
          cargo: cargoNovo,
          senha: usuario.senha,
        };
        list.push(novo);
        writeUsers(list);
        return { ok: true, status: 200, data: { perfil: usuario.perfil, nome: usuario.nome, email: email, cargo: cargoNovo, telefone: usuario.telefone, endereco: usuario.endereco, id: novo.id } };
      }
      return { ok: false, status: res.status, data: res.data };
    });
  }

  function getSession() {
    try {
      var s = JSON.parse(localStorage.getItem('pizzaria.sessao'));
      if (s && s.perfil) return s;
    } catch (e) {}
    return null;
  }

  function setSession(s) {
    localStorage.setItem('pizzaria.sessao', JSON.stringify(s));
    if (s && s.perfil === 'cliente') {
      setClient({ id: s.id || 1, nome: s.nome || 'Cliente', telefone: s.telefone || '', endereco: s.endereco || '', email: s.email || '' });
    }
  }

  function clearSession() {
    localStorage.removeItem('pizzaria.sessao');
  }

  function applySession() {
    var s = getSession();
    if (s && s.perfil === 'cliente') applyClient();
    /* Mostra nome e cargo do funcionario na barra lateral */
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-func .sidebar-bottom .name'), function (el) {
      if (s && s.perfil === 'funcionario') {
        var cargoLabel = {
          administrador: 'Administrador',
          balconista:    'Balconista',
          pizzaiolo:     'Pizzaiolo',
        };
        el.textContent = (s.nome || 'Funcionário') + ' — ' + (cargoLabel[s.cargo] || s.cargo || 'Administrador');
      } else {
        el.textContent = 'Administrador';
      }
    });
    /* Mostra nome e cargo no topo da sidebar (perfil) */
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-func .sidebar-top .name'), function (el) {
      if (s && s.perfil === 'funcionario') {
        el.textContent = 'Equipe da pizzaria';
      } else {
        el.textContent = 'Equipe da pizzaria';
      }
    });
  }

  function requireAuth() {
    var page = document.body.getAttribute('data-page');
    var tab = document.body.getAttribute('data-tab');
    if (page !== 'cliente' && page !== 'funcionario') return;
    var s = getSession();
    if (!s || s.perfil !== page) {
      window.location.replace(BASE + '../auth/' + page + '/login.html');
      return;
    }

    /* Controle de acesso por cargo para funcionarios (unica pasta funcionario/) */
    if (s.perfil === 'funcionario' && tab) {
      var cargo = s.cargo || 'administrador';
      var cargoLabel = { administrador: 'Administrador', balconista: 'Balconista', pizzaiolo: 'Pizzaiolo' };
      var paginas = CARGO_PAGES[cargo] || [];
      if (String(cargo).toUpperCase() === 'PENDENTE') {
        clearSession();
        toast('Seu cadastro ainda não foi liberado pelo administrador.', 'warning', 'alert');
        window.location.replace(BASE + '../auth/funcionario/login.html');
        return;
      }
      if (paginas.length === 0 || paginas.indexOf(tab) === -1) {
        /* Cargo nao tem acesso a esta pagina: apenas avisa, nao redireciona */
        toast('Acesso restrito ao seu cargo (' + (cargoLabel[cargo] || cargo) + ').', 'warning', 'alert');
        return;
      }
    }

    if (s.perfil === 'cliente') {
      setClient({ id: s.id, nome: s.nome, telefone: s.telefone, endereco: s.endereco, email: s.email });
    }
    applySession();
    syncServerSession(s);

    /* Impede navegação para paginas sem permissao no sidebar do funcionario */
    if (s.perfil === 'funcionario') {
      bindNavGuard();
    }
  }

  /* Confirma no servidor que o login ainda vale (cookie de sessao). Se o servidor
     esta no ar e a sessao expirou, volta para o login; em modo demo nao faz nada. */
  function syncServerSession(s) {
    detectServer().then(function (ok) {
      if (!ok) return;
      Api.get('/api/me').then(function (res) {
        if (res.status === 401) {
          var destino = (s && s.perfil === 'funcionario') ? 'funcionario' : 'cliente';
          clearSession();
          window.location.replace(BASE + '../auth/' + destino + '/login.html');
        }
      });
    });
  }

  function serverLogout() {
    try { fetch('/api/logout', { method: 'POST', keepalive: true }); } catch (e) {}
  }

  /* Intercepta cliques nos links do sidebar do funcionario para bloquear paginas sem permissao */
  function bindNavGuard() {
    var s = getSession();
    if (!s || s.perfil !== 'funcionario') return;
    var cargo = s.cargo || 'administrador';
    var paginas = CARGO_PAGES[cargo] || [];
    var cargoLabel = { administrador: 'Administrador', balconista: 'Balconista', pizzaiolo: 'Pizzaiolo' };

    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-nav .nav-item'), function (link) {
      link.addEventListener('click', function (ev) {
        var href = link.getAttribute('href');
        if (!href) return;
        /* Extrai o nome da pagina do href, ex: ../pedidos/pedidos.html -> pedidos */
        var m = href.match(/funcionario\/(\w+)\/\1\.html/);
        var tab = m ? m[1] : null;
        if (tab && paginas.indexOf(tab) === -1) {
          ev.preventDefault();
          toast('Acesso restrito ao seu cargo (' + cargoLabel[cargo] + ').', 'warning', 'alert');
        }
      });
    });
  }

  /* ---------------- Tabelas do funcionario ---------------- */
  function slugify(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function pedidoStatusKey(status) {
    var s = slugify(status);
    if (s.indexOf('receb') === 0) return 'recebido';
    if (s.indexOf('preparo') !== -1) return 'preparo';
    if (s.indexOf('saiu') !== -1 || s.indexOf('entrega') !== -1) return 'entrega';
    if (s.indexOf('entreg') !== -1) return 'entregue';
    if (s.indexOf('cancel') !== -1) return 'cancelado';
    return s;
  }

  function cargoInfo(cargo) {
    var c = String(cargo || 'PENDENTE').trim().toUpperCase();
    var label = { ADMINISTRADOR: 'Administrador', GERENTE: 'Gerente',
      ATENDENTE: 'Atendente', BALCONISTA: 'Balconista',
      COZINHEIRO: 'Cozinheiro', PIZZAIOLO: 'Pizzaiolo', PENDENTE: 'Pendente' }[c];
    var tone = { ADMINISTRADOR: 'badge-indigo', GERENTE: 'badge-indigo',
      ATENDENTE: 'badge-blue', BALCONISTA: 'badge-blue',
      COZINHEIRO: 'badge-green', PIZZAIOLO: 'badge-green', PENDENTE: 'badge-yellow' }[c];
    return { key: c, label: label || c, tone: tone || 'badge-gray' };
  }

  function fmtDateBR(v) {
    var s = String(v == null ? '' : v).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4);
    return s || '-';
  }

  var RENDER = {
    clientes: function (rows) {
      return rows.map(function (r) {
        var nome = r.nome || '';
        var iniciais = String(nome).split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase();
        var pedidos = Number(r.pedidos != null ? r.pedidos : (r.totalPedidos || 0));
        var status = pedidos >= 2 ? 'recorrente' : (pedidos === 1 ? 'novo' : 'sempedido');
        return '<tr data-id="' + escapeHtml(r.idCliente || r.id || '') + '" data-status="' + status + '" data-bairro="' + escapeHtml(r.bairro || '') + '">' +
          '<td class="cell-code">#' + String(r.idCliente || r.id || 0).padStart(3, '0') + '</td>' +
          '<td><div class="cli-cell"><span class="cli-avatar">' + escapeHtml(iniciais || '?') + '</span>' +
            '<div><div class="cell-strong">' + escapeHtml(nome) + '</div>' +
            '<div class="cell-sub">' + escapeHtml(r.email || '-') + '</div></div></div></td>' +
          '<td>' + escapeHtml(r.cpf || '-') + '</td>' +
          '<td>' + escapeHtml(r.telefone || '-') + '</td>' +
          '<td><div class="cell-strong">' + escapeHtml(r.endereco || '-') + '</div>' +
            '<div class="cell-sub">' + escapeHtml(r.cidade || r.bairro || '') + '</div></td>' +
          '<td class="cell-muted">' + escapeHtml(r.dataCadastro || '-') + '</td>' +
          '<td>' + escapeHtml(String(pedidos)) + '</td>' +
          '<td class="cell-action"><button type="button" class="link-action" data-edit>Editar</button>' +
            '<svg class="ic chev"><use href="#chevron-right"/></svg></td>' +
          '</tr>';
      }).join('');
    },
    funcionarios: function (rows) {
      var sessao = getSession() || {};
      var podeEditar = String(sessao.cargo || '').toLowerCase() === 'administrador';
      return rows.map(function (r) {
        var nome = r.nome || '';
        var iniciais = String(nome).split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase();
        var cargo = cargoInfo(r.cargo);
        var acao = podeEditar
          ? '<button type="button" class="link-action" data-edit>Editar</button>' +
            '<svg class="ic chev"><use href="#chevron-right"/></svg>'
          : '<span class="cell-muted">Somente administrador</span>';
        return '<tr data-id="' + escapeHtml(r.id || r.idFuncionario || '') + '" data-status="' + slugify(cargo.key) + '">' +
          '<td class="cell-code">#' + String(r.id || r.idFuncionario || 0).padStart(3, '0') + '</td>' +
          '<td><div class="cli-cell"><span class="cli-avatar">' + escapeHtml(iniciais || '?') + '</span>' +
            '<div><div class="cell-strong">' + escapeHtml(nome) + '</div>' +
            '<div class="cell-sub">' + escapeHtml(r.email || '-') + '</div></div></div></td>' +
          '<td><span class="badge ' + cargo.tone + '">' + escapeHtml(cargo.label) + '</span></td>' +
          '<td>' + escapeHtml(r.telefone || '-') + '</td>' +
          '<td class="cell-muted">' + escapeHtml(fmtDateBR(r.dataAdmissao)) + '</td>' +
          '<td class="cell-action">' + acao + '</td>' +
          '</tr>';
      }).join('');
    },
    pizzas: function (rows) {
      var slugs = {
        'margherita': 'margherita.png',
        'pepperoni': 'pepperoni.png',
        'quatro queijos': 'quatro-queijos.png',
        'portuguesa': 'portuguesa.png',
        'calabresa': 'calabresa.png',
        'frango com catupiry': 'frango-catupiry.png',
        'mussarela': 'pepperoni.png',
        'chocolate com morango': 'promo.png',
      };
      return rows.map(function (r) {
        var slug = String(r.nome).toLowerCase();
        var img = slugs[slug] || 'hero.png';
        var ativa = r.ativa === true || r.ativa === 1 || r.ativa === 'true';
        var status = ativa ? slugify(r.categoria) : 'indisponivel';
        return '<tr data-id="' + escapeHtml(r.idPizza) + '" data-status="' + status + '">' +
          '<td class="cell-code">#' + String(r.idPizza).padStart(3, '0') + '</td>' +
          '<td><div style="display:flex;align-items:center;gap:10px"><img src="' + BASE + 'img/' + img + '" alt="" style="width:42px;height:42px;border-radius:10px;object-fit:cover"><span class="cell-strong">' + escapeHtml(r.nome) + '</span></div></td>' +
          '<td>' + catBadge(r.categoria) + '</td>' +
          '<td>' + escapeHtml(r.tamanho) + '</td>' +
          '<td class="cell-price">' + fmtCurrency(r.preco) + '</td>' +
          '<td>' + (ativa ? '<span class="badge badge-green">Sim</span>' : '<span class="badge badge-red">Não</span>') + '</td>' +
          '<td class="cell-action"><button type="button" class="link-action" data-edit>Editar</button>' +
            '<svg class="ic chev"><use href="#chevron-right"/></svg></td>' +
          '</tr>';
      }).join('');
    },
    estoque: function (rows) {
      return rows.map(function (r) {
        var qtd = Number(r.quantidade) || 0;
        var low = qtd <= 5;
        return '<tr data-id="' + escapeHtml(r.idIngrediente || r.id || '') + '" data-status="' + (low ? 'critico' : 'ok') + '" data-unidade="' + escapeHtml(r.unidade || '') + '">' +
          '<td class="cell-code">#' + String(r.idIngrediente || r.id || 0).padStart(3, '0') + '</td>' +
          '<td class="cell-strong">' + escapeHtml(r.nome) + '</td>' +
          '<td class="cell-price">' + fmtCurrency(r.precoUnitario != null ? r.precoUnitario : r.preco) + '</td>' +
          '<td class="qty-cell">' + qtd.toFixed(2).replace('.', ',') + '</td>' +
          '<td>' + escapeHtml(r.unidade || '-') + '</td>' +
          '<td>' + (low ? '<span class="badge badge-red">Crítico</span>' : '<span class="badge badge-green">OK</span>') + '</td>' +
          '<td class="cell-action"><button type="button" class="link-action" data-edit>Editar</button>' +
            '<svg class="ic chev"><use href="#chevron-right"/></svg></td>' +
          '</tr>';
      }).join('');
    },
    pedidos: function (rows) {
      return rows.map(function (r) {
        var func = r.funcionario || r.nomeFuncionario;
        return '<tr data-id="' + escapeHtml(r.idPedido) + '" data-status="' + pedidoStatusKey(r.status) + '">' +
          '<td class="cell-order">#' + escapeHtml(String(r.idPedido)) + '</td>' +
          '<td><div class="cell-strong">' + escapeHtml(r.cliente || r.nomeCliente || '-') + '</div>' +
            '<div class="cell-sub">' + escapeHtml(r.email || '') + '</div></td>' +
          '<td><div class="cell-strong">' + escapeHtml(func || '—') + '</div>' +
            '<div class="cell-sub">' + escapeHtml(func ? '' : 'não atribuído') + '</div></td>' +
          '<td class="cell-time">' + escapeHtml(String(r.dataPedido || '').replace('T', ' ').slice(0, 16)) + '</td>' +
          '<td>' + escapeHtml(r.pagamento || r.formaPagamento || '-') + '</td>' +
          '<td class="cell-total">' + fmtCurrency(r.valorTotal) + '</td>' +
          '<td>' + badge(r.status) + '</td>' +
          '<td class="cell-action"><button type="button" class="link-action" data-edit>Editar</button>' +
            '<svg class="ic chev"><use href="#chevron-right"/></svg></td>' +
          '</tr>';
      }).join('');
    },
  };

  /* ---------------- Editor das tabelas (grava no banco) ---------------- */
  var CATEGORIAS_CACHE = null;
  var editor = null;

  function loadCategorias() {
    if (CATEGORIAS_CACHE) return Promise.resolve(CATEGORIAS_CACHE);
    return Api.get('/api/categorias').then(function (res) {
      CATEGORIAS_CACHE = res.ok && Array.isArray(res.data) ? res.data : [];
      return CATEGORIAS_CACHE;
    });
  }

  function optionsHtml(options, value) {
    return options.map(function (o) {
      var v = o.value != null ? o.value : o;
      var t = o.label != null ? o.label : o;
      return '<option value="' + escapeHtml(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' +
        escapeHtml(t) + '</option>';
    }).join('');
  }

  function fieldHtml(f) {
    var id = 'edit-' + f.name;
    var common = ' id="' + id + '" name="' + f.name + '"' +
      (f.required ? ' required' : '') + (f.disabled ? ' disabled' : '');
    var control;
    if (f.type === 'checkbox') {
      return '<label class="edit-check"><input type="checkbox" id="' + id + '" name="' + f.name + '"' +
        (f.value ? ' checked' : '') + '><span>' + escapeHtml(f.label) + '</span></label>';
    }
    if (f.type === 'select') {
      control = '<select' + common + '>' + optionsHtml(f.options, f.value) + '</select>';
    } else if (f.type === 'textarea') {
      control = '<textarea' + common + (f.rows ? ' rows="' + f.rows + '"' : '') + '>' +
        escapeHtml(f.value == null ? '' : f.value) + '</textarea>';
    } else {
      control = '<input type="' + (f.type || 'text') + '"' + common +
        ' value="' + escapeHtml(f.value == null ? '' : f.value) + '"' +
        (f.step ? ' step="' + f.step + '"' : '') +
        (f.min != null ? ' min="' + f.min + '"' : '') +
        (f.placeholder ? ' placeholder="' + escapeHtml(f.placeholder) + '"' : '') + '>';
    }
    return '<div class="field"><label for="' + id + '">' + escapeHtml(f.label) + '</label>' + control + '</div>';
  }

  function editorFields(kind, row, categorias) {
    if (kind === 'clientes') {
      return [
        { name: 'nome', label: 'Nome completo', value: row.nome, required: true },
        { name: 'telefone', label: 'Telefone', value: row.telefone, placeholder: '(11) 99999-9999' },
        { name: 'endereco', label: 'Endereço', value: row.endereco, placeholder: 'Rua, número' },
      ];
    }
    if (kind === 'pizzas') {
      var cats = (categorias || []).map(function (c) {
        return { value: c.idCategoria, label: c.nome };
      });
      if (!cats.length && row.idCategoria != null) {
        cats = [{ value: row.idCategoria, label: row.categoria || 'Categoria atual' }];
      }
      return [
        { name: 'nome', label: 'Nome da pizza', value: row.nome, required: true },
        { name: 'descricao', label: 'Descrição', type: 'textarea', value: row.descricao, rows: 3 },
        { name: 'idCategoria', label: 'Categoria', type: 'select', options: cats, value: row.idCategoria, required: true },
        { name: 'tamanho', label: 'Tamanho', type: 'select', options: [
          { value: 'P', label: 'P (broto)' }, { value: 'M', label: 'M (média)' },
          { value: 'G', label: 'G (grande)' }, { value: 'U', label: 'U (unidade/bebida)' },
        ], value: row.tamanho, required: true },
        { name: 'preco', label: 'Preço (R$)', type: 'number', step: '0.01', min: 0, value: row.preco, required: true },
        { name: 'ativa', label: 'Disponível no cardápio', type: 'checkbox', value: row.ativa === true || row.ativa === 1 || row.ativa === 'true' },
      ];
    }
    if (kind === 'estoque') {
      return [
        { name: 'nome', label: 'Ingrediente', value: row.nome, required: true },
        { name: 'precoUnitario', label: 'Preço unitário (R$)', type: 'number', step: '0.01', min: 0, value: row.precoUnitario != null ? row.precoUnitario : row.preco, required: true },
        { name: 'quantidade', label: 'Quantidade', type: 'number', step: '0.01', min: 0, value: row.quantidade, required: true },
        { name: 'unidade', label: 'Unidade', value: row.unidade, placeholder: 'kg, un, L...', required: true },
      ];
    }
    if (kind === 'funcionarios') {
      var cargoAtual = String(row.cargo || 'PENDENTE').trim().toUpperCase();
      var cargos = [
        { value: 'ADMINISTRADOR', label: 'Administrador' },
        { value: 'GERENTE', label: 'Gerente' },
        { value: 'ATENDENTE', label: 'Atendente' },
        { value: 'BALCONISTA', label: 'Balconista' },
        { value: 'COZINHEIRO', label: 'Cozinheiro' },
        { value: 'PIZZAIOLO', label: 'Pizzaiolo' },
        { value: 'PENDENTE', label: 'Pendente (sem acesso)' },
      ];
      var conhecido = cargos.some(function (c) { return c.value === cargoAtual; });
      if (!conhecido && cargoAtual) cargos.unshift({ value: cargoAtual, label: cargoAtual });
      return [
        { name: 'nome', label: 'Nome completo', value: row.nome, required: true },
        { name: 'email', label: 'E-mail corporativo', type: 'email', value: row.email, required: true },
        { name: 'cargo', label: 'Cargo', type: 'select', options: cargos, value: cargoAtual, required: true },
        { name: 'telefone', label: 'Telefone', value: row.telefone, placeholder: '(11) 99999-9999' },
      ];
    }
    var statusAtual = row.status || 'Recebido';
    var status = ['Recebido', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado'];
    if (status.indexOf(statusAtual) === -1) status.unshift(statusAtual);
    return [
      { name: 'status', label: 'Status do pedido', type: 'select', options: status, value: statusAtual, required: true },
      { name: 'formaPagamento', label: 'Forma de pagamento', value: row.pagamento || row.formaPagamento || '', required: true },
    ];
  }

  function createFields(kind, data) {
    data = data || {};
    if (kind === 'clientes') {
      return [
        { name: 'nome', label: 'Nome completo', required: true },
        { name: 'cpf', label: 'CPF', placeholder: '000.000.000-00', required: true },
        { name: 'email', label: 'E-mail', type: 'email', required: true },
        { name: 'telefone', label: 'Telefone', placeholder: '(11) 99999-9999', required: true },
        { name: 'tipoTelefone', label: 'Tipo de telefone', type: 'select', options: [
          { value: 'CELULAR', label: 'Celular' },
          { value: 'RESIDENCIAL', label: 'Residencial' },
          { value: 'COMERCIAL', label: 'Comercial' },
        ], value: 'CELULAR', required: true },
        { name: 'senha', label: 'Senha de acesso', type: 'password', required: true },
        { name: 'confirmarSenha', label: 'Confirmar senha', type: 'password', required: true },
        { name: 'cep', label: 'CEP', placeholder: '00000-000', required: true },
        { name: 'rua', label: 'Rua', required: true },
        { name: 'numero', label: 'Número', type: 'number', min: 1, required: true },
        { name: 'bairro', label: 'Bairro', required: true },
        { name: 'cidade', label: 'Cidade', required: true },
      ];
    }
    if (kind === 'pizzas') {
      var catsNovo = (data.categorias || []).map(function (c) {
        return { value: c.idCategoria, label: c.nome };
      });
      return [
        { name: 'nome', label: 'Nome da pizza', required: true },
        { name: 'descricao', label: 'Descrição', type: 'textarea', rows: 3 },
        { name: 'idCategoria', label: 'Categoria', type: 'select', options: catsNovo, required: true },
        { name: 'tamanho', label: 'Tamanho', type: 'select', options: [
          { value: 'P', label: 'P (broto)' }, { value: 'M', label: 'M (média)' },
          { value: 'G', label: 'G (grande)' }, { value: 'U', label: 'U (unidade/bebida)' },
        ], value: 'M', required: true },
        { name: 'preco', label: 'Preço (R$)', type: 'number', step: '0.01', min: 0, required: true },
        { name: 'ativa', label: 'Disponível no cardápio', type: 'checkbox', value: true },
      ];
    }
    if (kind === 'estoque') {
      return [
        { name: 'nome', label: 'Ingrediente', required: true },
        { name: 'precoUnitario', label: 'Preço unitário (R$)', type: 'number', step: '0.01', min: 0, required: true },
        { name: 'quantidade', label: 'Quantidade inicial', type: 'number', step: '0.01', min: 0, value: 0, required: true },
        { name: 'unidade', label: 'Unidade', placeholder: 'kg, un, L...', required: true },
      ];
    }
    var clientes = (data.clientes || []).map(function (c) {
      return { value: c.idCliente || c.id, label: c.nome };
    });
    var pizzas = (data.pizzas || []).filter(function (p) {
      return p.ativa === true || p.ativa === 1 || p.ativa === 'true';
    }).map(function (p) {
      return { value: p.idPizza, label: p.nome + ' — ' + fmtCurrency(p.preco) };
    });
    return [
      { name: 'idCliente', label: 'Cliente', type: 'select', options: clientes, required: true },
      { name: 'idPizza', label: 'Item do cardápio', type: 'select', options: pizzas, required: true },
      { name: 'quantidade', label: 'Quantidade', type: 'number', min: 1, value: 1, required: true },
      { name: 'pagamento', label: 'Forma de pagamento', type: 'select', options: [
        { value: 'Pix', label: 'Pix' },
        { value: 'Dinheiro', label: 'Dinheiro' },
        { value: 'Cartão de crédito', label: 'Cartão de crédito' },
        { value: 'Cartão de débito', label: 'Cartão de débito' },
      ], value: 'Pix', required: true },
      { name: 'taxa', label: 'Taxa de entrega (R$)', type: 'number', step: '0.01', min: 0, value: 0 },
    ];
  }

  function ensureEditor() {
    if (editor) return editor;
    editor = document.createElement('div');
    editor.className = 'edit-modal';
    editor.hidden = true;
    editor.innerHTML =
      '<div class="edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title">' +
        '<div class="edit-head"><div><h2 id="edit-title">Editar</h2>' +
          '<p class="edit-sub">A alteração é gravada direto no banco de dados.</p></div>' +
          '<button type="button" class="edit-x" data-close aria-label="Fechar">&times;</button></div>' +
        '<form class="edit-form" novalidate>' +
          '<div class="edit-fields"></div>' +
          '<div class="form-error" role="alert"></div>' +
          '<div class="edit-actions">' +
            '<button type="button" class="btn btn-outline" data-close>Cancelar</button>' +
            '<button type="submit" class="btn btn-primary">Salvar alterações</button>' +
          '</div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(editor);
    editor.addEventListener('click', function (ev) {
      if (ev.target === editor || ev.target.closest('[data-close]')) closeEditor();
    });
    editor.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      submitEditor();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !editor.hidden) closeEditor();
    });
    return editor;
  }

  function closeEditor() {
    if (!editor) return;
    editor.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function showEditor(kind, row, table, categorias, mode, data) {
    var m = ensureEditor();
    var criando = mode === 'create';
    var titles = {
      clientes: criando ? 'Novo cliente' : 'Editar cliente',
      funcionarios: 'Editar funcionário',
      pizzas: criando ? 'Nova pizza' : 'Editar pizza',
      estoque: criando ? 'Novo item de estoque' : 'Editar estoque',
      pedidos: criando ? 'Novo pedido' : 'Editar pedido',
    };
    m._kind = kind;
    m._row = row;
    m._table = table;
    m._mode = criando ? 'create' : 'edit';
    m.querySelector('#edit-title').textContent = titles[kind] || (criando ? 'Novo registro' : 'Editar');
    m.querySelector('.edit-sub').textContent = criando
      ? 'O novo registro será gravado direto no banco de dados.'
      : 'A alteração é gravada direto no banco de dados.';
    var fields = criando ? createFields(kind, data) : editorFields(kind, row, categorias);
    m.querySelector('.edit-fields').innerHTML = fields.map(fieldHtml).join('');
    var error = m.querySelector('.form-error');
    error.className = 'form-error';
    error.textContent = '';
    var submit = m.querySelector('button[type="submit"]');
    submit.disabled = false;
    submit.textContent = criando ? 'Cadastrar' : 'Salvar alterações';
    m.hidden = false;
    document.body.classList.add('modal-open');
    var first = m.querySelector('.edit-fields input, .edit-fields select, .edit-fields textarea');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }

  function openEditor(kind, row, table) {
    if (kind === 'pizzas') {
      loadCategorias().then(function (categorias) {
        showEditor(kind, row, table, categorias);
      });
    } else {
      showEditor(kind, row, table, []);
    }
  }

  function openCreate(kind, table) {
    var data = {};
    var tarefas = [];
    if (kind === 'pizzas') {
      tarefas.push(loadCategorias().then(function (categorias) {
        data.categorias = categorias;
      }));
    }
    if (kind === 'pedidos') {
      tarefas.push(Api.get('/api/clientes').then(function (res) {
        data.clientes = res.ok && Array.isArray(res.data) ? res.data : [];
      }));
      tarefas.push(Api.get('/api/pizzas').then(function (res) {
        data.pizzas = res.ok && Array.isArray(res.data) ? res.data : [];
      }));
    }
    Promise.all(tarefas).then(function () {
      if (kind === 'pizzas' && !(data.categorias || []).length) {
        toast('Cadastre uma categoria antes de criar uma pizza.', 'warning', 'alert');
        return;
      }
      if (kind === 'pedidos') {
        var temCliente = (data.clientes || []).length > 0;
        var temPizza = (data.pizzas || []).some(function (p) {
          return p.ativa === true || p.ativa === 1 || p.ativa === 'true';
        });
        if (!temCliente || !temPizza) {
          toast('É preciso ter ao menos um cliente e um item ativo no cardápio.', 'warning', 'alert');
          return;
        }
      }
      showEditor(kind, {}, table, [], 'create', data);
    });
  }

  function collectEditor(kind, form) {
    var get = function (name) {
      var el = form.elements[name];
      if (!el) return '';
      if (el.type === 'checkbox') return el.checked;
      return el.value;
    };
    if (kind === 'clientes') {
      return { nome: get('nome').trim(), telefone: get('telefone').trim(), endereco: get('endereco').trim() };
    }
    if (kind === 'pizzas') {
      return {
        nome: get('nome').trim(),
        descricao: get('descricao').trim(),
        idCategoria: Number(get('idCategoria')),
        tamanho: get('tamanho'),
        preco: Number(get('preco')),
        ativa: get('ativa'),
      };
    }
    if (kind === 'estoque') {
      return {
        nome: get('nome').trim(),
        precoUnitario: Number(get('precoUnitario')),
        quantidade: Number(get('quantidade')),
        unidade: get('unidade').trim(),
      };
    }
    if (kind === 'funcionarios') {
      return {
        nome: get('nome').trim(),
        email: get('email').trim().toLowerCase(),
        cargo: get('cargo'),
        telefone: get('telefone').trim(),
      };
    }
    return { status: get('status'), formaPagamento: get('formaPagamento').trim() };
  }

  function collectCreate(kind, form) {
    var get = function (name) {
      var el = form.elements[name];
      if (!el) return '';
      if (el.type === 'checkbox') return el.checked;
      return el.value;
    };
    if (kind === 'clientes') {
      return {
        nome: get('nome').trim(),
        cpf: get('cpf').trim(),
        email: get('email').trim().toLowerCase(),
        senha: get('senha'),
        confirmarSenha: get('confirmarSenha'),
        telefone: get('telefone').trim(),
        tipoTelefone: get('tipoTelefone'),
        cep: get('cep').trim(),
        rua: get('rua').trim(),
        numero: Number(get('numero')),
        bairro: get('bairro').trim(),
        cidade: get('cidade').trim(),
      };
    }
    if (kind === 'pizzas') {
      return {
        nome: get('nome').trim(),
        descricao: get('descricao').trim(),
        idCategoria: Number(get('idCategoria')),
        tamanho: get('tamanho'),
        preco: Number(get('preco')),
        ativa: get('ativa'),
      };
    }
    if (kind === 'estoque') {
      return {
        nome: get('nome').trim(),
        precoUnitario: Number(get('precoUnitario')),
        quantidade: Number(get('quantidade')),
        unidade: get('unidade').trim(),
      };
    }
    return {
      idCliente: Number(get('idCliente')),
      idPizza: Number(get('idPizza')),
      quantidade: Number(get('quantidade')),
      pagamento: get('pagamento'),
      taxa: Number(get('taxa')),
    };
  }

  function submitEditor() {
    if (!editor) return;
    var kind = editor._kind;
    var row = editor._row;
    var table = editor._table;
    var form = editor.querySelector('form');
    var error = editor.querySelector('.form-error');
    var submit = editor.querySelector('button[type="submit"]');
    var criando = editor._mode === 'create';
    var body = criando ? collectCreate(kind, form) : collectEditor(kind, form);

    var invalido = false;
    if (criando) {
      if (kind === 'clientes') {
        invalido = !body.nome || !body.cpf || !body.email || !body.senha || !body.confirmarSenha
          || body.senha !== body.confirmarSenha || !body.telefone || !body.tipoTelefone
          || !body.cep || !body.rua || !Number.isFinite(body.numero) || body.numero <= 0
          || !body.bairro || !body.cidade;
      } else if (kind === 'pizzas') {
        invalido = !body.nome || !body.tamanho || !Number.isFinite(body.preco) || body.preco < 0
          || !Number.isFinite(body.idCategoria);
      } else if (kind === 'estoque') {
        invalido = !body.nome || !body.unidade || !Number.isFinite(body.precoUnitario)
          || body.precoUnitario < 0 || !Number.isFinite(body.quantidade) || body.quantidade < 0;
      } else {
        invalido = !Number.isFinite(body.idCliente) || !Number.isFinite(body.idPizza)
          || !Number.isFinite(body.quantidade) || body.quantidade < 1;
      }
    } else if (kind === 'clientes') invalido = !body.nome;
    else if (kind === 'pizzas') invalido = !body.nome || !body.tamanho || !Number.isFinite(body.preco) || body.preco < 0 || !Number.isFinite(body.idCategoria);
    else if (kind === 'estoque') invalido = !body.nome || !body.unidade || !Number.isFinite(body.precoUnitario) || body.precoUnitario < 0 || !Number.isFinite(body.quantidade) || body.quantidade < 0;
    else if (kind === 'funcionarios') invalido = !body.nome || !body.email || !body.cargo;
    else invalido = !body.status || !body.formaPagamento;

    if (invalido) {
      error.className = 'form-error show';
      error.textContent = criando && kind === 'clientes' && body.senha !== body.confirmarSenha
        ? 'As senhas não conferem.'
        : 'Preencha todos os campos corretamente.';
      return;
    }

    var id = kind === 'clientes' ? (row.idCliente || row.id)
      : kind === 'funcionarios' ? (row.id || row.idFuncionario)
      : kind === 'pizzas' ? row.idPizza
      : kind === 'estoque' ? (row.idIngrediente || row.id)
      : row.idPedido;
    var url = criando
      ? (kind === 'clientes' ? '/api/clientes'
        : kind === 'pizzas' ? '/api/pizzas'
        : kind === 'estoque' ? '/api/estoque'
        : '/api/pedidos/painel')
      : (kind === 'clientes' ? '/api/clientes/' + id
        : kind === 'funcionarios' ? '/api/funcionarios/' + id
        : kind === 'pizzas' ? '/api/pizzas/' + id
        : kind === 'estoque' ? '/api/estoque/' + id
        : '/api/pedidos/' + id);

    error.className = 'form-error';
    error.textContent = '';
    submit.disabled = true;
    submit.textContent = criando ? 'Cadastrando...' : 'Salvando...';

    Api.send(criando ? 'POST' : 'PUT', url, body).then(function (res) {
      submit.disabled = false;
      submit.textContent = criando ? 'Cadastrar' : 'Salvar alterações';
      if (res.ok && res.data && res.data.ok !== false) {
        closeEditor();
        toast(res.data.mensagem || (criando ? 'Registro cadastrado no banco.' : 'Alterações salvas no banco.'), 'success', 'check');
        reloadTable(table);
        return;
      }
      error.className = 'form-error show';
      error.textContent = (res.data && (res.data.erro || res.data.mensagem)) || 'Não foi possível salvar. Confira a conexão com o banco.';
    });
  }

  function reloadTable(table) {
    if (!table) return;
    var tbody = table.querySelector('tbody');
    var header = table.querySelector('thead tr');
    var cols = header ? header.children.length : 8;
    Api.get(table._endpoint).then(function (res) {
      if (!res.ok || !Array.isArray(res.data)) return;
      table._rows = res.data;
      if (res.data.length) {
        tbody.innerHTML = RENDER[table._kind](res.data);
      } else {
        tbody.innerHTML = '<tr><td colspan="' + cols + '" class="cell-muted" style="text-align:center;padding:28px">Nenhum registro cadastrado.</td></tr>';
      }
      table.dispatchEvent(new CustomEvent('pizzaria:updated', { bubbles: true }));
    });
  }

  function bindTable(table, endpoint, kind) {
    if (!table) return;
    table._endpoint = endpoint;
    table._kind = kind;
    if (!table._editBound) {
      table.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-edit]');
        if (!btn) return;
        var tr = btn.closest('tr');
        var id = tr ? tr.getAttribute('data-id') : null;
        var row = (table._rows || []).filter(function (r) {
          var rid = table._kind === 'clientes' ? (r.idCliente || r.id)
            : table._kind === 'funcionarios' ? (r.id || r.idFuncionario)
            : table._kind === 'pizzas' ? r.idPizza
            : table._kind === 'estoque' ? (r.idIngrediente || r.id)
            : r.idPedido;
          return String(rid) === String(id);
        })[0];
        if (row) openEditor(table._kind, row, table);
      });
      table._editBound = true;
    }
    reloadTable(table);
  }

  function bindSearch() {
    Array.prototype.forEach.call(document.querySelectorAll('input[data-search]'), function (input) {
      input.addEventListener('input', function () {
        var target = document.querySelector(input.getAttribute('data-search'));
        if (!target) return;
        var q = input.value.toLowerCase();
        Array.prototype.forEach.call(target.querySelectorAll('tbody tr'), function (tr) {
          tr.style.display = tr.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });
    });
  }

  /* ---------------- Auto-run: paginas do cliente / funcionario ---------------- */
  var _page = document.body.getAttribute('data-page');

  /* Etiqueta cinza no topo do fundo escuro (ex.: "Home", "Painel administrativo") */
  var TAGS = {
    home: 'Home',
    menu: 'Cardápio',
    produto: 'Cardápio',
    carrinho: 'Carrinho',
    checkout: 'Checkout',
    rastreio: 'Acompanhar pedido',
    historico: 'Histórico',
    config: 'Minha conta',
    clientes: 'Clientes',
    pizzas: 'Cardápio',
    estoque: 'Estoque',
    pedidos: 'Painel administrativo',
    relatorios: 'Relatórios',
  };
  /* Etiqueta de pagina (era do Figma) — removida: nao aparece em nenhuma tela */

  /* Modo demonstracao: banner ativo em todas as paginas quando nao ha backend */
  try { detectServer(); } catch (e) {}

  if (_page === 'cliente' || _page === 'funcionario') {
    requireAuth();
    if (_page === 'cliente') {
      applyClient();
      Cart.renderCount();
    }
    /* "Encerrar Sessao" / "Sair do Sistema" */
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-bottom a[href*="login.html"]'), function (a) {
      a.addEventListener('click', function () {
        clearSession();
        serverLogout();
      });
    });
  }

  /* Botoes "Novo ..." das tabelas: data-add="<tipo da tabela>" */
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-add]');
    if (!btn) return;
    ev.preventDefault();
    var kind = btn.getAttribute('data-add');
    var table = document.querySelector('table[data-api="' + kind + '"]');
    openCreate(kind, table);
  });

  /* helpers exportados para os scripts de cada pagina */
  window.Pizzaria = {
    CARGO_PAGES: CARGO_PAGES,
    Api: Api,
    detectServer: detectServer,
    loadConfig: loadConfig,
    applyConfig: applyConfig,
    updatePreview: updatePreview,
    get CONFIG() { return CONFIG; },
    set CONFIG(v) { CONFIG = v; },
    Cart: Cart,
    getClient: getClient,
    setClient: setClient,
    applyClient: applyClient,
    login: login,
    register: register,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    applySession: applySession,
    requireAuth: requireAuth,
    PIZZAS: PIZZAS,
    RECO: RECO,
    toast: toast,
    fmtCurrency: fmtCurrency,
    badge: badge,
    catBadge: catBadge,
    bindTable: bindTable,
    bindSearch: bindSearch,
    openCreate: openCreate,
    maskTelefone: maskTelefone,
    maskCEP: maskCEP,
    escapeHtml: escapeHtml,
  };
})();
