const formulario = document.getElementById("form-cadastro");
const botaoCadastrar = document.getElementById("botao-cadastrar");
const mensagemFormulario = document.getElementById(
    "mensagem-formulario"
);

const campos = {
    nome: document.getElementById("nome"),
    cnpj: document.getElementById("cnpj"),
    telefone: document.getElementById("telefone"),
    cidade: document.getElementById("cidade"),
    estado: document.getElementById("estado"),
    endereco: document.getElementById("endereco"),
    email: document.getElementById("email"),
    senha: document.getElementById("senha"),
    confirmarSenha: document.getElementById("confirmar-senha"),
    aceite: document.getElementById("aceite")
};

function somenteNumeros(valor) {
    return valor.replace(/\D/g, "");
}

function formatarCnpj(valor) {
    const numeros = somenteNumeros(valor).slice(0, 14);

    return numeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(valor) {
    const numeros = somenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 10) {
        return numeros
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}

function validarCnpj(cnpj) {
    const numeros = somenteNumeros(cnpj);

    if (
        numeros.length !== 14 ||
        /^(\d)\1+$/.test(numeros)
    ) {
        return false;
    }

    function calcularDigito(base, pesos) {
        const soma = base
            .split("")
            .reduce((total, numero, indice) => {
                return total + Number(numero) * pesos[indice];
            }, 0);

        const resto = soma % 11;

        return resto < 2 ? 0 : 11 - resto;
    }

    const primeiroDigito = calcularDigito(
        numeros.slice(0, 12),
        [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    const segundoDigito = calcularDigito(
        numeros.slice(0, 12) + primeiroDigito,
        [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    return numeros.endsWith(
        `${primeiroDigito}${segundoDigito}`
    );
}

function definirErro(nomeCampo, texto = "") {
    const elementoErro = document.querySelector(
        `[data-erro="${nomeCampo}"]`
    );

    if (elementoErro) {
        elementoErro.textContent = texto;
    }

    const elementos = {
        nome: campos.nome,
        cnpj: campos.cnpj,
        telefone: campos.telefone,
        cidade: campos.cidade,
        estado: campos.estado,
        email: campos.email,
        senha: campos.senha,
        "confirmar-senha": campos.confirmarSenha
    };

    const elemento = elementos[nomeCampo];

    if (elemento) {
        elemento.classList.toggle(
            "invalido",
            Boolean(texto)
        );
    }
}

function limparErros() {
    document
        .querySelectorAll(".erro-campo")
        .forEach((elemento) => {
            elemento.textContent = "";
        });

    document
        .querySelectorAll(".invalido")
        .forEach((elemento) => {
            elemento.classList.remove("invalido");
        });
}

function exibirMensagem(texto, tipo = "") {
    mensagemFormulario.textContent = texto;

    mensagemFormulario.className =
        `mensagem-formulario ${tipo}`.trim();
}

function alterarCarregamento(carregando) {
    botaoCadastrar.disabled = carregando;

    botaoCadastrar.textContent = carregando
        ? "Enviando solicitação..."
        : "Enviar solicitação";
}

function validarFormulario() {
    limparErros();

    let valido = true;

    const nome = campos.nome.value.trim();
    const telefone = somenteNumeros(
        campos.telefone.value
    );
    const cidade = campos.cidade.value.trim();
    const email = campos.email.value.trim();
    const senha = campos.senha.value;
    const confirmarSenha = campos.confirmarSenha.value;

    if (nome.length < 3) {
        definirErro(
            "nome",
            "Informe o nome da farmácia."
        );

        valido = false;
    }

    if (!validarCnpj(campos.cnpj.value)) {
        definirErro(
            "cnpj",
            "Informe um CNPJ válido."
        );

        valido = false;
    }

    if (telefone.length < 10) {
        definirErro(
            "telefone",
            "Informe um telefone válido."
        );

        valido = false;
    }

    if (cidade.length < 2) {
        definirErro(
            "cidade",
            "Informe a cidade."
        );

        valido = false;
    }

    if (!campos.estado.value) {
        definirErro(
            "estado",
            "Selecione o estado."
        );

        valido = false;
    }

    if (
        !email ||
        !campos.email.validity.valid
    ) {
        definirErro(
            "email",
            "Informe um e-mail válido."
        );

        valido = false;
    }

    if (senha.length < 8) {
        definirErro(
            "senha",
            "A senha deve ter pelo menos 8 caracteres."
        );

        valido = false;
    }

    if (senha !== confirmarSenha) {
        definirErro(
            "confirmar-senha",
            "As senhas não são iguais."
        );

        valido = false;
    }

    if (!campos.aceite.checked) {
        definirErro(
            "aceite",
            "Confirme a veracidade dos dados."
        );

        valido = false;
    }

    return valido;
}

async function verificarCnpjExistente(cnpj) {
    const { data, error } = await supabaseClient
        .from("pharmacies")
        .select("id")
        .eq("cnpj", cnpj)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return Boolean(data);
}

async function criarConta(email, senha, nomeFarmacia) {
    const { data, error } =
        await supabaseClient.auth.signUp({
            email,
            password: senha,
            options: {
                data: {
                    full_name: nomeFarmacia,
                    role: "pharmacy"
                }
            }
        });

    if (error) {
        throw error;
    }

    if (!data.user) {
        throw new Error(
            "Não foi possível criar a conta."
        );
    }

    return data;
}

async function cadastrarFarmacia(usuarioId, dados) {
    const { error } = await supabaseClient
        .from("pharmacies")
        .insert({
            owner_user_id: usuarioId,

            legal_name: dados.nome,
            trade_name: dados.nome,

            cnpj: dados.cnpj,

            responsible_name: dados.nome,
            commercial_email: dados.email,

            phone: dados.telefone,
            whatsapp: dados.telefone,

            address: dados.endereco || null,
            neighborhood: null,

            city: dados.cidade,
            state: dados.estado,

            postal_code: null,

            status: "pending"
        });

    if (error) {
        throw error;
    }
}

campos.cnpj.addEventListener("input", () => {
    campos.cnpj.value = formatarCnpj(
        campos.cnpj.value
    );
});

campos.telefone.addEventListener("input", () => {
    campos.telefone.value = formatarTelefone(
        campos.telefone.value
    );
});

document
    .querySelectorAll(".botao-senha")
    .forEach((botao) => {
        botao.addEventListener("click", () => {
            const campo = document.getElementById(
                botao.dataset.alvo
            );

            const estaVisivel =
                campo.type === "text";

            campo.type = estaVisivel
                ? "password"
                : "text";

            botao.textContent = estaVisivel
                ? "Mostrar"
                : "Ocultar";
        });
    });

formulario.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        exibirMensagem("");

        if (!validarFormulario()) {
            exibirMensagem(
                "Revise os campos destacados.",
                "erro"
            );

            return;
        }

        alterarCarregamento(true);

        const dados = {
            nome: campos.nome.value.trim(),
            cnpj: somenteNumeros(
                campos.cnpj.value
            ),
            telefone: somenteNumeros(
                campos.telefone.value
            ),
            cidade: campos.cidade.value.trim(),
            estado: campos.estado.value,
            endereco: campos.endereco.value.trim(),
            email: campos.email.value
                .trim()
                .toLowerCase(),
            senha: campos.senha.value
        };

        try {
            const cnpjExistente =
                await verificarCnpjExistente(
                    dados.cnpj
                );

            if (cnpjExistente) {
                definirErro(
                    "cnpj",
                    "Este CNPJ já está cadastrado."
                );

                throw new Error(
                    "Já existe uma farmácia com este CNPJ."
                );
            }

            const resultado =
                await criarConta(
                    dados.email,
                    dados.senha,
                    dados.nome
                );

            if (!resultado.session) {
                throw new Error(
                    "A conta foi criada, mas o Supabase exige confirmação de e-mail. Desative temporariamente a confirmação de e-mail para concluir o cadastro."
                );
            }

            await cadastrarFarmacia(
                resultado.user.id,
                dados
            );

            await supabaseClient.auth.signOut();

            formulario.reset();
            campos.estado.value = "PR";

            exibirMensagem(
                "Solicitação enviada com sucesso! Aguarde a análise do moderador.",
                "sucesso"
            );
        } catch (erro) {
            console.error(
                "Erro no cadastro:",
                erro
            );

            let mensagem =
                erro.message ||
                "Não foi possível realizar o cadastro.";

            const texto = mensagem.toLowerCase();

            if (
                texto.includes("already registered") ||
                texto.includes("already been registered")
            ) {
                mensagem =
                    "Já existe uma conta com este e-mail.";

                definirErro(
                    "email",
                    mensagem
                );
            }

            if (
                texto.includes("row-level security") ||
                texto.includes("permission denied")
            ) {
                mensagem =
                    "A política de segurança do Supabase não permitiu cadastrar a farmácia.";
            }

            exibirMensagem(
                mensagem,
                "erro"
            );
        } finally {
            alterarCarregamento(false);
        }
    }
);