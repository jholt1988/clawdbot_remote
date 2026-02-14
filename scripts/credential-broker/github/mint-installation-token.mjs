import 'dotenv/config';
import { createAppAuth } from '@octokit/auth-app';
import { request } from '@octokit/request';
import { loadGithubPrivateKeyPem } from './_key.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith('--')) continue;
    const k = t.slice(2);
    const v = argv[i + 1];
    if (!v || v.startsWith('--')) {
      args[k] = true;
    } else {
      args[k] = v;
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const repo = args.repo;

if (!repo) {
  console.error('Usage: node scripts/credential-broker/github/mint-installation-token.mjs --repo owner/repo');
  process.exit(2);
}

const [owner, name] = repo.split('/');
if (!owner || !name) {
  console.error('Invalid --repo. Expected owner/repo');
  process.exit(2);
}

if (!process.env.GITHUB_APP_ID) {
  console.error('Missing env: GITHUB_APP_ID');
  process.exit(2);
}

const privateKey = await loadGithubPrivateKeyPem();

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey,
});

async function getInstallationId() {
  if (process.env.GITHUB_APP_INSTALLATION_ID) {
    return Number(process.env.GITHUB_APP_INSTALLATION_ID);
  }

  const appAuthentication = await auth({ type: 'app' });
  const res = await request('GET /repos/{owner}/{repo}/installation', {
    owner,
    repo: name,
    headers: {
      authorization: `Bearer ${appAuthentication.token}`,
      'x-github-api-version': '2022-11-28',
    },
  });

  return res.data.id;
}

const installationId = await getInstallationId();
const installationAuthentication = await auth({
  type: 'installation',
  installationId,
});

process.stdout.write(
  JSON.stringify(
    {
      token: installationAuthentication.token,
      expires_at: installationAuthentication.expiresAt,
      installation_id: installationId,
    },
    null,
    2,
  ) + '\n',
);
