const VIEW_OFERTAS = "public_medicine_offers";

const campoMedicamento = document.getElementById("medicamento");
const botaoPesquisar = document.getElementById("btnPesquisar");
const botaoLimpar = document.getElementById("btnLimpar");
const resultadoBusca = document.getElementById("resultadoBusca");
const sugestoesMedicamentos = document.getElementById(
    "sugestoesMedicamentos"
);

const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

const partnerButton = document.getElementById("partnerButton");
const partnerDropdown = document.getElementById("partnerDropdown");

let timerAutocomplete;
let pesquisando = false;


// =====================================
// FUNÇÕES UTILITÁRIAS
// =====================================

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

    return Number.isFinite(numero)
        ? numero.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
          })
        : "R$ --";
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
    const precoNormal = Number(oferta.price);
    const precoPromocional = Number(
        oferta.promotional_price
    );

    const promocaoValida =
        Number.isFinite(precoPromocional) &&
        precoPromocional > 0 &&
        precoPromocional < precoNormal;

    return promocaoValida
        ? precoPromocional
        : precoNormal;
}


function emPromocao(oferta) {
    const precoNormal = Number(oferta.price);
    const precoPromocional = Number(
        oferta.promotional_price
    );

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
    return [
        oferta.neighborhood,
        oferta.city
    ]
        .filter(Boolean)
        .join(" • ");
}


function digitos(valor = "") {
    return String(valor).replace(/\D/g, "");
}


function linkWhatsApp(oferta) {
    const numeroOriginal = digitos(
        oferta.whatsapp || oferta.phone
    );

    if (!numeroOriginal) {
        return null;
    }

    const numero = numeroOriginal.startsWith("55")
        ? numeroOriginal
        : `55${numeroOriginal}`;

    const mensagem = encodeURIComponent(
        `Olá! Encontrei ${nomeMedicamento(
            oferta
        )} no BuscaMed e gostaria de confirmar preço e disponibilidade.`
    );

    return `https://wa.me/${numero}?text=${mensagem}`;
}


function validarSupabase() {
    if (typeof supabaseClient === "undefined") {
        throw new Error(
            "Supabase não inicializado. Verifique config.js e supabase.js."
        );
    }
}


function atualizarLimpar() {
    botaoLimpar.style.display =
        campoMedicamento.value.trim()
            ? "block"
            : "none";
}


function fecharSugestoes() {
    sugestoesMedicamentos.innerHTML = "";
    sugestoesMedicamentos.style.display = "none";
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
            Buscando...
        `
        : `
            🔍 Encontrar menor preço
        `;
}


// =====================================
// DROPDOWN DA FARMÁCIA
// =====================================

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
        if (evento.key === "Escape") {
            partnerButton?.setAttribute(
                "aria-expanded",
                "false"
            );

            partnerDropdown?.classList.remove(
                "active"
            );

            fecharSugestoes();
        }
    }
);


// =====================================
// MENU MOBILE
// =====================================

menuToggle.addEventListener(
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
                menuToggle.classList.remove(
                    "active"
                );

                mobileNav.classList.remove(
                    "active"
                );

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );
    });


// =====================================
// AUTOCOMPLETE
// =====================================

async function buscarSugestoes() {
    const termo = normalizarTexto(
        campoMedicamento.value
    );

    atualizarLimpar();

    if (termo.length < 2) {
        fecharSugestoes();
        return;
    }

    try {
        validarSupabase();

        const termoSeguro = termo.replaceAll(
            ",",
            " "
        );

        const { data, error } =
            await supabaseClient
                .from(VIEW_OFERTAS)
                .select(
                    `
                    name,
                    dosage,
                    dosage_unit,
                    active_ingredient
                    `
                )
                .or(
                    `name.ilike.%${termoSeguro}%,active_ingredient.ilike.%${termoSeguro}%`
                )
                .limit(30);

        if (error) {
            throw error;
        }

        const medicamentosUnicos =
            new Map();

        (data || []).forEach((item) => {
            const nomeCompleto =
                nomeMedicamento(item);

            if (!nomeCompleto) {
                return;
            }

            medicamentosUnicos.set(
                normalizarTexto(nomeCompleto),
                {
                    nome: nomeCompleto,
                    principio:
                        item.active_ingredient ||
                        ""
                }
            );
        });

        const lista =
            [...medicamentosUnicos.values()]
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
                                    item.principio
                                        ? `
                                            <small>
                                                ${escaparHtml(
                                                    item.principio
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
            .querySelectorAll("button")
            .forEach((botao) => {
                botao.addEventListener(
                    "click",
                    () => {
                        campoMedicamento.value =
                            botao.dataset.medicamento;

                        fecharSugestoes();
                        atualizarLimpar();
                        pesquisarMedicamento();
                    }
                );
            });
    } catch (erro) {
        console.error(
            "Erro no autocomplete:",
            erro
        );

        fecharSugestoes();
    }
}
// =====================================
// RENDERIZAÇÃO DAS OFERTAS
// =====================================

function logoFarmacia(oferta) {
    if (oferta.logo_url) {
        return `
            <img
                src="${escaparHtml(
                    oferta.logo_url
                )}"
                alt="Logo de ${escaparHtml(
                    nomeFarmacia(oferta)
                )}"
                class="farmacia-logo"
            >
        `;
    }

    return `
        <div
            class="farmacia-logo-placeholder"
            aria-hidden="true"
        >
            🏪
        </div>
    `;
}


function blocoPreco(
    oferta,
    principal = true
) {
    return `
        ${
            emPromocao(oferta)
                ? `
                    <span class="preco-anterior">
                        ${formatarPreco(
                            oferta.price
                        )}
                    </span>
                `
                : ""
        }

        <strong class="${
            principal
                ? "preco-principal"
                : ""
        }">
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


function renderizar(ofertas, termo) {
    const melhorOferta = ofertas[0];

    const maiorPreco = Math.max(
        ...ofertas.map(precoEfetivo)
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

                <div class="resultado-meta">

                    <span class="resultado-selo">
                        🏆 Menor preço encontrado
                    </span>

                    <span class="resultado-contagem">
                        ${ofertas.length}
                        ${
                            ofertas.length === 1
                                ? "oferta"
                                : "ofertas"
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
                                ${escaparHtml(
                                    melhorOferta.active_ingredient
                                )}
                            </p>
                        `
                        : ""
                }

            </header>


            <div class="melhor-oferta">

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
                                        (
                                            detalhe
                                        ) => `
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

                                💰 Economia de até

                                <strong>
                                    ${formatarPreco(
                                        economia
                                    )}
                                </strong>

                                em relação à opção
                                mais cara.

                            </p>
                        `
                        : ""
                }

            </div>


            ${
                ofertas.length > 1
                    ? `
                        <div class="outras-ofertas">

                            <h3>
                                Outras ofertas
                            </h3>

                            ${ofertas
                                .slice(1)
                                .map(
                                    (
                                        oferta
                                    ) => `
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
                                                        oferta.package_description
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


            <p class="resultado-aviso">

                Preço e disponibilidade devem
                ser confirmados diretamente
                com a farmácia.

            </p>

        </section>
    `;

    resultadoBusca.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// =====================================
// PESQUISA PRINCIPAL
// =====================================

async function pesquisarMedicamento() {
    if (pesquisando) {
        return;
    }

    const termoOriginal =
        campoMedicamento.value.trim();

    const termo =
        normalizarTexto(termoOriginal);

    fecharSugestoes();

    if (!termo) {
        mensagem(
            "mensagem-erro",
            `
                ⚠️ Digite o nome ou o
                princípio ativo de um medicamento.
            `
        );

        campoMedicamento.focus();
        return;
    }

    estadoBusca(true);

    mensagem(
        "mensagem-carregando",
        `
            <span class="spinner"></span>

            <span>
                Consultando preços nas
                farmácias participantes...
            </span>
        `
    );

    try {
        validarSupabase();

        const termoSeguro =
            termo.replaceAll(",", " ");

        const { data, error } =
            await supabaseClient
                .from(VIEW_OFERTAS)
                .select("*")
                .or(
                    `
                    name.ilike.%${termoSeguro}%,
                    active_ingredient.ilike.%${termoSeguro}%,
                    manufacturer.ilike.%${termoSeguro}%
                    `.replace(/\s+/g, "")
                )
                .limit(80);

        if (error) {
            throw error;
        }

        const ofertas = (data || [])
            .filter((oferta) => {
                const preco =
                    precoEfetivo(oferta);

                return (
                    Number.isFinite(preco) &&
                    preco > 0
                );
            })
            .sort(
                (ofertaA, ofertaB) =>
                    precoEfetivo(ofertaA) -
                    precoEfetivo(ofertaB)
            );

        if (!ofertas.length) {
            mensagem(
                "mensagem-vazia",
                `
                    <strong>
                        😕 Nenhuma oferta encontrada.
                    </strong>

                    <br>

                    Confira a escrita ou tente
                    pesquisar pelo princípio ativo.
                `
            );

            return;
        }

        renderizar(
            ofertas,
            termoOriginal
        );
    } catch (erro) {
        console.error(
            "Erro na pesquisa:",
            erro
        );

        mensagem(
            "mensagem-erro",
            `
                <strong>
                    Não foi possível consultar
                    os preços agora.
                </strong>

                <br>

                Tente novamente em alguns
                instantes.
            `
        );
    } finally {
        estadoBusca(false);
    }
}


// =====================================
// EVENTOS DO CAMPO DE PESQUISA
// =====================================

campoMedicamento.addEventListener(
    "input",
    () => {
        clearTimeout(timerAutocomplete);

        atualizarLimpar();

        timerAutocomplete = setTimeout(
            buscarSugestoes,
            320
        );
    }
);


botaoPesquisar.addEventListener(
    "click",
    pesquisarMedicamento
);


botaoLimpar.addEventListener(
    "click",
    () => {
        campoMedicamento.value = "";
        resultadoBusca.innerHTML = "";

        fecharSugestoes();
        atualizarLimpar();

        campoMedicamento.focus();
    }
);


campoMedicamento.addEventListener(
    "keydown",
    (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            pesquisarMedicamento();
        }
    }
);