package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.dominio.Funcionario;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Log4j2
public class FuncionarioRepository {

    public static List<Funcionario> findByName(String nome) {
        log.info("Finding funcionarios by name '{}'", nome);
        List<Funcionario> funcionarios = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByName(conn, nome);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                funcionarios.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find funcionarios by name '{}'", nome, e);
        }
        return funcionarios;
    }

    private static PreparedStatement createPreparedStatementFindByName(Connection conn, String nome) throws SQLException {
        String sql = "SELECT * FROM dbo.Funcionario WHERE nome LIKE ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, String.format("%%%s%%", nome));
        return ps;
    }

    public static Optional<Funcionario> findById(Integer id) {
        log.info("Finding funcionario by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find funcionario by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Funcionario WHERE id_funcionario = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static Optional<Funcionario> findByEmail(String email) {
        log.info("Finding funcionario by email '{}'", email);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByEmail(conn, email);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find funcionario by email '{}'", email, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindByEmail(Connection conn, String email) throws SQLException {
        String sql = "SELECT * FROM dbo.Funcionario WHERE email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, email);
        return ps;
    }

    public static void save(Funcionario funcionario) {
        log.info("Saving funcionario '{}'", funcionario);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, funcionario)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save funcionario '{}'", funcionario.getNome(), e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Funcionario f) throws SQLException {
        String sql = "INSERT INTO dbo.Funcionario (nome, cargo, email, senha, telefone, data_admissao) VALUES (?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, f);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted funcionario '{}' from the database", id);
        } catch (SQLException e) {
            log.error("Error while trying to delete funcionario '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Funcionario WHERE id_funcionario = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Funcionario funcionario) {
        log.info("Updating funcionario '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, funcionario)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update funcionario '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Funcionario f) throws SQLException {
        String sql = "UPDATE dbo.Funcionario SET nome = ?, cargo = ?, email = ?, senha = ?, telefone = ?, data_admissao = ? WHERE id_funcionario = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, f);
        ps.setInt(7, id);
        return ps;
    }

    // Preenche os 6 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Funcionario f) throws SQLException {
        ps.setString(1, f.getNome());
        ps.setString(2, f.getCargo());
        ps.setString(3, f.getEmail());
        ps.setString(4, f.getSenha());
        ps.setString(5, f.getTelefone());
        ps.setDate(6, Date.valueOf(f.getData_admissao() == null ? java.time.LocalDate.now() : f.getData_admissao()));
    }

    private static Funcionario map(ResultSet rs) throws SQLException {
        Date data = rs.getDate("data_admissao");
        return Funcionario.builder()
                .id_funcionario(rs.getInt("id_funcionario"))
                .nome(rs.getString("nome"))
                .cargo(rs.getString("cargo"))
                .email(rs.getString("email"))
                .senha(rs.getString("senha"))
                .telefone(rs.getString("telefone"))
                .data_admissao(data == null ? null : data.toLocalDate())
                .build();
    }
}
