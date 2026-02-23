/**
 * Agent-Pack Notion Integration
 * 
 * Phase 4: Connects to real CEEG/TEA via Notion
 * - Creates ERQs in Notion Execution Requests DB
 * - Creates EXPs in Notion Execution Permits DB
 * - Polls for approval status
 * 
 * Usage:
 *   import { submitERQToNotion, requestEXPFromNotion } from './agent-pack-notion';
 */

import { Client } from '@notionhq/client';

// Notion configuration
const NOTION = {
  apiKey: process.env.NOTION_API_KEY,
  executionRequestsDB: process.env.NOTION_EXECUTION_REQUESTS_DB_ID,
  executionPermitsDB: process.env.NOTION_EXECUTION_PERMITS_DB_ID,
};

let notionClient: InstanceType<typeof Client> | null = null;
let requestsDbSchema: any = null;
let permitsDbSchema: any = null;

async function getNotionClient() {
  if (!notionClient && NOTION.apiKey) {
    notionClient = new Client({ auth: NOTION.apiKey });
  }
  return notionClient;
}

async function getRequestsDbSchema() {
  if (!requestsDbSchema && NOTION.executionRequestsDB) {
    const notion = await getNotionClient();
    if (notion) {
      requestsDbSchema = await notion.databases.retrieve({ database_id: NOTION.executionRequestsDB });
    }
  }
  return requestsDbSchema;
}

async function getPermitsDbSchema() {
  if (!permitsDbSchema && NOTION.executionPermitsDB) {
    const notion = await getNotionClient();
    if (notion) {
      permitsDbSchema = await notion.databases.retrieve({ database_id: NOTION.executionPermitsDB });
    }
  }
  return permitsDbSchema;
}

// Helper: check if property exists
function dbHas(dbSchema: any, propName: string): boolean {
  return !!dbSchema?.properties?.[propName];
}

/**
 * Submit ERQ to Notion Execution Requests DB
 */
export async function submitERQToNotion(erq: {
  erq_id: string;
  task: string;
  label?: string;
  risk_level: string;
  side_effects_declared: string[];
  target_system: string;
  target_environment: string;
}): Promise<{ success: boolean; notionPageId?: string; error?: string }> {
  const notion = await getNotionClient();
  const dbSchema = await getRequestsDbSchema();
  
  if (!notion || !dbSchema) {
    console.log(`[Notion] No client or DB - skipping (dev mode)`);
    return { success: true };
  }

  // Dynamic property mapping (like existing scripts)
  const props: any = {};
  
  // Always set Name/title
  props['Name'] = { title: [{ text: { content: erq.task } }] };
  
  if (dbHas(dbSchema, 'Intent Summary')) {
    props['Intent Summary'] = { rich_text: [{ text: { content: erq.task } }] };
  }
  if (dbHas(dbSchema, 'Task')) {
    props['Task'] = { rich_text: [{ text: { content: erq.task } }] };
  }
  if (dbHas(dbSchema, 'Label') && erq.label) {
    props['Label'] = { rich_text: [{ text: { content: erq.label } }] };
  }
  if (dbHas(dbSchema, 'Risk Level')) {
    props['Risk Level'] = { select: { name: erq.risk_level } };
  }
  if (dbHas(dbSchema, 'Side Effects Declared')) {
    props['Side Effects Declared'] = { multi_select: erq.side_effects_declared.map(s => ({ name: s })) };
  }
  if (dbHas(dbSchema, 'Target System')) {
    props['Target System'] = { select: { name: erq.target_system } };
  }
  if (dbHas(dbSchema, 'Target Environment')) {
    props['Target Environment'] = { select: { name: erq.target_environment } };
  }
  if (dbHas(dbSchema, 'Status')) {
    props['Status'] = { select: { name: 'Pending Review' } };
  }
  if (dbHas(dbSchema, 'ERQ ID')) {
    props['ERQ ID'] = { rich_text: [{ text: { content: erq.erq_id } }] };
  }

  try {
    const page = await notion.pages.create({
      parent: { database_id: NOTION.executionRequestsDB! },
      properties: props,
    });

    console.log(`[Notion] ERQ created: ${page.id}`);
    return { success: true, notionPageId: page.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Notion] ERQ create failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Request EXP (Execution Permit) from Notion
 */
export async function requestEXPFromNotion(exp: {
  exp_id: string;
  pack_id: string;
  task_count: number;
  risk_summary: { low: number; medium: number; high: number; critical: number };
  target_systems: string[];
}): Promise<{ success: boolean; notionPageId?: string; status?: string; error?: string }> {
  const notion = await getNotionClient();
  const dbSchema = await getPermitsDbSchema();
  
  if (!notion || !dbSchema) {
    console.log(`[Notion] No client or DB - skipping (dev mode)`);
    return { success: true, status: 'auto-approved' };
  }

  // Check if any high/critical tasks - if so, require manual review
  const hasHighRisk = exp.risk_summary.high > 0 || exp.risk_summary.critical > 0;
  const status = hasHighRisk ? 'Pending Review' : 'Approved';

  // Dynamic property mapping
  const props: any = {};
  
  if (dbHas(dbSchema, 'Name')) {
    props['Name'] = { title: [{ text: { content: `EXP: ${exp.pack_id}` } }] };
  }
  if (dbHas(dbSchema, 'EXP ID')) {
    props['EXP ID'] = { rich_text: [{ text: { content: exp.exp_id } }] };
  }
  if (dbHas(dbSchema, 'Pack ID')) {
    props['Pack ID'] = { rich_text: [{ text: { content: exp.pack_id } }] };
  }
  if (dbHas(dbSchema, 'Task Count')) {
    props['Task Count'] = { number: exp.task_count };
  }
  if (dbHas(dbSchema, 'Low Risk')) {
    props['Low Risk'] = { number: exp.risk_summary.low };
  }
  if (dbHas(dbSchema, 'Medium Risk')) {
    props['Medium Risk'] = { number: exp.risk_summary.medium };
  }
  if (dbHas(dbSchema, 'High Risk')) {
    props['High Risk'] = { number: exp.risk_summary.high };
  }
  if (dbHas(dbSchema, 'Critical Risk')) {
    props['Critical Risk'] = { number: exp.risk_summary.critical };
  }
  if (dbHas(dbSchema, 'Target Systems')) {
    props['Target Systems'] = { multi_select: exp.target_systems.map(s => ({ name: s })) };
  }
  if (dbHas(dbSchema, 'Status')) {
    props['Status'] = { select: { name: status } };
  }

  try {
    const page = await notion.pages.create({
      parent: { database_id: NOTION.executionPermitsDB! },
      properties: props,
    });

    console.log(`[Notion] EXP created: ${page.id} (${status})`);
    return { success: true, notionPageId: page.id, status };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Notion] EXP create failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Poll Notion for ERQ approval status
 */
export async function pollERQStatus(notionPageId: string, maxAttempts = 20): Promise<{
  approved: boolean;
  status: string;
}> {
  const notion = await getNotionClient();
  
  if (!notion) {
    return { approved: true, status: 'dev-mode' };
  }

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const page = await notion.pages.retrieve({ page_id: notionPageId });
      const props = (page as any).properties;
      const status = props['Status']?.select?.name || 'Unknown';
      
      console.log(`[Notion] ERQ ${notionPageId}: ${status}`);
      
      if (status === 'Approved') return { approved: true, status };
      if (status === 'Rejected') return { approved: false, status };
      
      await new Promise(r => setTimeout(r, 5000)); // Poll every 5s
    } catch (error) {
      console.error(`[Notion] Poll error: ${error}`);
      break;
    }
  }

  return { approved: false, status: 'Timeout' };
}

/**
 * Update ERQ status in Notion
 */
export async function updateERQStatus(
  notionPageId: string,
  status: 'Approved' | 'Rejected' | 'Executing' | 'Completed' | 'Failed'
): Promise<boolean> {
  const notion = await getNotionClient();
  const dbSchema = await getRequestsDbSchema();
  
  if (!notion) return true;

  try {
    const props: any = {};
    if (dbHas(dbSchema, 'Status')) {
      props['Status'] = { select: { name: status } };
    }
    
    await notion.pages.update({
      page_id: notionPageId,
      properties: props,
    });
    console.log(`[Notion] ERQ ${notionPageId} → ${status}`);
    return true;
  } catch (error) {
    console.error(`[Notion] Update failed: ${error}`);
    return false;
  }
}
