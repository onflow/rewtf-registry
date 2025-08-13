# TypeScript Scripts

This directory contains TypeScript scripts.

## get-token.ts

A TypeScript script that generates GitHub App JWT tokens and installation access tokens.

### Features

- Generates JWT tokens for GitHub App authentication
- Retrieves installation access tokens
- Supports GitHub Actions output
- Includes error handling and type safety
- Uses official Octokit libraries for better reliability

### Usage

```bash
# Set environment variables
export APP_ID="your_app_id"
export APP_PRIVATE_KEY="your_private_key"
export INSTALLATION_ID="your_installation_id"

# Run with bun (recommended)
bun run get-token
```

### Environment Variables

- `APP_ID`: Your GitHub App ID
- `APP_PRIVATE_KEY`: Your GitHub App private key (PEM format)
- `INSTALLATION_ID`: Your GitHub App installation ID
- `GITHUB_OUTPUT`: GitHub Actions output file path (optional)

### Dependencies

- `@octokit/rest`: GitHub REST API client
- `@octokit/auth-app`: GitHub App authentication utilities
