# GitHub Credential Broker (GitHub App)

This broker issues **short-lived GitHub Installation Access Tokens** for use by TEA/CEEG jobs.

## Why
- Avoid long-lived PATs in env
- Scope is controlled by:
  - GitHub App permissions
  - which repos the App is installed on
  - permit scope in Notion (repo/branch/actions)

## Required env
- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY_PEM` **or** `GITHUB_APP_PRIVATE_KEY_PATH`

Optional:
- `GITHUB_APP_INSTALLATION_ID` (if set, skips repo lookup)

## Mint a token for a repo
```bash
node scripts/credential-broker/github/mint-installation-token.mjs --repo owner/repo
```

Outputs JSON:
```json
{ "token": "...", "expires_at": "...", "installation_id": 123 }
```

## Notes
- Never write the token into Notion.
- Pass it to the runner via process env (e.g. `GITHUB_TOKEN`).
