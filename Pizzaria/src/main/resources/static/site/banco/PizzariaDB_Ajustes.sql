-- ============================================================
-- AJUSTES para um banco PizzariaDB que JÁ EXISTE (não apaga nada).
-- Pode ser executado mais de uma vez.
-- Troque PizzariaDB abaixo se o seu banco tiver outro nome.
-- ============================================================
USE PizzariaDB;
GO

-- 1) Relação "Possui" do DER (Pizza N:N Ingrediente), usada pelo PizzaRepository
IF OBJECT_ID('dbo.Pizza_Ingrediente', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Pizza_Ingrediente (
        id_pizza_ingrediente INT IDENTITY(1,1) PRIMARY KEY,
        id_pizza INT NOT NULL,
        id_ingrediente INT NOT NULL,
        CONSTRAINT FK_PizzaIngrediente_Pizza FOREIGN KEY (id_pizza)
            REFERENCES dbo.Pizza (id_pizza) ON DELETE CASCADE,
        CONSTRAINT FK_PizzaIngrediente_Ingrediente FOREIGN KEY (id_ingrediente)
            REFERENCES dbo.Ingredientes (id_ingrediente),
        CONSTRAINT UQ_Pizza_Ingrediente UNIQUE (id_pizza, id_ingrediente)
    );
END;
GO

-- 2) Itens do cardápio que o site mostra (o checkout localiza o item pelo NOME).
--    Sem eles, o pedido é recusado com "Item indisponível no cardápio".
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nome_categoria = 'Tradicional') INSERT INTO dbo.Categoria (nome_categoria) VALUES ('Tradicional');
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nome_categoria = 'Especial')    INSERT INTO dbo.Categoria (nome_categoria) VALUES ('Especial');
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nome_categoria = 'Doce')        INSERT INTO dbo.Categoria (nome_categoria) VALUES ('Doce');
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE nome_categoria = 'Bebida')      INSERT INTO dbo.Categoria (nome_categoria) VALUES ('Bebida');
GO

-- (nome, descricao, tamanho, preco, ativa, categoria)
DECLARE @cardapio TABLE (nome VARCHAR(100), descricao VARCHAR(255), tamanho CHAR(1), preco DECIMAL(10,2), ativa BIT, categoria VARCHAR(50));
INSERT INTO @cardapio VALUES
 ('Margherita',      'Molho de tomate, mussarela e manjericão fresco',      'G', 45.90, 1, 'Tradicional'),
 ('Pepperoni',       'Molho de tomate, mussarela e pepperoni artesanal',    'G', 52.90, 1, 'Especial'),
 ('Quatro Queijos',  'Mussarela, gorgonzola, parmesão e catupiry',          'G', 48.90, 1, 'Especial'),
 ('Portuguesa',      'Presunto, ovos, cebola, azeitona e mussarela',        'G', 47.90, 1, 'Tradicional'),
 ('Calabresa',       'Calabresa fatiada, cebola caramelizada e mussarela',  'M', 39.90, 1, 'Tradicional'),
 ('Frango Catupiry', 'Frango desfiado, catupiry cremoso e azeitona',        'G', 54.90, 0, 'Especial'),
 ('Brigadeiro',      'Chocolate cremoso com granulado colorido',            'G', 39.90, 1, 'Doce'),
 ('Coca-Cola lata',  'Lata 350ml gelada',                                   'U',  8.00, 1, 'Bebida'),
 ('Guaraná lata',    'Guaraná gelado 350ml',                                'U',  7.50, 1, 'Bebida');

INSERT INTO dbo.Pizza (nome, descricao, tamanho, preco, ativa, id_categoria)
SELECT c.nome, c.descricao, c.tamanho, c.preco, c.ativa, cat.id_categoria
FROM @cardapio c
JOIN dbo.Categoria cat ON cat.nome_categoria = c.categoria
WHERE NOT EXISTS (SELECT 1 FROM dbo.Pizza p WHERE p.nome = c.nome);
GO

-- 3) (Opcional) Pedido.id_funcionario já aceita NULL no script original: o pedido do
--    checkout nasce sem funcionário e é atribuído depois pelo painel. Nada a alterar.

-- 4) Funcionários recém-cadastrados no site entram com cargo 'PENDENTE' e só conseguem
--    logar depois que o cargo for definido. Cargos aceitos pelo sistema:
--    Gerente/Administrador, Atendente/Balconista, Cozinheiro/Pizzaiolo. Exemplo:
-- UPDATE dbo.Funcionario SET cargo = 'Gerente' WHERE email = 'fulano@pizzariasabores.com';
