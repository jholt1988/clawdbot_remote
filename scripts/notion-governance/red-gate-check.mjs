import {
  ENV,
  requireEnv,
  queryAll,
  notion,
  getSelectName,
  getCheckbox,
  firstRelationId,
} from './_notion.mjs';

requireEnv(['NOTION_API_KEY', 'NOTION_EXECUTION_REQUESTS_DB_ID']);

// If not dry-run AND external AND risk=High, require related project to be Project State = Red.
let blocked = 0;
for await (const page of queryAll(ENV.EXEC_DB)) {
  const props = page.properties;

  const risk = getSelectName(props, 'Risk Level');
  const dryRun = getCheckbox(props, 'Dry Run');
  const targetSystem = getSelectName(props, 'Target System');

  if (dryRun) continue;
  if (targetSystem === 'local') continue;
  if (risk !== 'High') continue;

  const projectId = firstRelationId(props, 'Project');
  if (!projectId) continue;

  const project = await notion.pages.retrieve({ page_id: projectId });
  const projectState = getSelectName(project.properties, 'Project State');

  if (projectState !== 'Red') {
    await notion.pages.update({
      page_id: page.id,
      properties: {
        'Execution Status': { select: { name: 'Blocked — Project Not Red' } },
      },
    });
    blocked++;
  }
}

console.log(JSON.stringify({ ok: true, blocked }, null, 2));
