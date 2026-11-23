
/*
 * CRON JOB - BUSCAMED + BATALHA NAVAL
 * Mantém consultas periódicas aos dois Supabases.
 */

// Tabelas do BuscaMed
const TABLES = ["pharmacies", "medicines", "categories"];

// Verificação do BuscaMed
async function pingTable(baseUrl, apiKey, table) {
  const response = await fetch(
    `${baseUrl}/rest/v1/${table}?select=*&limit=1`,
    {
      method: "GET",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    }
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Falha ao consultar ${table}: HTTP ${response.status} - ${body.slice(0, 300)}`
    );
  }

  return {
    table,
    status: response.status,
  };
}

// Nova verificação: Batalha Naval
async function pingBatalhaNaval(baseUrl, apiKey) {
  const headers = {
    apikey: apiKey,
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  // Chaves anon antigas são JWT.
  // Chaves sb_publishable_ usam apenas apikey.
  if (!apiKey.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(
    `${baseUrl}/rest/v1/rpc/bnc_keepalive`,
    {
      method: "POST",
      headers,
      body: "{}",
      cache: "no-store",
    }
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Falha na Batalha Naval: HTTP ${response.status} - ${body.slice(0, 300)}`
    );
  }

  return {
    project: "Batalha Naval do Conhecimento",
    status: response.status,
    rooms: JSON.parse(body),
  };
}

// Função principal do Cron Job
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      error: "Method Not Allowed",
    });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      ok: false,
      error: "Unauthorized",
    });
  }

  // Configuração BuscaMed
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  // Configuração Batalha Naval
  const bncUrl = process.env.BNC_SUPABASE_URL?.replace(/\/$/, "");
  const bncKey = process.env.BNC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey || !bncUrl || !bncKey) {
    return res.status(500).json({
      ok: false,
      error: "Configuração de Supabase ausente.",
    });
  }

  // Verifica os dois projetos independentemente
  const results = await Promise.allSettled([
    (async () => {
      const queries = [];

      for (const table of TABLES) {
        queries.push(
          await pingTable(supabaseUrl, supabaseKey, table)
        );
      }

      return { project: "BuscaMed", queries };
    })(),

    pingBatalhaNaval(bncUrl, bncKey),
  ]);

  const projects = results.map((result, index) => {
    const name = index === 0 ? "BuscaMed" : "Batalha Naval";

    if (result.status === "fulfilled") {
      return {
        project: name,
        ok: true,
        data: result.value,
      };
    }

    console.error(`${name} keep-alive:`, result.reason);

    return {
      project: name,
      ok: false,
      error: result.reason instanceof Error
        ? result.reason.message
        : "Erro desconhecido",
    };
  });

  const success = projects.every(project => project.ok);

  return res.status(success ? 200 : 500).json({
    ok: success,
    message: success
      ? "BuscaMed e Batalha Naval verificados com sucesso."
      : "Uma ou mais verificações falharam.",
    checkedAt: new Date().toISOString(),
    projects,
  });
}
