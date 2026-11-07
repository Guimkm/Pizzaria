# 🍕 Pizzaria Sabores Italiano

Sistema full-stack para gestão e vendas de uma pizzaria: site de pedidos online
(cardápio, carrinho, checkout e rastreio) + painel interno da equipe
(pedidos, clientes, estoque, cardápio e relatórios).

- **Backend:** Java 21 + Spring Boot (MVC/REST) + JDBC (SQL Server)
- **Frontend:** HTML + CSS + JS puro (sem build), servido pelo próprio Spring Boot
- **Banco:** Microsoft SQL Server (porta 1433)

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do banco](#configuração-do-banco)
- [Criando o banco de dados](#criando-o-banco-de-dados)
- [Rodando o projeto](#rodando-o-projeto)
- [Primeiro administrador](#primeiro-administrador)
- [Regras de cadastro e login](#regras-de-cadastro-e-login)
- [Endpoints da API](#endpoints-da-api)
- [Modo demonstração](#modo-demonstração)
- [Testes](#testes)
- [Documentação relacionada](#documentação-relacionada)

---

## Funcionalidades

### Área do cliente
- Cadastro e login com sessão no servidor (cookie) e opção “manter conectado” (14 dias)
- Cardápio com filtro por categoria e detalhe de cada pizza
- Carrinho, checkout (pagamento + taxa de entrega + cupom) e gravação do pedido
- Acompanhamento (rastreio) e histórico de pedidos
- “Minha conta”: atualização de dados pessoais, endereço e telefone

### Painel do funcionário (exige login de equipe com cargo liberado)
- Pedidos do dia (criação e atualização de status/pagamento)
- Base de clientes
- Estoque de ingredientes
- CRUD de pizzas do cardápio
- Relatórios e resumos

### Segurança e regras
- Sessão no servidor (cookie `HttpOnly`, `SameSite=Lax`, timeout de 30 min)
- Senhas com hash **PBKDF2** (nunca em texto puro)
- E-mails de funcionário obrigatoriamente no domínio `@PizzariaSabores`
- Cargos de equipe liberados pelo administrador (quem está `PENDENTE` não entra)
- Preços e cliente do pedido vêm do **banco**, nunca do navegador
- Se o banco estiver fora do ar, o site entra sozinho em **modo demonstração**

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagem | Java 21 |
| Backend | Spring Boot 4 (spring-boot-starter-webmvc) |
| Persistência | JDBC puro via `ConnectionFactory` (driver `mssql-jdbc` 12.8.1) |
| Banco | Microsoft SQL Server (porta 1433) |
| Frontend | HTML5 + CSS3 + JavaScript (sem framework, sem build) |
| Utilitários | Lombok, JUnit 5 |
| Build | Maven (`mvnw` incluso) |

---

## Estrutura do projeto

```
Pizzaria/
├── README.md                  ← este arquivo
├── COMO-RODAR.md              ← passo a passo detalhado de configuração/rodagem
├── pom.xml                    ← dependências e build (Spring Boot 4.1.1, Java 21)
├── mvnw / mvnw.cmd            ← wrapper do Maven (Linux/macOS / Windows)
│
└── src/main/
    ├── java/Pizzaria/
    │   ├── PizzariaApplication.java   ← bootstrap Spring Boot
    │   ├── connection/                 ← ConnectionFactory (lê application.properties)
    │   ├── controller/                 ← endpoints REST (/api/**)
    │   ├── domain/                     ← entidades: Cliente, Funcionario, Pizza,
    │   │                                 Pedido, Ingrediente, Categoria, Telefone,
    │   │                                 Endereco
    │   ├── repository/                 ← acesso a dados (JDBC)
    │   ├── service/                    ← regras de negócio / transações
    │   └── util/                       ← validações e helpers
    │
    ├── resources/
    │   ├── application.properties      ← porta, banco e sessão  <<< edite aqui
    │   └── static/
    │       └── site/
    │           ├── banco/              ← scripts SQL do banco
    │           │   ├── PizzariaDB_Completo.sql   ← banco novo
    │           │   └── PizzariaDB_Ajustes.sql    ← banco que já existe
    │           └── frontend/           ← site (HTML/CSS/JS)
    │               ├── index.html               ← landing page
    │               ├── assets/                  ← css/js/img compartilhados
    │               ├── auth/                    ← login e cadastro (cliente/equipe)
    │               ├── cliente/                 ← home, menu, produto, carrinho,
    │               │                              checkout, rastreio, histórico, conta
    │               └── funcionario/             ← pedidos, clientes, estoque,
    │                                              pizzas, relatórios
    └── test/java/Pizzaria/             ← testes (JUnit)
```

> **Convenção do front:** cada página tem sua própria pasta com `pagina.html` +
> `pagina.css` + `pagina.js`. Só existem 3 arquivos compartilhados
> (`assets/css/base.css`, `assets/js/base.js`, `assets/js/icons.js`).
> Detalhes em [`src/main/resources/static/site/README.md`](src/main/resources/static/site/README.md).

---

## Pré-requisitos

- **Java 21+**
- **Maven** (ou use o wrapper `./mvnw` incluso — baixa sozinho)
- **Microsoft SQL Server** rodando com:
  - TCP/IP habilitado na **porta 1433**
  - autenticação mista (“SQL Server e Windows”)
  - um usuário/senha (ex.: `sa` ou um login dedicado)

---

## Configuração do banco

Arquivo: [`src/main/resources/application.properties`](src/main/resources/application.properties)

```properties
server.port=8081

pizzaria.db.servidor=localhost
pizzaria.db.porta=1433
pizzaria.db.nome=PizzariaDB        # 1) nome do banco
pizzaria.db.usuario=sa             # 2) usuário do SQL Server
pizzaria.db.senha=********         # 3) senha do SQL Server
```

Esses valores são lidos por `Pizzaria.connection.ConnectionFactory`.
Alternativa sem editar arquivo: variáveis de ambiente `PIZZARIA_DB_NOME`,
`PIZZARIA_DB_USUARIO`, `PIZZARIA_DB_SENHA` (e opcionalmente `PIZZARIA_DB_SERVIDOR`,
`PIZZARIA_DB_PORTA`).

> ⚠️ Não suba o `application.properties` com credenciais reais em repositório
> público — use variáveis de ambiente.

---

## Criando o banco de dados

| Situação | Script a executar |
|---|---|
| Banco novo | `src/main/resources/static/site/banco/PizzariaDB_Completo.sql` |
| Banco que já existe | `src/main/resources/static/site/banco/PizzariaDB_Ajustes.sql` (não apaga nada; cria a tabela `Pizza_Ingrediente` e cadastra os itens do cardápio) |

Tabelas criadas: `Categoria`, `Cliente`, `Funcionario`, `Ingredientes`, `Pizza`,
`Pizza_Ingrediente`, `Telefone`, `Endereco`, `Pedido`, `Item_Pedido`.

---

## Rodando o projeto

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

Acesse:

- Site: **http://localhost:8081/site/frontend/index.html**
- Health check da API: **http://localhost:8081/api/health**

---

## Primeiro administrador

1. Cadastre-se em `/site/frontend/auth/funcionario/cadastro.html` usando um e-mail
   no domínio `@PizzariaSabores.com` (ex.: `voce@pizzariasabores.com`).
2. No SQL Server, libere o cargo:

```sql
UPDATE dbo.Funcionario SET cargo = 'Gerente'
WHERE email = 'seu@pizzariasabores.com';
```

**Cargos:** Gerente/Administrador · Atendente/Balconista · Cozinheiro/Pizzaiolo.

> Os usuários de exemplo vindo do script SQL têm senha em texto puro e **não
> conseguem logar** (o sistema só aceita senha com hash PBKDF2). Cadastre contas novas.

---

## Regras de cadastro e login

| Regra | Cliente | Funcionário |
|---|---|---|
| E-mail | não pode ser `@PizzariaSabores` | obrigatório `@PizzariaSabores` + `.com`/`.com.br` |
| Senha | mínimo de 6 caracteres, hash PBKDF2 | idem |
| Cadastro | nome, CPF (11 dígitos), telefone (10–11) + tipo, rua, número, bairro, cidade, CEP (8 dígitos) | nome, e-mail, telefone, senha |
| Duplicidade | e-mail e CPF → `409` | e-mail → `409` |
| Acesso | sessão no servidor (cookie); “manter conectado” = 14 dias | cargo precisa estar liberado (`PENDENTE` não entra) |

As mesmas validações rodam **no navegador** (`cadastro.js` / `login.js`) e **no
servidor** (controllers) — o servidor é sempre a fonte de verdade.

---

## Endpoints da API

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/api/clientes`, `/api/clientes/cadastro` | cadastro de cliente |
| `POST` | `/api/clientes/login` | login do cliente |
| `PUT` | `/api/clientes/{id}` | atualizar “Minha conta” |
| `POST` | `/api/funcionarios`, `/api/funcionarios/cadastro` | cadastro da equipe |
| `POST` | `/api/funcionarios/login` | login da equipe |
| `GET` | `/api/me` · `POST /api/logout` | sessão atual / sair |
| `GET` | `/api/health` · `GET /api/config` | status e modo demonstração |
| `GET` | `/api/pizzas` · `GET /api/categorias` | cardápio |
| `GET` | `/api/estoque` | ingredientes/estoque |
| `PUT` | `/api/estoque/{id}` | atualizar ingrediente |
| `PUT` | `/api/pizzas/{id}` | atualizar pizza |
| `GET` | `/api/pedidos` | listagem (painel) |
| `POST` | `/api/pedidos` | checkout (grava `Pedido` + `Item_Pedido`) |
| `POST` | `/api/pedidos/painel` | novo pedido pelo painel |
| `PUT` | `/api/pedidos/{id}` | atualizar status/pagamento (funcionário) |
| `GET` | `/api/clientes` | base de clientes (funcionário) |
| `GET` | `/api/relatorios` | relatórios (funcionário) |
| `GET` | `/api/resumos` | resumos do dashboard |

Rotas protegidas exigem sessão com o perfil correto (`cliente` ou `funcionario`).

---

## Modo demonstração

Se o SQL Server estiver indisponível, o front detecta via `/api/health` e
`/api/config` e entra em **modo demonstração**: um banner aparece no topo e as
telas funcionam com dados de exemplo (credenciais de teste na tela de login).
Nada é gravado nesse modo.

---

## Testes

```bash
./mvnw test
```

---

## Documentação relacionada

| Arquivo | Conteúdo |
|---|---|
| [`COMO-RODAR.md`](COMO-RODAR.md) | guia completo de configuração do SQL Server e execução |
| [`src/main/resources/static/site/README.md`](src/main/resources/static/site/README.md) | arquitetura e convenções do frontend |
| [`HELP.md`](HELP.md) | referência do Spring Initializr |
| `src/main/resources/static/UsuarioTest/` | versão anterior das telas (legado) |
| `Pizzaria-completa.zip`, `UsuarioTest-front.zip` | backups/arquivos de apoio |
