package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Pizza {
    Integer id_pizza;
    String nome;
    String descricao;
    String tamanho;      // CHAR(1) no banco: P, M ou G
    Double preco;
    Boolean ativa;
    Categoria id_categoria;
}
