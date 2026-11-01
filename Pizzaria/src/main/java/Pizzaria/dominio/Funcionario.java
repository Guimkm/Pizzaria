package Pizzaria.dominio;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class Funcionario {
    Integer id_funcionario;
    String nome;
    String cargo;
    String email;
    String senha;
    String telefone;
    LocalDate data_admissao;
}
