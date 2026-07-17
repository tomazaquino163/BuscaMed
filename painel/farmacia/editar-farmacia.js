/* ======================================================
   EDIÇÃO DOS DADOS DA FARMÁCIA
====================================================== */

const EditarFarmacia = {

    elementos: {},

    dadosFarmacia: null,


    /* ==================================================
       INICIALIZAÇÃO
    ================================================== */

    inicializar() {

        this.mapearElementos();
        this.adicionarEventos();

    },


    /* ==================================================
       ELEMENTOS DO HTML
    ================================================== */

    mapearElementos() {

        this.elementos = {

            botaoAbrir:
                document.getElementById("botao-editar-farmacia"),

            modal:
                document.getElementById("modal-editar-farmacia"),

            formulario:
                document.getElementById("formulario-editar-farmacia"),

            botoesFechar:
                document.querySelectorAll(
                    "[data-fechar-edicao-farmacia]"
                ),

            nomeFantasia:
                document.getElementById("editar-nome-fantasia"),

            razaoSocial:
                document.getElementById("editar-razao-social"),

            cnpj:
                document.getElementById("editar-cnpj"),

            responsavel:
                document.getElementById("editar-responsavel"),

            emailComercial:
                document.getElementById("editar-email-comercial"),

            telefone:
                document.getElementById("editar-telefone"),

            whatsapp:
                document.getElementById("editar-whatsapp"),

            endereco:
                document.getElementById("editar-endereco"),

            bairro:
                document.getElementById("editar-bairro"),

            cidade:
                document.getElementById("editar-cidade"),

            estado:
                document.getElementById("editar-estado"),

            cep:
                document.getElementById("editar-cep"),

            erroFormulario:
                document.getElementById("erro-formulario-farmacia")

        };

    },


    /* ==================================================
       EVENTOS
    ================================================== */

    adicionarEventos() {

        const {
            botaoAbrir,
            modal,
            botoesFechar
        } = this.elementos;


        if (botaoAbrir) {

            botaoAbrir.addEventListener("click", () => {

                this.abrir();

            });

        }


        botoesFechar.forEach((botao) => {

            botao.addEventListener("click", () => {

                this.fechar();

            });

        });


        document.addEventListener("keydown", (evento) => {

            if (
                evento.key === "Escape" &&
                modal?.classList.contains("aberto")
            ) {

                this.fechar();

            }

        });

    },


    /* ==================================================
       ABRIR MODAL
    ================================================== */

    abrir() {

        const { modal } = this.elementos;

        if (!modal) {

            console.error(
                "Modal de edição da farmácia não encontrado."
            );

            return;

        }


        this.carregarDadosAtuais();
        this.preencherFormulario();


        modal.classList.add("aberto");

        document.body.classList.add("modal-aberto");


        setTimeout(() => {

            this.elementos.nomeFantasia?.focus();

        }, 100);

    },


    /* ==================================================
       FECHAR MODAL
    ================================================== */

    fechar() {

        const {
            modal,
            formulario,
            erroFormulario
        } = this.elementos;


        modal?.classList.remove("aberto");

        document.body.classList.remove("modal-aberto");


        formulario?.reset();


        if (erroFormulario) {

            erroFormulario.textContent = "";

        }


        this.limparErrosCampos();

    },


    /* ==================================================
       CARREGAR DADOS ATUAIS
    ================================================== */

    carregarDadosAtuais() {

        /*
         * O painel provavelmente já possui os dados da farmácia
         * carregados em uma variável global.
         *
         * Vamos tentar localizar essa variável sem quebrar
         * o restante do sistema.
         */

        this.dadosFarmacia =
            window.farmaciaAtual ||
            window.dadosFarmacia ||
            window.farmaciaLogada ||
            null;


        if (!this.dadosFarmacia) {

            console.warn(
                "Os dados atuais da farmácia ainda não estão disponíveis."
            );

        }

    },


    /* ==================================================
       PREENCHER FORMULÁRIO
    ================================================== */

    preencherFormulario() {

        const farmacia = this.dadosFarmacia;

        if (!farmacia) {

            return;

        }


        this.definirValor(
            this.elementos.nomeFantasia,
            farmacia.trade_name
        );

        this.definirValor(
            this.elementos.razaoSocial,
            farmacia.legal_name
        );

        this.definirValor(
            this.elementos.cnpj,
            farmacia.cnpj
        );

        this.definirValor(
            this.elementos.responsavel,
            farmacia.responsible_name
        );

        this.definirValor(
            this.elementos.emailComercial,
            farmacia.commercial_email
        );

        this.definirValor(
            this.elementos.telefone,
            farmacia.phone
        );

        this.definirValor(
            this.elementos.whatsapp,
            farmacia.whatsapp
        );

        this.definirValor(
            this.elementos.endereco,
            farmacia.address
        );

        this.definirValor(
            this.elementos.bairro,
            farmacia.neighborhood
        );

        this.definirValor(
            this.elementos.cidade,
            farmacia.city
        );

        this.definirValor(
            this.elementos.estado,
            farmacia.state
        );

        this.definirValor(
            this.elementos.cep,
            farmacia.postal_code
        );

    },


    /* ==================================================
       FUNÇÕES AUXILIARES
    ================================================== */

    definirValor(elemento, valor) {

        if (!elemento) {

            return;

        }

        elemento.value = valor ?? "";

    },


    limparErrosCampos() {

        document
            .querySelectorAll("[data-erro-farmacia]")
            .forEach((elemento) => {

                elemento.textContent = "";

            });

    }

};


/* ======================================================
   INICIAR MÓDULO
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    EditarFarmacia.inicializar();

});