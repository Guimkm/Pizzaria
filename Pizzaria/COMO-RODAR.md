# Pizzaria — como rodar com SQL Server (porta 1433)

## 1. Onde colocar banco, usuário e senha

Arquivo: **`src/main/resources/application.properties`**

```properties
pizzaria.db.servidor=localhost          # onde o SQL Server roda
pizzaria.db.porta=1433                  # porta (já 1433)
pizzaria.db.nome=COLOQUE_O_NOME_DO_BANCO   # <-- 1) nome do banco (ex.: PizzariaDB)
pizzaria.db.usuario=COLOQUE_O_USUARIO      # <-- 2) usuário do SQL Server
pizzaria.db.senha=COLOQUE_A_SENHA          # <-- 3) senha do SQL Server
```

Quem lê esses valores é `src/main/java/Pizzaria/connection/ConnectionFactory.java`.
Alternativa sem editar arquivo: variáveis de ambiente `PIZZARIA_DB_NOME`,
`PIZZARIA_DB_USUARIO`, `PIZZARIA_DB_SENHA` (e opcionalmente `PIZZARIA_DB_SERVIDOR`, `PIZZARIA_DB_PORTA`).

Requisitos do SQL Server: TCP/IP habilitado na porta 1433 e login por usuário/senha
(modo de autenticação "SQL Server e Windows").

## 2. Banco de dados

* Banco novo: execute `src/main/resources/static/site/banco/PizzariaDB_Completo.sql`.
* Banco que já existe: execute só `PizzariaDB_Ajustes.sql` (não apaga nada). Ele cria a tabela
  `Pizza_Ingrediente` (relação "Possui" do DER) e cadastra no cardápio os itens que o site mostra
  (o checkout encontra o item pelo nome).

## 3. Rodar

```bash
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

Abra: http://localhost:8081/site/frontend/index.html
Se o banco estiver fora do ar, o site entra sozinho em **modo demonstração** (banner no topo).

## 4. Login e cadastro (verificações do UsuarioTeste)

| Regra | Cliente | Funcionário |
|---|---|---|
| E-mail | não pode ser `@PizzariaSabores` | obrigatório `@PizzariaSabores`, `.com` ou `.com.br` |
| Senha | mínimo 6, hash PBKDF2 | idem |
| Cadastro | nome, CPF (11 dígitos), telefone (10–11) + tipo, rua, número, bairro, cidade, CEP (8) | nome, e-mail, telefone, senha |
| Duplicidade | e-mail e CPF → 409 | e-mail → 409 |
| Acesso | sessão no servidor (cookie), "manter conectado" = 14 dias | cargo precisa ser liberado (`PENDENTE` não entra) |

As mesmas regras rodam no navegador (cadastro.js / login.js) e no servidor (controllers).

* **Primeiro administrador:** cadastre-se em
  `/site/frontend/auth/funcionario/cadastro.html` com um e-mail `@PizzariaSabores.com` e depois, no SQL Server:
  `UPDATE dbo.Funcionario SET cargo = 'Gerente' WHERE email = 'seu@pizzariasabores.com';`
  Cargos: Gerente/Administrador, Atendente/Balconista, Cozinheiro/Pizzaiolo.
* Os usuários de exemplo do script SQL têm senha em texto puro e **não conseguem logar**
  (o sistema só aceita senha com hash). Cadastre contas novas.

## 5. Endpoints Java usados pelo front

| Endpoint | Tela |
|---|---|
| `POST /api/clientes`, `POST /api/clientes/login`, `PUT /api/clientes/{id}` | cadastro, login, Minha conta |
| `POST /api/funcionarios`, `POST /api/funcionarios/login` | cadastro/login da equipe |
| `GET /api/me`, `POST /api/logout`, `GET /api/health`, `GET /api/config` | sessão e modo demo |
| `GET /api/pizzas` | painel › Cardápio |
| `GET /api/clientes`, `/api/estoque`, `/api/pedidos`, `/api/relatorios` | painel do funcionário (exige login de funcionário) |
| `POST /api/pedidos` | checkout (grava `Pedido` + `Item_Pedido`) |
