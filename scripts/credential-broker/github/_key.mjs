import fs from 'node:fs/promises';

export async function loadGithubPrivateKeyPem() {
  const inline = process.env.GITHUB_APP_PRIVATE_KEY_PEM;
  if (inline && inline.trim()) return inline;

  const p = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
  if (!p) throw new Error('Missing GITHUB_APP_PRIVATE_KEY_PEM or GITHUB_APP_PRIVATE_KEY_PATH');

  return await fs.readFile(p, 'utf8');
}
