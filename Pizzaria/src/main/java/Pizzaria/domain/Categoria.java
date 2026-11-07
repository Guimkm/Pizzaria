package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Categoria {
    Integer id_categoria;
    String nome_categoria;
}
