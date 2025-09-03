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

      // Validate repository URLs and Flow ecosystem requirements
      if (entry.repos && Array.isArray(entry.repos)) {
        await this.validateRepositoryUrls(entry.repos);
        await this.validateFlowEcosystemRequirements(entry.repos);
      }

      // Validate wallet addresses (optional)
      if (entry.wallets) {
        this.validateWalletAddresses(entry.wallets);
      }

      // Validate X handles (optional)
      if (entry.x && Array.isArray(entry.x)) {
        this.validateXHandles(entry.x);
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

    // wallets and x are optional, so no validation needed here
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

  private async validateFlowEcosystemRequirements(urls: string[]): Promise<void> {
    for (const url of urls) {
      try {
        const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) continue;

        const [, owner, repo] = match;
        const repoName = repo.replace(/\.git$/, "");

        // Check README.md for "Built on Flow" mention
        try {
          const readmeResponse = await this.octokit.repos.getContent({
            owner: owner.trim(),
            repo: repoName.trim(),
            path: "README.md",
          });

          if (readmeResponse.status === 200 && "content" in readmeResponse.data) {
            const content = Buffer.from(readmeResponse.data.content, "base64").toString("utf8");
            if (content.toLowerCase().includes("on flow") || content.toLowerCase().includes("flow blockchain")) {
              return; // This repo meets requirement 1
            }
          }
        } catch (error) {
          // README.md not found or not accessible
        }

        // Check package.json for Flow dependencies
        try {
          const packageResponse = await this.octokit.repos.getContent({
            owner: owner.trim(),
            repo: repoName.trim(),
            path: "package.json",
          });

          if (packageResponse.status === 200 && "content" in packageResponse.data) {
            const content = Buffer.from(packageResponse.data.content, "base64").toString("utf8");
            const packageJson = JSON.parse(content);

            if (
              packageJson.dependencies &&
              (packageJson.dependencies["@onflow/fcl"] ||
                packageJson.dependencies["@onflow/kit"] ||
                packageJson.devDependencies?.["@onflow/fcl"] ||
                packageJson.devDependencies?.["@onflow/kit"])
            ) {
              continue; // This repo meets requirement 2
            }
          }
        } catch (error) {
          // package.json not found or not accessible
        }

        // Check go.mod for Flow SDK
        try {
          const goModResponse = await this.octokit.repos.getContent({
            owner: owner.trim(),
            repo: repoName.trim(),
            path: "go.mod",
          });

          if (goModResponse.status === 200 && "content" in goModResponse.data) {
            const content = Buffer.from(goModResponse.data.content, "base64").toString("utf8");
            if (content.includes("github.com/onflow/flow-go-sdk") || content.includes("github.com/onflow/flow-go")) {
              continue; // This repo meets requirement 2
            }
          }
        } catch (error) {
          // go.mod not found or not accessible
        }

        // Check for Solidity config files with Flow EVM endpoints
        try {
          const filesResponse = await this.octokit.repos.getContent({
            owner: owner.trim(),
            repo: repoName.trim(),
            path: "",
          });

          if (filesResponse.status === 200 && Array.isArray(filesResponse.data)) {
            const hasSolidityConfig = filesResponse.data.some(
              (file: any) =>
                file.name === "hardhat.config.js" ||
                file.name === "hardhat.config.ts" ||
                file.name === "truffle-config.js" ||
                file.name === "foundry.toml",
            );

            if (hasSolidityConfig) {
              // Check if any of these config files contain Flow EVM endpoints
              for (const file of filesResponse.data) {
                if (file.name === "hardhat.config.js" || file.name === "hardhat.config.ts") {
                  try {
                    const configResponse = await this.octokit.repos.getContent({
                      owner: owner.trim(),
                      repo: repoName.trim(),
                      path: file.name,
                    });

                    if (configResponse.status === 200 && "content" in configResponse.data) {
                      const content = Buffer.from(configResponse.data.content, "base64").toString("utf8");
                      if (content.includes("evm.nodes.onflow.org")) {
                        return; // This repo meets requirement 2
                      }
                    }
                  } catch (error) {
                    // Config file not accessible
                  }
                }
              }
            }
          }
        } catch (error) {
          // Could not check repo contents
        }

        // If we reach here, the repo doesn't meet either requirement
        this.errors.push(
          `Repository '${url}' does not meet Flow ecosystem requirements. It must either: 1) Clearly state "Built on Flow" in README.md, or 2) Include Flow components (@onflow/fcl, @onflow/kit, Flow Go SDK, or Flow EVM endpoints)`,
        );
      } catch (error) {
        // Skip validation for this repo if we can't access it
        // Continue to next repo
      }
    }
  }

  private validateWalletAddresses(wallets: any): void {
    if (wallets.evm && typeof wallets.evm === "string") {
      const evmAddress = wallets.evm.trim();
      if (!evmAddress.startsWith("0x") || evmAddress.length !== 42 || !/^0x[0-9a-fA-F]{40}$/.test(evmAddress)) {
        this.errors.push(
          `Invalid EVM wallet address: '${evmAddress}' - must start with 0x and be 42 characters long (0x + 40 hex chars)`,
        );
      }
    }

    if (wallets.flow && typeof wallets.flow === "string") {
      const flowAddress = wallets.flow.trim();
      if (!flowAddress.startsWith("0x") || flowAddress.length !== 18 || !/^0x[0-9a-fA-F]{16}$/.test(flowAddress)) {
        this.errors.push(
          `Invalid Flow wallet address: '${flowAddress}' - must start with 0x and be 18 characters long (0x + 16 hex chars)`,
        );
      }
    }
  }

  private validateXHandles(handles: string[]): void {
    for (const handle of handles) {
      if (typeof handle !== "string" || handle.trim() === "") {
        this.errors.push(`Invalid X handle: '${handle}'`);
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
