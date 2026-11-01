package Pizzaria.dominio;

import lombok.Builder;
import lombok.Value;

// O telefone pertence a um cliente OU a um funcionário (o outro fica null)
@Builder
@Value
public class Telefone {
    Integer id_telefone;
    String numero;
    String tipo;
    Cliente id_cliente;
    Funcionario id_funcionario;
}
