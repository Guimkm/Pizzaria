package Pizzaria.domain;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Endereco {
    Integer id_endereco;
    String rua;
    String numero;
    String bairro;
    String cidade;
    String cep;
    Cliente id_cliente;
}
