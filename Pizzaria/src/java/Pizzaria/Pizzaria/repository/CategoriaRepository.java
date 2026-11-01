package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.domain.Categoria;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Log4j2
public class CategoriaRepository {

    public static List<Categoria> findByName(String nome) {
        log.info("Finding categorias by name '{}'", nome);
        List<Categoria> categorias = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByName(conn, nome);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                categorias.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find categorias by name '{}'", nome, e);
        }
        return categorias;
    }

    private static PreparedStatement createPreparedStatementFindByName(Connection conn, String nome) throws SQLException {
        String sql = "SELECT * FROM dbo.Categoria WHERE nome_categoria LIKE ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, String.format("%%%s%%", nome));
        return ps;
    }

    public static Optional<Categoria> findById(Integer id) {
        log.info("Finding categoria by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find categoria by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Categoria WHERE id_categoria = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void save(Categoria categoria) {
        log.info("Saving categoria '{}'", categoria);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, categoria)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save categoria", e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Categoria categoria) throws SQLException {
        String sql = "INSERT INTO dbo.Categoria (nome_categoria) VALUES (?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, categoria.getNome_categoria());
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted categoria '{}' from the database", id);
        } catch (SQLException e) {
            log.error("Error while trying to delete categoria '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Categoria WHERE id_categoria = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Categoria categoria) {
        log.info("Updating categoria '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, categoria)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update categoria '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Categoria categoria) throws SQLException {
        String sql = "UPDATE dbo.Categoria SET nome_categoria = ? WHERE id_categoria = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, categoria.getNome_categoria());
        ps.setInt(2, id);
        return ps;
    }

    private static Categoria map(ResultSet rs) throws SQLException {
        return Categoria.builder()
                .id_categoria(rs.getInt("id_categoria"))
                .nome_categoria(rs.getString("nome_categoria"))
                .build();
    }
}
