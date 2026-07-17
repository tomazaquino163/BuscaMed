"use strict";

// =====================================
// ELEMENTOS DA PÁGINA
// =====================================

const loginForm = document.getElementById("loginForm");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");
const mensagemLogin = document.getElementById("mensagemLogin");
const esqueciSenha = document.getElementById("esqueciSenha");
const solicitarCadastro = document.getElementById("solicitarCadastro");
const botaoLogin = loginForm.querySelector(".btn-login");

// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    verificarSessaoExistente
);

async function verificarSessaoExistente() {
    limparMensagem();

    try {
        const usuario = await obterUsuarioAtual();

        if (!usuario) {
            return;
        }

        mostrarMensagem(
            "Sessão encontrada. Verificando acesso...",
            "sucesso"
        );

        await verificarAcessoFarmacia(usuario);
    } catch (erro) {
        console.log("Nenhuma sessão ativa.");
    }
}

// =====================================
// MOSTRAR / OCULTAR SENHA
// =====================================

toggleSenha.addEventListener("click", function () {
    const mostrar = campoSenha.type === "password";

    campoSenha.type = mostrar
        ? "text"
        : "password";

    toggleSenha.textContent = mostrar
        ? "🙈"
        : "👁️";

    toggleSenha.setAttribute(
        "aria-label",
        mostrar
            ? "Ocultar senha"
            : "Mostrar senha"
    );
});

// =====================================
// LOGIN
// =====================================

loginForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        limparMensagem();

        const email = campoEmail.value
            .trim()
            .toLowerCase();

        const senha = campoSenha.value;

        if (!email || !senha) {
            mostrarMensagem(
                "Preencha o e-mail e a senha.",
                "erro"
            );

            return;
        }

        alterarEstadoBotao(
            true,
            "Entrando..."
        );

        try {
            const usuario = await fazerLogin(
                email,
                senha
            );

            if (!usuario) {
                throw new Error(
                    "Não foi possível identificar o usuário."
                );
            }

            mostrarMensagem(
                "Login realizado. Verificando acesso...",
                "sucesso"
            );

            await verificarAcessoFarmacia(usuario);
        } catch (erro) {
            console.error(
                "Erro no login:",
                erro
            );

            mostrarMensagem(
                traduzirErro(erro),
                "erro"
            );

            alterarEstadoBotao(
                false,
                "Entrar"
            );
        }
    }
);

// =====================================
// VERIFICAR PERFIL E FARMÁCIA
// =====================================

async function verificarAcessoFarmacia(usuario) {
    const perfil = await obterPerfilUsuario(
        usuario.id
    );

    if (!perfil) {
        await fazerLogout();

        throw new Error(
            "Não foi encontrado um perfil para esta conta."
        );
    }

    if (perfil.role !== "pharmacy") {
        await fazerLogout();

        throw new Error(
            "Esta conta não possui acesso à área da farmácia."
        );
    }

    const {
        data: farmacia,
        error
    } = await supabaseClient
        .from("pharmacies")
        .select(`
            id,
            owner_user_id,
            legal_name,
            trade_name,
            status
        `)
        .eq(
            "owner_user_id",
            usuario.id
        )
        .maybeSingle();

    if (error) {
        await fazerLogout();

        throw new Error(
            "Não foi possível consultar o cadastro da farmácia."
        );
    }

    if (!farmacia) {
        await fazerLogout();

        throw new Error(
            "Esta conta não está vinculada a nenhuma farmácia."
        );
    }

    if (farmacia.status === "pending") {
        await fazerLogout();

        throw new Error(
            "O cadastro da farmácia ainda está aguardando aprovação."
        );
    }

    if (farmacia.status === "rejected") {
        await fazerLogout();

        throw new Error(
            "O cadastro da farmácia foi rejeitado."
        );
    }

    if (farmacia.status === "suspended") {
        await fazerLogout();

        throw new Error(
            "O acesso desta farmácia está suspenso."
        );
    }

    if (farmacia.status === "archived") {
        await fazerLogout();

        throw new Error(
            "O cadastro desta farmácia está arquivado."
        );
    }

    if (farmacia.status === "deleted") {
        exibirOpcaoReativacao();
        return;
    }

    if (farmacia.status !== "approved") {
        await fazerLogout();

        throw new Error(
            "A farmácia não está liberada para acessar o painel."
        );
    }

    const nomeFarmacia =
        farmacia.trade_name ||
        farmacia.legal_name ||
        "farmácia";

    mostrarMensagem(
        `Bem-vindo, ${nomeFarmacia}!`,
        "sucesso"
    );

    setTimeout(function () {
        window.location.href =
            "painel/index.html";
    }, 600);
}

// =====================================
// REATIVAÇÃO DE FARMÁCIA EXCLUÍDA
// =====================================

function exibirOpcaoReativacao() {
    alterarEstadoBotao(
        false,
        "Entrar"
    );

    mensagemLogin.textContent = "";
    mensagemLogin.className =
        "mensagem-login erro";

    const texto =
        document.createElement("p");

    texto.textContent =
        "O cadastro desta farmácia foi excluído. Deseja solicitar uma nova análise da moderação?";

    const botao =
        document.createElement("button");

    botao.type = "button";
    botao.className =
        "btn-reativacao";

    botao.textContent =
        "Solicitar reativação";

    botao.addEventListener(
        "click",
        solicitarReativacao
    );

    mensagemLogin.append(
        texto,
        botao
    );
}

async function solicitarReativacao() {
    const botao =
        document.querySelector(
            ".btn-reativacao"
        );

    if (!botao) {
        return;
    }

    botao.disabled = true;
    botao.textContent =
        "Enviando solicitação...";

    try {
        const {
            data,
            error
        } = await supabaseClient.rpc(
            "request_pharmacy_reactivation"
        );

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error(
                "Não foi possível localizar um cadastro excluído para reativação."
            );
        }

        await fazerLogout();

        campoSenha.value = "";

        mostrarMensagem(
            "Solicitação enviada com sucesso! Aguarde uma nova análise da moderação.",
            "sucesso"
        );
    } catch (erro) {
        console.error(
            "Erro ao solicitar reativação:",
            erro
        );

        mostrarMensagem(
            erro?.message ||
                "Não foi possível solicitar a reativação.",
            "erro"
        );
    } finally {
        if (botao.isConnected) {
            botao.disabled = false;
            botao.textContent =
                "Solicitar reativação";
        }
    }
}

// =====================================
// ESQUECI MINHA SENHA
// =====================================

esqueciSenha.addEventListener(
    "click",
    async function (event) {
        event.preventDefault();

        limparMensagem();

        const email = campoEmail.value
            .trim()
            .toLowerCase();

        if (!email) {
            mostrarMensagem(
                "Digite seu e-mail para recuperar a senha.",
                "erro"
            );

            campoEmail.focus();
            return;
        }

        mostrarMensagem(
            "Enviando e-mail de recuperação...",
            "sucesso"
        );

        try {
            const redirectTo =
                `${window.location.origin}${window.location.pathname}`;

            const {
                error
            } = await supabaseClient
                .auth
                .resetPasswordForEmail(
                    email,
                    {
                        redirectTo
                    }
                );

            if (error) {
                throw error;
            }

            mostrarMensagem(
                "As instruções de recuperação foram enviadas para seu e-mail.",
                "sucesso"
            );
        } catch (erro) {
            console.error(
                "Erro na recuperação de senha:",
                erro
            );

            mostrarMensagem(
                "Não foi possível enviar o e-mail de recuperação.",
                "erro"
            );
        }
    }
);

// =====================================
// SOLICITAR CADASTRO
// =====================================

solicitarCadastro.addEventListener(
    "click",
    function (event) {
        event.preventDefault();

        window.location.href =
            "farmacia/cadastro.html";
    }
);

// =====================================
// INTERFACE
// =====================================

function mostrarMensagem(texto, tipo) {
    mensagemLogin.textContent = texto;

    mensagemLogin.className =
        `mensagem-login ${tipo}`;
}

function limparMensagem() {
    mensagemLogin.textContent = "";

    mensagemLogin.className =
        "mensagem-login";
}

function alterarEstadoBotao(
    carregando,
    texto
) {
    botaoLogin.disabled = carregando;
    botaoLogin.textContent = texto;

    campoEmail.disabled = carregando;
    campoSenha.disabled = carregando;
    toggleSenha.disabled = carregando;
}

// =====================================
// TRADUZIR ERROS
// =====================================

function traduzirErro(erro) {
    const mensagem = String(
        erro?.message ||
        erro ||
        ""
    ).toLowerCase();

    if (
        mensagem.includes(
            "invalid login credentials"
        ) ||
        mensagem.includes(
            "invalid credentials"
        )
    ) {
        return "E-mail ou senha incorretos.";
    }

    if (
        mensagem.includes(
            "email not confirmed"
        )
    ) {
        return "Confirme seu e-mail antes de entrar.";
    }

    if (
        mensagem.includes(
            "too many requests"
        ) ||
        mensagem.includes(
            "rate limit"
        )
    ) {
        return "Muitas tentativas. Aguarde alguns minutos.";
    }

    if (
        mensagem.includes(
            "failed to fetch"
        ) ||
        mensagem.includes(
            "network"
        )
    ) {
        return "Não foi possível conectar ao servidor.";
    }

    return (
        erro?.message ||
        "Não foi possível realizar o login."
    );
}