package Pizzaria.UsuarioTeste.repository;

import Pizzaria.UsuarioTeste.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByEmail(String email);
    boolean existsByCpf(String cpf);
}