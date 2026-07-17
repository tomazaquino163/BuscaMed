const formularioLogin = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const botaoEntrar = document.getElementById("botao-entrar");
const botaoMostrarSenha = document.getElementById("botao-mostrar-senha");
const mensagem = document.getElementById("mensagem");

function exibirMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`.trim();
}

function alterarCarregamento(estaCarregando) {
    botaoEntrar.disabled = estaCarregando;
    botaoEntrar.textContent = estaCarregando
        ? "Verificando..."
        : "Entrar";
}

botaoMostrarSenha.addEventListener("click", () => {
    const senhaEstaVisivel = campoSenha.type === "text";

    campoSenha.type = senhaEstaVisivel ? "password" : "text";

    botaoMostrarSenha.textContent = senhaEstaVisivel
        ? "Mostrar"
        : "Ocultar";

    botaoMostrarSenha.setAttribute(
        "aria-label",
        senhaEstaVisivel ? "Mostrar senha" : "Ocultar senha"
    );
});

formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    exibirMensagem("");
    alterarCarregamento(true);

    try {
        const usuario = await fazerLogin(email, senha);
        const perfil = await obterPerfilUsuario(usuario.id);

        const possuiAcesso =
            perfil.role === "moderator" ||
            perfil.role === "admin";

        if (!possuiAcesso) {
            await fazerLogout();

            throw new Error(
                "Esta conta não possui permissão de moderador."
            );
        }

        exibirMensagem(
            "Acesso autorizado. Abrindo o painel...",
            "sucesso"
        );

        window.location.href = "moderador/index.html";
    } catch (erro) {
        console.error("Erro ao entrar:", erro);

        let textoErro = "Não foi possível realizar o acesso.";

        if (
            erro.message ===
            "Esta conta não possui permissão de moderador."
        ) {
            textoErro = erro.message;
        } else if (
            erro.message?.toLowerCase().includes("invalid login credentials")
        ) {
            textoErro = "E-mail ou senha incorretos.";
        } else if (
            erro.message?.toLowerCase().includes("email not confirmed")
        ) {
            textoErro = "O e-mail desta conta ainda não foi confirmado.";
        }

        exibirMensagem(textoErro, "erro");
    } finally {
        alterarCarregamento(false);
    }
});