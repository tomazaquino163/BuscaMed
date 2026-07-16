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
// ELEMENTOS DA PÁGINA
// ================================

const campoMedicamento = document.getElementById("medicamento");

const botaoPesquisar = document.getElementById("btnPesquisar");

const resultadoBusca = document.getElementById("resultadoBusca");


// ================================
// FUNÇÃO DE PESQUISA
// ================================

function pesquisarMedicamento() {

    const busca = campoMedicamento.value
        .toLowerCase()
        .trim();


    if (busca === "") {

        resultadoBusca.innerHTML = `
            <div class="mensagem-erro">
                ⚠️ Digite o nome de um medicamento para pesquisar.
            </div>
        `;

        return;

    }


    const resultados = medicamentos[busca];


    if (!resultados) {

        resultadoBusca.innerHTML = `
            <div class="mensagem-erro">
                😕 Não encontramos esse medicamento na nossa base de demonstração.
                <br><br>
                Tente pesquisar por:
                <strong>Propranolol 40 mg, Hidroclorotiazida 25 mg,
                Furosemida 40 mg, Captopril 25 mg ou Anlodipino 5 mg.</strong>
            </div>
        `;

        return;

    }


    // Ordena os preços do menor para o maior

    const resultadosOrdenados = [...resultados].sort(
        (a, b) => a.preco - b.preco
    );


    const menorPreco = resultadosOrdenados[0];


    const maiorPreco = resultadosOrdenados[
        resultadosOrdenados.length - 1
    ];


    const economia = maiorPreco.preco - menorPreco.preco;


    resultadoBusca.innerHTML = `

        <div class="resultado-card">

            <div class="resultado-titulo">

                <span>
                    🏆 MENOR PREÇO ENCONTRADO
                </span>

                <h2>
                    ${busca}
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
                    R$ ${menorPreco.preco.toFixed(2).replace(".", ",")}
                </strong>

            </div>


            <p class="economia">

                💰 Economia de até
                <strong>
                    R$ ${economia.toFixed(2).replace(".", ",")}
                </strong>
                em relação à opção mais cara.

            </p>


            <div class="outras-ofertas">

                <h3>
                    Outras opções
                </h3>


                ${resultadosOrdenados.slice(1).map((oferta) => `

                    <div class="oferta">

                        <span>
                            ${oferta.farmacia}
                        </span>

                        <strong>
                            R$ ${oferta.preco.toFixed(2).replace(".", ",")}
                        </strong>

                    </div>

                `).join("")}

            </div>

        </div>

    `;


    resultadoBusca.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


// ================================
// EVENTOS
// ================================

botaoPesquisar.addEventListener(

    "click",

    pesquisarMedicamento

);


campoMedicamento.addEventListener(

    "keydown",

    function(event) {

        if (event.key === "Enter") {

            pesquisarMedicamento();

        }

    }

);