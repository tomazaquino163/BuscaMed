/* ======================================================
   SELEÇÃO DA LOGO DA FARMÁCIA
   Responsável apenas por:
   - selecionar a imagem;
   - validar formato e tamanho;
   - mostrar o preview;
   - remover e fornecer o arquivo selecionado.
====================================================== */

const UploadLogoFarmacia = {

    elementos: {},

    arquivoSelecionado: null,

    urlPreview: null,


    /* ==================================================
       INICIALIZAÇÃO
    ================================================== */

    inicializar() {

        this.mapearElementos();

        if (!this.elementos.inputArquivo || !this.elementos.preview) {

            console.warn(
                "UploadLogoFarmacia: elementos do upload não foram encontrados."
            );

            return;

        }

        this.adicionarEventos();
        this.limpar();

    },


    /* ==================================================
       MAPEAMENTO DOS ELEMENTOS
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

        this.elementos.inputArquivo.addEventListener(

            "change",

            (evento) => {

                this.selecionarArquivo(evento);

            }

        );


        this.elementos.botaoRemover?.addEventListener(

            "click",

            (evento) => {

                evento.preventDefault();

                this.removerImagem();

            }

        );

    },


    /* ==================================================
       SELEÇÃO DO ARQUIVO
    ================================================== */

    selecionarArquivo(evento) {

        const arquivo = evento.target.files?.[0];

        this.limparErro();

        if (!arquivo) {

            return;

        }

        if (!this.validarArquivo(arquivo)) {

            evento.target.value = "";

            return;

        }

        this.arquivoSelecionado = arquivo;

        this.mostrarPreview(arquivo);

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

        const tamanhoMaximo = 2 * 1024 * 1024;


        if (!tiposPermitidos.includes(arquivo.type)) {

            this.mostrarErro(
                "Formato inválido. Selecione uma imagem JPG, PNG ou WEBP."
            );

            return false;

        }


        if (arquivo.size > tamanhoMaximo) {

            this.mostrarErro(
                "A imagem deve possuir no máximo 2 MB."
            );

            return false;

        }


        return true;

    },


    /* ==================================================
       PREVIEW
    ================================================== */

    mostrarPreview(arquivo) {

        this.revogarUrlPreview();

        this.urlPreview = URL.createObjectURL(arquivo);

        const imagem = document.createElement("img");

        imagem.src = this.urlPreview;
        imagem.alt = "Pré-visualização da logo da farmácia";

        imagem.addEventListener("error", () => {

            this.mostrarErro(
                "Não foi possível carregar a imagem selecionada."
            );

            this.removerImagem();

        });


        this.elementos.preview.replaceChildren(imagem);

        this.elementos.botaoRemover?.classList.remove("oculto");

    },


    mostrarPlaceholder() {

        this.elementos.preview.replaceChildren();

        const placeholder = document.createElement("span");

        placeholder.textContent = "🏥";
        placeholder.setAttribute("aria-hidden", "true");

        this.elementos.preview.appendChild(placeholder);

        this.elementos.botaoRemover?.classList.add("oculto");

    },


    /* ==================================================
       REMOÇÃO
    ================================================== */

    removerImagem() {

        this.arquivoSelecionado = null;

        if (this.elementos.inputArquivo) {

            this.elementos.inputArquivo.value = "";

        }

        this.revogarUrlPreview();
        this.limparErro();
        this.mostrarPlaceholder();

    },


    /* ==================================================
       CONSULTA DO ARQUIVO
    ================================================== */

    possuiArquivo() {

        return this.arquivoSelecionado instanceof File;

    },


    obterArquivo() {

        return this.arquivoSelecionado;

    },

    /* ==================================================
   ENVIO DA LOGO PARA O SUPABASE STORAGE
================================================== */

    async enviarParaStorage() {

        if (!this.possuiArquivo()) {
            return null;
        }

        const arquivo = this.obterArquivo();

        const extensao = arquivo.name
            .split(".")
            .pop()
            .toLowerCase();

        const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;
        const caminhoArquivo = `logos/${nomeArquivo}`;

        const { error: erroUpload } = await supabaseClient.storage
            .from("pharmacy-logos")
            .upload(caminhoArquivo, arquivo, {
                cacheControl: "3600",
                upsert: false
            });

        if (erroUpload) {
            throw erroUpload;
        }

        const { data } = supabaseClient.storage
            .from("pharmacy-logos")
            .getPublicUrl(caminhoArquivo);

        if (!data?.publicUrl) {
            throw new Error(
                "A imagem foi enviada, mas não foi possível obter sua URL pública."
            );
        }

        return data.publicUrl;

    },


    /* ==================================================
       LIMPEZA
    ================================================== */

    limpar() {

        this.arquivoSelecionado = null;

        if (this.elementos.inputArquivo) {

            this.elementos.inputArquivo.value = "";

        }

        this.revogarUrlPreview();
        this.limparErro();

        if (this.elementos.preview) {

            this.mostrarPlaceholder();

        }

    },


    revogarUrlPreview() {

        if (this.urlPreview) {

            URL.revokeObjectURL(this.urlPreview);

            this.urlPreview = null;

        }

    },


    /* ==================================================
       ERROS
    ================================================== */

    mostrarErro(mensagem) {

        if (this.elementos.erro) {

            this.elementos.erro.textContent = mensagem;

        } else {

            console.warn(mensagem);

        }

    },


    limparErro() {

        if (this.elementos.erro) {

            this.elementos.erro.textContent = "";

        }

    }

};