// ================================
// DADOS DA PESQUISA DE CAMPO
// ================================

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


// ================================
// NORMALIZAÇÃO DO TEXTO
// ================================

function normalizarTexto(texto) {

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();

}


// ================================
// ELEMENTOS DA PÁGINA
// ================================

const campoMedicamento =
    document.getElementById("medicamento");

const botaoPesquisar =
    document.getElementById("btnPesquisar");

const resultadoBusca =
    document.getElementById("resultadoBusca");


// ================================
// ENCONTRAR MEDICAMENTO
// ================================

function encontrarMedicamento(busca) {

    const medicamentosDisponiveis =
        Object.keys(medicamentos);


    // 1. Procura exata

    if (medicamentos[busca]) {

        return busca;

    }


    // 2. Procura pelo nome principal

    const medicamentoPorNome =
        medicamentosDisponiveis.find(

            medicamento => {

                const nomePrincipal =
                    medicamento.split(" ")[0];

                return busca === nomePrincipal;

            }

        );


    if (medicamentoPorNome) {

        return medicamentoPorNome;

    }


    // 3. Procura ignorando o espaço entre número e unidade

    const buscaSemEspacos =
        busca.replace(/\s+/g, "");


    const medicamentoSemEspacos =
        medicamentosDisponiveis.find(

            medicamento => {

                const nomeSemEspacos =
                    medicamento.replace(/\s+/g, "");

                return buscaSemEspacos === nomeSemEspacos;

            }

        );


    if (medicamentoSemEspacos) {

        return medicamentoSemEspacos;

    }


    // 4. Procura quando o usuário digita apenas parte do nome

    const medicamentoParcial =
        medicamentosDisponiveis.find(

            medicamento => {

                const nomePrincipal =
                    medicamento.split(" ")[0];

                return busca.includes(nomePrincipal);

            }

        );


    if (medicamentoParcial) {

        return medicamentoParcial;

    }


    // Caso nada seja encontrado

    return null;

}


// ================================
// FORMATAR PREÇO
// ================================

function formatarPreco(preco) {

    return preco
        .toFixed(2)
        .replace(".", ",");

}


// ================================
// REALIZAR PESQUISA
// ================================

function pesquisarMedicamento() {


    const buscaOriginal =
        campoMedicamento.value;


    const busca =
        normalizarTexto(buscaOriginal);


    // Se o campo estiver vazio

    if (busca === "") {

        resultadoBusca.innerHTML = `

            <div class="mensagem-erro">

                ⚠️ Digite o nome de um medicamento
                para pesquisar.

            </div>

        `;

        return;

    }


    // Procurar medicamento

    const medicamentoEncontrado =
        encontrarMedicamento(busca);


    // Se não encontrar

    if (!medicamentoEncontrado) {

        resultadoBusca.innerHTML = `

            <div class="mensagem-erro">

                😕 Não encontramos esse medicamento
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


    // Obter os preços

    const resultados =
        medicamentos[medicamentoEncontrado];


    // Ordenar do menor para o maior

    const resultadosOrdenados =
        [...resultados].sort(

            (a, b) => a.preco - b.preco

        );


    // Menor preço

    const menorPreco =
        resultadosOrdenados[0];


    // Maior preço

    const maiorPreco =
        resultadosOrdenados[
            resultadosOrdenados.length - 1
        ];


    // Calcular economia

    const economia =
        maiorPreco.preco - menorPreco.preco;


    // Exibir resultado

    resultadoBusca.innerHTML = `

        <div class="resultado-card">


            <div class="resultado-titulo">


                <span>

                    🏆 MENOR PREÇO ENCONTRADO

                </span>


                <h2>

                    ${medicamentoEncontrado}

                </h2>


            </div>


            <div class="melhor-oferta">


                <div>


                    <span class="label-menor-preco">

                        Melhor oferta

                    </span>


                    <h3>

                        ${menorPreco.farmacia}

                    </h3>


                </div>


                <strong>

                    R$

                    ${formatarPreco(
                        menorPreco.preco
                    )}

                </strong>


            </div>


            <p class="economia">


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


            <div class="outras-ofertas">


                <h3>

                    Outras opções

                </h3>


                ${resultadosOrdenados
                    .slice(1)
                    .map(

                        oferta => `

                            <div class="oferta">


                                <span>

                                    ${oferta.farmacia}

                                </span>


                                <strong>

                                    R$

                                    ${formatarPreco(
                                        oferta.preco
                                    )}

                                </strong>


                            </div>

                        `

                    )
                    .join("")}


            </div>


        </div>

    `;


    // Rolar suavemente até o resultado

    resultadoBusca.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });


}


// ================================
// EVENTO DO BOTÃO PESQUISAR
// ================================

botaoPesquisar.addEventListener(

    "click",

    pesquisarMedicamento

);


// ================================
// PESQUISAR PRESSIONANDO ENTER
// ================================

campoMedicamento.addEventListener(

    "keydown",

    function(event) {


        if (event.key === "Enter") {


            pesquisarMedicamento();


        }


    }

);