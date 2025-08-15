import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";
import type { ValidationResult } from "../src/types";

class RegistryValidator {
  private octokit: Octokit;
  private errors: string[] = [];

  constructor(githubToken: string) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  async validateRegistry(filePath: string): Promise<ValidationResult> {
    try {
      const content = readFileSync(filePath, "utf8");
      const data = yaml.load(content) as any[];

      // Find the new/modified entry (should be the last one)
      const entries = data.filter((entry) => entry && typeof entry === "object");
      if (entries.length === 0) {
        this.errors.push("No valid registry entries found");
        return { isValid: false, errors: this.errors };
      }

      // Get the last entry (newest/modified)
      const entry = entries[entries.length - 1];

      // Validate required fields
      await this.validateRequiredFields(entry);

      // Validate GitHub handles
      if (entry.github && Array.isArray(entry.github)) {
        await this.validateGitHubHandles(entry.github);
      }

      // Validate repository URLs
      if (entry.repos && Array.isArray(entry.repos)) {
        await this.validateRepositoryUrls(entry.repos);
      }

      // Validate wallet addresses
      if (entry.wallets) {
        this.validateWalletAddresses(entry.wallets);
      }

      return {
        isValid: this.errors.length === 0,
        errors: this.errors,
      };
    } catch (error) {
      this.errors.push(`Failed to parse registry file: ${error}`);
      return { isValid: false, errors: this.errors };
    }
  }

  private async validateRequiredFields(entry: any): Promise<void> {
    if (!entry.name || typeof entry.name !== "string") {
      this.errors.push("Missing or invalid 'name' field");
    }

    if (!entry.github || !Array.isArray(entry.github) || entry.github.length === 0) {
      this.errors.push("Missing or invalid 'github' field - must be a non-empty array");
    }

    if (!entry.repos || !Array.isArray(entry.repos) || entry.repos.length === 0) {
      this.errors.push("Missing or invalid 'repos' field - must be a non-empty array");
    }

    if (!entry.wallets || typeof entry.wallets !== "object") {
      this.errors.push("Missing or invalid 'wallets' field");
    }
  }

  private async validateGitHubHandles(handles: string[]): Promise<void> {
    for (const handle of handles) {
      if (typeof handle !== "string" || handle.trim() === "") {
        this.errors.push(`Invalid GitHub handle: '${handle}'`);
        continue;
      }

      try {
        const response = await this.octokit.users.getByUsername({
          username: handle.trim(),
        });

        if (response.status !== 200) {
          this.errors.push(`GitHub handle '${handle}' is not accessible (status: ${response.status})`);
        }
      } catch (error) {
        this.errors.push(`GitHub handle '${handle}' is not valid or not found`);
      }
    }
  }

  private async validateRepositoryUrls(urls: string[]): Promise<void> {
    for (const url of urls) {
      if (typeof url !== "string" || url.trim() === "") {
        this.errors.push(`Invalid repository URL: '${url}'`);
        continue;
      }

      try {
        // Extract owner and repo from GitHub URL
        const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
          this.errors.push(`Invalid GitHub URL format: '${url}'`);
          continue;
        }

        const [, owner, repo] = match;
        const repoName = repo.replace(/\.git$/, ""); // Remove .git suffix if present

        const response = await this.octokit.repos.get({
          owner: owner.trim(),
          repo: repoName.trim(),
        });

        if (response.status !== 200) {
          this.errors.push(`Repository '${url}' is not accessible (status: ${response.status})`);
        }
      } catch (error) {
        this.errors.push(`Repository '${url}' is not valid or not found`);
      }
    }
  }

  private validateWalletAddresses(wallets: any): void {
    if (!wallets.evm || typeof wallets.evm !== "string") {
      this.errors.push("Missing or invalid 'evm' wallet address");
    } else {
      const evmAddress = wallets.evm.trim();
      if (!evmAddress.startsWith("0x") || evmAddress.length !== 42 || !/^0x[0-9a-fA-F]{40}$/.test(evmAddress)) {
        this.errors.push(
          `Invalid EVM wallet address: '${evmAddress}' - must start with 0x and be 42 characters long (0x + 40 hex chars)`,
        );
      }
    }

    if (!wallets.flow || typeof wallets.flow !== "string") {
      this.errors.push("Missing or invalid 'flow' wallet address");
    } else {
      const flowAddress = wallets.flow.trim();
      if (!flowAddress.startsWith("0x") || flowAddress.length !== 18 || !/^0x[0-9a-fA-F]{16}$/.test(flowAddress)) {
        this.errors.push(
          `Invalid Flow wallet address: '${flowAddress}' - must start with 0x and be 18 characters long (0x + 16 hex chars)`,
        );
      }
    }
  }
}

async function main(): Promise<void> {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }

    const validator = new RegistryValidator(githubToken);
    const result = await validator.validateRegistry("registry.yaml");

    // Create tmp directory if it doesn't exist
    mkdirSync("tmp", { recursive: true });

    // Write validation result to file for GitHub Action to read
    writeFileSync("tmp/validation-result.json", JSON.stringify(result, null, 2));

    if (result.isValid) {
      console.log("✅ Registry validation passed!");
      process.exit(0);
    } else {
      console.log("❌ Registry validation failed:");
      for (const error of result.errors) {
        console.log(`  - ${error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("Error during validation:", error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
