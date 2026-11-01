IF DB_ID('PizzariaDB') IS NULL
BEGIN
    CREATE DATABASE PizzariaDB;
END;
GO

USE PizzariaDB;
GO

-- Remove as tabelas se já existirem (ordem inversa das FKs),
-- para o script poder ser executado mais de uma vez
DROP TABLE IF EXISTS Item_Pedido;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Endereco;
DROP TABLE IF EXISTS Telefone;
DROP TABLE IF EXISTS Pizza;
DROP TABLE IF EXISTS Ingredientes;
DROP TABLE IF EXISTS Funcionario;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS Categoria;
GO

-- DDL
CREATE TABLE Categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE Cliente (
    id_cliente INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Cliente_Cpf UNIQUE (cpf),
    CONSTRAINT UQ_Cliente_Email UNIQUE (email)
);

CREATE TABLE Funcionario (
    id_funcionario INT IDENTITY(1,1) PRIMARY KEY,
    senha VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data_admissao DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Funcionario_Email UNIQUE (email)
);

CREATE TABLE Ingredientes (
    id_ingrediente INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
    unidade VARCHAR(10) NOT NULL
);

CREATE TABLE Pizza (
    id_pizza INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NULL,
    tamanho CHAR(1) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    ativa BIT NOT NULL DEFAULT 1,
    id_categoria INT NOT NULL,
    CONSTRAINT FK_Pizza_Categoria FOREIGN KEY (id_categoria)
        REFERENCES Categoria (id_categoria)
);

CREATE TABLE Telefone (
    id_telefone INT IDENTITY(1,1) PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    id_cliente INT NULL,
    id_funcionario INT NULL,
    CONSTRAINT FK_Telefone_Cliente FOREIGN KEY (id_cliente)
        REFERENCES Cliente (id_cliente),
    CONSTRAINT FK_Telefone_Funcionario FOREIGN KEY (id_funcionario)
        REFERENCES Funcionario (id_funcionario),
    -- O telefone pertence a um cliente OU a um funcionário (nunca nenhum, nunca os dois)
    CONSTRAINT CK_Telefone_Dono CHECK (
        (id_cliente IS NOT NULL AND id_funcionario IS NULL)
        OR (id_cliente IS NULL AND id_funcionario IS NOT NULL)
    )
);

CREATE TABLE Endereco (
    id_endereco INT IDENTITY(1,1) PRIMARY KEY,
    rua VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    cep CHAR(8) NOT NULL,
    id_cliente INT NOT NULL,
    CONSTRAINT FK_Endereco_Cliente FOREIGN KEY (id_cliente)
        REFERENCES Cliente (id_cliente)
);

CREATE TABLE Pedido (
    id_pedido INT IDENTITY(1,1) PRIMARY KEY,
    data_pedido DATETIME NOT NULL DEFAULT GETDATE(),
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pedido Recebido',
    forma_pagamento VARCHAR(30) NOT NULL,
    id_cliente INT NOT NULL,
    id_funcionario INT NULL,
    CONSTRAINT FK_Pedido_Cliente FOREIGN KEY (id_cliente)
        REFERENCES Cliente (id_cliente),
    CONSTRAINT FK_Pedido_Funcionario FOREIGN KEY (id_funcionario)
        REFERENCES Funcionario (id_funcionario)
);

CREATE TABLE Item_Pedido (
    id_item_pedido INT IDENTITY(1,1) PRIMARY KEY,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    id_pedido INT NOT NULL,
    id_pizza INT NOT NULL,
    CONSTRAINT FK_ItemPedido_Pedido FOREIGN KEY (id_pedido)
        REFERENCES Pedido (id_pedido),
    CONSTRAINT FK_ItemPedido_Pizza FOREIGN KEY (id_pizza)
        REFERENCES Pizza (id_pizza)
);
GO

-- DML
INSERT INTO Categoria (nome_categoria) VALUES ('Especial');
INSERT INTO Categoria (nome_categoria) VALUES ('Tradicional');

INSERT INTO Cliente (nome, cpf, email, senha)
VALUES ('Ana Silva', '12345678901', 'ana@email.com', '123456');

INSERT INTO Funcionario (nome, email, senha, cargo, telefone, data_admissao)
VALUES ('Carlos Souza', 'carlos@email.com', '123456', 'Atendente',
        '11912345678', GETDATE());

INSERT INTO Ingredientes (nome, preco_unitario, quantidade, unidade)
VALUES ('Mussarela', 25.00, 12.00, 'kg');
INSERT INTO Ingredientes (nome, preco_unitario, quantidade, unidade)
VALUES ('Molho de tomate', 8.00, 8.00, 'L');

INSERT INTO Pizza (nome, descricao, tamanho, preco, ativa, id_categoria)
VALUES ('Pepperoni', 'Molho de tomate, mussarela e pepperoni artesanal',
        'G', 52.90, 1, 1);
INSERT INTO Pizza (nome, descricao, tamanho, preco, ativa, id_categoria)
VALUES ('Margherita', 'Molho de tomate, mussarela e manjericão fresco',
        'G', 45.90, 1, 2);

INSERT INTO Telefone (numero, tipo, id_cliente, id_funcionario)
VALUES ('11987654321', 'Celular', 1, NULL);
INSERT INTO Telefone (numero, tipo, id_cliente, id_funcionario)
VALUES ('11912345678', 'Celular', NULL, 1);

INSERT INTO Endereco (rua, numero, bairro, cidade, cep, id_cliente)
VALUES ('Rua das Flores', '123', 'Centro', 'São Paulo', '01310100', 1);

INSERT INTO Pedido (valor_total, status, forma_pagamento, id_cliente, id_funcionario)
VALUES (52.90, 'Saiu para Entrega', 'Pix', 1, 1);

INSERT INTO Item_Pedido (quantidade, preco_unitario, subtotal, id_pedido, id_pizza)
VALUES (1, 52.90, 52.90, 1, 1);

-- Consultas
SELECT * FROM Categoria;
SELECT * FROM Cliente;
SELECT * FROM Funcionario;
SELECT * FROM Ingredientes;
SELECT * FROM Pizza;
SELECT * FROM Telefone;
SELECT * FROM Endereco;
SELECT * FROM Pedido;
SELECT * FROM Item_Pedido;

SELECT
    Pedido.id_pedido,
    Cliente.nome AS nome_cliente,
    Pizza.nome AS nome_pizza,
    Item_Pedido.quantidade,
    Item_Pedido.subtotal,
    Pedido.status,
    Pedido.forma_pagamento,
    Pedido.data_pedido
FROM Pedido
JOIN Cliente ON Pedido.id_cliente = Cliente.id_cliente
JOIN Item_Pedido ON Pedido.id_pedido = Item_Pedido.id_pedido
JOIN Pizza ON Item_Pedido.id_pizza = Pizza.id_pizza;

SELECT
    Pizza.nome,
    Pizza.tamanho,
    Pizza.preco,
    Categoria.nome_categoria
FROM Pizza
JOIN Categoria ON Pizza.id_categoria = Categoria.id_categoria;

SELECT
    Cliente.nome,
    Cliente.email,
    Telefone.numero AS telefone,
    Endereco.rua,
    Endereco.numero AS numero_casa,
    Endereco.bairro,
    Endereco.cidade,
    Endereco.cep
FROM Cliente
JOIN Telefone ON Cliente.id_cliente = Telefone.id_cliente
JOIN Endereco ON Cliente.id_cliente = Endereco.id_cliente;
