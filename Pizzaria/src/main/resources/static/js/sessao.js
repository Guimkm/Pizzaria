// Envia JSON por POST
function enviar(url, corpo) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
    });
}

async function sessao() {
    const r = await fetch('/api/me');
    return r.ok ? r.json() : null;
}

// Nas páginas de login: se já está logado, vai direto para a página certa
async function jaLogado() {
    const u = await sessao();
    if (u) location.href = u.pagina;
}

// Nas áreas restritas: confere tipo (e cargo, se informado) e mostra o nome
async function exigir(tipo, cargo) {
    const u = await sessao();
    if (!u) { location.href = '/index.html'; return; }
    if (u.tipo !== tipo || (cargo && u.cargo !== cargo)) { location.href = u.pagina; return; }
    document.getElementById('nome').textContent = u.nome;
}

async function sair() {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/index.html';
}