package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.domain.Cliente;
import Pizzaria.domain.Funcionario;
import Pizzaria.domain.Pedido;
import Pizzaria.domain.Pizza;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * A relação "Contém" (Pedido N:N Pizza) é tratada aqui, na tabela dbo.Item_Pedido
 * (quantidade, preco_unitario, subtotal, id_pedido, id_pizza) do banco externo.
 * No domínio ela aparece como o atributo item_pedido (List<Pizza>): cada ocorrência da pizza = 1 unidade.
 */
@Log4j2
public class PedidoRepository {

    public static Optional<Pedido> findById(Integer id) {
        log.info("Finding pedido by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            Pedido base = map(rs);
            return Optional.of(Pedido.builder()
                    .id_pedido(base.getId_pedido())
                    .data_pedido(base.getData_pedido())
                    .valor_total(base.getValor_total())
                    .status(base.getStatus())
                    .forma_pagamento(base.getForma_pagamento())
                    .id_cliente(base.getId_cliente())
                    .id_funcionario(base.getId_funcionario())
                    .item_pedido(findItens(id))
                    .build());
        } catch (SQLException e) {
            log.error("Error while trying to find pedido by id '{}'", id, e);
        }
        return Optional.empty();
    }

    // Lista todos os pedidos (sem carregar os itens) - usado no painel do funcionário
    public static List<Pedido> findAll() {
        log.info("Finding all pedidos");
        List<Pedido> lista = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindAll(conn);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find all pedidos", e);
        }
        return lista;
    }

    private static PreparedStatement createPreparedStatementFindAll(Connection conn) throws SQLException {
        String sql = "SELECT * FROM dbo.Pedido ORDER BY data_pedido DESC, id_pedido DESC";
        return conn.prepareStatement(sql);
    }

    // Lista os pedidos de um cliente (relação "Realiza")
    public static List<Pedido> findByCliente(Integer idCliente) {
        log.info("Finding pedidos of cliente '{}'", idCliente);
        List<Pedido> lista = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByCliente(conn, idCliente);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find pedidos of cliente '{}'", idCliente, e);
        }
        return lista;
    }

    private static PreparedStatement createPreparedStatementFindByCliente(Connection conn, Integer idCliente) throws SQLException {
        String sql = "SELECT * FROM dbo.Pedido WHERE id_cliente = ? ORDER BY data_pedido DESC, id_pedido DESC";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idCliente);
        return ps;
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Pedido WHERE id_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    /** Conta pedidos (não cancelados) por hora em um período, para o relatório de horários de pico. */
    public static Map<Integer, Integer> contarPorHora(LocalDate inicio, LocalDate fim) {
        Map<Integer, Integer> porHora = new LinkedHashMap<>();
        String sql = "SELECT DATEPART(HOUR, data_pedido) AS hora, COUNT(*) AS total "
                + "FROM dbo.Pedido WHERE CAST(data_pedido AS DATE) BETWEEN ? AND ? "
                + "AND UPPER(status) NOT LIKE 'CANCEL%' "
                + "GROUP BY DATEPART(HOUR, data_pedido) ORDER BY hora";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(inicio));
            ps.setDate(2, Date.valueOf(fim));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) porHora.put(rs.getInt("hora"), rs.getInt("total"));
            }
        } catch (SQLException e) {
            log.error("Error while counting pedidos by hour", e);
        }
        return porHora;
    }

    /** Ranking de itens vendidos no período (ignora bebidas e pedidos cancelados). */
    public static List<Map<String, Object>> topPizzas(LocalDate inicio, LocalDate fim, int limite) {
        List<Map<String, Object>> lista = new ArrayList<>();
        String sql = "SELECT p.nome, SUM(ip.quantidade) AS quantidade "
                + "FROM dbo.Item_Pedido ip "
                + "JOIN dbo.Pedido pe ON pe.id_pedido = ip.id_pedido "
                + "JOIN dbo.Pizza p ON p.id_pizza = ip.id_pizza "
                + "LEFT JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria "
                + "WHERE CAST(pe.data_pedido AS DATE) BETWEEN ? AND ? "
                + "AND UPPER(pe.status) NOT LIKE 'CANCEL%' "
                + "AND (c.nome_categoria IS NULL OR UPPER(c.nome_categoria) <> 'BEBIDA') "
                + "GROUP BY p.nome ORDER BY quantidade DESC, p.nome ASC";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(inicio));
            ps.setDate(2, Date.valueOf(fim));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next() && lista.size() < limite) {
                    Map<String, Object> linha = new LinkedHashMap<>();
                    linha.put("nome", rs.getString("nome"));
                    linha.put("quantidade", rs.getInt("quantidade"));
                    lista.add(linha);
                }
            }
        } catch (SQLException e) {
            log.error("Error while loading top pizzas", e);
        }
        return lista;
    }

    // Pizzas do pedido (relação "Contém"); repete a pizza conforme a quantidade
    private static List<Pizza> findItens(Integer idPedido) {
        List<Pizza> itens = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindItens(conn, idPedido);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Optional<Pizza> pizza = PizzaRepository.findById(rs.getInt("id_pizza"));
                int quantidade = rs.getInt("quantidade");
                pizza.ifPresent(p -> {
                    for (int i = 0; i < quantidade; i++) itens.add(p);
                });
            }
        } catch (SQLException e) {
            log.error("Error while trying to find itens of pedido '{}'", idPedido, e);
        }
        return itens;
    }

    private static PreparedStatement createPreparedStatementFindItens(Connection conn, Integer idPedido) throws SQLException {
        String sql = "SELECT id_pizza, quantidade FROM dbo.Item_Pedido WHERE id_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idPedido);
        return ps;
    }

    public static void save(Pedido pedido) {
        log.info("Saving pedido '{}'", pedido);
        try (Connection conn = ConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try {
                Integer idPedido;
                try (PreparedStatement ps = createPreparedStatementSave(conn, pedido)) {
                    ps.execute();
                    idPedido = generatedId(ps);
                }
                saveItens(conn, idPedido, pedido.getItem_pedido());
                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            log.error("Error while trying to save pedido", e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Pedido pedido) throws SQLException {
        String sql = "INSERT INTO dbo.Pedido (data_pedido, valor_total, status, forma_pagamento, id_cliente, id_funcionario) VALUES (?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        fill(ps, pedido);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try {
                deleteItens(conn, id);
                try (PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
                    ps.execute();
                }
                conn.commit();
                log.info("Deleted pedido '{}' from the database", id);
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            log.error("Error while trying to delete pedido '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Pedido WHERE id_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Pedido pedido) {
        log.info("Updating pedido '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = createPreparedStatementUpdate(conn, id, pedido)) {
                    ps.execute();
                }
                // Só mexe nos itens se a lista foi informada
                if (pedido.getItem_pedido() != null) {
                    deleteItens(conn, id);
                    saveItens(conn, id, pedido.getItem_pedido());
                }
                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            log.error("Error while trying to update pedido '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Pedido pedido) throws SQLException {
        String sql = "UPDATE dbo.Pedido SET data_pedido = ?, valor_total = ?, status = ?, forma_pagamento = ?, id_cliente = ?, id_funcionario = ? WHERE id_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, pedido);
        ps.setInt(7, id);
        return ps;
    }

    /**
     * Atualização feita pelo painel: mexe só em status, forma de pagamento e
     * funcionário responsável. Assim data/valor/itens do pedido são preservados.
     */
    public static boolean updatePainel(Integer id, String status, String formaPagamento, Integer idFuncionario) {
        log.info("Updating pedido '{}' from painel", id);
        String sql = "UPDATE dbo.Pedido SET status = ?, forma_pagamento = ?, id_funcionario = ? WHERE id_pedido = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setString(2, formaPagamento);
            if (idFuncionario == null) ps.setNull(3, Types.INTEGER);
            else ps.setInt(3, idFuncionario);
            ps.setInt(4, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            log.error("Error while trying to update pedido '{}' from painel", id, e);
        }
        return false;
    }

    // Agrupa as pizzas repetidas em uma linha de Item_Pedido com a quantidade
    private static void saveItens(Connection conn, Integer idPedido, List<Pizza> pizzas) throws SQLException {
        if (pizzas == null) return;
        Map<Integer, Integer> quantidades = new LinkedHashMap<>();
        Map<Integer, Double> precos = new LinkedHashMap<>();
        for (Pizza p : pizzas) {
            quantidades.merge(p.getId_pizza(), 1, Integer::sum);
            precos.putIfAbsent(p.getId_pizza(), p.getPreco() != null
                    ? p.getPreco()
                    : PizzaRepository.findById(p.getId_pizza()).map(Pizza::getPreco).orElse(0.0));
        }
        for (Map.Entry<Integer, Integer> e : quantidades.entrySet()) {
            double preco = precos.get(e.getKey());
            try (PreparedStatement ps = createPreparedStatementSaveItem(conn, idPedido, e.getKey(), e.getValue(), preco)) {
                ps.execute();
            }
        }
    }

    private static PreparedStatement createPreparedStatementSaveItem(Connection conn, Integer idPedido, Integer idPizza, int quantidade, double preco) throws SQLException {
        String sql = "INSERT INTO dbo.Item_Pedido (quantidade, preco_unitario, subtotal, id_pedido, id_pizza) VALUES (?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, quantidade);
        ps.setDouble(2, preco);
        ps.setDouble(3, preco * quantidade);
        ps.setInt(4, idPedido);
        ps.setInt(5, idPizza);
        return ps;
    }

    private static void deleteItens(Connection conn, Integer idPedido) throws SQLException {
        try (PreparedStatement ps = createPreparedStatementDeleteItens(conn, idPedido)) {
            ps.execute();
        }
    }

    private static PreparedStatement createPreparedStatementDeleteItens(Connection conn, Integer idPedido) throws SQLException {
        String sql = "DELETE FROM dbo.Item_Pedido WHERE id_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idPedido);
        return ps;
    }

    private static Integer generatedId(PreparedStatement ps) throws SQLException {
        try (ResultSet keys = ps.getGeneratedKeys()) {
            return keys.next() ? keys.getInt(1) : null;
        }
    }

    // Preenche os 6 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Pedido p) throws SQLException {
        ps.setDate(1, Date.valueOf(p.getData_pedido() == null ? java.time.LocalDate.now() : p.getData_pedido()));
        ps.setDouble(2, p.getValor_total());
        ps.setString(3, p.getStatus());
        ps.setString(4, p.getForma_pagamento());
        ps.setInt(5, p.getId_cliente().getId_cliente());
        // Atende: o funcionário é atribuído pelo painel; um pedido novo do cliente nasce sem ele
        if (p.getId_funcionario() != null && p.getId_funcionario().getId_funcionario() != null) {
            ps.setInt(6, p.getId_funcionario().getId_funcionario());
        } else {
            ps.setNull(6, Types.INTEGER);
        }
    }

    // Monta o Pedido (sem itens) a partir da linha do ResultSet
    private static Pedido map(ResultSet rs) throws SQLException {
        Date data = rs.getDate("data_pedido");
        Integer idFuncionario = rs.getObject("id_funcionario", Integer.class);
        return Pedido.builder()
                .id_pedido(rs.getInt("id_pedido"))
                .data_pedido(data == null ? null : data.toLocalDate())
                .valor_total(rs.getDouble("valor_total"))
                .status(rs.getString("status"))
                .forma_pagamento(rs.getString("forma_pagamento"))
                .id_cliente(Cliente.builder().id_cliente(rs.getInt("id_cliente")).build())
                .id_funcionario(idFuncionario == null ? null : Funcionario.builder().id_funcionario(idFuncionario).build())
                .build();
    }
}
