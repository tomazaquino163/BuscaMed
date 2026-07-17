"use strict";

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

        if (
            typeof UploadLogoFarmacia !== "undefined" &&
            typeof UploadLogoFarmacia.inicializar === "function"
        ) {
            UploadLogoFarmacia.inicializar();
        }

    },


    /* ==================================================
       MAPEAMENTO DOS ELEMENTOS
    ================================================== */

    mapearElementos() {

        this.elementos = {

            botaoAbrir:
                document.getElementById(
                    "botao-editar-farmacia"
                ),

            modal:
                document.getElementById(
                    "modal-editar-farmacia"
                ),

            formulario:
                document.getElementById(
                    "formulario-editar-farmacia"
                ),

            botaoSalvar:
                document.getElementById(
                    "botao-salvar-farmacia"
                ),

            botoesFechar:
                document.querySelectorAll(
                    "[data-fechar-edicao-farmacia]"
                ),

            nomeFantasia:
                document.getElementById(
                    "editar-nome-fantasia"
                ),

            razaoSocial:
                document.getElementById(
                    "editar-razao-social"
                ),

            cnpj:
                document.getElementById(
                    "editar-cnpj"
                ),

            responsavel:
                document.getElementById(
                    "editar-responsavel"
                ),

            emailComercial:
                document.getElementById(
                    "editar-email-comercial"
                ),

            telefone:
                document.getElementById(
                    "editar-telefone"
                ),

            whatsapp:
                document.getElementById(
                    "editar-whatsapp"
                ),

            endereco:
                document.getElementById(
                    "editar-endereco"
                ),

            bairro:
                document.getElementById(
                    "editar-bairro"
                ),

            cidade:
                document.getElementById(
                    "editar-cidade"
                ),

            estado:
                document.getElementById(
                    "editar-estado"
                ),

            cep:
                document.getElementById(
                    "editar-cep"
                ),

            erroFormulario:
                document.getElementById(
                    "erro-formulario-farmacia"
                )

        };

    },


    /* ==================================================
       EVENTOS
    ================================================== */

    adicionarEventos() {

        const {
            botaoAbrir,
            formulario,
            modal,
            botoesFechar,
            telefone,
            whatsapp,
            cep
        } = this.elementos;


        botaoAbrir?.addEventListener("click", () => {

            this.abrir();

        });


        formulario?.addEventListener(
            "submit",
            async (evento) => {

                evento.preventDefault();

                await this.salvar();

            }
        );


        telefone?.addEventListener("input", (evento) => {

            evento.target.value =
                Mascaras.formatarTelefone(
                    evento.target.value
                );

        });


        whatsapp?.addEventListener("input", (evento) => {

            evento.target.value =
                Mascaras.formatarWhatsApp(
                    evento.target.value
                );

        });


        cep?.addEventListener("input", (evento) => {

            evento.target.value =
                Mascaras.formatarCEP(
                    evento.target.value
                );

        });


        botoesFechar.forEach((botao) => {

            botao.addEventListener("click", () => {

                this.fechar();

            });

        });


        document.addEventListener(
            "keydown",
            (evento) => {

                if (
                    evento.key === "Escape" &&
                    modal?.classList.contains("aberto")
                ) {
                    this.fechar();
                }

            }
        );

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
        this.limparMensagemErro();


        if (
            typeof UploadLogoFarmacia !== "undefined" &&
            typeof UploadLogoFarmacia.limpar === "function"
        ) {
            UploadLogoFarmacia.limpar();
        }


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
            formulario
        } = this.elementos;


        modal?.classList.remove("aberto");

        document.body.classList.remove("modal-aberto");

        formulario?.reset();


        if (
            typeof UploadLogoFarmacia !== "undefined" &&
            typeof UploadLogoFarmacia.limpar === "function"
        ) {
            UploadLogoFarmacia.limpar();
        }


        this.limparMensagemErro();
        this.limparErrosCampos();

    },


    /* ==================================================
       CARREGAR DADOS ATUAIS
    ================================================== */

    carregarDadosAtuais() {

        this.dadosFarmacia =
            typeof estado !== "undefined"
                ? estado.farmacia
                : null;


        if (!this.dadosFarmacia) {

            console.warn(
                "Os dados da farmácia ainda não foram carregados."
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
            Mascaras.formatarCNPJ(farmacia.cnpj)
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
            Mascaras.formatarTelefone(farmacia.phone)
        );

        this.definirValor(
            this.elementos.whatsapp,
            Mascaras.formatarWhatsApp(farmacia.whatsapp)
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
            Mascaras.formatarCEP(farmacia.postal_code)
        );

    },


    /* ==================================================
       OBTER DADOS DO FORMULÁRIO
    ================================================== */

    obterDadosFormulario() {

        const {
            nomeFantasia,
            responsavel,
            emailComercial,
            telefone,
            whatsapp,
            endereco,
            bairro,
            cidade,
            estado,
            cep
        } = this.elementos;


        return {

            trade_name:
                nomeFantasia?.value.trim() || "",

            responsible_name:
                responsavel?.value.trim() || "",

            commercial_email:
                emailComercial?.value.trim() || "",

            phone:
                Mascaras.somenteNumeros(
                    telefone?.value
                ).slice(0, 11),

            whatsapp:
                Mascaras.somenteNumeros(
                    whatsapp?.value
                ).slice(0, 11),

            address:
                endereco?.value.trim() || "",

            neighborhood:
                bairro?.value.trim() || "",

            city:
                cidade?.value.trim() || "",

            state:
                estado?.value
                    .trim()
                    .toUpperCase() || "",

            postal_code:
                Mascaras.somenteNumeros(
                    cep?.value
                ).slice(0, 8)

        };

    },


    /* ==================================================
       VALIDAÇÃO
    ================================================== */

    validarFormulario(dados) {

        this.limparErrosCampos();
        this.limparMensagemErro();


        const camposObrigatorios = [

            {
                valor: dados.trade_name,
                elemento: this.elementos.nomeFantasia,
                mensagem: "Informe o nome fantasia."
            },

            {
                valor: dados.responsible_name,
                elemento: this.elementos.responsavel,
                mensagem: "Informe o nome do responsável."
            },

            {
                valor: dados.commercial_email,
                elemento: this.elementos.emailComercial,
                mensagem: "Informe o e-mail comercial."
            },

            {
                valor: dados.phone,
                elemento: this.elementos.telefone,
                mensagem: "Informe o telefone."
            },

            {
                valor: dados.address,
                elemento: this.elementos.endereco,
                mensagem: "Informe o endereço."
            },

            {
                valor: dados.city,
                elemento: this.elementos.cidade,
                mensagem: "Informe a cidade."
            },

            {
                valor: dados.state,
                elemento: this.elementos.estado,
                mensagem: "Informe o estado."
            }

        ];


        const campoVazio =
            camposObrigatorios.find(
                (campo) => !campo.valor
            );


        if (campoVazio) {

            this.exibirErro(campoVazio.mensagem);
            campoVazio.elemento?.focus();

            return false;

        }


        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                dados.commercial_email
            );


        if (!emailValido) {

            this.exibirErro(
                "Informe um e-mail comercial válido."
            );

            this.elementos.emailComercial?.focus();

            return false;

        }


        if (
            dados.phone.length !== 10 &&
            dados.phone.length !== 11
        ) {

            this.exibirErro(
                "Informe um telefone válido com DDD."
            );

            this.elementos.telefone?.focus();

            return false;

        }


        if (
            dados.whatsapp &&
            dados.whatsapp.length !== 10 &&
            dados.whatsapp.length !== 11
        ) {

            this.exibirErro(
                "Informe um WhatsApp válido com DDD."
            );

            this.elementos.whatsapp?.focus();

            return false;

        }


        if (dados.state.length !== 2) {

            this.exibirErro(
                "Selecione uma sigla de estado válida."
            );

            this.elementos.estado?.focus();

            return false;

        }


        if (
            dados.postal_code &&
            dados.postal_code.length !== 8
        ) {

            this.exibirErro(
                "Informe um CEP válido com 8 números."
            );

            this.elementos.cep?.focus();

            return false;

        }


        return true;

    },


    /* ==================================================
       SALVAR
    ================================================== */

    async salvar() {

        const dados = this.obterDadosFormulario();

        if (!this.validarFormulario(dados)) {
            return;
        }


        this.definirSalvando(true);


        try {

            let logoUrl =
                this.dadosFarmacia?.logo_url || null;


            if (
                typeof UploadLogoFarmacia !== "undefined" &&
                typeof UploadLogoFarmacia.possuiArquivo ===
                "function" &&
                UploadLogoFarmacia.possuiArquivo()
            ) {

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


            this.fechar();


            if (
                typeof mostrarNotificacao === "function"
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
                typeof traduzirErroSupabase === "function"
            ) {

                mensagem =
                    traduzirErroSupabase(erro) ||
                    mensagem;

            } else if (erro?.message) {

                mensagem = erro.message;

            }


            this.exibirErro(mensagem);


            if (
                typeof mostrarNotificacao === "function"
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
       ATUALIZAR ESTADO LOCAL
    ================================================== */

    atualizarEstadoLocal(
        dados,
        logoUrl,
        respostaRpc
    ) {

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

        botao.textContent =
            salvando
                ? "Salvando..."
                : botao.dataset.textoOriginal;

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


    exibirErro(mensagem) {

        if (this.elementos.erroFormulario) {

            this.elementos.erroFormulario.textContent =
                mensagem;

        }

    },


    limparMensagemErro() {

        if (this.elementos.erroFormulario) {

            this.elementos.erroFormulario.textContent = "";

        }

    },


    limparErrosCampos() {

        document
            .querySelectorAll("[data-erro-farmacia]")
            .forEach((elemento) => {

                elemento.textContent = "";

            });

    }

};