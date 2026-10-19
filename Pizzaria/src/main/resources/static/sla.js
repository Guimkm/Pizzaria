fetch('/api/mensagem')
    .then(response => response.text())
    .then(data => {
        console.log(data); // Exibe: "Olá do Back-end Java!"
    });
