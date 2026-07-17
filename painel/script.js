"use strict";

/* =========================================================
   ESTADO DA APLICAÇÃO
========================================================= */

const estado = {
    usuario: null,
    farmacia: null,
    medicamentos: [],
    categorias: [],
    medicamentoEmExclusao: null,
    secaoAtual: "inicio",
    notificacaoTimeout: null
};


/* =========================================================
   ELEMENTOS PRINCIPAIS
========================================================= */

const elementos = {
    telaCarregamento: document.getElementById("tela-carregamento"),

    tituloPainel: document.getElementById("titulo-painel"),
    nomeCabecalhoFarmacia: document.getElementById(
        "nome-cabecalho-farmacia"
    ),
    emailUsuario: document.getElementById("email-usuario"),
    avatarFarmacia: document.getElementById("avatar-farmacia"),

    avisoStatus: document.getElementById("aviso-status"),
    iconeAvisoStatus: document.getElementById("icone-aviso-status"),
    tituloAvisoStatus: document.getElementById("titulo-aviso-status"),
    textoAvisoStatus: document.getElementById("texto-aviso-status"),
    motivoStatus: document.getElementById("motivo-status"),

    nomeBannerFarmacia: document.getElementById("nome-banner-farmacia"),

    contadorMedicamentos: document.getElementById(
        "contador-medicamentos"
    ),
    contadorAtivos: document.getElementById("contador-ativos"),
    contadorComEstoque: document.getElementById(
        "contador-com-estoque"
    ),
    contadorSemEstoque: document.getElementById(
        "contador-sem-estoque"
    ),

    listaMedicamentosRecentes: document.getElementById(
        "lista-medicamentos-recentes"
    ),
    listaMedicamentos: document.getElementById(
        "lista-medicamentos"
    ),

    buscaMedicamento: document.getElementById("busca-medicamento"),
    filtroMedicamentos: document.getElementById(
        "filtro-medicamentos"
    ),

    botaoNovoMedicamento: document.getElementById(
        "botao-novo-medicamento"
    ),
    botaoAtualizarInicio: document.getElementById(
        "botao-atualizar-inicio"
    ),
    botaoAtualizarMedicamentos: document.getElementById(
        "botao-atualizar-medicamentos"
    ),
    botaoSair: document.getElementById("botao-sair"),

    modalMedicamento: document.getElementById("modal-medicamento"),
    tituloModalMedicamento: document.getElementById(
        "titulo-modal-medicamento"
    ),
    formularioMedicamento: document.getElementById(
        "formulario-medicamento"
    ),
    botaoSalvarMedicamento: document.getElementById(
        "botao-salvar-medicamento"
    ),
    erroFormularioMedicamento: document.getElementById(
        "erro-formulario-medicamento"
    ),

    medicamentoId: document.getElementById("medicamento-id"),
    nomeMedicamento: document.getElementById("nome-medicamento"),
    principioAtivo: document.getElementById("principio-ativo"),
    fabricante: document.getElementById("fabricante"),
    dosagem: document.getElementById("dosagem"),
    unidadeDosagem: document.getElementById("unidade-dosagem"),
    apresentacao: document.getElementById("apresentacao"),
    codigoBarras: document.getElementById("codigo-barras"),
    categoriaMedicamento: document.getElementById(
        "categoria-medicamento"
    ),
    preco: document.getElementById("preco"),
    precoPromocional: document.getElementById(
        "preco-promocional"
    ),
    quantidade: document.getElementById("quantidade"),
    imagemUrl: document.getElementById("imagem-url"),
    descricao: document.getElementById("descricao"),
    medicamentoAtivo: document.getElementById(
        "medicamento-ativo"
    ),
    exigeReceita: document.getElementById("exige-receita"),

    modalExclusao: document.getElementById("modal-exclusao"),
    nomeMedicamentoExclusao: document.getElementById(
        "nome-medicamento-exclusao"
    ),
    botaoConfirmarExclusao: document.getElementById(
        "botao-confirmar-exclusao"
    ),

    notificacao: document.getElementById("notificacao"),

    perfilNomeFantasia: document.getElementById(
        "perfil-nome-fantasia"
    ),
    perfilRazaoSocial: document.getElementById(
        "perfil-razao-social"
    ),
    perfilStatus: document.getElementById("perfil-status"),
    perfilCnpj: document.getElementById("perfil-cnpj"),
    perfilResponsavel: document.getElementById(
        "perfil-responsavel"
    ),
    perfilEmail: document.getElementById("perfil-email"),
    perfilTelefone: document.getElementById("perfil-telefone"),
    perfilWhatsapp: document.getElementById("perfil-whatsapp"),
    perfilEndereco: document.getElementById("perfil-endereco"),
    perfilBairro: document.getElementById("perfil-bairro"),
    perfilCidade: document.getElementById("perfil-cidade"),
    perfilCep: document.getElementById("perfil-cep"),
    perfilDataCadastro: document.getElementById(
        "perfil-data-cadastro"
    ),
    logoFarmacia: document.getElementById("logo-farmacia")
};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", iniciarPainel);

async function iniciarPainel() {
    configurarEventos();

    try {
        await verificarSessao();
        await carregarFarmacia();

        EditarFarmacia.inicializar();

        preencherInformacoesFarmacia();
        configurarAcessoPorStatus();

        if (estado.farmacia.status === "approved") {
            await Promise.all([
                carregarCategorias(),
                carregarMedicamentos()
            ]);
        } else {
            renderizarPainelBloqueado();
        }
    } catch (erro) {
        console.error("Erro ao iniciar painel:", erro);

        mostrarNotificacao(
            erro.message || "Não foi possível carregar o painel.",
            "erro"
        );
    } finally {
        ocultarTelaCarregamento();
    }
}


/* =========================================================
   SESSÃO E FARMÁCIA
========================================================= */

async function verificarSessao() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        throw new Error("Não foi possível verificar sua sessão.");
    }

    if (!session?.user) {
        window.location.href = "../login.html";
        return;
    }

    estado.usuario = session.user;

    elementos.emailUsuario.textContent =
        estado.usuario.email || "Usuário autenticado";
}

async function carregarFarmacia() {
    const { data, error } = await supabaseClient
        .from("pharmacies")
        .select("*")
        .eq("owner_user_id", estado.usuario.id)
        .maybeSingle();

    if (error) {
        throw new Error(
            "Não foi possível carregar os dados da farmácia."
        );
    }

    if (!data) {
        await supabaseClient.auth.signOut();
        window.location.href = "../farmacia/cadastro.html";
        return;
    }

    estado.farmacia = data;
}


/* =========================================================
   STATUS DA FARMÁCIA
========================================================= */

function configurarAcessoPorStatus() {
    const status = estado.farmacia.status;

    if (status === "approved") {
        elementos.avisoStatus.classList.add("oculto");
        habilitarAreaDeMedicamentos(true);
        return;
    }

    elementos.avisoStatus.className = `aviso-status ${status}`;
    elementos.avisoStatus.classList.remove("oculto");

    const configuracoes = {
        pending: {
            icone: "⏳",
            titulo: "Cadastro em análise",
            texto:
                "Sua farmácia foi cadastrada e está aguardando a análise de um moderador."
        },

        rejected: {
            icone: "✕",
            titulo: "Cadastro rejeitado",
            texto:
                "O cadastro da sua farmácia foi rejeitado. Confira abaixo o motivo informado pelo moderador."
        },

        suspended: {
            icone: "⚠",
            titulo: "Acesso suspenso",
            texto:
                "A farmácia está temporariamente suspensa e não pode gerenciar medicamentos."
        },

        archived: {
            icone: "📁",
            titulo: "Cadastro arquivado",
            texto:
                "O cadastro desta farmácia foi arquivado e o acesso ao catálogo está bloqueado."
        }
    };

    const configuracao =
        configuracoes[status] || configuracoes.pending;

    elementos.iconeAvisoStatus.textContent = configuracao.icone;
    elementos.tituloAvisoStatus.textContent = configuracao.titulo;
    elementos.textoAvisoStatus.textContent = configuracao.texto;

    if (
        status === "rejected" &&
        estado.farmacia.rejection_reason
    ) {
        elementos.motivoStatus.textContent =
            `Motivo: ${estado.farmacia.rejection_reason}`;

        elementos.motivoStatus.classList.remove("oculto");
    } else {
        elementos.motivoStatus.classList.add("oculto");
    }

    habilitarAreaDeMedicamentos(false);
}

function habilitarAreaDeMedicamentos(habilitar) {
    elementos.botaoNovoMedicamento.disabled = !habilitar;
    elementos.botaoAtualizarMedicamentos.disabled = !habilitar;
    elementos.botaoAtualizarInicio.disabled = !habilitar;
    elementos.buscaMedicamento.disabled = !habilitar;
    elementos.filtroMedicamentos.disabled = !habilitar;
}

function renderizarPainelBloqueado() {
    const mensagem = `
        <div class="estado-lista">
            <span class="icone-vazio">🔒</span>
            <strong>Gerenciamento indisponível</strong>
            <p>
                O catálogo de medicamentos será liberado quando
                a farmácia estiver com o cadastro aprovado.
            </p>
        </div>
    `;

    elementos.listaMedicamentos.innerHTML = mensagem;
    elementos.listaMedicamentosRecentes.innerHTML = mensagem;

    atualizarContadores();
}


/* =========================================================
   INFORMAÇÕES DA FARMÁCIA
========================================================= */

function preencherInformacoesFarmacia() {

    const farmacia = estado.farmacia;

    const nome = Mascaras.formatarNome(
        farmacia.trade_name ||
        farmacia.legal_name ||
        "Farmácia"
    );

    elementos.nomeCabecalhoFarmacia.textContent = nome;
    elementos.nomeBannerFarmacia.textContent = nome;
    elementos.tituloPainel.textContent = `Painel — ${nome}`;

    elementos.avatarFarmacia.textContent =
        nome.trim().charAt(0).toUpperCase() || "F";

    elementos.perfilNomeFantasia.textContent = nome;

    elementos.perfilRazaoSocial.textContent =
        Mascaras.formatarNome(farmacia.legal_name) ||
        "Razão social não informada";

    elementos.perfilCnpj.textContent =
        Mascaras.formatarCNPJ(farmacia.cnpj) ||
        "Não informado";

    elementos.perfilResponsavel.textContent =
        Mascaras.formatarNome(farmacia.responsible_name) ||
        "Não informado";

    elementos.perfilEmail.textContent =
        farmacia.commercial_email || "Não informado";

    elementos.perfilTelefone.textContent =
        Mascaras.formatarTelefone(farmacia.phone) ||
        "Não informado";

    elementos.perfilWhatsapp.textContent =
        Mascaras.formatarWhatsApp(farmacia.whatsapp) ||
        "Não informado";

    elementos.perfilEndereco.textContent =
        Mascaras.formatarNome(farmacia.address) ||
        "Não informado";

    elementos.perfilBairro.textContent =
        Mascaras.formatarNome(farmacia.neighborhood) ||
        "Não informado";

    elementos.perfilCidade.textContent =
        montarCidadeEstado(
            Mascaras.formatarNome(farmacia.city),
            farmacia.state
        );

    elementos.perfilCep.textContent =
        Mascaras.formatarCEP(farmacia.postal_code) ||
        "Não informado";

    elementos.perfilDataCadastro.textContent =
        formatarData(farmacia.created_at);

    preencherStatusPerfil(farmacia.status);
    preencherLogoFarmacia(farmacia.logo_url);

}

function preencherStatusPerfil(status) {
    const nomesStatus = {
        pending: "Em análise",
        approved: "Aprovada",
        rejected: "Rejeitada",
        suspended: "Suspensa",
        archived: "Arquivada"
    };

    elementos.perfilStatus.textContent =
        nomesStatus[status] || "Status desconhecido";

    elementos.perfilStatus.className =
        `selo-status ${status || "pending"}`;
}

function preencherLogoFarmacia(logoUrl) {
    if (!logoUrl) {
        elementos.logoFarmacia.textContent = "🏥";
        return;
    }

    elementos.logoFarmacia.innerHTML = `
        <img
            src="${escaparAtributo(logoUrl)}"
            alt="Logo da farmácia"
            loading="lazy"
            onerror="
                this.parentElement.textContent = '🏥';
            "
        >
    `;
}


/* =========================================================
   CATEGORIAS
========================================================= */

async function carregarCategorias() {
    const { data, error } = await supabaseClient
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

    if (error) {
        console.warn(
            "Não foi possível carregar categorias:",
            error
        );

        estado.categorias = [];
        preencherSelectCategorias();
        return;
    }

    estado.categorias = data || [];
    preencherSelectCategorias();
}

function preencherSelectCategorias() {
    elementos.categoriaMedicamento.innerHTML = `
        <option value="">Sem categoria</option>
    `;

    estado.categorias.forEach((categoria) => {
        const option = document.createElement("option");

        option.value = categoria.id;
        option.textContent = categoria.name;

        elementos.categoriaMedicamento.appendChild(option);
    });
}


/* =========================================================
   MEDICAMENTOS
========================================================= */

async function carregarMedicamentos() {
    mostrarCarregamentoListas();

    const { data, error } = await supabaseClient
        .from("medicines")
        .select(`
            *,
            category:categories (
                id,
                name
            )
        `)
        .eq("pharmacy_id", estado.farmacia.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);

        renderizarErroNasListas(
            "Não foi possível carregar os medicamentos."
        );

        return;
    }

    estado.medicamentos = data || [];

    atualizarContadores();
    renderizarMedicamentosRecentes();
    renderizarListaMedicamentos();
}

function mostrarCarregamentoListas() {
    const carregamento = `
        <div class="estado-lista">
            <div class="mini-spinner"></div>
            <strong>Carregando medicamentos...</strong>
        </div>
    `;

    elementos.listaMedicamentos.innerHTML = carregamento;
    elementos.listaMedicamentosRecentes.innerHTML = carregamento;
}

function renderizarErroNasListas(mensagem) {
    const html = `
        <div class="estado-lista">
            <span class="icone-vazio">⚠️</span>
            <strong>Algo deu errado</strong>
            <p>${escaparHtml(mensagem)}</p>
        </div>
    `;

    elementos.listaMedicamentos.innerHTML = html;
    elementos.listaMedicamentosRecentes.innerHTML = html;
}

function atualizarContadores() {
    const medicamentos = estado.medicamentos;

    const ativos = medicamentos.filter(
        (medicamento) => medicamento.active === true
    ).length;

    const comEstoque = medicamentos.filter(
        (medicamento) => Number(medicamento.quantity) > 0
    ).length;

    const semEstoque = medicamentos.filter(
        (medicamento) => Number(medicamento.quantity) <= 0
    ).length;

    elementos.contadorMedicamentos.textContent =
        medicamentos.length;

    elementos.contadorAtivos.textContent = ativos;
    elementos.contadorComEstoque.textContent = comEstoque;
    elementos.contadorSemEstoque.textContent = semEstoque;
}

function renderizarMedicamentosRecentes() {
    const recentes = estado.medicamentos.slice(0, 4);

    if (!recentes.length) {
        elementos.listaMedicamentosRecentes.innerHTML = `
            <div class="estado-lista">
                <span class="icone-vazio">💊</span>
                <strong>Nenhum medicamento cadastrado</strong>
                <p>
                    Cadastre o primeiro medicamento para começar
                    a divulgar os preços da sua farmácia.
                </p>
            </div>
        `;

        return;
    }

    elementos.listaMedicamentosRecentes.innerHTML =
        recentes.map(criarCartaoMedicamento).join("");
}

function renderizarListaMedicamentos() {
    const termo = normalizarTexto(
        elementos.buscaMedicamento.value
    );

    const filtro = elementos.filtroMedicamentos.value;

    const medicamentosFiltrados = estado.medicamentos.filter(
        (medicamento) => {
            const textoPesquisavel = normalizarTexto([
                medicamento.name,
                medicamento.active_ingredient,
                medicamento.manufacturer,
                medicamento.package_description,
                medicamento.category?.name
            ].filter(Boolean).join(" "));

            const correspondeBusca =
                !termo || textoPesquisavel.includes(termo);

            const correspondeFiltro =
                verificarFiltro(medicamento, filtro);

            return correspondeBusca && correspondeFiltro;
        }
    );

    if (!medicamentosFiltrados.length) {
        elementos.listaMedicamentos.innerHTML = `
            <div class="estado-lista">
                <span class="icone-vazio">🔎</span>
                <strong>Nenhum medicamento encontrado</strong>
                <p>
                    Tente alterar o termo pesquisado ou escolher
                    outro filtro.
                </p>
            </div>
        `;

        return;
    }

    elementos.listaMedicamentos.innerHTML =
        medicamentosFiltrados
            .map(criarCartaoMedicamento)
            .join("");
}

function verificarFiltro(medicamento, filtro) {
    const quantidade = Number(medicamento.quantity) || 0;
    const preco = Number(medicamento.price);
    const precoPromocional = Number(
        medicamento.promotional_price
    );

    const possuiPromocao =
        medicamento.promotional_price !== null &&
        medicamento.promotional_price !== "" &&
        Number.isFinite(precoPromocional) &&
        precoPromocional < preco;

    const filtros = {
        all: true,
        active: medicamento.active === true,
        inactive: medicamento.active !== true,
        in_stock: quantidade > 0,
        out_of_stock: quantidade <= 0,
        promotion: possuiPromocao
    };

    return filtros[filtro] ?? true;
}

function criarCartaoMedicamento(medicamento) {
    const quantidade = Number(medicamento.quantity) || 0;

    const ativo = medicamento.active === true;
    const exigeReceita =
        medicamento.requires_prescription === true;

    const preco = Number(medicamento.price) || 0;

    const precoPromocional =
        medicamento.promotional_price !== null
            ? Number(medicamento.promotional_price)
            : null;

    const possuiPromocao =
        Number.isFinite(precoPromocional) &&
        precoPromocional >= 0 &&
        precoPromocional < preco;

    const dosagem = montarDosagem(
        medicamento.dosage,
        medicamento.dosage_unit
    );

    const imagem = medicamento.image_url
        ? `
            <img
                src="${escaparAtributo(medicamento.image_url)}"
                alt="${escaparAtributo(medicamento.name)}"
                loading="lazy"
                onerror="
                    this.parentElement.innerHTML = '💊';
                "
            >
        `
        : "💊";

    const categoria =
        medicamento.category?.name ||
        encontrarNomeCategoria(medicamento.category_id);

    return `
        <article
            class="cartao-medicamento"
            data-medicamento-id="${medicamento.id}"
        >
            <div class="imagem-medicamento">
                ${imagem}
            </div>

            <div class="informacoes-medicamento">

                <div class="topo-medicamento">
                    <div>
                        <h3 class="nome-medicamento">
                            ${escaparHtml(medicamento.name)}
                        </h3>

                        <div class="detalhes-medicamento">

                            ${medicamento.active_ingredient
            ? `
                                        <span>
                                            <strong>Princípio ativo:</strong>
                                            ${escaparHtml(
                medicamento.active_ingredient
            )}
                                        </span>
                                    `
            : ""
        }

                            ${dosagem
            ? `
                                        <span>
                                            <strong>Dosagem:</strong>
                                            ${escaparHtml(dosagem)}
                                        </span>
                                    `
            : ""
        }

                            ${medicamento.manufacturer
            ? `
                                        <span>
                                            <strong>Fabricante:</strong>
                                            ${escaparHtml(
                medicamento.manufacturer
            )}
                                        </span>
                                    `
            : ""
        }

                            ${categoria
            ? `
                                        <span>
                                            <strong>Categoria:</strong>
                                            ${escaparHtml(categoria)}
                                        </span>
                                    `
            : ""
        }

                        </div>
                    </div>
                </div>


                <div class="etiquetas-medicamento">

                    <span class="etiqueta-medicamento ${ativo ? "ativo" : "inativo"
        }">
                        ${ativo ? "Ativo" : "Inativo"}
                    </span>

                    <span class="etiqueta-medicamento ${quantidade > 0 ? "estoque" : "sem-estoque"
        }">
                        ${quantidade > 0
            ? `${quantidade} em estoque`
            : "Sem estoque"
        }
                    </span>

                    ${exigeReceita
            ? `
                                <span class="etiqueta-medicamento receita">
                                    Exige receita
                                </span>
                            `
            : ""
        }

                    ${possuiPromocao
            ? `
                                <span class="etiqueta-medicamento promocao">
                                    Em promoção
                                </span>
                            `
            : ""
        }

                </div>


                <div class="preco-medicamento">

                    ${possuiPromocao
            ? `
                                <span class="preco-atual">
                                    ${formatarMoeda(precoPromocional)}
                                </span>

                                <span class="preco-original">
                                    ${formatarMoeda(preco)}
                                </span>
                            `
            : `
                                <span class="preco-atual">
                                    ${formatarMoeda(preco)}
                                </span>
                            `
        }

                </div>

            </div>


            <div class="acoes-medicamento">

                <button
                    type="button"
                    class="botao-editar"
                    data-acao="editar"
                    data-id="${medicamento.id}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="botao-alternar ${ativo ? "inativar" : ""
        }"
                    data-acao="alternar"
                    data-id="${medicamento.id}"
                >
                    ${ativo ? "Desativar" : "Ativar"}
                </button>

                <button
                    type="button"
                    class="botao-remover"
                    data-acao="excluir"
                    data-id="${medicamento.id}"
                >
                    Excluir
                </button>

            </div>
        </article>
    `;
}


/* =========================================================
   CADASTRO E EDIÇÃO
========================================================= */

function abrirModalNovoMedicamento() {
    if (estado.farmacia.status !== "approved") {
        mostrarNotificacao(
            "Sua farmácia precisa estar aprovada.",
            "erro"
        );

        return;
    }

    limparFormularioMedicamento();

    elementos.tituloModalMedicamento.textContent =
        "Novo medicamento";

    abrirModal(elementos.modalMedicamento);

    setTimeout(() => {
        elementos.nomeMedicamento.focus();
    }, 100);
}

function abrirModalEditarMedicamento(id) {
    const medicamento = encontrarMedicamento(id);

    if (!medicamento) {
        mostrarNotificacao(
            "Medicamento não encontrado.",
            "erro"
        );

        return;
    }

    limparFormularioMedicamento();

    elementos.tituloModalMedicamento.textContent =
        "Editar medicamento";

    elementos.medicamentoId.value = medicamento.id;
    elementos.nomeMedicamento.value = medicamento.name || "";
    elementos.principioAtivo.value =
        medicamento.active_ingredient || "";

    elementos.fabricante.value =
        medicamento.manufacturer || "";

    elementos.dosagem.value =
        medicamento.dosage ?? "";

    elementos.unidadeDosagem.value =
        medicamento.dosage_unit || "";

    elementos.apresentacao.value =
        medicamento.package_description || "";

    elementos.codigoBarras.value =
        medicamento.barcode || "";

    elementos.categoriaMedicamento.value =
        medicamento.category_id || "";

    elementos.preco.value =
        formatarValorParaCampo(medicamento.price);

    elementos.precoPromocional.value =
        medicamento.promotional_price !== null
            ? formatarValorParaCampo(
                medicamento.promotional_price
            )
            : "";

    elementos.quantidade.value =
        medicamento.quantity ?? 0;

    elementos.imagemUrl.value =
        medicamento.image_url || "";

    elementos.descricao.value =
        medicamento.description || "";

    elementos.medicamentoAtivo.checked =
        medicamento.active === true;

    elementos.exigeReceita.checked =
        medicamento.requires_prescription === true;

    abrirModal(elementos.modalMedicamento);
}

async function salvarMedicamento(evento) {
    evento.preventDefault();

    limparErrosFormulario();

    const dados = obterDadosFormularioMedicamento();
    const valido = validarMedicamento(dados);

    if (!valido) {
        elementos.erroFormularioMedicamento.textContent =
            "Confira os campos destacados antes de continuar.";

        return;
    }

    const id = elementos.medicamentoId.value.trim();
    const estaEditando = Boolean(id);

    alterarEstadoBotao(
        elementos.botaoSalvarMedicamento,
        true,
        estaEditando ? "Salvando..." : "Cadastrando..."
    );

    try {
        const payload = {
            pharmacy_id: estado.farmacia.id,
            category_id: dados.category_id,
            name: dados.name,
            active_ingredient: dados.active_ingredient,
            dosage: dados.dosage,
            dosage_unit: dados.dosage_unit,
            manufacturer: dados.manufacturer,
            package_description: dados.package_description,
            price: dados.price,
            promotional_price: dados.promotional_price,
            quantity: dados.quantity,
            active: dados.active,
            barcode: dados.barcode,
            image_url: dados.image_url,
            requires_prescription: dados.requires_prescription,
            description: dados.description
        };

        let resultado;

        if (estaEditando) {
            resultado = await supabaseClient
                .from("medicines")
                .update(payload)
                .eq("id", id)
                .eq("pharmacy_id", estado.farmacia.id)
                .select()
                .single();
        } else {
            resultado = await supabaseClient
                .from("medicines")
                .insert(payload)
                .select()
                .single();
        }

        if (resultado.error) {
            throw resultado.error;
        }

        fecharModal(elementos.modalMedicamento);

        mostrarNotificacao(
            estaEditando
                ? "Medicamento atualizado com sucesso."
                : "Medicamento cadastrado com sucesso.",
            "sucesso"
        );

        await carregarMedicamentos();
    } catch (erro) {
        console.error("Erro ao salvar medicamento:", erro);

        elementos.erroFormularioMedicamento.textContent =
            traduzirErroSupabase(erro);
    } finally {
        alterarEstadoBotao(
            elementos.botaoSalvarMedicamento,
            false,
            "Salvar medicamento"
        );
    }
}

function obterDadosFormularioMedicamento() {
    return {
        name: elementos.nomeMedicamento.value.trim(),

        active_ingredient:
            valorOuNulo(elementos.principioAtivo.value),

        manufacturer:
            valorOuNulo(elementos.fabricante.value),

        dosage:
            numeroOuNulo(elementos.dosagem.value),

        dosage_unit:
            valorOuNulo(elementos.unidadeDosagem.value),

        package_description:
            valorOuNulo(elementos.apresentacao.value),

        barcode:
            valorOuNulo(elementos.codigoBarras.value),

        category_id:
            valorOuNulo(elementos.categoriaMedicamento.value),

        price:
            converterMoedaParaNumero(elementos.preco.value),

        promotional_price:
            elementos.precoPromocional.value.trim()
                ? converterMoedaParaNumero(
                    elementos.precoPromocional.value
                )
                : null,

        quantity:
            Number.parseInt(elementos.quantidade.value, 10),

        image_url:
            valorOuNulo(elementos.imagemUrl.value),

        description:
            valorOuNulo(elementos.descricao.value),

        active:
            elementos.medicamentoAtivo.checked,

        requires_prescription:
            elementos.exigeReceita.checked
    };
}

function validarMedicamento(dados) {
    let valido = true;

    if (!dados.name || dados.name.length < 2) {
        definirErroCampo(
            "nome-medicamento",
            "Informe o nome do medicamento."
        );

        valido = false;
    }

    if (
        !Number.isFinite(dados.price) ||
        dados.price < 0
    ) {
        definirErroCampo(
            "preco",
            "Informe um preço válido."
        );

        valido = false;
    }

    if (
        dados.promotional_price !== null &&
        (
            !Number.isFinite(dados.promotional_price) ||
            dados.promotional_price < 0
        )
    ) {
        definirErroCampo(
            "preco-promocional",
            "Informe um preço promocional válido."
        );

        valido = false;
    }

    if (
        dados.promotional_price !== null &&
        Number.isFinite(dados.price) &&
        dados.promotional_price > dados.price
    ) {
        definirErroCampo(
            "preco-promocional",
            "O preço promocional não pode ser maior que o preço normal."
        );

        valido = false;
    }

    if (
        !Number.isInteger(dados.quantity) ||
        dados.quantity < 0
    ) {
        definirErroCampo(
            "quantidade",
            "Informe uma quantidade válida."
        );

        valido = false;
    }

    return valido;
}


/* =========================================================
   ATIVAR E DESATIVAR
========================================================= */

async function alternarStatusMedicamento(id, botao) {
    const medicamento = encontrarMedicamento(id);

    if (!medicamento) {
        mostrarNotificacao(
            "Medicamento não encontrado.",
            "erro"
        );

        return;
    }

    botao.disabled = true;

    const novoStatus = !medicamento.active;

    try {
        const { error } = await supabaseClient
            .from("medicines")
            .update({
                active: novoStatus
            })
            .eq("id", medicamento.id)
            .eq("pharmacy_id", estado.farmacia.id);

        if (error) {
            throw error;
        }

        mostrarNotificacao(
            novoStatus
                ? "Medicamento ativado."
                : "Medicamento desativado.",
            "sucesso"
        );

        await carregarMedicamentos();
    } catch (erro) {
        console.error("Erro ao alterar status:", erro);

        mostrarNotificacao(
            traduzirErroSupabase(erro),
            "erro"
        );
    } finally {
        botao.disabled = false;
    }
}


/* =========================================================
   EXCLUSÃO
========================================================= */

function abrirModalExclusao(id) {
    const medicamento = encontrarMedicamento(id);

    if (!medicamento) {
        mostrarNotificacao(
            "Medicamento não encontrado.",
            "erro"
        );

        return;
    }

    estado.medicamentoEmExclusao = medicamento;

    elementos.nomeMedicamentoExclusao.textContent =
        medicamento.name;

    abrirModal(elementos.modalExclusao);
}

async function confirmarExclusao() {
    const medicamento = estado.medicamentoEmExclusao;

    if (!medicamento) {
        fecharModal(elementos.modalExclusao);
        return;
    }

    alterarEstadoBotao(
        elementos.botaoConfirmarExclusao,
        true,
        "Excluindo..."
    );

    try {
        const { error } = await supabaseClient
            .from("medicines")
            .delete()
            .eq("id", medicamento.id)
            .eq("pharmacy_id", estado.farmacia.id);

        if (error) {
            throw error;
        }

        fecharModal(elementos.modalExclusao);

        mostrarNotificacao(
            "Medicamento excluído com sucesso.",
            "sucesso"
        );

        estado.medicamentoEmExclusao = null;

        await carregarMedicamentos();
    } catch (erro) {
        console.error("Erro ao excluir medicamento:", erro);

        mostrarNotificacao(
            traduzirErroSupabase(erro),
            "erro"
        );
    } finally {
        alterarEstadoBotao(
            elementos.botaoConfirmarExclusao,
            false,
            "Excluir medicamento"
        );
    }
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function mudarSecao(nomeSecao) {
    const secao = document.getElementById(
        `secao-${nomeSecao}`
    );

    if (!secao) {
        return;
    }

    document.querySelectorAll(".secao-painel").forEach(
        (elemento) => {
            elemento.classList.remove("ativa");
        }
    );

    document.querySelectorAll(".item-menu").forEach(
        (botao) => {
            botao.classList.toggle(
                "ativo",
                botao.dataset.secao === nomeSecao
            );
        }
    );

    secao.classList.add("ativa");
    estado.secaoAtual = nomeSecao;

    const titulos = {
        inicio: "Painel da farmácia",
        medicamentos: "Gerenciar medicamentos",
        farmacia: "Minha farmácia"
    };

    elementos.tituloPainel.textContent =
        titulos[nomeSecao] || "Painel da farmácia";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {
    document.querySelectorAll(".item-menu").forEach(
        (botao) => {
            botao.addEventListener("click", () => {
                mudarSecao(botao.dataset.secao);
            });
        }
    );

    document.querySelectorAll("[data-ir-para]").forEach(
        (botao) => {
            botao.addEventListener("click", () => {
                mudarSecao(botao.dataset.irPara);
            });
        }
    );

    elementos.botaoNovoMedicamento.addEventListener(
        "click",
        abrirModalNovoMedicamento
    );

    elementos.formularioMedicamento.addEventListener(
        "submit",
        salvarMedicamento
    );

    elementos.botaoConfirmarExclusao.addEventListener(
        "click",
        confirmarExclusao
    );

    elementos.buscaMedicamento.addEventListener(
        "input",
        renderizarListaMedicamentos
    );

    elementos.filtroMedicamentos.addEventListener(
        "change",
        renderizarListaMedicamentos
    );

    elementos.botaoAtualizarInicio.addEventListener(
        "click",
        carregarMedicamentos
    );

    elementos.botaoAtualizarMedicamentos.addEventListener(
        "click",
        carregarMedicamentos
    );

    elementos.botaoSair.addEventListener("click", sair);

    elementos.listaMedicamentos.addEventListener(
        "click",
        tratarAcaoMedicamento
    );

    elementos.listaMedicamentosRecentes.addEventListener(
        "click",
        tratarAcaoMedicamento
    );

    document.querySelectorAll(
        "[data-fechar-modal-medicamento]"
    ).forEach((elemento) => {
        elemento.addEventListener("click", () => {
            fecharModal(elementos.modalMedicamento);
        });
    });

    document.querySelectorAll(
        "[data-fechar-modal-exclusao]"
    ).forEach((elemento) => {
        elemento.addEventListener("click", () => {
            fecharModal(elementos.modalExclusao);
            estado.medicamentoEmExclusao = null;
        });
    });

    elementos.preco.addEventListener(
        "blur",
        formatarCampoMoeda
    );

    elementos.precoPromocional.addEventListener(
        "blur",
        formatarCampoMoeda
    );

    document.addEventListener("keydown", (evento) => {
        if (evento.key !== "Escape") {
            return;
        }

        fecharModal(elementos.modalMedicamento);
        fecharModal(elementos.modalExclusao);
    });
}

function tratarAcaoMedicamento(evento) {
    const botao = evento.target.closest("[data-acao]");

    if (!botao) {
        return;
    }

    const id = botao.dataset.id;
    const acao = botao.dataset.acao;

    if (acao === "editar") {
        abrirModalEditarMedicamento(id);
    }

    if (acao === "alternar") {
        alternarStatusMedicamento(id, botao);
    }

    if (acao === "excluir") {
        abrirModalExclusao(id);
    }
}


/* =========================================================
   LOGOUT
========================================================= */

async function sair() {
    elementos.botaoSair.disabled = true;

    try {
        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        window.location.href = "../login.html";
    } catch (erro) {
        console.error("Erro ao sair:", erro);

        mostrarNotificacao(
            "Não foi possível encerrar a sessão.",
            "erro"
        );

        elementos.botaoSair.disabled = false;
    }
}


/* =========================================================
   MODAIS
========================================================= */

function abrirModal(modal) {
    modal.classList.add("aberto");
    document.body.classList.add("modal-aberto");
}

function fecharModal(modal) {
    modal.classList.remove("aberto");

    const existeModalAberto =
        document.querySelector(".modal.aberto");

    if (!existeModalAberto) {
        document.body.classList.remove("modal-aberto");
    }
}


/* =========================================================
   FORMULÁRIO
========================================================= */

function limparFormularioMedicamento() {
    elementos.formularioMedicamento.reset();

    elementos.medicamentoId.value = "";
    elementos.quantidade.value = "0";
    elementos.medicamentoAtivo.checked = true;
    elementos.exigeReceita.checked = false;

    limparErrosFormulario();
}

function limparErrosFormulario() {
    elementos.erroFormularioMedicamento.textContent = "";

    document.querySelectorAll(".erro-campo").forEach(
        (elemento) => {
            elemento.textContent = "";
        }
    );

    document.querySelectorAll(".invalido").forEach(
        (elemento) => {
            elemento.classList.remove("invalido");
        }
    );
}

function definirErroCampo(idCampo, mensagem) {
    const campo = document.getElementById(idCampo);

    const elementoErro = document.querySelector(
        `[data-erro="${idCampo}"]`
    );

    campo?.classList.add("invalido");

    if (elementoErro) {
        elementoErro.textContent = mensagem;
    }
}


/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function mostrarNotificacao(mensagem, tipo = "") {
    clearTimeout(estado.notificacaoTimeout);

    elementos.notificacao.textContent = mensagem;
    elementos.notificacao.className =
        `notificacao visivel ${tipo}`.trim();

    estado.notificacaoTimeout = setTimeout(() => {
        elementos.notificacao.classList.remove("visivel");
    }, 3500);
}


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function encontrarMedicamento(id) {
    return estado.medicamentos.find(
        (medicamento) => String(medicamento.id) === String(id)
    );
}

function encontrarNomeCategoria(id) {
    const categoria = estado.categorias.find(
        (item) => String(item.id) === String(id)
    );

    return categoria?.name || "";
}

function montarDosagem(dosagem, unidade) {
    if (
        dosagem === null ||
        dosagem === undefined ||
        dosagem === ""
    ) {
        return unidade || "";
    }

    return `${dosagem}${unidade ? ` ${unidade}` : ""}`;
}

function montarCidadeEstado(cidade, estadoUf) {
    if (cidade && estadoUf) {
        return `${cidade} - ${estadoUf}`;
    }

    return cidade || estadoUf || "Não informada";
}

function formatarData(data) {
    if (!data) {
        return "Não informada";
    }

    const objetoData = new Date(data);

    if (Number.isNaN(objetoData.getTime())) {
        return "Não informada";
    }

    return objetoData.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatarMoeda(valor) {
    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarValorParaCampo(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "";
    }

    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function converterMoedaParaNumero(valor) {
    const texto = String(valor || "")
        .trim()
        .replace(/\s/g, "")
        .replace(/R\$/gi, "");

    if (!texto) {
        return Number.NaN;
    }

    let normalizado;

    if (texto.includes(",")) {
        normalizado = texto
            .replace(/\./g, "")
            .replace(",", ".");
    } else {
        normalizado = texto;
    }

    return Number(normalizado);
}

function formatarCampoMoeda(evento) {
    const campo = evento.target;
    const numero = converterMoedaParaNumero(campo.value);

    if (Number.isFinite(numero)) {
        campo.value = formatarValorParaCampo(numero);
    }
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function valorOuNulo(valor) {
    const texto = String(valor || "").trim();
    return texto || null;
}

function numeroOuNulo(valor) {
    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : null;
}

function alterarEstadoBotao(botao, carregando, texto) {
    botao.disabled = carregando;
    botao.textContent = texto;
}

function ocultarTelaCarregamento() {
    elementos.telaCarregamento.classList.add("oculto");
}

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributo(valor) {
    return escaparHtml(valor);
}

function traduzirErroSupabase(erro) {
    const mensagem = String(
        erro?.message || erro || ""
    ).toLowerCase();

    if (mensagem.includes("row-level security")) {
        return "Você não tem permissão para realizar esta operação.";
    }

    if (
        mensagem.includes("duplicate") ||
        mensagem.includes("unique")
    ) {
        return "Já existe um registro com essas informações.";
    }

    if (
        mensagem.includes("promotional") &&
        mensagem.includes("check")
    ) {
        return "O preço promocional deve ser menor ou igual ao preço normal.";
    }

    if (
        mensagem.includes("quantity") &&
        mensagem.includes("check")
    ) {
        return "A quantidade em estoque não pode ser negativa.";
    }

    if (mensagem.includes("network")) {
        return "Verifique sua conexão com a internet.";
    }

    return erro?.message ||
        "Não foi possível concluir a operação.";
}