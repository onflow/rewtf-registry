# Scripts

This directory contains utility scripts for the rewtf-registry project.

## Scripts

### get-access-token.ts

Generates a GitHub access token for authentication purposes.

**Usage:**

```bash
bun run get-token
```

**Environment Variables Required:**

- `APP_ID`: GitHub App ID
- `APP_PRIVATE_KEY`: GitHub App private key
- `INSTALLATION_ID`: GitHub App installation ID

### validate-registry.ts

Validates registry.yaml entries to ensure they meet the required format and contain valid data.

**Usage:**

```bash
bun run validate-registry
```

**Environment Variables Required:**

- `GITHUB_TOKEN`: GitHub token for API access

**What it validates:**

- Required fields: `name`, `github`, `repos`, `wallets`
- GitHub handles: Checks if usernames exist and are accessible
- Repository URLs: Verifies GitHub repositories are accessible
- Wallet addresses:
  - EVM: Must start with `0x` and be 42 characters long (0x + 40 hex chars)
  - Flow: Must start with `0x` and be 18 characters long (0x + 16 hex chars)

**Output:**
Creates a `validation-result.json` file with validation results that can be used by GitHub Actions.

## GitHub Action Integration

The `validate-registry.ts` script is designed to work with the GitHub Action workflow in `.github/workflows/validate-registry.yml`. This workflow:

1. Triggers on PR changes to `registry.yaml`
2. Runs the validation script
3. Posts results as comments on the PR
4. Uses friendly emojis and clear messaging

## Development

To run these scripts locally:

1. Install dependencies: `bun install`
2. Set required environment variables
3. Run the desired script: `bun run <script-name>`

## Dependencies

- `@octokit/rest`: GitHub API client
- `js-yaml`: YAML parsing
- `@octokit/auth-app`: GitHub App authentication
