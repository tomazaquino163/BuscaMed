const telaCarregamento = document.getElementById("tela-carregamento");
const aplicacao = document.getElementById("aplicacao");
const emailUsuario = document.getElementById("email-usuario");
const botaoSair = document.getElementById("botao-sair");
const botaoAtualizar = document.getElementById("botao-atualizar");
const mensagemPainel = document.getElementById("mensagem-painel");

const totalPendentes = document.getElementById("total-pendentes");
const totalAprovadas = document.getElementById("total-aprovadas");
const totalRejeitadas = document.getElementById("total-rejeitadas");
const totalSuspensas = document.getElementById("total-suspensas");

function exibirMensagem(texto, tipo = "") {
    mensagemPainel.textContent = texto;
    mensagemPainel.className = `mensagem-painel ${tipo}`.trim();
}

function esconderCarregamento() {
    telaCarregamento.classList.add("escondido");
    aplicacao.classList.remove("escondido");
}

async function redirecionarParaLogin() {
    window.location.replace("../login-moderador.html");
}

async function protegerPainel() {
    try {
        const usuario = await obterUsuarioAtual();

        if (!usuario) {
            await redirecionarParaLogin();
            return;
        }

        const perfil = await obterPerfilUsuario(usuario.id);

        const possuiPermissao =
            perfil.role === "moderator" ||
            perfil.role === "admin";

        if (!possuiPermissao) {
            await fazerLogout();
            await redirecionarParaLogin();
            return;
        }

        emailUsuario.textContent = usuario.email;

        esconderCarregamento();

        await carregarResumo();
    } catch (erro) {
        console.error("Erro ao proteger o painel:", erro);

        try {
            await fazerLogout();
        } catch (erroLogout) {
            console.error("Erro ao encerrar sessão:", erroLogout);
        }

        await redirecionarParaLogin();
    }
}

async function contarFarmaciasPorStatus(status) {
    const { count, error } = await supabaseClient
        .from("pharmacies")
        .select("id", {
            count: "exact",
            head: true
        })
        .eq("status", status);

    if (error) {
        throw error;
    }

    return count ?? 0;
}

async function carregarResumo() {
    botaoAtualizar.disabled = true;
    botaoAtualizar.textContent = "Atualizando...";

    exibirMensagem("");

    try {
        const [
            pendentes,
            aprovadas,
            rejeitadas,
            suspensas
        ] = await Promise.all([
            contarFarmaciasPorStatus("pending"),
            contarFarmaciasPorStatus("approved"),
            contarFarmaciasPorStatus("rejected"),
            contarFarmaciasPorStatus("suspended")
        ]);

        totalPendentes.textContent = pendentes;
        totalAprovadas.textContent = aprovadas;
        totalRejeitadas.textContent = rejeitadas;
        totalSuspensas.textContent = suspensas;
    } catch (erro) {
        console.error("Erro ao carregar resumo:", erro);

        exibirMensagem(
            "Não foi possível carregar os dados das farmácias.",
            "erro"
        );
    } finally {
        botaoAtualizar.disabled = false;
        botaoAtualizar.textContent = "Atualizar";
    }
}

botaoAtualizar.addEventListener("click", carregarResumo);

botaoSair.addEventListener("click", async () => {
    botaoSair.disabled = true;
    botaoSair.textContent = "Saindo...";

    try {
        await fazerLogout();
        await redirecionarParaLogin();
    } catch (erro) {
        console.error("Erro ao sair:", erro);

        botaoSair.disabled = false;
        botaoSair.textContent = "Sair da conta";

        exibirMensagem(
            "Não foi possível encerrar a sessão.",
            "erro"
        );
    }
});

protegerPainel();