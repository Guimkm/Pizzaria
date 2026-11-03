package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Ingrediente {
    Integer id_ingrediente;
    String nome;
    Double preco_unitario;
    Double quantidade;
    String unidade;
}
