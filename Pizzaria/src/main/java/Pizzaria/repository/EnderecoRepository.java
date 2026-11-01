package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.dominio.Cliente;
import Pizzaria.dominio.Endereco;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Log4j2
public class EnderecoRepository {

    public static Optional<Endereco> findById(Integer id) {
        log.info("Finding endereco by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find endereco by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Endereco WHERE id_endereco = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    // Lista os endereços de um cliente
    public static List<Endereco> findByCliente(Integer idCliente) {
        log.info("Finding enderecos of cliente '{}'", idCliente);
        List<Endereco> enderecos = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByCliente(conn, idCliente);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                enderecos.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find enderecos of cliente '{}'", idCliente, e);
        }
        return enderecos;
    }

    private static PreparedStatement createPreparedStatementFindByCliente(Connection conn, Integer idCliente) throws SQLException {
        String sql = "SELECT * FROM dbo.Endereco WHERE id_cliente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idCliente);
        return ps;
    }

    public static void save(Endereco endereco) {
        log.info("Saving endereco '{}'", endereco);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, endereco)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save endereco", e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Endereco endereco) throws SQLException {
        String sql = "INSERT INTO dbo.Endereco (rua, numero, bairro, cidade, cep, id_cliente) VALUES (?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, endereco);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted endereco '{}' from the database", id);
        } catch (SQLException e) {
            log.error("Error while trying to delete endereco '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Endereco WHERE id_endereco = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Endereco endereco) {
        log.info("Updating endereco '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, endereco)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update endereco '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Endereco endereco) throws SQLException {
        String sql = "UPDATE dbo.Endereco SET rua = ?, numero = ?, bairro = ?, cidade = ?, cep = ?, id_cliente = ? WHERE id_endereco = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, endereco);
        ps.setInt(7, id);
        return ps;
    }

    // Preenche os 6 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Endereco e) throws SQLException {
        ps.setString(1, e.getRua());
        ps.setString(2, e.getNumero());
        ps.setString(3, e.getBairro());
        ps.setString(4, e.getCidade());
        ps.setString(5, e.getCep());
        ps.setInt(6, e.getId_cliente().getId_cliente());
    }

    private static Endereco map(ResultSet rs) throws SQLException {
        return Endereco.builder()
                .id_endereco(rs.getInt("id_endereco"))
                .rua(rs.getString("rua"))
                .numero(rs.getString("numero"))
                .bairro(rs.getString("bairro"))
                .cidade(rs.getString("cidade"))
                .cep(rs.getString("cep"))
                .id_cliente(Cliente.builder().id_cliente(rs.getInt("id_cliente")).build())
                .build();
    }
}
