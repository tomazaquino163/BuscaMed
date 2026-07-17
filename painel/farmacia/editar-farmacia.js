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

        UploadLogoFarmacia.inicializar();

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

            botaoSalvar:
                document.querySelector(
                    '#formulario-editar-farmacia button[type="submit"]'
                ),

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
            formulario,
            botaoAbrir,
            modal,
            botoesFechar
        } = this.elementos;


        if (botaoAbrir) {

            botaoAbrir.addEventListener("click", () => {

                this.abrir();

            });

        }


        if (formulario) {

            formulario.addEventListener("submit", async (evento) => {

                evento.preventDefault();

                await this.salvar();

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

        UploadLogoFarmacia.limpar();


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

        UploadLogoFarmacia.limpar();


        if (erroFormulario) {

            erroFormulario.textContent = "";

        }


        this.limparErrosCampos();

    },


    /* ==================================================
       CARREGAR DADOS ATUAIS
    ================================================== */

    carregarDadosAtuais() {

        this.dadosFarmacia = estado?.farmacia || null;

        if (!this.dadosFarmacia) {

            console.warn(
                "Os dados atuais da farmácia ainda não foram carregados."
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
       OBTER DADOS DO FORMULÁRIO
    ================================================== */

    obterDadosFormulario() {

        return {

            trade_name:
                this.elementos.nomeFantasia?.value.trim() || "",

            responsible_name:
                this.elementos.responsavel?.value.trim() || "",

            commercial_email:
                this.elementos.emailComercial?.value.trim() || "",

            phone:
                this.elementos.telefone?.value.trim() || "",

            whatsapp:
                this.elementos.whatsapp?.value.trim() || "",

            address:
                this.elementos.endereco?.value.trim() || "",

            neighborhood:
                this.elementos.bairro?.value.trim() || "",

            city:
                this.elementos.cidade?.value.trim() || "",

            state:
                this.elementos.estado?.value
                    .trim()
                    .toUpperCase() || "",

            postal_code:
                this.elementos.cep?.value
                    .replace(/\D/g, "")
                    .slice(0, 8) || ""

        };

    },


    /* ==================================================
       VALIDAÇÃO
    ================================================== */

    validarFormulario(dados) {

        this.limparErrosCampos();

        const { erroFormulario } = this.elementos;

        if (erroFormulario) {
            erroFormulario.textContent = "";
        }


        const camposObrigatorios = [

            {
                chave: "trade_name",
                elemento: this.elementos.nomeFantasia,
                mensagem: "Informe o nome fantasia."
            },

            {
                chave: "responsible_name",
                elemento: this.elementos.responsavel,
                mensagem: "Informe o nome do responsável."
            },

            {
                chave: "commercial_email",
                elemento: this.elementos.emailComercial,
                mensagem: "Informe o e-mail comercial."
            },

            {
                chave: "city",
                elemento: this.elementos.cidade,
                mensagem: "Informe a cidade."
            },

            {
                chave: "state",
                elemento: this.elementos.estado,
                mensagem: "Informe o estado."
            }

        ];


        const campoInvalido = camposObrigatorios.find(
            (campo) => !dados[campo.chave]
        );


        if (campoInvalido) {

            if (erroFormulario) {
                erroFormulario.textContent =
                    campoInvalido.mensagem;
            }

            campoInvalido.elemento?.focus();

            return false;

        }


        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                dados.commercial_email
            );


        if (!emailValido) {

            if (erroFormulario) {
                erroFormulario.textContent =
                    "Informe um e-mail comercial válido.";
            }

            this.elementos.emailComercial?.focus();

            return false;

        }


        if (dados.state.length !== 2) {

            if (erroFormulario) {
                erroFormulario.textContent =
                    "Informe a sigla do estado com duas letras.";
            }

            this.elementos.estado?.focus();

            return false;

        }


        return true;

    },


    /* ==================================================
       ESTADO DO BOTÃO
    ================================================== */

    definirSalvando(salvando) {

        const botao = this.elementos.botaoSalvar;

        if (!botao) {
            return;
        }


        if (!botao.dataset.textoOriginal) {

            botao.dataset.textoOriginal =
                botao.textContent.trim();

        }


        botao.disabled = salvando;

        botao.textContent = salvando
            ? "Salvando..."
            : botao.dataset.textoOriginal;

    },


    /* ==================================================
       ATUALIZAR ESTADO LOCAL
    ================================================== */

    atualizarEstadoLocal(dados, logoUrl, respostaRpc) {

        let farmaciaAtualizada = null;


        if (Array.isArray(respostaRpc)) {

            farmaciaAtualizada =
                respostaRpc[0] || null;

        } else if (
            respostaRpc &&
            typeof respostaRpc === "object"
        ) {

            farmaciaAtualizada = respostaRpc;

        }


        estado.farmacia = {

            ...estado.farmacia,

            ...dados,

            logo_url: logoUrl,

            ...(farmaciaAtualizada || {})

        };


        this.dadosFarmacia = estado.farmacia;

    },


    /* ==================================================
       SALVAR ALTERAÇÕES
    ================================================== */

    async salvar() {

        const dados = this.obterDadosFormulario();

        if (!this.validarFormulario(dados)) {
            return;
        }


        const { erroFormulario } = this.elementos;

        this.definirSalvando(true);


        try {

            let logoUrl =
                this.dadosFarmacia?.logo_url || null;


            if (UploadLogoFarmacia.possuiArquivo()) {

                logoUrl =
                    await UploadLogoFarmacia
                        .enviarParaStorage();

            }


            const { data, error } =
                await supabaseClient.rpc(
                    "update_own_pharmacy",
                    {

                        p_trade_name:
                            dados.trade_name,

                        p_responsible_name:
                            dados.responsible_name,

                        p_commercial_email:
                            dados.commercial_email,

                        p_phone:
                            dados.phone || null,

                        p_whatsapp:
                            dados.whatsapp || null,

                        p_address:
                            dados.address || null,

                        p_neighborhood:
                            dados.neighborhood || null,

                        p_city:
                            dados.city,

                        p_state:
                            dados.state,

                        p_postal_code:
                            dados.postal_code || null,

                        p_logo_url:
                            logoUrl

                    }
                );


            if (error) {
                throw error;
            }


            this.atualizarEstadoLocal(
                dados,
                logoUrl,
                data
            );


            if (
                typeof preencherInformacoesFarmacia ===
                "function"
            ) {

                preencherInformacoesFarmacia();

            }


            if (
                typeof preencherLogoFarmacia ===
                "function"
            ) {

                preencherLogoFarmacia(logoUrl);

            }


            UploadLogoFarmacia.limpar();

            this.fechar();


            if (
                typeof mostrarNotificacao ===
                "function"
            ) {

                mostrarNotificacao(
                    "Dados da farmácia atualizados com sucesso.",
                    "sucesso"
                );

            }


        } catch (erro) {

            console.error(
                "Erro ao atualizar a farmácia:",
                erro
            );


            let mensagem =
                "Não foi possível atualizar os dados da farmácia.";


            if (
                typeof traduzirErroSupabase ===
                "function"
            ) {

                mensagem =
                    traduzirErroSupabase(erro) ||
                    mensagem;

            } else if (erro?.message) {

                mensagem = erro.message;

            }


            if (erroFormulario) {
                erroFormulario.textContent = mensagem;
            }


            if (
                typeof mostrarNotificacao ===
                "function"
            ) {

                mostrarNotificacao(
                    mensagem,
                    "erro"
                );

            }


        } finally {

            this.definirSalvando(false);

        }

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