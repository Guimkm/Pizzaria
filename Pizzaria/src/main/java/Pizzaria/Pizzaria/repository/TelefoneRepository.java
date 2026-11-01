package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.domain.Cliente;
import Pizzaria.domain.Funcionario;
import Pizzaria.domain.Telefone;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Log4j2
public class TelefoneRepository {

    public static Optional<Telefone> findById(Integer id) {
        log.info("Finding telefone by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find telefone by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Telefone WHERE id_telefone = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    // Lista os telefones de um cliente
    public static List<Telefone> findByCliente(Integer idCliente) {
        log.info("Finding telefones of cliente '{}'", idCliente);
        List<Telefone> telefones = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByCliente(conn, idCliente);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                telefones.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find telefones of cliente '{}'", idCliente, e);
        }
        return telefones;
    }

    private static PreparedStatement createPreparedStatementFindByCliente(Connection conn, Integer idCliente) throws SQLException {
        String sql = "SELECT * FROM dbo.Telefone WHERE id_cliente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idCliente);
        return ps;
    }

    public static void save(Telefone telefone) {
        log.info("Saving telefone '{}'", telefone);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, telefone)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save telefone", e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Telefone telefone) throws SQLException {
        String sql = "INSERT INTO dbo.Telefone (numero, tipo, id_cliente, id_funcionario) VALUES (?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, telefone);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted telefone '{}' from the database", id);
        } catch (SQLException e) {
            log.error("Error while trying to delete telefone '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Telefone WHERE id_telefone = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Telefone telefone) {
        log.info("Updating telefone '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, telefone)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update telefone '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Telefone telefone) throws SQLException {
        String sql = "UPDATE dbo.Telefone SET numero = ?, tipo = ?, id_cliente = ?, id_funcionario = ? WHERE id_telefone = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, telefone);
        ps.setInt(5, id);
        return ps;
    }

    // Preenche os 4 primeiros parâmetros (usado no INSERT e no UPDATE).
    // O banco exige que o telefone seja de um cliente OU de um funcionário (nunca os dois, nunca nenhum).
    private static void fill(PreparedStatement ps, Telefone t) throws SQLException {
        ps.setString(1, t.getNumero());
        ps.setString(2, t.getTipo());
        if (t.getId_cliente() != null && t.getId_cliente().getId_cliente() != null) {
            ps.setInt(3, t.getId_cliente().getId_cliente());
        } else {
            ps.setNull(3, Types.INTEGER);
        }
        if (t.getId_funcionario() != null && t.getId_funcionario().getId_funcionario() != null) {
            ps.setInt(4, t.getId_funcionario().getId_funcionario());
        } else {
            ps.setNull(4, Types.INTEGER);
        }
    }

    private static Telefone map(ResultSet rs) throws SQLException {
        Integer idCliente = rs.getObject("id_cliente", Integer.class);
        Integer idFuncionario = rs.getObject("id_funcionario", Integer.class);
        return Telefone.builder()
                .id_telefone(rs.getInt("id_telefone"))
                .numero(rs.getString("numero"))
                .tipo(rs.getString("tipo"))
                .id_cliente(idCliente == null ? null : Cliente.builder().id_cliente(idCliente).build())
                .id_funcionario(idFuncionario == null ? null : Funcionario.builder().id_funcionario(idFuncionario).build())
                .build();
    }
}
