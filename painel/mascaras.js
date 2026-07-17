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
            /^(\d{5})(\d{1,3})$/,
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
            /^(\d{2})(\d{4})(\d{1,4})$/,
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
            /^(\d{2})(\d{5})(\d{1,4})$/,
            "($1) $2-$3"
        );

    },


    formatarCNPJ(valor) {

        const numeros = this.somenteNumeros(valor).slice(0, 14);

        if (!numeros) {
            return "";
        }

        if (numeros.length <= 2) return numeros;

        if (numeros.length <= 5)
            return numeros.replace(/^(\d{2})(\d+)/, "$1.$2");

        if (numeros.length <= 8)
            return numeros.replace(
                /^(\d{2})(\d{3})(\d+)/,
                "$1.$2.$3"
            );

        if (numeros.length <= 12)
            return numeros.replace(
                /^(\d{2})(\d{3})(\d{3})(\d+)/,
                "$1.$2.$3/$4"
            );

        return numeros.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            "$1.$2.$3/$4-$5"
        );

    }

};