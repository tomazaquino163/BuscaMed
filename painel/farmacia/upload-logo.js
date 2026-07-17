/* ======================================================
   UPLOAD DA LOGOMARCA DA FARMÁCIA
====================================================== */

const UploadLogoFarmacia = {

    elementos: {},

    arquivoSelecionado: null,

    logoAtual: null,


    /* ==================================================
       INICIALIZAÇÃO
    ================================================== */

    inicializar() {

        this.mapearElementos();
        this.adicionarEventos();

    },


    /* ==================================================
       ELEMENTOS
    ================================================== */

    mapearElementos() {

        this.elementos = {

            inputArquivo:
                document.getElementById("arquivo-logo-farmacia"),

            preview:
                document.getElementById("preview-logo-farmacia"),

            botaoRemover:
                document.getElementById("botao-remover-logo"),

            erro:
                document.getElementById("erro-logo-farmacia")

        };

    },


    /* ==================================================
       EVENTOS
    ================================================== */

    adicionarEventos() {

        this.elementos.inputArquivo?.addEventListener(

            "change",

            (evento) => {

                this.selecionarArquivo(evento);

            }

        );


        this.elementos.botaoRemover?.addEventListener(

            "click",

            () => {

                this.removerImagem();

            }

        );

    },


    /* ==================================================
       CARREGAR LOGO ATUAL
    ================================================== */

    carregarLogo(url) {

        this.logoAtual = url || null;

        this.arquivoSelecionado = null;

        this.atualizarPreview();

    },


    /* ==================================================
       SELEÇÃO
    ================================================== */

    selecionarArquivo(evento) {

        const arquivo = evento.target.files[0];

        if (!arquivo) {

            return;

        }

        this.limparErro();

        if (!this.validarArquivo(arquivo)) {

            evento.target.value = "";

            return;

        }

        this.arquivoSelecionado = arquivo;

        this.atualizarPreview();

    },


    /* ==================================================
       VALIDAÇÃO
    ================================================== */

    validarArquivo(arquivo) {

        const tiposPermitidos = [

            "image/jpeg",
            "image/png",
            "image/webp"

        ];

        if (!tiposPermitidos.includes(arquivo.type)) {

            this.mostrarErro(

                "Formato inválido. Utilize JPG, PNG ou WEBP."

            );

            return false;

        }

        if (arquivo.size > (2 * 1024 * 1024)) {

            this.mostrarErro(

                "A imagem deve ter no máximo 2 MB."

            );

            return false;

        }

        return true;

    },


    /* ==================================================
       PREVIEW
    ================================================== */

    atualizarPreview() {

        const {

            preview,
            botaoRemover

        } = this.elementos;

        preview.innerHTML = "";

        if (this.arquivoSelecionado) {

            const img = document.createElement("img");

            img.src = URL.createObjectURL(
                this.arquivoSelecionado
            );

            preview.appendChild(img);

            botaoRemover.classList.remove("oculto");

            return;

        }

        if (this.logoAtual) {

            const img = document.createElement("img");

            img.src = this.logoAtual;

            preview.appendChild(img);

            botaoRemover.classList.remove("oculto");

            return;

        }

        preview.textContent = "🏥";

        botaoRemover.classList.add("oculto");

    },


    /* ==================================================
       REMOVER
    ================================================== */

    removerImagem() {

        this.arquivoSelecionado = null;

        this.logoAtual = null;

        this.elementos.inputArquivo.value = "";

        this.atualizarPreview();

    },


    /* ==================================================
       GETTERS
    ================================================== */

    possuiNovaImagem() {

        return this.arquivoSelecionado !== null;

    },


    obterArquivo() {

        return this.arquivoSelecionado;

    },


    obterLogoAtual() {

        return this.logoAtual;

    },


    /* ==================================================
       ERROS
    ================================================== */

    mostrarErro(mensagem) {

        this.elementos.erro.textContent = mensagem;

    },

    limparErro() {

        this.elementos.erro.textContent = "";

    }

};