package Pizzaria.service;

import Pizzaria.dominio.*;
import Pizzaria.repository.Repository;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Log4j2
@RestController
@RequestMapping("/api")
public class Service {

    @GetMapping("/findByName")
    public static <T> List<T> findByName(Class<T> tipo, String nome) {
        return Repository.findByName(tipo, nome);
    }

    @GetMapping("/findById")
    public static <T> T findById(Class<T> tipo, Integer id) {
        return Repository.findById(tipo, id);
    }

    @GetMapping("/findByEmail")
    public static <T> Optional<T> findByEmail(Class<T> tipo, String email) {
        return Repository.findByEmail(tipo, email);
    }

    @GetMapping("/existsByCpf")
    public static boolean existsByCpf(String cpf) {
        return Repository.existsByCpf(cpf);
    }

    @GetMapping("/delete")
    public static void delete(Class<?> tipo, int id) {
        Repository.delete(tipo, id);
    }

    @GetMapping("/save")
    public static <T> void save(T obj) {
        // Regra de negócio: não cadastrar dois clientes com o mesmo CPF
        if (obj instanceof Cliente cliente && existsByCpf(cliente.getCpf())) {
            log.warn("Já existe um cliente cadastrado com o CPF '{}'", cliente.getCpf());
            return;
        }
        Repository.save(obj);
    }

    @GetMapping("/update")
    public static <T> void update(T obj) {
        Repository.update(idOf(obj), obj);
    }

    // Descobre o id do objeto para usar no WHERE do UPDATE
    private static Integer idOf(Object obj) {
        if (obj instanceof Cliente o) return o.getId_cliente();
        if (obj instanceof Funcionario o) return o.getId_funcionario();
        if (obj instanceof Pizza o) return o.getId_pizza();
        if (obj instanceof Ingrediente o) return o.getId_ingrediente();
        if (obj instanceof Endereco o) return o.getId_endereco();
        if (obj instanceof Pedido o) return o.getId_pedido();
        if (obj instanceof ItemPedido o) return o.getId_item_pedido();
        throw new UnsupportedOperationException("Tipo não suportado: " + obj.getClass().getSimpleName());
    }
}
