const VIEW_OFERTAS = "public_medicine_offers";

const IMAGEM_FARMACIA_PADRAO =
    "assets/logo-farmacia.png";

const campoMedicamento =
    document.getElementById("medicamento");

const botaoPesquisar =
    document.getElementById("btnPesquisar");

const botaoLimpar =
    document.getElementById("btnLimpar");

const resultadoBusca =
    document.getElementById("resultadoBusca");

const sugestoesMedicamentos =
    document.getElementById("sugestoesMedicamentos");

const menuToggle =
    document.getElementById("menuToggle");

const mobileNav =
    document.getElementById("mobileNav");

const partnerButton =
    document.getElementById("partnerButton");

const partnerDropdown =
    document.getElementById("partnerDropdown");

const anoAtual =
    document.getElementById("anoAtual");

let timerAutocomplete;
let pesquisando = false;
let versaoBusca = 0;
let versaoSugestoes = 0;
let ultimaBusca = null;


/* ========================================
   FUNÇÕES UTILITÁRIAS
======================================== */

function normalizarTexto(texto = "") {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


function escaparHtml(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatarPreco(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "R$ --";
    }

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function capitalizarLocalidade(texto = "") {
    return String(texto)
        .toLocaleLowerCase("pt-BR")
        .replace(
            /(^|\s|[-/])\p{L}/gu,
            (letra) =>
                letra.toLocaleUpperCase("pt-BR")
        );
}


function nomeMedicamento(oferta) {
    return [
        oferta.name,
        oferta.dosage,
        oferta.dosage_unit
    ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}


function precoEfetivo(oferta) {
    const precoNormal =
        Number(oferta.price);

    const precoPromocional =
        Number(oferta.promotional_price);

    const promocaoValida =
        Number.isFinite(precoPromocional) &&
        precoPromocional > 0 &&
        precoPromocional < precoNormal;

    return promocaoValida
        ? precoPromocional
        : precoNormal;
}


function emPromocao(oferta) {
    const precoNormal =
        Number(oferta.price);

    const precoPromocional =
        Number(oferta.promotional_price);

    return (
        Number.isFinite(precoPromocional) &&
        precoPromocional > 0 &&
        precoPromocional < precoNormal
    );
}


function nomeFarmacia(oferta) {
    return (
        oferta.trade_name ||
        oferta.legal_name ||
        "Farmácia participante"
    );
}


function localizacao(oferta) {
    const cidade =
        capitalizarLocalidade(
            oferta.city || ""
        );

    const bairro =
        capitalizarLocalidade(
            oferta.neighborhood || ""
        );

    const estado =
        String(oferta.state || "")
            .toUpperCase()
            .trim();

    const cidadeEstado = [
        cidade,
        estado
    ]
        .filter(Boolean)
        .join(" - ");

    return [
        oferta.address,
        bairro,
        cidadeEstado,
        typeof oferta.distance_km === "number" && Number.isFinite(oferta.distance_km)
            ? `${oferta.distance_km.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km em linha reta` : ""
    ]
        .filter(Boolean)
        .join(" • ");
}


function digitos(valor = "") {
    return String(valor)
        .replace(/\D/g, "");
}


function linkWhatsApp(oferta) {
    const numeroOriginal =
        digitos(
            oferta.whatsapp ||
            oferta.phone
        );

    if (!numeroOriginal) {
        return null;
    }

    const numero =
        numeroOriginal.startsWith("55")
            ? numeroOriginal
            : `55${numeroOriginal}`;

    const mensagem =
        encodeURIComponent(
            `Olá! Encontrei ${nomeMedicamento(
                oferta
            )} no BuscaMed por ${formatarPreco(
                precoEfetivo(oferta)
            )} e gostaria de confirmar o preço e a disponibilidade.`
        );

    return (
        `https://wa.me/${numero}` +
        `?text=${mensagem}`
    );
}


function validarSupabase() {
    if (
        typeof supabaseClient ===
        "undefined"
    ) {
        throw new Error(
            "Supabase não inicializado. " +
            "Verifique config.js e supabase.js."
        );
    }
}


function atualizarLimpar() {
    if (!botaoLimpar) {
        return;
    }

    botaoLimpar.style.display =
        campoMedicamento.value.trim()
            ? "grid"
            : "none";
}


function fecharSugestoes() {
    versaoSugestoes++;
    sugestoesMedicamentos.innerHTML = "";
    sugestoesMedicamentos.style.display =
        "none";
}


function mensagem(classe, html) {
    resultadoBusca.innerHTML = `
        <div class="${classe}">
            ${html}
        </div>
    `;
}


function estadoBusca(ativo) {
    pesquisando = ativo;
    botaoPesquisar.disabled = ativo;

    botaoPesquisar.innerHTML = ativo
        ? `
            <span class="spinner"></span>
            Buscando ofertas...
        `
        : `
            <span aria-hidden="true">🔍</span>
            Encontrar menor preço
        `;
}


/* ========================================
   MENU DA FARMÁCIA
======================================== */

partnerButton?.addEventListener(
    "click",
    (evento) => {
        evento.stopPropagation();

        const abrir =
            partnerButton.getAttribute(
                "aria-expanded"
            ) !== "true";

        partnerButton.setAttribute(
            "aria-expanded",
            String(abrir)
        );

        partnerDropdown.classList.toggle(
            "active",
            abrir
        );
    }
);


document.addEventListener(
    "click",
    (evento) => {
        if (
            !evento.target.closest(
                ".partner-access"
            )
        ) {
            partnerButton?.setAttribute(
                "aria-expanded",
                "false"
            );

            partnerDropdown?.classList.remove(
                "active"
            );
        }

        if (
            !evento.target.closest(
                ".campo-com-sugestoes"
            )
        ) {
            fecharSugestoes();
        }
    }
);


document.addEventListener(
    "keydown",
    (evento) => {
        if (evento.key !== "Escape") {
            return;
        }

        partnerButton?.setAttribute(
            "aria-expanded",
            "false"
        );

        partnerDropdown?.classList.remove(
            "active"
        );

        fecharSugestoes();
    }
);


/* ========================================
   MENU MOBILE
======================================== */

menuToggle?.addEventListener(
    "click",
    () => {
        const aberto =
            menuToggle.classList.toggle(
                "active"
            );

        mobileNav.classList.toggle(
            "active",
            aberto
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(aberto)
        );
    }
);


document
    .querySelectorAll(".mobile-nav a")
    .forEach((link) => {
        link.addEventListener(
            "click",
            () => {
                menuToggle?.classList.remove(
                    "active"
                );

                mobileNav?.classList.remove(
                    "active"
                );

                menuToggle?.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );
    });


/* ========================================
   AUTOCOMPLETE
======================================== */

async function buscarSugestoes() {
    const termo =
        normalizarTexto(
            campoMedicamento.value
        );

    atualizarLimpar();

    if (termo.length < 2) {
        fecharSugestoes();
        return;
    }

    try {
        validarSupabase();

        const parametros = BuscaRegiao.parametros();
        const versao = ++versaoSugestoes;
        const regiaoVersao = BuscaRegiao.versao;
        const { data: resposta, error } = await supabaseClient.rpc('buscamed_buscar_ofertas', {
            ...parametros, p_termo: termo, p_pagina: 0
        });
        if (error) throw error;
        if (versao !== versaoSugestoes || regiaoVersao !== BuscaRegiao.versao ||
            termo !== normalizarTexto(campoMedicamento.value)) return;
        const data = resposta?.offers || [];

        const medicamentosUnicos =
            new Map();

        (data || []).forEach(
            (item) => {
                const nomeCompleto =
                    nomeMedicamento(item);

                if (!nomeCompleto) {
                    return;
                }

                const chave =
                    normalizarTexto(
                        nomeCompleto
                    );

                if (
                    medicamentosUnicos.has(
                        chave
                    )
                ) {
                    return;
                }

                medicamentosUnicos.set(
                    chave,
                    {
                        nome: nomeCompleto,
                        termoBusca:
                            item.name ||
                            nomeCompleto,
                        principio:
                            item.active_ingredient ||
                            "",
                        fabricante:
                            item.manufacturer ||
                            ""
                    }
                );
            }
        );

        const lista =
            [
                ...medicamentosUnicos
                    .values()
            ]
                .slice(0, 8);

        if (!lista.length) {
            fecharSugestoes();
            return;
        }

        sugestoesMedicamentos.innerHTML =
            lista
                .map(
                    (item) => `
                        <button
                            type="button"
                            class="sugestao-medicamento"
                            data-medicamento="${escaparHtml(
                                item.nome
                            )}"
                            data-termo-busca="${escaparHtml(
                                item.termoBusca
                            )}"
                            role="option"
                        >
                            <span aria-hidden="true">
                                💊
                            </span>

                            <span>
                                <strong>
                                    ${escaparHtml(
                                        item.nome
                                    )}
                                </strong>

                                ${
                                    item.principio ||
                                    item.fabricante
                                        ? `
                                            <small>
                                                ${escaparHtml(
                                                    [
                                                        item.principio,
                                                        item.fabricante
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" • ")
                                                )}
                                            </small>
                                        `
                                        : ""
                                }
                            </span>
                        </button>
                    `
                )
                .join("");

        sugestoesMedicamentos.style.display =
            "block";

        sugestoesMedicamentos
            .querySelectorAll(
                ".sugestao-medicamento"
            )
            .forEach(
                (botao) => {
                    botao.addEventListener(
                        "click",
                        () => {
                            campoMedicamento.value =
                                botao.dataset
                                    .termoBusca;

                            fecharSugestoes();
                            atualizarLimpar();
                            pesquisarMedicamento();
                        }
                    );
                }
            );
    } catch (erro) {
        console.error(
            "Erro no autocomplete:",
            erro
        );

        fecharSugestoes();
    }
}


/* ========================================
   IMAGENS
======================================== */

function logoFarmacia(oferta) {
    const logo =
        oferta.logo_url ||
        IMAGEM_FARMACIA_PADRAO;

    return `
        <img
            src="${escaparHtml(logo)}"
            alt="Logo de ${escaparHtml(
                nomeFarmacia(oferta)
            )}"
            class="farmacia-logo"
            onerror="
                this.onerror=null;
                this.src='${IMAGEM_FARMACIA_PADRAO}';
            "
        >
    `;
}


function imagemMedicamento(oferta) {
    if (oferta.medicine_image_url || oferta.image_url) {
        return `
            <div class="medicamento-imagem-box">
                <img
                    src="${escaparHtml(
                        oferta.medicine_image_url || oferta.image_url
                    )}"
                    alt="Imagem de ${escaparHtml(
                        nomeMedicamento(oferta)
                    )}"
                    class="medicamento-imagem"
                    onerror="
                        this.parentElement.innerHTML =
                        '<div class=&quot;medicamento-imagem-placeholder&quot;><div><span>💊</span><small>Imagem indisponível</small></div></div>';
                    "
                >
            </div>
        `;
    }

    return `
        <div class="medicamento-imagem-box">
            <div class="medicamento-imagem-placeholder">
                <div>
                    <span aria-hidden="true">
                        💊
                    </span>

                    <small>
                        Imagem do medicamento
                    </small>
                </div>
            </div>
        </div>
    `;
}


/* ========================================
   PREÇO
======================================== */

function blocoPreco(oferta) {
    return `
        ${
            emPromocao(oferta)
                ? `
                    <span class="preco-anterior">
                        De
                        ${formatarPreco(
                            oferta.price
                        )}
                    </span>
                `
                : `
                    <span class="preco-anterior">
                        Melhor preço
                    </span>
                `
        }

        <strong class="preco-principal">
            ${formatarPreco(
                precoEfetivo(oferta)
            )}
        </strong>

        ${
            emPromocao(oferta)
                ? `
                    <span class="promocao-badge">
                        EM PROMOÇÃO
                    </span>
                `
                : ""
        }
    `;
}


/* ========================================
   RENDERIZAÇÃO
======================================== */

function renderizar(ofertas, termo, total = ofertas.length, resumo = "", rolar = true) {
    const melhorOferta =
        ofertas[0];

    const maiorPreco =
        Math.max(
            ...ofertas.map(
                precoEfetivo
            )
        );

    const economia =
        maiorPreco -
        precoEfetivo(melhorOferta);

    const whatsapp =
        linkWhatsApp(melhorOferta);

    const detalhes = [
        melhorOferta.manufacturer,
        melhorOferta.package_description,
        melhorOferta.active_ingredient
    ].filter(Boolean);

    resultadoBusca.innerHTML = `
        <section class="resultado-card">

            <header class="resultado-cabecalho">
                <p class="resultado-regiao">${escaparHtml(resumo)} • Mostrando ${ofertas.length} de ${total} ofertas, do menor para o maior preço.</p>

                <div class="resultado-meta">

                    <span class="resultado-selo">
                        🏆 Menor preço encontrado
                    </span>

                    <span class="resultado-contagem">
                        ${total}
                        ${
                            total === 1
                                ? "oferta encontrada"
                                : "ofertas encontradas"
                        }
                    </span>

                </div>

                <h2>
                    ${escaparHtml(
                        nomeMedicamento(
                            melhorOferta
                        ) || termo
                    )}
                </h2>

                ${
                    melhorOferta.active_ingredient
                        ? `
                            <p class="resultado-subtitulo">
                                Princípio ativo:
                                <strong>
                                    ${escaparHtml(
                                        melhorOferta
                                            .active_ingredient
                                    )}
                                </strong>
                            </p>
                        `
                        : ""
                }

            </header>

            <div class="melhor-oferta">

                <div class="melhor-oferta-grid">

                    ${imagemMedicamento(
                        melhorOferta
                    )}

                    <div class="oferta-conteudo">

                        <div class="oferta-topo">

                            <div class="farmacia-resumo">

                                ${logoFarmacia(
                                    melhorOferta
                                )}

                                <div>

                                    <small>
                                        Melhor oferta disponível
                                    </small>

                                    <h3>
                                        ${escaparHtml(
                                            nomeFarmacia(
                                                melhorOferta
                                            )
                                        )}
                                    </h3>

                                    ${
                                        localizacao(
                                            melhorOferta
                                        )
                                            ? `
                                                <p class="localizacao">
                                                    📍
                                                    ${escaparHtml(
                                                        localizacao(
                                                            melhorOferta
                                                        )
                                                    )}
                                                </p>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>

                            <div class="preco-bloco">
                                ${blocoPreco(
                                    melhorOferta
                                )}
                            </div>

                        </div>

                        ${
                            detalhes.length
                                ? `
                                    <div class="detalhes-medicamento">

                                        ${detalhes
                                            .map(
                                                (detalhe) => `
                                                    <span>
                                                        ${escaparHtml(
                                                            detalhe
                                                        )}
                                                    </span>
                                                `
                                            )
                                            .join("")}

                                    </div>
                                `
                                : ""
                        }

                        <div class="oferta-acoes">

                            ${
                                whatsapp
                                    ? `
                                        <a
                                            href="${whatsapp}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="btn-whatsapp"
                                        >
                                            💬 Conversar no WhatsApp
                                        </a>
                                    `
                                    : ""
                            }

                            ${
                                melhorOferta.phone
                                    ? `
                                        <a
                                            href="tel:${digitos(
                                                melhorOferta.phone
                                            )}"
                                            class="btn-secundario"
                                        >
                                            ☎️ Ligar para a farmácia
                                        </a>
                                    `
                                    : ""
                            }

                        </div>

                        ${
                            economia > 0
                                ? `
                                    <p class="economia">

                                        💰 Você pode economizar até

                                        <strong>
                                            ${formatarPreco(
                                                economia
                                            )}
                                        </strong>

                                        escolhendo a melhor oferta.

                                    </p>
                                `
                                : ""
                        }

                    </div>

                </div>

            </div>

            ${
                ofertas.length > 1
                    ? `
                        <div class="outras-ofertas">

                            <h3>
                                Outras ofertas disponíveis
                            </h3>

                            ${ofertas
                                .slice(1)
                                .map(
                                    (oferta) => `
                                        <div class="oferta">

                                            <div class="oferta-info">

                                                <strong>
                                                    ${escaparHtml(
                                                        nomeFarmacia(
                                                            oferta
                                                        )
                                                    )}
                                                </strong>

                                                <small>
                                                    ${[
                                                        localizacao(
                                                            oferta
                                                        ),
                                                        oferta
                                                            .package_description
                                                    ]
                                                        .filter(
                                                            Boolean
                                                        )
                                                        .map(
                                                            escaparHtml
                                                        )
                                                        .join(
                                                            " • "
                                                        )}
                                                </small>

                                            </div>

                                            <div class="oferta-preco">

                                                ${
                                                    emPromocao(
                                                        oferta
                                                    )
                                                        ? `
                                                            <del>
                                                                ${formatarPreco(
                                                                    oferta.price
                                                                )}
                                                            </del>
                                                        `
                                                        : ""
                                                }

                                                <strong>
                                                    ${formatarPreco(
                                                        precoEfetivo(
                                                            oferta
                                                        )
                                                    )}
                                                </strong>

                                            </div>

                                        </div>
                                    `
                                )
                                .join("")}

                        </div>
                    `
                    : ""
            }

            ${ofertas.length < total ? '<button type="button" id="mais-ofertas" class="botao-mais-ofertas">Mostrar mais ofertas</button>' : ''}
            <p class="resultado-aviso">

                Preço e disponibilidade devem ser
                confirmados diretamente com a farmácia.

            </p>

        </section>
    `;

    document.getElementById("mais-ofertas")?.addEventListener("click", carregarMaisOfertas);
    if (rolar) resultadoBusca.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ========================================
   PESQUISA PRINCIPAL
======================================== */

async function pesquisarMedicamento() {
    if (pesquisando) return;
    const termoOriginal = campoMedicamento.value.trim();
    const termo = normalizarTexto(termoOriginal);
    fecharSugestoes();
    if (termo.length < 2) {
        mensagem('mensagem-erro', '<strong>Digite pelo menos duas letras do medicamento, princípio ativo ou fabricante.</strong>');
        campoMedicamento.focus();
        return;
    }
    let parametros;
    try { parametros = BuscaRegiao.parametros(); }
    catch (erro) { mensagem('mensagem-erro', escaparHtml(erro.message)); return; }
    const versao = ++versaoBusca;
    const resumo = BuscaRegiao.resumo();
    ultimaBusca = null;
    estadoBusca(true);
    mensagem('mensagem-carregando', '<span class="spinner"></span> Consultando os menores preços na região selecionada…');
    try {
        validarSupabase();
        const { data, error } = await supabaseClient.rpc('buscamed_buscar_ofertas', {
            ...parametros, p_termo: termo, p_pagina: 0
        });
        if (versao !== versaoBusca) return;
        if (error) throw error;
        const ofertas = data?.offers || [];
        if (!ofertas.length) {
            mensagem('mensagem-vazia', `<strong>Nenhuma oferta encontrada ${escaparHtml(resumo.toLocaleLowerCase('pt-BR'))}.</strong><br>Confira o medicamento, escolha outra cidade ou amplie o raio. Na busca por localização, só aparecem farmácias com coordenadas cadastradas.`);
            return;
        }
        ultimaBusca = { parametros, termo, termoOriginal, ofertas, total: Number(data.total), pagina: 0, resumo };
        renderizar(ofertas, termoOriginal, ultimaBusca.total, resumo);
    } catch (erro) {
        if (versao !== versaoBusca) return;
        console.error('Erro na pesquisa:', erro);
        mensagem('mensagem-erro', '<strong>Não foi possível consultar os preços agora.</strong><br>Verifique a conexão e tente novamente.');
    } finally { estadoBusca(false); }
}

async function carregarMaisOfertas() {
    if (pesquisando || !ultimaBusca) return;
    const busca = ultimaBusca;
    const versao = versaoBusca;
    const botao = document.getElementById('mais-ofertas');
    estadoBusca(true);
    if (botao) { botao.disabled = true; botao.textContent = 'Carregando…'; }
    try {
        const { data, error } = await supabaseClient.rpc('buscamed_buscar_ofertas', {
            ...busca.parametros, p_termo: busca.termo, p_pagina: busca.pagina + 1
        });
        if (versao !== versaoBusca) return;
        if (error) throw error;
        busca.pagina++;
        const ids = new Set(busca.ofertas.map(o => o.medicine_id));
        busca.ofertas.push(...(data.offers || []).filter(o => !ids.has(o.medicine_id)));
        busca.ofertas.sort((a, b) => precoEfetivo(a) - precoEfetivo(b) || String(a.medicine_id).localeCompare(String(b.medicine_id)));
        // O estoque pode mudar entre páginas. Evita um botão sem fim.
        busca.total = data.offers?.length ? Number(data.total) : busca.ofertas.length;
        renderizar(busca.ofertas, busca.termoOriginal, busca.total, busca.resumo, false);
    } catch (erro) {
        if (versao === versaoBusca && botao) {
            botao.disabled = false;
            botao.textContent = 'Falha ao carregar. Tentar novamente';
        }
    } finally { estadoBusca(false); }
}

/* ========================================
   EVENTOS DA PESQUISA
======================================== */

campoMedicamento?.addEventListener(
    "input",
    () => {
        versaoSugestoes++;
        clearTimeout(
            timerAutocomplete
        );

        atualizarLimpar();

        timerAutocomplete =
            setTimeout(
                buscarSugestoes,
                320
            );
    }
);


botaoPesquisar?.addEventListener(
    "click",
    pesquisarMedicamento
);


botaoLimpar?.addEventListener(
    "click",
    () => {
        versaoBusca++;
        versaoSugestoes++;
        ultimaBusca = null;
        campoMedicamento.value = "";
        resultadoBusca.innerHTML = "";

        fecharSugestoes();
        atualizarLimpar();

        campoMedicamento.focus();
    }
);


campoMedicamento?.addEventListener(
    "keydown",
    (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            pesquisarMedicamento();
        }
    }
);


/* ========================================
   INICIALIZAÇÃO
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        atualizarLimpar();
        fecharSugestoes();

        if (anoAtual) {
            anoAtual.textContent =
                new Date()
                    .getFullYear();
        }
    }
);
// Mudar a região invalida resultados e respostas ainda em trânsito.
document.addEventListener('buscamed:regiao-alterada', () => {
    versaoBusca++;
    versaoSugestoes++;
    ultimaBusca = null;
    fecharSugestoes();
    resultadoBusca.innerHTML = '';
});
