package Pizzaria;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeuController {
    @GetMapping("/mensagem")
    public String getMensagem() {
        return "Olá do Back-end Java!";
    }
}
