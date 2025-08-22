# ReWTF Registry

This repository is the registry of ReWTF Program, an always-on contribution program that rewards developers for their contributions to the Flow ecosystem.

## 🚀 How to Register Your Team

To participate in the ReWTF program and start earning points, you need to register your team in the `registry.yaml` file.

### 📋 Registration Requirements

Your team's projects must meet **at least one** of the following criteria:

1. **"Built on Flow"** - Your projects clearly state in their README.md that they are built on Flow, and if there are any contracts, list the contract addresses deployed on Flow.

2. **With Flow Components** - Your projects use:
   - Cadence Language
   - `@onflow/fcl` or `@onflow/kit` (in package.json)
   - Go SDK (URL in go.mod)
   - Flow public EVM endpoints (in Solidity configuration files)

### 📝 Registration Template

Copy the following structure, modify it to your needs, and add it to the end of `registry.yaml`:

```yaml
-
  name: Your Team Name (Displayed in Leaderboard)
  github:
    # Your team members' GitHub usernames for tracking PR status to onflow
    - username1
    - username2
  repos:
    # Your team's repositories - all commits to these repos will be tracked
    - https://github.com/your/repo_1
    - https://github.com/your/repo_2
  wallets:
    # Your team's wallets to accept Flow Rewards
    evm: "0x0000000000000000000000000000000000000000"
    flow: "0x0000000000000001"
```

### ✅ Validation Requirements

The registration system will automatically validate:

- **Team Name**: Required, Must be a non-empty string
- **GitHub Handles**: Required, Must be valid, accessible GitHub usernames
- **Repository URLs**: Optional, Must be valid, accessible GitHub repositories
- **Wallet Addresses**:
  - EVM: Required, Must start with `0x` and be 42 characters long (0x + 40 hex chars)
  - Flow: Required, Must start with `0x` and be 18 characters long (0x + 16 hex chars)

### 🔍 Continuous Monitoring

After successful registration, we will continuously monitor and scan your GitHub activity data to calculate user points.

## 🏆 Scoring System

### Contribution Points

| Contribution Type | Points | Notes |
|------------------|---------|-------|
| **PR to `onflow/*` repos (merged)** | 50-200 | Weighted by impact: 50 (typos/docs) → 200 (core protocol fixes) |
| **Commit to registered repos** | 5~50 | Each daily active user can earn 5 points per day, with a maximum of 50 points accumulable per Team daily.  |

### How Points Are Calculated

- **PR Impact Assessment**: Core protocol fixes and significant contributions receive higher points
- **Repository Activity**: More popular and active repositories may receive bonus points, but the points are capped at 50 points per day.

## 📚 Additional Resources

- [Flow Documentation](https://developers.flow.com/)
- [Cadence Language Reference](https://cadence-lang.org/)

## 🤝 Contributing

If you have questions about the registration process or scoring system, please open an issue in this repository.

---

**Note**: All contributions to onflow repositories and registered Flow-related projects are automatically tracked. Make sure your GitHub username is correctly listed in your team's registration to receive proper credit for your contributions.
