// =====================================
// DADOS DA PESQUISA DE CAMPO
// =====================================

const medicamentos = {


    "propranolol 40 mg": [

        {
            farmacia: "Nissei",
            preco: 8.90
        },


        {
            farmacia: "Multi Farma",
            preco: 7.50
        },


        {
            farmacia: "Droga Mais",
            preco: 6.99
        },


        {
            farmacia: "Hiper Farma",
            preco: 8.20
        }

    ],


    "hidroclorotiazida 25 mg": [

        {
            farmacia: "Nissei",
            preco: 5.90
        },


        {
            farmacia: "Multi Farma",
            preco: 4.80
        },


        {
            farmacia: "Droga Mais",
            preco: 3.99
        },


        {
            farmacia: "Hiper Farma",
            preco: 5.20
        }

    ],


    "furosemida 40 mg": [

        {
            farmacia: "Nissei",
            preco: 7.90
        },


        {
            farmacia: "Multi Farma",
            preco: 6.50
        },


        {
            farmacia: "Droga Mais",
            preco: 5.99
        },


        {
            farmacia: "Hiper Farma",
            preco: 6.80
        }

    ],


    "captopril 25 mg": [

        {
            farmacia: "Nissei",
            preco: 10.40
        },


        {
            farmacia: "Multi Farma",
            preco: 5.38
        },


        {
            farmacia: "Droga Mais",
            preco: 4.99
        },


        {
            farmacia: "Hiper Farma",
            preco: 6.85
        }

    ],


    "anlodipino 5 mg": [

        {
            farmacia: "Nissei",
            preco: 9.90
        },


        {
            farmacia: "Multi Farma",
            preco: 8.50
        },


        {
            farmacia: "Droga Mais",
            preco: 7.99
        },


        {
            farmacia: "Hiper Farma",
            preco: 8.90
        }

    ]

};


// =====================================
// ELEMENTOS DA PÁGINA
// =====================================

const campoMedicamento =
    document.getElementById(
        "medicamento"
    );


const botaoPesquisar =
    document.getElementById(
        "btnPesquisar"
    );


const botaoLimpar =
    document.getElementById(
        "btnLimpar"
    );


const resultadoBusca =
    document.getElementById(
        "resultadoBusca"
    );


const sugestoesMedicamentos =
    document.getElementById(
        "sugestoesMedicamentos"
    );


// =====================================
// NORMALIZAR TEXTO
// =====================================

function normalizarTexto(
    texto
) {


    return texto

        .toLowerCase()

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();


}


// =====================================
// FORMATAR PREÇO
// =====================================

function formatarPreco(
    preco
) {


    return preco

        .toFixed(
            2
        )

        .replace(
            ".",
            ","
        );


}


// =====================================
// ENCONTRAR MEDICAMENTO
// =====================================

function encontrarMedicamento(
    busca
) {


    const medicamentosDisponiveis =
        Object.keys(
            medicamentos
        );


    // BUSCA EXATA

    if (
        medicamentos[busca]
    ) {


        return busca;


    }


    // BUSCA PELO NOME PRINCIPAL

    const medicamentoPorNome =
        medicamentosDisponiveis.find(

            medicamento => {


                const nomePrincipal =
                    medicamento
                        .split(
                            " "
                        )[0];


                return busca ===
                    nomePrincipal;


            }

        );


    if (
        medicamentoPorNome
    ) {


        return medicamentoPorNome;


    }


    // BUSCA SEM ESPAÇOS

    const buscaSemEspacos =
        busca.replace(
            /\s+/g,
            ""
        );


    const medicamentoSemEspacos =
        medicamentosDisponiveis.find(

            medicamento => {


                const nomeSemEspacos =
                    medicamento.replace(
                        /\s+/g,
                        ""
                    );


                return buscaSemEspacos ===
                    nomeSemEspacos;


            }

        );


    if (
        medicamentoSemEspacos
    ) {


        return medicamentoSemEspacos;


    }


    // BUSCA PARCIAL

    const medicamentoParcial =
        medicamentosDisponiveis.find(

            medicamento => {


                const nomePrincipal =
                    medicamento
                        .split(
                            " "
                        )[0];


                return busca.includes(
                    nomePrincipal
                );


            }

        );


    if (
        medicamentoParcial
    ) {


        return medicamentoParcial;


    }


    return null;


}


// =====================================
// BOTÃO LIMPAR
// =====================================

function atualizarBotaoLimpar() {


    if (

        campoMedicamento
            .value
            .trim()
            !== ""

    ) {


        botaoLimpar
            .style
            .display =
            "block";


    } else {


        botaoLimpar
            .style
            .display =
            "none";


    }


}


function limparBusca() {


    campoMedicamento
        .value =
        "";


    resultadoBusca
        .innerHTML =
        "";


    sugestoesMedicamentos
        .innerHTML =
        "";


    sugestoesMedicamentos
        .style
        .display =
        "none";


    botaoLimpar
        .style
        .display =
        "none";


    campoMedicamento
        .focus();


}


// =====================================
// AUTOCOMPLETE
// =====================================

function mostrarSugestoes() {


    const textoDigitado =
        normalizarTexto(

            campoMedicamento
                .value

        );


    atualizarBotaoLimpar();


    // CAMPO VAZIO

    if (
        textoDigitado === ""
    ) {


        sugestoesMedicamentos
            .innerHTML =
            "";


        sugestoesMedicamentos
            .style
            .display =
            "none";


        return;


    }


    const listaMedicamentos =
        Object.keys(
            medicamentos
        );


    // FILTRAR RESULTADOS

    const resultados =
        listaMedicamentos.filter(

            medicamento => {


                const nomePrincipal =
                    medicamento
                        .split(
                            " "
                        )[0];


                return medicamento
                    .includes(
                        textoDigitado
                    )

                    ||

                    nomePrincipal
                        .startsWith(
                            textoDigitado
                        );


            }

        );


    // NENHUM RESULTADO

    if (
        resultados.length === 0
    ) {


        sugestoesMedicamentos
            .innerHTML =
            "";


        sugestoesMedicamentos
            .style
            .display =
            "none";


        return;


    }


    // CRIAR SUGESTÕES

    sugestoesMedicamentos
        .innerHTML =


        resultados

            .map(

                medicamento => `


                    <button

                        type="button"

                        class="sugestao-medicamento"

                        data-medicamento="${medicamento}"

                    >


                        💊


                        <span>


                            ${medicamento}


                        </span>


                    </button>


                `

            )

            .join(
                ""
            );


    sugestoesMedicamentos
        .style
        .display =
        "block";


    // CLIQUE NAS SUGESTÕES

    document

        .querySelectorAll(
            ".sugestao-medicamento"
        )

        .forEach(

            sugestao => {


                sugestao

                    .addEventListener(

                        "click",

                        function() {


                            campoMedicamento
                                .value =

                                this
                                    .dataset
                                    .medicamento;


                            sugestoesMedicamentos
                                .innerHTML =
                                "";


                            sugestoesMedicamentos
                                .style
                                .display =
                                "none";


                            pesquisarMedicamento();


                        }

                    );


            }

        );


}


// =====================================
// PESQUISAR MEDICAMENTO
// =====================================

function pesquisarMedicamento() {


    const busca =
        normalizarTexto(

            campoMedicamento
                .value

        );


    // CAMPO VAZIO

    if (
        busca === ""
    ) {


        resultadoBusca
            .innerHTML = `


                <div
                    class="mensagem-erro"
                >


                    ⚠️ Digite o nome
                    de um medicamento
                    para pesquisar.


                </div>


            `;


        return;


    }


    // ENCONTRAR MEDICAMENTO

    const medicamentoEncontrado =
        encontrarMedicamento(
            busca
        );


    // MEDICAMENTO NÃO ENCONTRADO

    if (
        !medicamentoEncontrado
    ) {


        resultadoBusca
            .innerHTML = `


                <div
                    class="mensagem-erro"
                >


                    😕 Não encontramos
                    esse medicamento
                    na nossa base de demonstração.


                    <br><br>


                    Tente pesquisar por:


                    <strong>


                        Propranolol,
                        Hidroclorotiazida,
                        Furosemida,
                        Captopril
                        ou Anlodipino.


                    </strong>


                </div>


            `;


        return;


    }


    // OBTER PREÇOS

    const resultados =
        medicamentos[
            medicamentoEncontrado
        ];


    // ORDENAR DO MENOR PARA O MAIOR

    const resultadosOrdenados =
        [

            ...resultados

        ]

        .sort(

            (
                a,
                b

            ) =>

                a.preco -
                b.preco

        );


    // MENOR PREÇO

    const menorPreco =
        resultadosOrdenados[
            0
        ];


    // MAIOR PREÇO

    const maiorPreco =
        resultadosOrdenados[

            resultadosOrdenados
                .length -
            1

        ];


    // ECONOMIA

    const economia =
        maiorPreco.preco -
        menorPreco.preco;


    // EXIBIR RESULTADO

    resultadoBusca
        .innerHTML = `


            <div
                class="resultado-card"
            >


                <div
                    class="resultado-titulo"
                >


                    <span>


                        🏆 MENOR PREÇO
                        ENCONTRADO


                    </span>


                    <h2>


                        ${medicamentoEncontrado}


                    </h2>


                </div>


                <div
                    class="melhor-oferta"
                >


                    <div>


                        <span
                            class="label-menor-preco"
                        >


                            Melhor oferta


                        </span>


                        <h3>


                            ${menorPreco
                                .farmacia}


                        </h3>


                    </div>


                    <strong>


                        R$


                        ${formatarPreco(

                            menorPreco
                                .preco

                        )}


                    </strong>


                </div>


                <p
                    class="economia"
                >


                    💰 Economia de até


                    <strong>


                        R$


                        ${formatarPreco(

                            economia

                        )}


                    </strong>


                    em relação à opção
                    mais cara.


                </p>


                <div
                    class="outras-ofertas"
                >


                    <h3>


                        Outras opções


                    </h3>


                    ${

                        resultadosOrdenados

                            .slice(
                                1
                            )

                            .map(

                                oferta => `


                                    <div
                                        class="oferta"
                                    >


                                        <span>


                                            ${oferta
                                                .farmacia}


                                        </span>


                                        <strong>


                                            R$


                                            ${formatarPreco(

                                                oferta
                                                    .preco

                                            )}


                                        </strong>


                                    </div>


                                `

                            )

                            .join(
                                ""
                            )

                    }


                </div>


            </div>


        `;


    // ROLAR ATÉ O RESULTADO

    resultadoBusca
        .scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });


}


// =====================================
// MENU MOBILE
// =====================================

const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const mobileNav =
    document.getElementById(
        "mobileNav"
    );


menuToggle
    .addEventListener(

        "click",

        function() {


            const menuAberto =
                menuToggle
                    .classList
                    .toggle(
                        "active"
                    );


            mobileNav
                .classList
                .toggle(
                    "active"
                );


            menuToggle
                .setAttribute(

                    "aria-expanded",

                    menuAberto

                );


        }

    );


// FECHAR MENU AO CLICAR EM UM LINK

const linksMenuMobile =
    document.querySelectorAll(
        ".mobile-nav a"
    );


linksMenuMobile
    .forEach(

        link => {


            link
                .addEventListener(

                    "click",

                    function() {


                        menuToggle
                            .classList
                            .remove(
                                "active"
                            );


                        mobileNav
                            .classList
                            .remove(
                                "active"
                            );


                        menuToggle
                            .setAttribute(

                                "aria-expanded",

                                "false"

                            );


                    }

                );


        }

    );


// =====================================
// EVENTOS DA BUSCA
// =====================================


// MOSTRAR SUGESTÕES ENQUANTO DIGITA

campoMedicamento
    .addEventListener(

        "input",

        mostrarSugestoes

    );


// PESQUISAR AO CLICAR

botaoPesquisar
    .addEventListener(

        "click",

        pesquisarMedicamento

    );


// LIMPAR BUSCA

botaoLimpar
    .addEventListener(

        "click",

        limparBusca

    );


// PESQUISAR COM ENTER

campoMedicamento
    .addEventListener(

        "keydown",

        function(event) {


            if (

                event.key ===
                "Enter"

            ) {


                sugestoesMedicamentos
                    .innerHTML =
                    "";


                sugestoesMedicamentos
                    .style
                    .display =
                    "none";


                pesquisarMedicamento();


            }


        }

    );