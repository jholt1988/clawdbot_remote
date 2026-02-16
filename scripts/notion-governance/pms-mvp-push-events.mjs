#!/usr/bin/env node
/**
 * Create PMS MVP PUSH calendar blocks and associate 5 tasks per event.
 *
 * Creates 7 events:
 * - Day1-3: 10-12 CT and 2-4 CT
 * - Day4: 10-12 CT
 *
 * Also:
 * - Sets Calendar DB relations: Project + Ticket
 * - Sets Tickets DB relation: Calendar Event
 */

import 'dotenv/config';
import { Client } from '@notionhq/client';

function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
}

function nowCTDateStr() {
  // Approx CT handling: use fixed -06:00 offset (CST). Good enough for Feb 2026.
  const now = new Date();
  const ctMs = now.getTime() - 6 * 60 * 60 * 1000;
  const d = new Date(ctMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00-06:00');
  d.setDate(d.getDate() + days);
  // Return CT date string from that offset date
  const iso = d.toISOString();
  // iso is UTC; but we want the CT calendar day implied by -06
  const ctMs = d.getTime();
  const ct = new Date(ctMs - (d.getTimezoneOffset() * 60 * 1000));
  // fallback: derive from d shifted -6 again
  const shifted = new Date(d.getTime() - 6 * 60 * 60 * 1000);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ctRange(dateStr, startHHMM, endHHMM) {
  const start = `${dateStr}T${startHHMM}:00-06:00`;
  const end = `${dateStr}T${endHHMM}:00-06:00`;
  return { start, end };
}

function title(content) {
  return { title: [{ text: { content: String(content).slice(0, 200) } }] };
}

function select(name) {
  return { select: { name } };
}

function relation(ids) {
  return { relation: (ids || []).map((id) => ({ id })) };
}

function dateRange({ start, end }) {
  return { date: { start, end } };
}

async function getDataSourceId(notion, database_id) {
  const db = await notion.databases.retrieve({ database_id });
  const dsId = db.data_sources?.[0]?.id;
  if (!dsId) throw new Error(`Missing data_source_id for database ${database_id}`);
  return dsId;
}

async function findTicketsByTaskIds(notion, ticketsDsId, taskIds) {
  const map = new Map();
  for (const taskId of taskIds) {
    const resp = await notion.dataSources.query({
      data_source_id: ticketsDsId,
      page_size: 5,
      filter: { property: 'Task ID', rich_text: { contains: taskId } },
    });
    const page = resp.results?.[0];
    if (!page) throw new Error(`Ticket not found for Task ID: ${taskId}`);
    map.set(taskId, page.id);
  }
  return map;
}

async function main() {
  requireEnv([
    'NOTION_API_KEY',
    'NOTION_TICKETS_DB_ID',
    'NOTION_CALENDAR_EVENTS_DB_ID',
    'NOTION_PMS_PROJECT_PAGE_ID',
  ]);

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  const ticketsDbId = process.env.NOTION_TICKETS_DB_ID;
  const calDbId = process.env.NOTION_CALENDAR_EVENTS_DB_ID;
  const ticketsDsId = await getDataSourceId(notion, ticketsDbId);

  const startDateCT = nowCTDateStr();

  const events = [
    { day: 1, block: 1, range: ctRange(startDateCT, '10:00', '12:00') },
    { day: 1, block: 2, range: ctRange(startDateCT, '14:00', '16:00') },
    { day: 2, block: 1, range: ctRange(addDays(startDateCT, 1), '10:00', '12:00') },
    { day: 2, block: 2, range: ctRange(addDays(startDateCT, 1), '14:00', '16:00') },
    { day: 3, block: 1, range: ctRange(addDays(startDateCT, 2), '10:00', '12:00') },
    { day: 3, block: 2, range: ctRange(addDays(startDateCT, 2), '14:00', '16:00') },
    { day: 4, block: 1, range: ctRange(addDays(startDateCT, 3), '10:00', '12:00') },
  ];

  // Vary task sets by day (5 per event). Adjust as needed.
  const taskSets = {
    1: ['PMS-A-02', 'PMS-A-03', 'PMS-A-01', 'PMS-E-01', 'PMS-E-02'],
    2: ['PMS-A-04', 'PMS-A-05', 'PMS-A-06', 'PMS-A-11', 'PMS-A-07'],
    3: ['PMS-PAY-01', 'PMS-PAY-02', 'PMS-PAY-03', 'PMS-PRIC-01', 'PMS-PRIC-03'],
    4: ['PMS-PAY-05', 'PMS-PAY-06', 'PMS-B-01', 'PMS-B-02', 'PMS-F-01'],
  };

  const out = { ok: true, startDateCT, created: [] };

  for (const ev of events) {
    const taskIds = taskSets[ev.day];
    const ticketMap = await findTicketsByTaskIds(notion, ticketsDsId, taskIds);
    const ticketPageIds = Array.from(ticketMap.values());

    const name = `PMS MVP PUSH — Day ${ev.day} Block ${ev.block} (${ev.range.start.slice(0, 10)} CT)`;

    // Create calendar event page
    const calPage = await notion.pages.create({
      parent: { database_id: calDbId },
      properties: {
        Name: title(name),
        When: dateRange(ev.range),
        Source: select('Human'),
        Project: relation([process.env.NOTION_PMS_PROJECT_PAGE_ID]),
        Ticket: relation(ticketPageIds),
      },
    });

    // Back-link on each ticket
    for (const pid of ticketPageIds) {
      // Append relation (Notion relation properties accept multiple)
      await notion.pages.update({
        page_id: pid,
        properties: {
          'Calendar Event': relation([calPage.id]),
        },
      });
    }

    out.created.push({
      day: ev.day,
      block: ev.block,
      calEventId: calPage.id,
      calEventUrl: calPage.url,
      when: ev.range,
      tasks: taskIds,
    });
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2));
  process.exit(1);
});
