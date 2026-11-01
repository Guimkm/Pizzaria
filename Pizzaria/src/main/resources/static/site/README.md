# Pizzaria Sabores Italiano — Frontend

Site estático (HTML + CSS + JS, sem build) da pizzaria: landing, login/cadastro,
área do cliente e painel do funcionário. Roda com qualquer servidor estático:

```bash
cd frontend
python3 -m http.server 8899
# http://localhost:8899
```

Sem backend Java/banco, o sistema entra em **modo demonstração** automaticamente
(o banner no topo avisa) — credenciais de teste estão na tela de login.

---

## Estrutura

```
Pizzaria_Front/
│
├── README.md                  ← este arquivo
│

│
├── banco/
│   └── PizzariaDB_Completo.sql   ← script do banco (tabelas Cliente, Pedido,
│                                    Ingredientes, Funcionario, Pizza, ...)
│
└── frontend/                  ← tudo que o navegador carrega
    │
    ├── index.html             ← landing page (entrada do site)
    │
    ├── assets/                ← compartilhado por TODAS as páginas
    │   ├── css/base.css       ← design system: tokens, botões, tabelas, sidebar
    │   ├── css/landing.css    ← estilos só da landing (index.html)
    │   ├── js/base.js         ← auth/sessão, demo, carrinho, toasts, RENDER das tabelas
    │   ├── js/icons.js        ← sprite único dos ícones (injetado em toda página)
    │   ├── img/               ← fotos das pizzas + favicon.svg
    │   └── (img/ é a única pasta de imagens: nada fora daqui)
    │
    ├── auth/                  ← páginas de acesso (sem sessão)
    │   ├── login/             ← login.html + login.css + login.js
    │   └── cadastro/          ← cadastro.html + cadastro.css + cadastro.js
    │
    ├── cliente/               ← área do cliente (exige sessão com perfil "cliente")
    │   ├── home/              ← painel inicial
    │   ├── menu/              ← cardápio com filtros de categoria
    │   ├── produto/           ← detalhe do produto
    │   ├── carrinho/          ← carrinho
    │   ├── checkout/          ← confirmação e pagamento
    │   ├── rastreio/          ← acompanhamento do pedido
    │   ├── historico/         ← histórico de pedidos
    │   └── config/            ← minha conta
    │
    └── funcionario/           ← painel interno (exige sessão com perfil "funcionario"
                                  + cargo liberado, ver CARGO_PAGES em base.js)
        ├── pedidos/           ← pedidos do dia (página principal)
        ├── clientes/          ← base de clientes
        ├── estoque/           ← ingredientes/estoque
        ├── pizzas/            ← cardápio (CRUD de pizzas)
        └── relatorios/        ← relatórios
```

## Convenções

- **Cada página tem sua própria pasta** com `pagina.html` + `pagina.css` + `pagina.js`.
  Nada de CSS/JS solto na raiz.
- **Só existem 3 arquivos compartilhados**: `assets/css/base.css`,
  `assets/js/base.js` e `assets/js/icons.js`. Todo o resto é específico da página.
- **Ícones**: nenhum HTML embute sprite. Use `<svg class="ic"><use href="#id"/></svg>`
  — os `<symbol>` vêm de `assets/js/icons.js` (carregado antes do `base.js`).
- **Favicon**: um único arquivo `assets/img/favicon.svg`, referenciado por todas as páginas.
- **Caminhos**: páginas em `cliente/` e `funcionario/` usam `../../assets/...`;
  `auth/` também `../../assets/...`; a landing usa `assets/...`.
  O `base.js` recebe o prefixo pelo atributo `data-base` no `<script>`.
- **Identidade**: fontes Lilita One (títulos) + Nunito (texto); `#EFA54A` (laranja),
  `#D9641F` (preços/destaques), `#AAB127` (verde). Detalhes em `frontend/assets/css/base.css`.
- **Sessão**: gravada em `localStorage` (`pizzaria.sessao`) como JSON com `perfil`
  (`cliente` | `funcionario`) e, para equipe, `cargo`.
