const telaCarregamento = document.getElementById(
    "tela-carregamento"
);

const emailModerador = document.getElementById(
    "email-moderador"
);

const avatarModerador = document.getElementById(
    "avatar-moderador"
);

const contadorPendentes = document.getElementById(
    "contador-pendentes"
);

const contadorAprovadas = document.getElementById(
    "contador-aprovadas"
);

const contadorRejeitadas = document.getElementById(
    "contador-rejeitadas"
);

const contadorSuspensas = document.getElementById(
    "contador-suspensas"
);

const listaPendentes = document.getElementById(
    "lista-pendentes"
);

const listaSolicitacoes = document.getElementById(
    "lista-solicitacoes"
);

const listaFarmacias = document.getElementById(
    "lista-farmacias"
);

const filtroStatus = document.getElementById(
    "filtro-status"
);

const modalRejeicao = document.getElementById(
    "modal-rejeicao"
);

const motivoRejeicao = document.getElementById(
    "motivo-rejeicao"
);

const erroMotivo = document.getElementById(
    "erro-motivo"
);

const confirmarRejeicao = document.getElementById(
    "confirmar-rejeicao"
);

const notificacao = document.getElementById(
    "notificacao"
);

let usuarioModerador = null;
let farmaciaSelecionadaParaRejeicao = null;
let temporizadorNotificacao = null;

function escaparHtml(valor) {
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
}

function formatarCnpj(cnpj) {
    const numeros = String(cnpj || "")
        .replace(/\D/g, "")
        .slice(0, 14);

    if (numeros.length !== 14) {
        return cnpj || "Não informado";
    }

    return numeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(telefone) {
    const numeros = String(telefone || "")
        .replace(/\D/g, "")
        .slice(0, 11);

    if (numeros.length === 11) {
        return numeros
            .replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (numeros.length === 10) {
        return numeros
            .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return telefone || "Não informado";
}

function formatarData(data) {
    if (!data) {
        return "Não informada";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date(data));
}

function traduzirStatus(status) {
    const statusTraduzidos = {
        pending: "Pendente",
        approved: "Aprovada",
        rejected: "Rejeitada",
        suspended: "Suspensa"
    };

    return statusTraduzidos[status] || status;
}

function mostrarNotificacao(mensagem, tipo = "sucesso") {
    clearTimeout(temporizadorNotificacao);

    notificacao.textContent = mensagem;
    notificacao.className = `notificacao ${tipo} visivel`;

    temporizadorNotificacao = setTimeout(() => {
        notificacao.classList.remove("visivel");
    }, 4000);
}

function mostrarCarregamentoLista(elemento) {
    elemento.innerHTML = `
        <div class="estado-lista">
            <div class="mini-spinner"></div>
            <strong>Carregando informações...</strong>
        </div>
    `;
}

function mostrarListaVazia(elemento, tipo = "pendentes") {
    const mensagens = {
        pendentes: {
            icone: "🏥",
            titulo: "Nenhuma solicitação pendente",
            texto: "As novas farmácias aparecerão aqui para análise."
        },

        farmacias: {
            icone: "🔎",
            titulo: "Nenhuma farmácia encontrada",
            texto: "Não existem farmácias com o filtro selecionado."
        }
    };

    const conteudo = mensagens[tipo];

    elemento.innerHTML = `
        <div class="estado-lista">
            <div class="icone-vazio">${conteudo.icone}</div>
            <strong>${conteudo.titulo}</strong>
            <p>${conteudo.texto}</p>
        </div>
    `;
}

function criarDadosFarmacia(farmacia) {
    const nomeFantasia =
        farmacia.trade_name ||
        farmacia.legal_name ||
        "Farmácia sem nome";

    const razaoSocial =
        farmacia.legal_name ||
        "Razão social não informada";

    const responsavel =
        farmacia.responsible_name ||
        "Não informado";

    const localizacao = [
        farmacia.city,
        farmacia.state
    ]
        .filter(Boolean)
        .join(" - ") || "Não informada";

    return {
        nomeFantasia,
        razaoSocial,
        responsavel,
        localizacao
    };
}

function criarCardFarmacia(farmacia, modo = "moderacao") {
    const dados = criarDadosFarmacia(farmacia);

    const email = farmacia.commercial_email || "Não informado";
    const telefone = formatarTelefone(
        farmacia.whatsapp || farmacia.phone
    );

    const enderecoCompleto = [
        farmacia.address,
        farmacia.neighborhood
    ]
        .filter(Boolean)
        .join(" - ") || "Não informado";

    let botoes = "";

    if (modo === "moderacao" && farmacia.status === "pending") {
        botoes = `
            <div class="acoes-farmacia">
                <button
                    type="button"
                    class="botao-rejeitar"
                    data-acao="rejeitar"
                    data-id="${farmacia.id}"
                >
                    ✕ Rejeitar
                </button>

                <button
                    type="button"
                    class="botao-aprovar"
                    data-acao="aprovar"
                    data-id="${farmacia.id}"
                >
                    ✓ Aprovar
                </button>
            </div>
        `;
    }

    if (modo === "gerenciamento") {
        if (farmacia.status === "approved") {
            botoes = `
                <div class="acoes-farmacia">
                    <button
                        type="button"
                        class="botao-suspender"
                        data-acao="suspender"
                        data-id="${farmacia.id}"
                    >
                        Suspender farmácia
                    </button>
                </div>
            `;
        }

        if (farmacia.status === "suspended") {
            botoes = `
                <div class="acoes-farmacia">
                    <button
                        type="button"
                        class="botao-reativar"
                        data-acao="reativar"
                        data-id="${farmacia.id}"
                    >
                        Reativar farmácia
                    </button>
                </div>
            `;
        }

        if (farmacia.status === "pending") {
            botoes = `
                <div class="acoes-farmacia">
                    <button
                        type="button"
                        class="botao-rejeitar"
                        data-acao="rejeitar"
                        data-id="${farmacia.id}"
                    >
                        ✕ Rejeitar
                    </button>

                    <button
                        type="button"
                        class="botao-aprovar"
                        data-acao="aprovar"
                        data-id="${farmacia.id}"
                    >
                        ✓ Aprovar
                    </button>
                </div>
            `;
        }
    }

    const motivo =
        farmacia.status === "rejected" &&
        farmacia.rejection_reason
            ? `
                <div class="motivo-rejeicao">
                    <strong>Motivo da rejeição:</strong>
                    ${escaparHtml(farmacia.rejection_reason)}
                </div>
            `
            : "";

    return `
        <article
            class="cartao-farmacia"
            data-farmacia-id="${farmacia.id}"
        >
            <div class="topo-cartao-farmacia">
                <div class="identidade-farmacia">
                    <span class="icone-farmacia">🏥</span>

                    <div>
                        <h3 class="nome-farmacia">
                            ${escaparHtml(dados.nomeFantasia)}
                        </h3>

                        <p class="razao-social">
                            ${escaparHtml(dados.razaoSocial)}
                        </p>
                    </div>
                </div>

                <span class="selo-status ${farmacia.status}">
                    ${traduzirStatus(farmacia.status)}
                </span>
            </div>

            <div class="dados-farmacia">
                <div class="dado-farmacia">
                    <small>Responsável</small>
                    <strong>
                        ${escaparHtml(dados.responsavel)}
                    </strong>
                </div>

                <div class="dado-farmacia">
                    <small>CNPJ</small>
                    <strong>
                        ${escaparHtml(formatarCnpj(farmacia.cnpj))}
                    </strong>
                </div>

                <div class="dado-farmacia">
                    <small>Localização</small>
                    <strong>
                        ${escaparHtml(dados.localizacao)}
                    </strong>
                </div>

                <div class="dado-farmacia">
                    <small>E-mail comercial</small>

                    ${
                        farmacia.commercial_email
                            ? `
                                <a href="mailto:${escaparHtml(email)}">
                                    ${escaparHtml(email)}
                                </a>
                            `
                            : `
                                <strong>Não informado</strong>
                            `
                    }
                </div>

                <div class="dado-farmacia">
                    <small>Telefone / WhatsApp</small>
                    <strong>
                        ${escaparHtml(telefone)}
                    </strong>
                </div>

                <div class="dado-farmacia">
                    <small>Endereço</small>
                    <strong>
                        ${escaparHtml(enderecoCompleto)}
                    </strong>
                </div>

                <div class="dado-farmacia">
                    <small>Solicitação enviada</small>
                    <strong>
                        ${escaparHtml(formatarData(farmacia.created_at))}
                    </strong>
                </div>

                ${
                    farmacia.reviewed_at
                        ? `
                            <div class="dado-farmacia">
                                <small>Última análise</small>
                                <strong>
                                    ${escaparHtml(
                                        formatarData(farmacia.reviewed_at)
                                    )}
                                </strong>
                            </div>
                        `
                        : ""
                }
            </div>

            ${motivo}
            ${botoes}
        </article>
    `;
}

async function protegerPainel() {
    try {
        usuarioModerador = await obterUsuarioAtual();

        if (!usuarioModerador) {
            window.location.href = "../login-moderador.html";
            return false;
        }

        const perfil = await obterPerfilUsuario(
            usuarioModerador.id
        );

        if (
            !perfil ||
            !["moderator", "admin"].includes(perfil.role)
        ) {
            await fazerLogout();
            window.location.href = "../login-moderador.html";
            return false;
        }

        emailModerador.textContent =
            usuarioModerador.email || "Moderador";

        avatarModerador.textContent =
            usuarioModerador.email
                ? usuarioModerador.email
                    .charAt(0)
                    .toUpperCase()
                : "M";

        return true;
    } catch (erro) {
        console.error("Erro ao proteger painel:", erro);

        window.location.href = "../login-moderador.html";
        return false;
    }
}

async function carregarContadores() {
    const status = [
        "pending",
        "approved",
        "rejected",
        "suspended"
    ];

    const resultados = await Promise.all(
        status.map(async (situacao) => {
            const { count, error } = await supabaseClient
                .from("pharmacies")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("status", situacao);

            if (error) {
                throw error;
            }

            return {
                status: situacao,
                quantidade: count || 0
            };
        })
    );

    const contagem = Object.fromEntries(
        resultados.map((item) => [
            item.status,
            item.quantidade
        ])
    );

    contadorPendentes.textContent =
        contagem.pending || 0;

    contadorAprovadas.textContent =
        contagem.approved || 0;

    contadorRejeitadas.textContent =
        contagem.rejected || 0;

    contadorSuspensas.textContent =
        contagem.suspended || 0;
}

async function buscarFarmaciasPendentes() {
    const { data, error } = await supabaseClient
        .from("pharmacies")
        .select("*")
        .eq("status", "pending")
        .order("created_at", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return data || [];
}

async function carregarPendentes() {
    mostrarCarregamentoLista(listaPendentes);
    mostrarCarregamentoLista(listaSolicitacoes);

    try {
        const farmacias = await buscarFarmaciasPendentes();

        if (farmacias.length === 0) {
            mostrarListaVazia(listaPendentes, "pendentes");
            mostrarListaVazia(listaSolicitacoes, "pendentes");
            return;
        }

        const cards = farmacias
            .map((farmacia) => {
                return criarCardFarmacia(
                    farmacia,
                    "moderacao"
                );
            })
            .join("");

        listaPendentes.innerHTML = cards;
        listaSolicitacoes.innerHTML = cards;
    } catch (erro) {
        console.error(
            "Erro ao carregar farmácias pendentes:",
            erro
        );

        listaPendentes.innerHTML = `
            <div class="estado-lista">
                <div class="icone-vazio">⚠️</div>
                <strong>Erro ao carregar solicitações</strong>
                <p>${escaparHtml(erro.message)}</p>
            </div>
        `;

        listaSolicitacoes.innerHTML =
            listaPendentes.innerHTML;
    }
}

async function carregarTodasFarmacias() {
    mostrarCarregamentoLista(listaFarmacias);

    try {
        let consulta = supabaseClient
            .from("pharmacies")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (filtroStatus.value !== "all") {
            consulta = consulta.eq(
                "status",
                filtroStatus.value
            );
        }

        const { data, error } = await consulta;

        if (error) {
            throw error;
        }

        const farmacias = data || [];

        if (farmacias.length === 0) {
            mostrarListaVazia(listaFarmacias, "farmacias");
            return;
        }

        listaFarmacias.innerHTML = farmacias
            .map((farmacia) => {
                return criarCardFarmacia(
                    farmacia,
                    "gerenciamento"
                );
            })
            .join("");
    } catch (erro) {
        console.error(
            "Erro ao carregar farmácias:",
            erro
        );

        listaFarmacias.innerHTML = `
            <div class="estado-lista">
                <div class="icone-vazio">⚠️</div>
                <strong>Erro ao carregar farmácias</strong>
                <p>${escaparHtml(erro.message)}</p>
            </div>
        `;
    }
}

async function atualizarPainelCompleto() {
    try {
        await Promise.all([
            carregarContadores(),
            carregarPendentes(),
            carregarTodasFarmacias()
        ]);
    } catch (erro) {
        console.error(
            "Erro ao atualizar o painel:",
            erro
        );

        mostrarNotificacao(
            "Não foi possível atualizar o painel.",
            "erro"
        );
    }
}

async function atualizarStatusFarmacia(
    farmaciaId,
    novoStatus,
    motivo = null
) {
    const atualizacao = {
        status: novoStatus,
        reviewed_by: usuarioModerador.id,
        reviewed_at: new Date().toISOString()
    };

    if (novoStatus === "rejected") {
        atualizacao.rejection_reason = motivo;
    } else {
        atualizacao.rejection_reason = null;
    }

    const { error } = await supabaseClient
        .from("pharmacies")
        .update(atualizacao)
        .eq("id", farmaciaId);

    if (error) {
        throw error;
    }
}

async function aprovarFarmacia(farmaciaId, botao) {
    const confirmou = window.confirm(
        "Deseja aprovar esta farmácia?"
    );

    if (!confirmou) {
        return;
    }

    const textoOriginal = botao.textContent;

    try {
        botao.disabled = true;
        botao.textContent = "Aprovando...";

        await atualizarStatusFarmacia(
            farmaciaId,
            "approved"
        );

        mostrarNotificacao(
            "Farmácia aprovada com sucesso!"
        );

        await atualizarPainelCompleto();
    } catch (erro) {
        console.error(
            "Erro ao aprovar farmácia:",
            erro
        );

        mostrarNotificacao(
            `Erro ao aprovar: ${erro.message}`,
            "erro"
        );

        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}

function abrirModalRejeicao(farmaciaId) {
    farmaciaSelecionadaParaRejeicao = farmaciaId;

    motivoRejeicao.value = "";
    erroMotivo.textContent = "";

    modalRejeicao.classList.add("aberto");
    motivoRejeicao.focus();
}

function fecharModalRejeicao() {
    modalRejeicao.classList.remove("aberto");

    farmaciaSelecionadaParaRejeicao = null;
    motivoRejeicao.value = "";
    erroMotivo.textContent = "";
}

async function rejeitarFarmacia() {
    const motivo = motivoRejeicao.value.trim();

    if (motivo.length < 5) {
        erroMotivo.textContent =
            "Informe um motivo com pelo menos 5 caracteres.";

        return;
    }

    const textoOriginal =
        confirmarRejeicao.textContent;

    try {
        confirmarRejeicao.disabled = true;
        confirmarRejeicao.textContent =
            "Rejeitando...";

        await atualizarStatusFarmacia(
            farmaciaSelecionadaParaRejeicao,
            "rejected",
            motivo
        );

        fecharModalRejeicao();

        mostrarNotificacao(
            "Solicitação rejeitada."
        );

        await atualizarPainelCompleto();
    } catch (erro) {
        console.error(
            "Erro ao rejeitar farmácia:",
            erro
        );

        erroMotivo.textContent =
            `Erro: ${erro.message}`;
    } finally {
        confirmarRejeicao.disabled = false;
        confirmarRejeicao.textContent =
            textoOriginal;
    }
}

async function suspenderFarmacia(
    farmaciaId,
    botao
) {
    const confirmou = window.confirm(
        "Deseja suspender esta farmácia?"
    );

    if (!confirmou) {
        return;
    }

    try {
        botao.disabled = true;
        botao.textContent = "Suspendendo...";

        await atualizarStatusFarmacia(
            farmaciaId,
            "suspended"
        );

        mostrarNotificacao(
            "Farmácia suspensa."
        );

        await atualizarPainelCompleto();
    } catch (erro) {
        console.error(
            "Erro ao suspender farmácia:",
            erro
        );

        mostrarNotificacao(
            `Erro ao suspender: ${erro.message}`,
            "erro"
        );

        botao.disabled = false;
        botao.textContent = "Suspender farmácia";
    }
}

async function reativarFarmacia(
    farmaciaId,
    botao
) {
    const confirmou = window.confirm(
        "Deseja reativar esta farmácia?"
    );

    if (!confirmou) {
        return;
    }

    try {
        botao.disabled = true;
        botao.textContent = "Reativando...";

        await atualizarStatusFarmacia(
            farmaciaId,
            "approved"
        );

        mostrarNotificacao(
            "Farmácia reativada."
        );

        await atualizarPainelCompleto();
    } catch (erro) {
        console.error(
            "Erro ao reativar farmácia:",
            erro
        );

        mostrarNotificacao(
            `Erro ao reativar: ${erro.message}`,
            "erro"
        );

        botao.disabled = false;
        botao.textContent = "Reativar farmácia";
    }
}

function tratarCliqueEmFarmacia(evento) {
    const botao = evento.target.closest(
        "[data-acao]"
    );

    if (!botao) {
        return;
    }

    const farmaciaId = botao.dataset.id;
    const acao = botao.dataset.acao;

    if (acao === "aprovar") {
        aprovarFarmacia(
            farmaciaId,
            botao
        );
    }

    if (acao === "rejeitar") {
        abrirModalRejeicao(farmaciaId);
    }

    if (acao === "suspender") {
        suspenderFarmacia(
            farmaciaId,
            botao
        );
    }

    if (acao === "reativar") {
        reativarFarmacia(
            farmaciaId,
            botao
        );
    }
}

function configurarNavegacao() {
    const botoesMenu = document.querySelectorAll(
        ".item-menu"
    );

    const secoes = document.querySelectorAll(
        ".secao-painel"
    );

    botoesMenu.forEach((botao) => {
        botao.addEventListener("click", () => {
            botoesMenu.forEach((item) => {
                item.classList.remove("ativo");
            });

            secoes.forEach((secao) => {
                secao.classList.remove("ativa");
            });

            botao.classList.add("ativo");

            const secao = document.getElementById(
                `secao-${botao.dataset.secao}`
            );

            secao.classList.add("ativa");

            if (botao.dataset.secao === "farmacias") {
                carregarTodasFarmacias();
            }

            if (botao.dataset.secao === "solicitacoes") {
                carregarPendentes();
            }
        });
    });
}

document
    .querySelectorAll("[data-fechar-modal]")
    .forEach((elemento) => {
        elemento.addEventListener(
            "click",
            fecharModalRejeicao
        );
    });

document.addEventListener("keydown", (evento) => {
    if (
        evento.key === "Escape" &&
        modalRejeicao.classList.contains("aberto")
    ) {
        fecharModalRejeicao();
    }
});

listaPendentes.addEventListener(
    "click",
    tratarCliqueEmFarmacia
);

listaSolicitacoes.addEventListener(
    "click",
    tratarCliqueEmFarmacia
);

listaFarmacias.addEventListener(
    "click",
    tratarCliqueEmFarmacia
);

confirmarRejeicao.addEventListener(
    "click",
    rejeitarFarmacia
);

document
    .getElementById("botao-atualizar")
    .addEventListener(
        "click",
        atualizarPainelCompleto
    );

document
    .getElementById("botao-atualizar-solicitacoes")
    .addEventListener(
        "click",
        carregarPendentes
    );

document
    .getElementById("botao-atualizar-farmacias")
    .addEventListener(
        "click",
        carregarTodasFarmacias
    );

filtroStatus.addEventListener(
    "change",
    carregarTodasFarmacias
);

document
    .getElementById("botao-sair")
    .addEventListener("click", async () => {
        try {
            await fazerLogout();
        } finally {
            window.location.href =
                "../login-moderador.html";
        }
    });

async function iniciarPainel() {
    const autorizado = await protegerPainel();

    if (!autorizado) {
        return;
    }

    configurarNavegacao();

    await atualizarPainelCompleto();

    telaCarregamento.style.display = "none";
}

iniciarPainel();