package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.dominio.Cliente;
import Pizzaria.dominio.Funcionario;
import Pizzaria.dominio.Pedido;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.Optional;

@Log4j2
public class PedidoRepository {

    public static Optional<Pedido> findById(Integer id) {
        log.info("Finding pedido by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            Date data = rs.getDate("data_pedido");
            Integer idFuncionario = rs.getObject("id_funcionario", Integer.class);
            return Optional.of(Pedido.builder()
                    .id_pedido(rs.getInt("id_pedido"))
                    .data_pedido(data == null ? null : data.toLocalDate())
                    .valor_total(rs.getDouble("valor_total"))
                    .status(rs.getString("status"))
                    .forma_pagamento(rs.getString("forma_pagamento"))
                    .id_cliente(Cliente.builder().id_cliente(rs.getInt("id_cliente")).build())
                    .id_funcionario(idFuncionario == null ? null : Funcionario.builder().id_funcionario(idFuncionario).build())
                    .build());
        } catch (SQLException e) {
            log.error("Error while trying to find pedido by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Pedido WHERE id_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void save(Pedido pedido) {
        log.info("Saving pedido '{}'", pedido);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, pedido)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save pedido", e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Pedido pedido) throws SQLException {
        String sql = "INSERT INTO dbo.Pedido (data_pedido, valor_total, status, forma_pagamento, id_cliente, id_funcionario) VALUES (?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, pedido);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted pedido '{}' from the database", id);
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
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, pedido)) {
            ps.execute();
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

    // Preenche os 6 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Pedido p) throws SQLException {
        ps.setDate(1, Date.valueOf(p.getData_pedido() == null ? java.time.LocalDate.now() : p.getData_pedido()));
        ps.setDouble(2, p.getValor_total());
        ps.setString(3, p.getStatus());
        ps.setString(4, p.getForma_pagamento());
        ps.setInt(5, p.getId_cliente().getId_cliente());
        if (p.getId_funcionario() != null && p.getId_funcionario().getId_funcionario() != null) {
            ps.setInt(6, p.getId_funcionario().getId_funcionario());
        } else {
            ps.setNull(6, Types.INTEGER);
        }
    }
}
