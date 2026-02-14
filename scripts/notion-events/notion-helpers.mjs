export function getText(prop) {
  const rt = prop?.rich_text || prop?.title;
  if (!rt || rt.length === 0) return '';
  return rt.map((x) => x.plain_text).join('');
}

export function getSelectName(prop) {
  return prop?.select?.name || null;
}

export function getCheckbox(prop) {
  return !!prop?.checkbox;
}

export function getRelationId(prop) {
  const rel = prop?.relation;
  if (!rel || rel.length === 0) return null;
  return rel[0].id;
}

export function getMultiSelectNames(prop) {
  return (prop?.multi_select || []).map((s) => s.name);
}
