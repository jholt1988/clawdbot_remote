import {
  ENV,
  requireEnv,
  queryAll,
  notion,
  getSelectName,
} from './_notion.mjs';

requireEnv(['NOTION_API_KEY', 'NOTION_PROJECTS_DB_ID', 'NOTION_TICKETS_DB_ID']);

// Heuristic: if tickets under a project span multiple Domains, flag split candidate.
// NOTE: property names assume Tickets DB has select property "Domain" and relation property "Project".

let flagged = 0;
for await (const project of queryAll(ENV.PROJECTS_DB)) {
  const domains = new Set();

  for await (const ticket of queryAll(ENV.TICKETS_DB, {
    filter: {
      property: 'Project',
      relation: { contains: project.id },
    },
  })) {
    const d = getSelectName(ticket.properties, 'Domain');
    if (d) domains.add(d);
    if (domains.size > 1) break;
  }

  if (domains.size > 1) {
    await notion.pages.update({
      page_id: project.id,
      properties: {
        'Project Split Flag': { checkbox: true },
      },
    });
    flagged++;
  }
}

console.log(JSON.stringify({ ok: true, flagged }, null, 2));
