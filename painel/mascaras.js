"use strict";

const Mascaras = {

    somenteNumeros(valor) {

        return (valor || "").replace(/\D/g, "");

    },


    formatarCEP(valor) {

        const numeros = this.somenteNumeros(valor).slice(0, 8);

        if (!numeros) {
            return "";
        }

        if (numeros.length <= 5) {
            return numeros;
        }

        return numeros.replace(
            /^(\d{5})(\d{3})$/,
            "$1-$2"
        );

    },


    formatarTelefone(valor) {

        const numeros = this.somenteNumeros(valor).slice(0, 10);

        if (!numeros) {
            return "";
        }

        if (numeros.length <= 2) {
            return `(${numeros}`;
        }

        if (numeros.length <= 6) {
            return numeros.replace(
                /^(\d{2})(\d+)/,
                "($1) $2"
            );
        }

        return numeros.replace(
            /^(\d{2})(\d{4})(\d{4})$/,
            "($1) $2-$3"
        );

    },


    formatarWhatsApp(valor) {

        const numeros = this.somenteNumeros(valor).slice(0, 11);

        if (!numeros) {
            return "";
        }

        if (numeros.length <= 2) {
            return `(${numeros}`;
        }

        if (numeros.length <= 7) {
            return numeros.replace(
                /^(\d{2})(\d+)/,
                "($1) $2"
            );
        }

        return numeros.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );

    },


    formatarCNPJ(valor) {

        const numeros = this.somenteNumeros(valor).slice(0, 14);

        if (!numeros) {
            return "";
        }

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 5) {

            return numeros.replace(
                /^(\d{2})(\d+)/,
                "$1.$2"
            );

        }

        if (numeros.length <= 8) {

            return numeros.replace(
                /^(\d{2})(\d{3})(\d+)/,
                "$1.$2.$3"
            );

        }

        if (numeros.length <= 12) {

            return numeros.replace(
                /^(\d{2})(\d{3})(\d{3})(\d+)/,
                "$1.$2.$3/$4"
            );

        }

        return numeros.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            "$1.$2.$3/$4-$5"
        );

    },


    limparCEP(valor) {

        return this.somenteNumeros(valor).slice(0, 8);

    },


    limparTelefone(valor) {

        return this.somenteNumeros(valor).slice(0, 10);

    },


    limparWhatsApp(valor) {

        return this.somenteNumeros(valor).slice(0, 11);

    },


    limparCNPJ(valor) {

        return this.somenteNumeros(valor).slice(0, 14);

    },

    formatarNome(valor) {

    const texto = (valor || "").trim();

    if (!texto) {
        return "";
    }

    const palavrasMinusculas = new Set([
        "da",
        "das",
        "de",
        "do",
        "dos",
        "e"
    ]);

    const siglasConhecidas = new Set([
        "UPA",
        "UBS",
        "SUS",
        "LTDA",
        "ME",
        "EPP"
    ]);

    return texto
        .split(/\s+/)
        .map((palavra, indice) => {

            const palavraLimpa = palavra
                .replace(/[.,;:!?()]/g, "");

            const pontuacaoFinal =
                palavra.slice(palavraLimpa.length);

            const maiuscula =
                palavraLimpa.toLocaleUpperCase("pt-BR");

            const minuscula =
                palavraLimpa.toLocaleLowerCase("pt-BR");

            if (siglasConhecidas.has(maiuscula)) {
                return maiuscula + pontuacaoFinal;
            }

            if (
                indice > 0 &&
                palavrasMinusculas.has(minuscula)
            ) {
                return minuscula + pontuacaoFinal;
            }

            return (
                minuscula
                    .charAt(0)
                    .toLocaleUpperCase("pt-BR") +
                minuscula.slice(1) +
                pontuacaoFinal
            );

        })
        .join(" ");

},

};