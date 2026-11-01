package Pizzaria.dominio;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Ingrediente {
    Integer id_ingrediente;
    String nome;
    String unidade;
    Integer quantidade;
    Double preco_unitario;

}
