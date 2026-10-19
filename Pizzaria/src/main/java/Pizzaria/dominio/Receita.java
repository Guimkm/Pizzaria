package Pizzaria.dominio;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Receita {
    Integer id_receita;
    Integer quantidade_utilizada;
    Pizza id_pizza;
    Ingrediente id_ingrediente;
}
