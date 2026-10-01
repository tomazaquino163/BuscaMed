# Keep-alive do Supabase - BuscaMed

O projeto possui uma Vercel Function em `/api/keep-alive.js` e um Cron Job configurado no `vercel.json`.

## Agendamento

```text
0 12 * * *
```

A Vercel interpreta o Cron em UTC. Portanto, a execução está configurada para 12:00 UTC, aproximadamente 09:00 no horário de Brasília (UTC-3).

## Variáveis de ambiente na Vercel

No projeto BuscaMed, abra **Settings > Environment Variables** e cadastre:

- `CRON_SECRET`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Use em `SUPABASE_URL` a URL do projeto Supabase.
Use em `SUPABASE_PUBLISHABLE_KEY` a chave publicável do projeto.
Em `CRON_SECRET`, gere uma sequência longa e aleatória.

Marque as variáveis para o ambiente **Production**. Se quiser testar em Preview, marque Preview também.

## Como funciona

Uma vez por dia, a Vercel chama automaticamente:

```text
/api/keep-alive
```

Quando `CRON_SECRET` está configurado, a Vercel envia o cabeçalho de autorização para o Cron. A função valida esse cabeçalho e, se estiver correto, executa três consultas pequenas no Supabase:

- `pharmacies`
- `medicines`
- `categories`

Nenhum dado é alterado. São apenas leituras com `limit=1`.

## Teste manual

A rota é protegida. Abrir `/api/keep-alive` diretamente no navegador deve retornar HTTP 401, o que é esperado.

Para testar com autorização, use PowerShell:

```powershell
$secret = "COLOQUE_AQUI_O_MESMO_CRON_SECRET_DA_VERCEL"
Invoke-RestMethod `
  -Uri "https://buscamed.ong.br/api/keep-alive" `
  -Headers @{ Authorization = "Bearer $secret" }
```

O retorno esperado contém:

```json
{
  "ok": true,
  "message": "BuscaMed Supabase keep-alive executado com sucesso."
}
```

## Conferência na Vercel

Depois do deploy:

1. Abra o projeto BuscaMed na Vercel.
2. Confira se as três variáveis de ambiente estão cadastradas.
3. Faça um novo deploy após cadastrar ou alterar variáveis.
4. Abra a área de Cron Jobs do projeto.
5. Confirme que `/api/keep-alive` aparece com o agendamento diário.
6. Confira os logs da Function depois de uma execução.
