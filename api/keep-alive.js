const TABLES = ["pharmacies", "medicines", "categories"];

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      ok: false,
      error: "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY",
    });
  }

  try {
    const results = [];

    for (const table of TABLES) {
      results.push(await pingTable(supabaseUrl, supabaseKey, table));
    }

    return res.status(200).json({
      ok: true,
      message: "BuscaMed Supabase keep-alive executado com sucesso.",
      checkedAt: new Date().toISOString(),
      queries: results,
    });
  } catch (error) {
    console.error("Keep-alive error:", error);

    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
