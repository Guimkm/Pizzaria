package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.dominio.Cliente;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Log4j2
public class ClienteRepository {

    public static List<Cliente> findByName(String nome) {
        log.info("Finding clientes by name '{}'", nome);
        List<Cliente> clientes = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByName(conn, nome);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                clientes.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find clientes by name '{}'", nome, e);
        }
        return clientes;
    }

    private static PreparedStatement createPreparedStatementFindByName(Connection conn, String nome) throws SQLException {
        String sql = "SELECT * FROM dbo.Cliente WHERE nome LIKE ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, String.format("%%%s%%", nome));
        return ps;
    }

    public static Optional<Cliente> findById(Integer id) {
        log.info("Finding cliente by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find cliente by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Cliente WHERE id_cliente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static Optional<Cliente> findByEmail(String email) {
        log.info("Finding cliente by email '{}'", email);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByEmail(conn, email);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find cliente by email '{}'", email, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindByEmail(Connection conn, String email) throws SQLException {
        String sql = "SELECT * FROM dbo.Cliente WHERE email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, email);
        return ps;
    }

    public static boolean existsByCpf(String cpf) {
        log.info("Checking if cliente exists by cpf '{}'", cpf);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementExistsByCpf(conn, cpf);
             ResultSet rs = ps.executeQuery()) {
            return rs.next();
        } catch (SQLException e) {
            log.error("Error while trying to check cpf '{}'", cpf, e);
        }
        return false;
    }

    private static PreparedStatement createPreparedStatementExistsByCpf(Connection conn, String cpf) throws SQLException {
        String sql = "SELECT 1 FROM dbo.Cliente WHERE cpf = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, cpf);
        return ps;
    }

    public static void save(Cliente cliente) {
        log.info("Saving cliente '{}'", cliente);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, cliente)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save cliente '{}'", cliente.getNome(), e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Cliente cliente) throws SQLException {
        String sql = "INSERT INTO dbo.Cliente (nome, cpf, email, senha, data_cadastro) VALUES (?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, cliente);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted cliente '{}' from the database", id);
        } catch (SQLException e) {
            log.error("Error while trying to delete cliente '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Cliente WHERE id_cliente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Cliente cliente) {
        log.info("Updating cliente '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, cliente)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update cliente '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Cliente cliente) throws SQLException {
        String sql = "UPDATE dbo.Cliente SET nome = ?, cpf = ?, email = ?, senha = ?, data_cadastro = ? WHERE id_cliente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, cliente);
        ps.setInt(6, id);
        return ps;
    }

    // Preenche os 5 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Cliente c) throws SQLException {
        ps.setString(1, c.getNome());
        ps.setString(2, c.getCpf());
        ps.setString(3, c.getEmail());
        ps.setString(4, c.getSenha());
        ps.setDate(5, Date.valueOf(c.getData_cadastro() == null ? java.time.LocalDate.now() : c.getData_cadastro()));
    }

    private static Cliente map(ResultSet rs) throws SQLException {
        Date data = rs.getDate("data_cadastro");
        return Cliente.builder()
                .id_cliente(rs.getInt("id_cliente"))
                .nome(rs.getString("nome"))
                .cpf(rs.getString("cpf"))
                .email(rs.getString("email"))
                .senha(rs.getString("senha"))
                .data_cadastro(data == null ? null : data.toLocalDate())
                .build();
    }
}
