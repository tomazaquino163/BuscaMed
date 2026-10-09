/* Coordenadas nunca são obtidas sem uma ação explícita do usuário. */
window.BuscaGeo = {
    coordenada(valor, limite) {
        if (valor === null || valor === undefined || String(valor).trim() === '') return null;
        const numero = Number(String(valor).trim().replace(',', '.'));
        if (!Number.isFinite(numero) || Math.abs(numero) > limite) throw new Error('Coordenadas inválidas.');
        return numero;
    },
    separarCoordenadas(valor) {
        const texto = String(valor ?? '').trim();
        if (!texto) return { latitude: null, longitude: null };
        // Formato do Maps: latitude, longitude; sinais e casas decimais preservados.
        const partes = texto.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
        if (!partes) throw new Error('Cole os dois números do Maps, separados por vírgula. Exemplo: -23.293357744559383, -50.073091540406544');
        return { latitude: this.coordenada(partes[1], 90), longitude: this.coordenada(partes[2], 180) };
    },
    lerCampos() {
        if (this.capturando) throw new Error('Aguarde a localização terminar antes de salvar.');
        const campoUnico = document.getElementById('geo-coordenadas');
        const valores = campoUnico ? this.separarCoordenadas(campoUnico.value) : {
            latitude: this.coordenada(document.getElementById('geo-latitude').value, 90),
            longitude: this.coordenada(document.getElementById('geo-longitude').value, 180)
        };
        const { latitude, longitude } = valores;
        document.getElementById('geo-latitude').value = latitude ?? '';
        document.getElementById('geo-longitude').value = longitude ?? '';
        if ((latitude === null) !== (longitude === null)) throw new Error('Preencha latitude e longitude, ou deixe ambas vazias.');
        return { latitude, longitude };
    },
    preencher(latitude, longitude) {
        this.versaoCampos = (this.versaoCampos || 0) + 1;
        document.getElementById('geo-latitude').value = latitude ?? '';
        document.getElementById('geo-longitude').value = longitude ?? '';
        const campoUnico = document.getElementById('geo-coordenadas');
        if (campoUnico) campoUnico.value = latitude != null && longitude != null ? `${latitude}, ${longitude}` : '';
        this.atualizarMapa();
    },
    obterPosicao() {
        return new Promise((resolve, reject) => {
            if (!window.isSecureContext || !navigator.geolocation) {
                reject(new Error('Localização indisponível neste navegador. Use a opção manual.'));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, erro => {
                const mensagens = {
                    1: 'Permissão de localização negada. Use a opção manual ou autorize nas configurações do navegador.',
                    2: 'Não foi possível determinar sua localização. Tente novamente ou use a opção manual.',
                    3: 'A localização demorou a responder. Tente novamente ou use a opção manual.'
                };
                reject(new Error(mensagens[erro.code] || 'Não foi possível obter sua localização.'));
            }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
        });
    },
    atualizarMapa() {
        const link = document.getElementById('geo-mapa');
        if (!link) return;
        try {
            const { latitude, longitude } = this.lerCampos();
            link.hidden = latitude === null;
            if (latitude !== null) link.href = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        } catch (_) { link.hidden = true; }
    },
    iniciarCampos(idsEndereco) {
        const botao = document.getElementById('geo-capturar');
        const status = document.getElementById('geo-status');
        if (!botao) return;
        this.versaoCampos = 0;
        botao.addEventListener('click', async () => {
            if (!window.confirm('Você está fisicamente na farmácia? Só use a localização do aparelho se estiver no endereço da loja. Caso contrário, informe as coordenadas do endereço manualmente.')) return;
            const atual = ++this.versaoCampos;
            this.capturando = true;
            botao.disabled = true;
            status.textContent = 'Obtendo localização da farmácia…';
            try {
                const posicao = await this.obterPosicao();
                if (atual !== this.versaoCampos) return;
                // Aproximações muito amplas não são adequadas para localizar a loja.
                if (posicao.coords.accuracy > 200) throw new Error('Localização imprecisa (mais de 200 m). Tente no celular, próximo à loja, ou informe as coordenadas manualmente.');
                this.capturando = false;
                this.preencher(posicao.coords.latitude.toFixed(7), posicao.coords.longitude.toFixed(7));
                status.textContent = `Posição obtida (precisão aproximada de ${Math.ceil(posicao.coords.accuracy)} m). Confira no mapa antes de salvar.`;
            } catch (erro) {
                if (atual === this.versaoCampos) status.textContent = erro.message;
            } finally { this.capturando = false; botao.disabled = false; this.atualizarMapa(); }
        });
        const idsCoordenadas = document.getElementById('geo-coordenadas')
            ? ['geo-coordenadas'] : ['geo-latitude', 'geo-longitude'];
        for (const id of idsCoordenadas) {
            document.getElementById(id).addEventListener('input', () => {
                this.versaoCampos++;
                status.textContent = "Coordenadas alteradas. Confira no mapa antes de salvar.";
                this.atualizarMapa();
            });
        }
        for (const id of idsEndereco) {
            document.getElementById(id)?.addEventListener('input', () => {
                this.versaoCampos++;
                this.preencher(null, null);
                status.textContent = 'Endereço alterado. Confirme novamente a localização da farmácia antes de salvar.';
            });
        }
    }
};
