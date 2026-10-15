const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  }
});

function validClientId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9-]{8,80}$/.test(value);
}

function validateProgress(progress) {
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) return false;
  if (!Number.isInteger(progress.step) || progress.step < 0 || progress.step > 50) return false;
  if (typeof progress.completed !== 'boolean') return false;
  if (typeof progress.bookmarked !== 'boolean') return false;
  if (typeof progress.repetitionDone !== 'boolean') return false;
  const raw = JSON.stringify(progress);
  return raw.length <= 20000;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'D1-bindingen DB saknas.' }, 503);
  const clientId = request.headers.get('X-Larsparet-Client');
  if (!validClientId(clientId)) return json({ error: 'Ogiltigt klient-ID.' }, 400);

  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare(
        'SELECT progress_json, updated_at FROM poc_progress WHERE client_id = ?1'
      ).bind(clientId).first();
      return json({
        progress: row ? JSON.parse(row.progress_json) : null,
        updatedAt: row ? row.updated_at : null
      });
    }

    if (request.method === 'PUT') {
      const contentLength = Number(request.headers.get('content-length') || 0);
      if (contentLength > 25000) return json({ error: 'Begäran är för stor.' }, 413);
      const body = await request.json();
      if (!validateProgress(body.progress)) return json({ error: 'Progressionsdata är ogiltig.' }, 400);
      const updatedAt = new Date().toISOString();
      await env.DB.prepare(`
        INSERT INTO poc_progress (client_id, app_version, progress_json, updated_at)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(client_id) DO UPDATE SET
          app_version = excluded.app_version,
          progress_json = excluded.progress_json,
          updated_at = excluded.updated_at
      `).bind(clientId, String(body.appVersion || '6').slice(0, 20), JSON.stringify(body.progress), updatedAt).run();
      return json({ ok: true, updatedAt });
    }

    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM poc_progress WHERE client_id = ?1').bind(clientId).run();
      return json({ ok: true });
    }

    return json({ error: 'Metoden stöds inte.' }, 405);
  } catch (error) {
    console.error('progress_api_error', error);
    return json({ error: 'Databasoperationen misslyckades.' }, 500);
  }
}
