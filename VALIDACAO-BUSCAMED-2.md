# Validação da entrega

## PostgreSQL local

- Migração aplicada duas vezes sem erros.
- Busca com 121 ofertas dentro do raio: oferta promocional de R$ 8 mais distante vence ofertas próximas mais caras.
- Raio menor exclui a oferta fora do limite.
- Paginação cobre 121 ofertas sem duplicação.
- Cidade + UF, acentos e maiúsculas tratados corretamente.
- Farmácia sem coordenadas aparece na cidade e é excluída do raio.
- Farmácia pendente, medicamento sem estoque e medicamento inativo não aparecem.
- Coordenadas incompletas, fora de faixa, NaN, raio inválido e região ausente são rejeitados.
- Usuário público consegue consultar ofertas/cidades pelas funções, sem receber acesso direto à tabela de farmácias no ambiente de teste.
- Usuário não autenticado não executa a função de edição; autenticado altera somente sua farmácia.

## Chromium — integração com respostas simuladas

- Região obrigatória, seleção de cidade e geolocalização.
- Menor preço como destaque, independentemente da distância.
- Carregamento de páginas adicionais e mudança de cidade/UF/raio.
- Localização negada: alternativa manual utilizável.
- Tela de 390 px sem rolagem horizontal.
- Coordenadas existentes carregadas no painel; alteração de endereço limpa posição antiga.
- Latitude/longitude salvas pela função v2 e refletidas no estado do painel.
- Validação de coordenadas, campos incompletos e vírgula decimal.
- Revisão visual dos campos de busca e localização em desktop e celular.
- Sintaxe dos arquivos JavaScript modificados e análise sintática do SQL.

## Limites

Os testes não usaram as contas reais nem a conexão com o Supabase de produção. Após executar o SQL e publicar, faça os testes reais descritos no guia de instalação. Precisão GPS e permissões variam conforme navegador/aparelho; o site mostra a precisão informada pelo aparelho.

A listagem pode mudar quando preços ou estoque mudarem entre páginas. A primeira página sempre consulta os menores preços elegíveis naquele momento.
