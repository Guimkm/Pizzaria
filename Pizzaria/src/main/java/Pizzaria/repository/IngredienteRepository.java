package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.dominio.Ingrediente;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Log4j2
public class IngredienteRepository {

    public static List<Ingrediente> findByName(String nome) {
        log.info("Finding ingredientes by name '{}'", nome);
        List<Ingrediente> ingredientes = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByName(conn, nome);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                ingredientes.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find ingredientes by name '{}'", nome, e);
        }
        return ingredientes;
    }

    private static PreparedStatement createPreparedStatementFindByName(Connection conn, String nome) throws SQLException {
        String sql = "SELECT * FROM dbo.Ingredientes WHERE nome LIKE ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, String.format("%%%s%%", nome));
        return ps;
    }

    public static Optional<Ingrediente> findById(Integer id) {
        log.info("Finding ingrediente by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find ingrediente by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Ingredientes WHERE id_ingrediente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void save(Ingrediente ingrediente) {
        log.info("Saving ingrediente '{}'", ingrediente);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, ingrediente)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save ingrediente '{}'", ingrediente.getNome(), e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, Ingrediente i) throws SQLException {
        String sql = "INSERT INTO dbo.Ingredientes (nome, preco_unitario, quantidade, unidade) VALUES (?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, i);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted ingrediente '{}' from the database", id);
        } catch (SQLException e) {
            log.error("Error while trying to delete ingrediente '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Ingredientes WHERE id_ingrediente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, Ingrediente ingrediente) {
        log.info("Updating ingrediente '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, ingrediente)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update ingrediente '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, Ingrediente i) throws SQLException {
        String sql = "UPDATE dbo.Ingredientes SET nome = ?, preco_unitario = ?, quantidade = ?, unidade = ? WHERE id_ingrediente = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, i);
        ps.setInt(5, id);
        return ps;
    }

    // Preenche os 4 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, Ingrediente i) throws SQLException {
        ps.setString(1, i.getNome());
        ps.setDouble(2, i.getPreco_unitario());
        ps.setDouble(3, i.getQuantidade() == null ? 0.0 : i.getQuantidade());
        ps.setString(4, i.getUnidade());
    }

    private static Ingrediente map(ResultSet rs) throws SQLException {
        return Ingrediente.builder()
                .id_ingrediente(rs.getInt("id_ingrediente"))
                .nome(rs.getString("nome"))
                .preco_unitario(rs.getDouble("preco_unitario"))
                .quantidade(rs.getInt("quantidade"))
                .unidade(rs.getString("unidade"))
                .build();
    }

    static String ingredientesToString(Ingrediente[] ings) {
        if (ings == null || ings.length == 0) return null;
        return Arrays.stream(ings)
                .filter(i -> i != null && i.getId_ingrediente() != null)
                .map(i -> String.valueOf(i.getId_ingrediente()))
                .collect(Collectors.joining(","));
    }

    static Ingrediente[] ingredientesFromString(String ids) {
        if (ids == null || ids.isBlank()) return new Ingrediente[0];
        List<Ingrediente> lista = new ArrayList<>();
        for (String id : ids.split(",")) {
            IngredienteRepository.findById(Integer.parseInt(id.trim())).ifPresent(lista::add);
        }
        return lista.toArray(new Ingrediente[0]);
    }
}
