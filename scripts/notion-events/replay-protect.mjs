// Redis-backed replay protection.
// Uses SET key NX EX ttlSeconds.

export async function seenEvent(connection, eventId, ttlSeconds = 300) {
  if (!connection) return { ok: true, deduped: false, mode: 'no-redis' };
  if (!eventId) return { ok: true, deduped: false, mode: 'no-event-id' };

  const key = `dedupe:event:${eventId}`;
  try {
    const res = await connection.set(key, '1', 'NX', 'EX', ttlSeconds);
    // If res is null, key already exists → dedupe hit.
    return { ok: true, deduped: res === null, mode: 'redis' };
  } catch (e) {
    // Fail-open for ingress to avoid total outage; worker still idempotent by jobId.
    return { ok: false, deduped: false, mode: 'redis-error', error: e?.message || String(e) };
  }
}
