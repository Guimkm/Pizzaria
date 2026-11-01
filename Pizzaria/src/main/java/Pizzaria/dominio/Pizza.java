package Pizzaria.dominio;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Pizza {
    Integer id_pizza;
    String nome;
    String descricao;
    String categoria;
    String tamanho;
    Double preco;
    Boolean ativa;
    Ingrediente[] ingredientes;
}
