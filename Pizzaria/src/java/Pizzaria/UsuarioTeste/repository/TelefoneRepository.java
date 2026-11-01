package Pizzaria.UsuarioTeste.repository;

import Pizzaria.UsuarioTeste.model.Telefone;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TelefoneRepository extends JpaRepository<Telefone, Integer> {}