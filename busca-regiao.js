window.BuscaRegiao = {
    posicao: null,
    versao: 0,
    cidades: [],
    iniciar() {
        this.cidade = document.getElementById('busca-cidade');
        this.raio = document.getElementById('busca-raio');
        this.campoRaio = document.getElementById('busca-raio-campo');
        this.grade = document.querySelector('.busca-regiao-grade');
        this.exibirRaio(false);
        this.status = document.getElementById('busca-regiao-status');
        this.botao = document.getElementById('usar-localizacao');
        this.cidade.addEventListener('change', () => {
            this.posicao = null;
            this.versao++;
            this.exibirRaio(false);
            this.status.textContent = this.cidade.value ? 'Busca na cidade selecionada, sempre pelo menor preço.' : 'Escolha uma cidade ou use sua localização.';
            this.invalidar();
        });
        this.raio.addEventListener('change', () => {
            this.versao++;
            this.atualizarStatus();
            this.invalidar();
        });
        this.botao.addEventListener('click', () => this.localizar());
        this.carregarCidades();
    },
    invalidar() { document.dispatchEvent(new Event('buscamed:regiao-alterada')); },
    exibirRaio(visivel) {
        this.campoRaio.hidden = !visivel;
        this.raio.disabled = !visivel;
        this.grade.classList.toggle('com-localizacao', visivel);
    },
    atualizarStatus() {
        if (!this.posicao) return;
        this.status.textContent = `Sua localização • raio de ${this.raio.value} km • precisão aproximada de ${Math.ceil(this.posicao.accuracy)} m. Distâncias em linha reta; menor preço em primeiro lugar.`;
    },
    async carregarCidades() {
        try {
            const { data, error } = await supabaseClient.rpc('buscamed_cidades');
            if (error) throw error;
            this.cidades = data || [];
            this.cidade.replaceChildren(new Option('Escolha uma cidade', ''));
            this.cidades.forEach((cidade, indice) => {
                this.cidade.add(new Option(`${cidade.city} — ${cidade.state}`, String(indice)));
            });
            if (!this.posicao) this.status.textContent = this.cidades.length
                ? 'Escolha uma cidade ou use sua localização.'
                : 'Ainda não há cidades com farmácias aprovadas cadastradas.';
        } catch (_) {
            if (!this.posicao) this.status.textContent = 'Não foi possível carregar as cidades. Tente recarregar a página; você também pode usar sua localização.';
        }
    },
    async localizar() {
        const versao = ++this.versao;
        this.posicao = null;
        this.exibirRaio(false);
        this.invalidar();
        this.botao.disabled = true;
        this.status.textContent = 'Obtendo sua localização…';
        try {
            const posicao = await BuscaGeo.obterPosicao();
            if (versao !== this.versao) return;
            this.posicao = posicao.coords;
            this.cidade.value = '';
            this.exibirRaio(true);
            this.atualizarStatus();
            this.invalidar();
        } catch (erro) {
            if (versao === this.versao) this.status.textContent = erro.message;
        } finally { this.botao.disabled = false; }
    },
    parametros() {
        if (this.posicao) return {
            p_city: null, p_state: null,
            p_latitude: this.posicao.latitude, p_longitude: this.posicao.longitude,
            p_raio_km: Number(this.raio.value)
        };
        const cidade = this.cidade.value !== '' ? this.cidades[Number(this.cidade.value)] : null;
        if (!cidade) throw new Error('Escolha uma cidade ou toque em “Usar minha localização”.');
        return { p_city: cidade.city, p_state: cidade.state,
            p_latitude: null, p_longitude: null, p_raio_km: 10 };
    },
    resumo() {
        if (this.posicao) return `No raio de ${this.raio.value} km da sua localização`;
        const cidade = this.cidades[Number(this.cidade.value)];
        return cidade ? `Em ${cidade.city} — ${cidade.state}` : '';
    }
};
document.addEventListener('DOMContentLoaded', () => BuscaRegiao.iniciar());
