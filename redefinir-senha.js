"use strict";

const formRedefinirSenha =
    document.getElementById("formRedefinirSenha");

const campoNovaSenha =
    document.getElementById("novaSenha");

const campoConfirmarSenha =
    document.getElementById("confirmarSenha");

const mensagemSenha =
    document.getElementById("mensagemSenha");

const botaoSalvar =
    formRedefinirSenha.querySelector(".btn-login");

let recuperacaoValida = false;

supabaseClient.auth.onAuthStateChange(
    function (evento, sessao) {
        console.log("Evento de autenticação:", evento);

        if (
            evento === "PASSWORD_RECOVERY" ||
            evento === "SIGNED_IN"
        ) {
            recuperacaoValida = Boolean(sessao);
        }
    }
);

formRedefinirSenha.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        limparMensagem();

        const novaSenha =
            campoNovaSenha.value;

        const confirmarSenha =
            campoConfirmarSenha.value;

        if (novaSenha.length < 6) {
            mostrarMensagem(
                "A senha deve possuir pelo menos 6 caracteres.",
                "erro"
            );

            return;
        }

        if (novaSenha !== confirmarSenha) {
            mostrarMensagem(
                "As senhas digitadas não são iguais.",
                "erro"
            );

            return;
        }

        botaoSalvar.disabled = true;
        botaoSalvar.textContent =
            "Salvando...";

        try {
            const {
                data: sessaoAtual,
                error: erroSessao
            } = await supabaseClient.auth.getSession();

            if (erroSessao) {
                throw erroSessao;
            }

            if (
                !recuperacaoValida &&
                !sessaoAtual.session
            ) {
                throw new Error(
                    "O link de recuperação é inválido ou expirou."
                );
            }

            const {
                error
            } = await supabaseClient.auth.updateUser({
                password: novaSenha
            });

            if (error) {
                throw error;
            }

            mostrarMensagem(
                "Senha alterada com sucesso! Redirecionando para o login...",
                "sucesso"
            );

            await supabaseClient.auth.signOut();

            setTimeout(function () {
                window.location.href =
                    "login.html";
            }, 1800);
        } catch (erro) {
            console.error(
                "Erro ao redefinir a senha:",
                erro
            );

            mostrarMensagem(
                erro?.message ||
                "Não foi possível redefinir a senha.",
                "erro"
            );
        } finally {
            botaoSalvar.disabled = false;
            botaoSalvar.textContent =
                "Salvar nova senha";
        }
    }
);

function mostrarMensagem(texto, tipo) {
    mensagemSenha.textContent = texto;
    mensagemSenha.className =
        `mensagem-login ${tipo}`;
}

function limparMensagem() {
    mensagemSenha.textContent = "";
    mensagemSenha.className =
        "mensagem-login";
}