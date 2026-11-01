package Pizzaria.dominio;

import lombok.Builder;
import lombok.Value;

@Builder
@Value
public class Endereco {
    Integer id_endereco;
    String rua;
    Integer numero;
    String bairro;
    String cidade;
    String cep;
}
