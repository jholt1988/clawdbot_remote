// Compatibility query helper for @notionhq/client.
//
// Older client versions exposed `notion.databases.query({ database_id, ... })`.
// Newer versions (Data Sources) expose `notion.dataSources.query({ data_source_id, ... })`.
//
// This helper accepts a Notion *database_id* and transparently queries via the right surface.

export async function resolveDataSourceId(notion, database_id) {
  const db = await notion.databases.retrieve({ database_id });
  const ds = db?.data_sources?.[0];
  return ds?.id || null;
}

export async function* queryAll(notion, database_id, { page_size = 50, ...query } = {}) {
  let cursor = undefined;

  const hasDbQuery = typeof notion?.databases?.query === 'function';
  const dataSourceId = hasDbQuery ? null : await resolveDataSourceId(notion, database_id);

  for (;;) {
    const payload = {
      page_size,
      start_cursor: cursor,
      ...query,
    };

    const res = hasDbQuery
      ? await notion.databases.query({ database_id, ...payload })
      : await notion.dataSources.query({ data_source_id: dataSourceId, ...payload });

    for (const r of res.results) yield r;
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
}
