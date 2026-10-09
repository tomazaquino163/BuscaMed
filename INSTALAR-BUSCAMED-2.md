# BuscaMed 2.0 — busca regional pelo menor preço

Esta entrega parte do ZIP “BuscaMed-main (2).zip” e mantém a correção de sessão do painel.

## Instalação

1. Abra `sql/01-buscamed-2.sql`, copie seu conteúdo inteiro e execute no Supabase → SQL Editor. Faça isso **antes** de publicar os novos arquivos.
2. O resultado esperado é execução concluída sem erros. O SQL pode ser executado novamente; cria funções novas sem apagar registros, políticas ou a view existente.
3. No GitHub/Codespaces, copie os arquivos abaixo para as mesmas pastas do projeto. As pastas `painel` e `farmacia` já existem; não crie outra pasta do projeto dentro delas.
4. Faça commit/push e espere o deploy automático da Vercel. Recarregue a página com Ctrl+F5.
5. Entre em cada farmácia → Minha Farmácia → Editar. Confira a localização da loja no mapa e salve. Faça isso também nas farmácias já cadastradas.
6. Teste a busca no celular em `https://buscamed.ong.br` e autorize a localização quando tocar no botão.

### Arquivos para copiar

- `index.html`
- `script.js`
- `geolocalizacao.js` (novo)
- `geolocalizacao.css` (novo)
- `busca-regiao.js` (novo)
- `farmacia/cadastro.html`
- `farmacia/cadastro.js`
- `painel/index.html`
- `painel/farmacia/editar-farmacia.js`

O ZIP contém apenas os arquivos novos/alterados, o SQL e os guias. Mantenha os demais arquivos do seu projeto. Não precisa substituir `config.js`, alterar credenciais, domínio ou cron.

## Como funciona

- Nenhuma permissão de localização é solicitada ao abrir a página: o visitante escolhe a cidade ou toca em “Usar minha localização”.
- A busca por posição usa um raio de 5, 10, 20, 50 ou 100 km. O padrão é 10 km.
- O raio pode incluir cidades vizinhas. A distância é aproximada, em linha reta; não é a quilometragem do trajeto de carro.
- Todas as ofertas elegíveis são ordenadas pelo preço efetivo (incluindo promoção válida) no banco **antes** da paginação. A distância nunca passa à frente do preço.
- A primeira página mostra as 50 ofertas mais baratas; “Mostrar mais ofertas” carrega as seguintes. Uma oferta fora das primeiras 100 linhas originais não fica excluída da comparação.
- As cidades são obtidas das farmácias aprovadas. Cidade + UF evita misturar municípios de estados diferentes; diferenças de acentuação e letras maiúsculas são normalizadas.
- Farmácias sem coordenadas aparecem na busca pela cidade, mas não aparecem na busca por raio. Não se inventam coordenadas a partir do centro da cidade.
- Preços, estoque e aprovação continuam sujeitos aos filtros da view pública atual. A busca continua aceitando nome, princípio ativo, fabricante ou apresentação; confira dosagem e embalagem ao comparar, como no projeto anterior.
- A posição do visitante fica apenas na memória da página, sem ser gravada nas tabelas. Tocar novamente no botão atualiza a posição.
- Se a pessoa negar a permissão, estiver sem localização ou não houver ofertas no raio, a cidade manual continua disponível. Não se amplia o raio silenciosamente.

## Como confirmar a localização de uma farmácia

Se estiver fisicamente na loja, use “Estou na farmácia: usar localização do aparelho”. O navegador pede autorização. Uma localização com imprecisão maior que 200 metros não é aceita para cadastrar a loja.

Se estiver em casa ou na escola, não use a localização do seu aparelho para a farmácia. No Google Maps, localize o endereço da loja, clique com o botão direito no ponto e copie a latitude e a longitude para os campos respectivos. Use o link “Conferir localização no mapa” e verifique a posição antes de salvar.

Os campos aceitam ponto ou vírgula decimal e são opcionais, mas devem ser preenchidos em conjunto. Ao alterar endereço/cidade/UF no formulário, a posição antiga é limpa para que você confirme a nova posição. CEP/bairro também limpam a posição no formulário de edição.

A função `update_own_pharmacy_v2` salva dados e coordenadas na mesma transação e usa o usuário autenticado para selecionar a farmácia. A função antiga permanece disponível.

## Validação antes da apresentação

1. Busque por uma cidade com farmácia aprovada: verifique se o menor preço aparece primeiro.
2. No celular, autorize sua localização e teste 5 e 10 km. Confira o preço e a distância das ofertas.
3. Para a apresentação em Foz, confirme que as farmácias demonstradas têm coordenadas do endereço real. Estando em outra cidade, use a cidade manual para simular a busca de Foz.
4. Negue a localização e confirme que a busca por cidade funciona.
5. Edite uma farmácia já cadastrada, confira/salve suas coordenadas e repita a busca por raio.
6. Cadastre/edite um medicamento no painel para verificar a integração real e a correção de sessão existente.

Os testes locais usaram dados fictícios; não alteraram o Supabase de produção. O SQL foi executado em PostgreSQL local (PGlite), com a view e a função antiga reproduzidas a partir das definições enviadas. As telas foram testadas em Chromium com respostas simuladas do Supabase. Veja `VALIDACAO-BUSCAMED-2.md`.

Para voltar à interface anterior, restaure o commit anterior no GitHub. O SQL é aditivo e não impede o uso da versão anterior. Não é necessário apagar as funções novas para voltar.
