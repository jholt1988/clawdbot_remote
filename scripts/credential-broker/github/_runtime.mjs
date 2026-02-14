import 'dotenv/config';
import { createAppAuth } from '@octokit/auth-app';
import { request } from '@octokit/request';
import { loadGithubPrivateKeyPem } from './_key.mjs';

export async function mintGithubInstallationToken(repoFullName) {
  const [owner, repo] = String(repoFullName || '').split('/');
  if (!owner || !repo) throw new Error('invalid_repo_full_name');

  const appId = process.env.GITHUB_APP_ID;
  if (!appId) throw new Error('missing_env_GITHUB_APP_ID');

  const privateKey = await loadGithubPrivateKeyPem();

  const auth = createAppAuth({
    appId,
    privateKey,
  });

  let installationId = process.env.GITHUB_APP_INSTALLATION_ID
    ? Number(process.env.GITHUB_APP_INSTALLATION_ID)
    : null;

  if (!installationId) {
    const appAuthentication = await auth({ type: 'app' });
    const res = await request('GET /repos/{owner}/{repo}/installation', {
      owner,
      repo,
      headers: {
        authorization: `Bearer ${appAuthentication.token}`,
        'x-github-api-version': '2022-11-28',
      },
    });
    installationId = res.data.id;
  }

  const installationAuthentication = await auth({
    type: 'installation',
    installationId,
  });

  return {
    token: installationAuthentication.token,
    expires_at: installationAuthentication.expiresAt,
    installation_id: installationId,
  };
}
