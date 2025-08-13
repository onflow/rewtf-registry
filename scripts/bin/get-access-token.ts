import { appendFileSync } from "node:fs";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

// Load secrets from ENV
const APP_ID = process.env.APP_ID;
const APP_PRIVATE_KEY = process.env.APP_PRIVATE_KEY;
const INSTALLATION_ID = process.env.INSTALLATION_ID;

if (!APP_ID || !APP_PRIVATE_KEY || !INSTALLATION_ID) {
	throw new Error(
		"Missing required environment variables: APP_ID, APP_PRIVATE_KEY, or INSTALLATION_ID",
	);
}

async function generateJWT(appId: string, privateKey: string): Promise<string> {
	const auth = createAppAuth({
		appId: parseInt(appId),
		privateKey: privateKey,
	});

	const { token } = await auth({ type: "app" });
	return token;
}

async function getInstallationAccessToken(
	jwtToken: string,
	installationId: string,
): Promise<string> {
	const auth = createAppAuth({
		appId: parseInt(APP_ID!),
		privateKey: APP_PRIVATE_KEY!,
	});

	const { token } = await auth({
		type: "installation",
		installationId: parseInt(installationId),
	});
	return token;
}

async function trySearch(jwtToken: string): Promise<number> {
	const octokit = new Octokit({
		auth: jwtToken,
	});

	const query = "language:cadence";
	const page = 1;
	const sort = "updated";
	const order = "desc";

	try {
		const response = await octokit.search.repos({
			q: query,
			per_page: 100,
			page: page,
			sort: sort,
			order: order as "asc" | "desc",
		});
		return response.data.total_count;
	} catch (error) {
		console.error("Error searching repositories:", error);
		throw error;
	}
}

// Main function to fetch repositories and check for recent commits
async function main(): Promise<void> {
	try {
		// We already checked these are defined at the top of the file
		const jwtToken = await generateJWT(APP_ID!, APP_PRIVATE_KEY!);
		const accessToken = await getInstallationAccessToken(
			jwtToken,
			INSTALLATION_ID!,
		);

		console.log("Github Access token is generated and saved to Github output.");

		// Set the token as a Github Action output
		const githubOutput = process.env.GITHUB_OUTPUT;
		if (githubOutput) {
			appendFileSync(githubOutput, `token=${accessToken}\n`);
		} else {
			// Fallback for older GitHub Actions syntax
			console.log(`::set-output name=token::${accessToken}`);
		}
	} catch (error) {
		console.error("Error in main function:", error);
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
