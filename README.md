# ReWTF
<p align="center">
  <img width="500" height="500" alt="ChatGPT Image Aug 28, 2025, 07_28_59 PM" src="https://github.com/user-attachments/assets/b8cd1c47-799d-4e6c-aebe-a18d7ff7872a" />
</p>

Great projects are 1% idea and 99% execution, the hardest part is usually just getting started and sticking to it. ReWTF unlocks both points to redeem prizes in the [Rewards Store](https://store.flow.com/minting/contracts/a33764e4-e993-4e64-aef3-6ea823afa991) and 10k+ $FLOW over the month of September for builders. How does it work?
- **Register** your Project - can be brand new or existing projects you are already working on. Any type of project is eligible (DeFi, gaming, agents etc.)
- **Build** - commit code as regularly as possible, the more you build the more likely you are to get rewards
- **Earn** - Get access to 10k+ in $FLOW as well as points to redeem for Macbook Pros, Airpods, digital collectables and more. There are even bonus rewards for the top projects building in public!

It's time to go WTF (with the Flow) again!

## Leaderboard

To see how you rank relative to others and your total points, check out the [leaderboard](https://app.databox.com/datawall/fc5f1f7de13471eac8bd5eb2e3d90a752817ac68a86fd6). 

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

Note, for rewards store points use an EVM address like [Metamask](https://developers.flow.com/build/evm/using) or [Flow Wallet](https://wallet.flow.com/)'s EVM accounts.

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

### How Points Are Calculated

- Points are generated through many different sources. The higher your points, the more likely you are to win prizes and funds. To maximize your score make sure you create to push meaningful commits regularly. 


## 📚 Additional Resources

- [Flow Documentation](https://developers.flow.com/)
- [Cadence Language Reference](https://cadence-lang.org/)

## 🤝 Building in Public

The top building in public posts will earn more points as well as bonus $FLOW. In your building in public posts, include #ReWTF and @flow_blockchain as well as @aliserag0.

## FAQ
- Can I use existing projects or do they need to be brand new? Both new and existing projects are eligible!
---

**Note**: All contributions to onflow repositories and registered Flow-related projects are automatically tracked. Make sure your GitHub username is correctly listed in your team's registration to receive proper credit for your contributions.
