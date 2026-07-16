// =====================================
// ELEMENTOS DA PÁGINA
// =====================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


const senha =
    document.getElementById(
        "senha"
    );


const toggleSenha =
    document.getElementById(
        "toggleSenha"
    );


const mensagemLogin =
    document.getElementById(
        "mensagemLogin"
    );


const esqueciSenha =
    document.getElementById(
        "esqueciSenha"
    );


const solicitarCadastro =
    document.getElementById(
        "solicitarCadastro"
    );


// =====================================
// MOSTRAR / OCULTAR SENHA
// =====================================

toggleSenha.addEventListener(

    "click",

    function() {


        if (

            senha.type ===
            "password"

        ) {


            senha.type =
                "text";


            toggleSenha.textContent =
                "🙈";


            toggleSenha.setAttribute(

                "aria-label",

                "Ocultar senha"

            );


        } else {


            senha.type =
                "password";


            toggleSenha.textContent =
                "👁️";


            toggleSenha.setAttribute(

                "aria-label",

                "Mostrar senha"

            );


        }


    }

);


// =====================================
// LOGIN DE DEMONSTRAÇÃO
// =====================================

loginForm.addEventListener(

    "submit",

    function(event) {


        event.preventDefault();


        const email =
            document
                .getElementById(
                    "email"
                )
                .value
                .trim();


        const senhaDigitada =
            senha
                .value
                .trim();


        mensagemLogin
            .className =
            "mensagem-login";


        mensagemLogin
            .textContent =
            "";


        if (

            email ===
            ""

            ||

            senhaDigitada ===
            ""

        ) {


            mensagemLogin
                .textContent =

                "Preencha todos os campos.";


            mensagemLogin
                .classList
                .add(
                    "erro"
                );


            return;


        }


        const botao =
            loginForm
                .querySelector(
                    ".btn-login"
                );


        botao.disabled =
            true;


        botao.textContent =
            "Entrando...";


        mensagemLogin
            .textContent =

            "Verificando acesso...";


        mensagemLogin
            .classList
            .add(
                "sucesso"
            );


        setTimeout(

            function() {


                mensagemLogin
                    .textContent =

                    "Área de demonstração em construção.";


                botao.disabled =
                    false;


                botao.textContent =
                    "Entrar";


            },

            1200

        );


    }

);


// =====================================
// ESQUECI MINHA SENHA
// =====================================

esqueciSenha.addEventListener(

    "click",

    function(event) {


        event.preventDefault();


        alert(

            "A recuperação de senha será disponibilizada quando o sistema de login estiver conectado ao banco de dados."

        );


    }

);


// =====================================
// SOLICITAR CADASTRO
// =====================================

solicitarCadastro.addEventListener(

    "click",

    function(event) {


        event.preventDefault();


        alert(

            "O cadastro de novas farmácias será disponibilizado em uma próxima etapa."

        );


    }

);