export function validateIngressEvent(event) {
  const errors = [];
  if (!event || typeof event !== 'object') {
    return { ok: false, errors: ['event_not_object'] };
  }
  if (typeof event.type !== 'string') errors.push('missing_type');
  if (!event.data || typeof event.data !== 'object') errors.push('missing_data');
  if (event.type === 'permit.updated') {
    if (typeof event?.data?.page_id !== 'string' || !event.data.page_id) errors.push('missing_page_id');
  }
  // Only allow known event types for now.
  const allowed = new Set(['permit.updated']);
  if (typeof event.type === 'string' && !allowed.has(event.type)) errors.push('unsupported_type');

  return { ok: errors.length === 0, errors };
}

export function extractEventId(req, event) {
  // Prefer explicit idempotency key header, then event payload fields.
  const headerId = req.headers['x-event-id'];
  if (typeof headerId === 'string' && headerId.trim()) return headerId.trim();

  const payloadId = event?.event_id || event?.id || event?.data?.event_id;
  if (typeof payloadId === 'string' && payloadId.trim()) return payloadId.trim();

  // Fallback: permit.updated can use page_id+type+updated_at if present.
  if (event?.type === 'permit.updated' && typeof event?.data?.page_id === 'string') {
    const t = event?.data?.updated_at || event?.data?.timestamp || '';
    return `${event.type}:${event.data.page_id}:${t}`;
  }

  return null;
}
