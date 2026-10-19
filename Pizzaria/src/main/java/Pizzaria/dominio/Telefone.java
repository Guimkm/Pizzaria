package Pizzaria.dominio;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Telefone {
    Integer id_telefone;
    Integer numero;
    String tipo;
    Cliente id_cliente;
}
