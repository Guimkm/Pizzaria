package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class ItemPedido {
    Integer id_item_pedido;
    Integer quantidade;
    Double preco_unitario;
    Double subtotal;
    Pedido id_pedido;
    Pizza id_pizza;
}
