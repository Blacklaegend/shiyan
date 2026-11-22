export async function onRequest(context) {
  const { request, env } = context;
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 binding DB is missing' }), { status: 500, headers: cors });
  }

  const site = 'shiyan';

  try {
    if (request.method === 'POST') {
      const row = await env.DB.prepare(
        "INSERT INTO counters (site, count, updated_at) VALUES (?1, 1, datetime('now')) " +
        "ON CONFLICT(site) DO UPDATE SET count = count + 1, updated_at = datetime('now') " +
        "RETURNING count"
      ).bind(site).first();
      return new Response(JSON.stringify({ count: Number(row?.count || 0) }), { status: 200, headers: cors });
    }

    const row = await env.DB.prepare(
      'SELECT count FROM counters WHERE site = ?1'
    ).bind(site).first();
    return new Response(JSON.stringify({ count: Number(row?.count || 0) }), { status: 200, headers: cors });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 500, headers: cors });
  }
}
