import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'node:crypto';
import { Client } from '@notionhq/client';
import { executionQueue, governanceQueue, connection } from './infra/queue.mjs';
import { validateIngressEvent, extractEventId } from './event-validate.mjs';
import { seenEvent } from './replay-protect.mjs';

const app = express();
app.use(bodyParser.json());

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  // Runtime query may use dataSources endpoints depending on @notionhq/client.
  // Do not force an old Notion API version here.
});

function verifySignature(req) {
  const sig = req.headers['x-signature'];
  if (!sig) return false;
  const payload = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET || '')
    .update(payload)
    .digest('hex');
  return sig === expected;
}

app.post('/webhook/notion', async (req, res) => {
  try {
    if (!verifySignature(req)) return res.status(401).json({ error: 'bad_signature' });

    const event = req.body;
    const v = validateIngressEvent(event);
    if (!v.ok) return res.status(400).json({ error: 'invalid_event', details: v.errors });

    const eventId = extractEventId(req, event);
    const replay = await seenEvent(connection, eventId, 300);
    if (replay.deduped) return res.json({ ok: true, deduped: true });

    if (event?.type === 'permit.updated') {
      const permitId = event?.data?.page_id;
      if (!permitId) return res.status(400).json({ error: 'missing_permit_id' });

      // Webhook handler is enqueue-only.
      // We *lightly* check status to reduce queue noise, but worker re-validates.
      const permit = await notion.pages.retrieve({ page_id: permitId });
      const status = permit.properties?.Status?.select?.name;

      if (status === 'Approved') {
        await executionQueue.add(
          'execute-permit',
          { permitId },
          {
            jobId: permitId,
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
          },
        );
      }
    }

    if (event?.type === 'ticket.updated') {
      const ticketId = event?.data?.page_id;
      if (!ticketId) return res.status(400).json({ error: 'missing_ticket_id' });

      await governanceQueue.add(
        'ticket-updated',
        { ticketId },
        {
          jobId: `${eventId || ''}:${ticketId}`.slice(0, 180),
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
    }

    res.json({ ok: true });
  } catch (e) {
    // never leak secrets; keep error minimal
    console.error('Ingress error:', e?.message || e);
    res.status(500).json({ error: 'ingress_failed' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Ingress listening on :${port}`));
