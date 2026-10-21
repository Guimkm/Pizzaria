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
    return Api.get('api/health').then(function (res) {
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
    return Api.get('api/config').then(function (res) {
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
    { perfil: 'funcionario', nome: 'Administrador', cargo: 'Gerente', email: 'adm@email.com', senha: 'admin123' },
  ];

  function seedUsers() {
    var u;
    try { u = JSON.parse(localStorage.getItem('pizzaria.usuarios')); } catch (e) {}
    if (!Array.isArray(u) || !u.length) {
      localStorage.setItem('pizzaria.usuarios', JSON.stringify(DEMO_USERS));
    }
  }

  function readUsers() {
    seedUsers();
    try { return JSON.parse(localStorage.getItem('pizzaria.usuarios')); } catch (e) { return []; }
  }

  function writeUsers(list) {
    localStorage.setItem('pizzaria.usuarios', JSON.stringify(list));
  }

  function login(perfil, email, senha) {
    email = (email || '').trim().toLowerCase();
    var endpoint = perfil === 'funcionario' ? 'api/funcionarios/login' : 'api/clientes/login';
    return Api.send('POST', endpoint, { email: email, senha: senha }).then(function (res) {
      if (res.ok && res.data && res.data.ok) {
        var u = res.data.usuario || {};
        return { ok: true, status: res.status, data: { perfil: perfil, nome: u.nome || 'Usuário', cargo: u.cargo, email: email, telefone: u.telefone, endereco: u.endereco, id: u.idCliente || u.id } };
      }
      if (res.status === 0 || res.status === 404) {
        /* servidor offline / endpoint inexistente: modo demonstracao */
        var found = null;
        readUsers().forEach(function (u2) {
          if (u2.perfil === perfil && String(u2.email).toLowerCase() === email && String(u2.senha) === String(senha)) {
            found = u2;
          }
        });
        if (found) {
          return { ok: true, status: 200, data: { perfil: perfil, nome: found.nome, cargo: found.cargo, email: email, telefone: found.telefone, endereco: found.endereco, id: found.id } };
        }
        return { ok: false, status: 401, data: { erro: 'E-mail ou senha incorretos.' } };
      }
      return { ok: false, status: res.status, data: res.data };
    });
  }

  function register(usuario) {
    var endpoint = usuario.perfil === 'funcionario' ? 'api/funcionarios' : 'api/clientes';
    return Api.send('POST', endpoint, {
      nome: usuario.nome,
      telefone: usuario.telefone,
      endereco: usuario.endereco,
      email: (usuario.email || '').trim().toLowerCase(),
      cargo: usuario.cargo,
      senha: usuario.senha,
    }).then(function (res) {
      if (res.ok && res.data && (res.data.ok || res.data.id != null)) {
        return { ok: true, status: res.status, data: { perfil: usuario.perfil, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo, telefone: usuario.telefone, endereco: usuario.endereco, id: res.data.id } };
      }
      if (res.status === 409) {
        return { ok: false, status: 409, data: res.data };
      }
      if (res.status === 0 || res.status === 404) {
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
          cargo: usuario.cargo,
          senha: usuario.senha,
        };
        list.push(novo);
        writeUsers(list);
        return { ok: true, status: 200, data: { perfil: usuario.perfil, nome: usuario.nome, email: email, cargo: usuario.cargo, telefone: usuario.telefone, endereco: usuario.endereco, id: novo.id } };
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
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-func .sidebar-bottom .name'), function (el) {
      el.textContent = (s && s.perfil === 'funcionario' && s.nome) ? s.nome : 'Administrador';
    });
  }

  function requireAuth() {
    var page = document.body.getAttribute('data-page');
    if (page !== 'cliente' && page !== 'funcionario') return;
    var s = getSession();
    if (!s || s.perfil !== page) {
      window.location.replace(BASE + '../login/login.html');
      return;
    }
    if (s.perfil === 'cliente') {
      setClient({ id: s.id, nome: s.nome, telefone: s.telefone, endereco: s.endereco, email: s.email });
    }
    applySession();
  }

  /* ---------------- Tabelas do funcionario ---------------- */
  var RENDER = {
    clientes: function (rows) {
      return rows.map(function (r) {
        return '<tr>' +
          '<td class="cell-code">#' + String(r.idCliente).padStart(3, '0') + '</td>' +
          '<td class="cell-strong">' + escapeHtml(r.nome) + '</td>' +
          '<td>' + escapeHtml(r.telefone) + '</td>' +
          '<td>' + escapeHtml(r.endereco) + '</td>' +
          '<td>' + escapeHtml(r.email || '-') + '</td>' +
          '<td class="cell-muted">' + escapeHtml(r.dataCadastro || '-') + '</td>' +
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
        var ativa = r.ativa || r.ativa === 1;
        return '<tr>' +
          '<td class="cell-code">#' + String(r.idPizza).padStart(3, '0') + '</td>' +
          '<td><div style="display:flex;align-items:center;gap:10px"><img src="' + BASE + 'img/' + img + '" alt="" style="width:42px;height:42px;border-radius:10px;object-fit:cover"><span class="cell-strong">' + escapeHtml(r.nome) + '</span></div></td>' +
          '<td>' + catBadge(r.categoria) + '</td>' +
          '<td>' + escapeHtml(r.tamanho) + '</td>' +
          '<td class="cell-price">' + fmtCurrency(r.preco) + '</td>' +
          '<td>' + (ativa ? '<span class="badge badge-green">Sim</span>' : '<span class="badge badge-red">Não</span>') + '</td>' +
          '</tr>';
      }).join('');
    },
    estoque: function (rows) {
      return rows.map(function (r) {
        var low = Number(r.quantidade) <= 5;
        return '<tr>' +
          '<td class="cell-code">#' + String(r.idIngrediente).padStart(3, '0') + '</td>' +
          '<td class="cell-strong">' + escapeHtml(r.nome) + '</td>' +
          '<td class="cell-strong" style="color:' + (low ? '#991b1b' : 'inherit') + '">' + escapeHtml(r.quantidade) + '</td>' +
          '<td>' + escapeHtml(r.unidade) + '</td>' +
          '<td>' + (low ? '<span class="badge badge-red">Crítico</span>' : '<span class="badge badge-green">OK</span>') + '</td>' +
          '</tr>';
      }).join('');
    },
    pedidos: function (rows) {
      return rows.map(function (r) {
        return '<tr>' +
          '<td class="cell-price">#' + escapeHtml(r.idPedido) + '</td>' +
          '<td class="cell-strong">' + escapeHtml(r.cliente) + '</td>' +
          '<td class="cell-muted">' + escapeHtml(String(r.dataPedido || '').replace('T', ' ').slice(0, 19)) + '</td>' +
          '<td>' + badge(r.status) + '</td>' +
          '<td style="font-family:var(--font-display);font-size:1rem">' + fmtCurrency(r.valorTotal) + '</td>' +
          '</tr>';
      }).join('');
    },
  };

  function bindTable(table, endpoint, kind) {
    if (!table) return;
    var tbody = table.querySelector('tbody');
    Api.get(endpoint).then(function (res) {
      if (res.ok && Array.isArray(res.data) && res.data.length) {
        tbody.innerHTML = RENDER[kind](res.data);
      }
    });
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
      });
    });
  }

  /* helpers exportados para os scripts de cada pagina */
  window.Pizzaria = {
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
    maskTelefone: maskTelefone,
    maskCEP: maskCEP,
    escapeHtml: escapeHtml,
  };
})();
