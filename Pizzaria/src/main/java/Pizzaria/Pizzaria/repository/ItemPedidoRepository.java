package Pizzaria.repository;

import Pizzaria.connection.ConnectionFactory;
import Pizzaria.domain.ItemPedido;
import Pizzaria.domain.Pedido;
import Pizzaria.domain.Pizza;
import lombok.extern.log4j.Log4j2;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Log4j2
public class ItemPedidoRepository {

    public static Optional<ItemPedido> findById(Integer id) {
        log.info("Finding item_pedido by id '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindById(conn, id);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) return Optional.empty();
            return Optional.of(map(rs));
        } catch (SQLException e) {
            log.error("Error while trying to find item_pedido by id '{}'", id, e);
        }
        return Optional.empty();
    }

    private static PreparedStatement createPreparedStatementFindById(Connection conn, Integer id) throws SQLException {
        String sql = "SELECT * FROM dbo.Item_Pedido WHERE id_item_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    // Extra útil: lista os itens de um pedido (relação de composição Pedido -> ItemPedido)
    public static List<ItemPedido> findByPedido(Integer idPedido) {
        log.info("Finding itens of pedido '{}'", idPedido);
        List<ItemPedido> itens = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementFindByPedido(conn, idPedido);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                itens.add(map(rs));
            }
        } catch (SQLException e) {
            log.error("Error while trying to find itens of pedido '{}'", idPedido, e);
        }
        return itens;
    }

    private static PreparedStatement createPreparedStatementFindByPedido(Connection conn, Integer idPedido) throws SQLException {
        String sql = "SELECT * FROM dbo.Item_Pedido WHERE id_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, idPedido);
        return ps;
    }

    public static void save(ItemPedido item) {
        log.info("Saving item_pedido '{}'", item);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementSave(conn, item)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to save item_pedido", e);
        }
    }

    private static PreparedStatement createPreparedStatementSave(Connection conn, ItemPedido item) throws SQLException {
        String sql = "INSERT INTO dbo.Item_Pedido (quantidade, preco_unitario, subtotal, id_pedido, id_pizza) VALUES (?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, item);
        return ps;
    }

    public static void delete(Integer id) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementDelete(conn, id)) {
            ps.execute();
            log.info("Deleted item_pedido '{}' from the database", id);
        } catch (SQLException e) {
            log.error("Error while trying to delete item_pedido '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementDelete(Connection conn, Integer id) throws SQLException {
        String sql = "DELETE FROM dbo.Item_Pedido WHERE id_item_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        return ps;
    }

    public static void update(Integer id, ItemPedido item) {
        log.info("Updating item_pedido '{}'", id);
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement ps = createPreparedStatementUpdate(conn, id, item)) {
            ps.execute();
        } catch (SQLException e) {
            log.error("Error while trying to update item_pedido '{}'", id, e);
        }
    }

    private static PreparedStatement createPreparedStatementUpdate(Connection conn, Integer id, ItemPedido item) throws SQLException {
        String sql = "UPDATE dbo.Item_Pedido SET quantidade = ?, preco_unitario = ?, subtotal = ?, id_pedido = ?, id_pizza = ? WHERE id_item_pedido = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        fill(ps, item);
        ps.setInt(6, id);
        return ps;
    }

    // Preenche os 5 primeiros parâmetros (usado no INSERT e no UPDATE)
    private static void fill(PreparedStatement ps, ItemPedido i) throws SQLException {
        ps.setInt(1, i.getQuantidade());
        ps.setDouble(2, i.getPreco_unitario());
        ps.setDouble(3, i.getSubtotal());
        ps.setInt(4, i.getId_pedido().getId_pedido());
        ps.setInt(5, i.getId_pizza().getId_pizza());
    }

    private static ItemPedido map(ResultSet rs) throws SQLException {
        return ItemPedido.builder()
                .id_item_pedido(rs.getInt("id_item_pedido"))
                .quantidade(rs.getInt("quantidade"))
                .preco_unitario(rs.getDouble("preco_unitario"))
                .subtotal(rs.getDouble("subtotal"))
                .id_pedido(Pedido.builder().id_pedido(rs.getInt("id_pedido")).build())
                .id_pizza(Pizza.builder().id_pizza(rs.getInt("id_pizza")).build())
                .build();
    }
}
