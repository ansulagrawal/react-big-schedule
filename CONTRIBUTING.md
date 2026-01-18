# Contributing Guide for react-big-schedule

Welcome to the react-big-schedule project! We're thrilled that you're interested in contributing to our open-source scheduling component for React. By contributing to this project, you can help make it even better and support the broader developer community.

### Code of Conduct

Before you start contributing, please take a moment to read our Code of Conduct. We expect all contributors to adhere to these guidelines to ensure a positive and inclusive community for everyone. You can find our Code of Conduct [here](https://github.com/ansulagrawal/react-big-schedule/blob/master/CODE_OF_CONDUCT.md).

### Getting Started

If you're new to the project, it's a good idea to familiarize yourself with the [README.md](https://github.com/ansulagrawal/react-big-schedule/blob/master/README.md) file, which provides an overview of the project and its features. Also, explore existing issues and pull requests to understand the ongoing work and discussions.

## 🚀 Release Process & Versioning

Our project uses an **automated release workflow** that publishes versions based on your Pull Request title. Understanding this process is crucial for contributing:

### Branch Strategy

- **`main` branch**: Stable releases only. All PRs should be made against this branch.
- Merging to `main` triggers automatic versioning and release

### Automatic Versioning Based on PR Title

When your PR is merged, the version is automatically bumped based on your **PR title**:

| PR Title Format                                 | Version Bump | Example              |
| ----------------------------------------------- | ------------ | -------------------- |
| `fix: description`                              | Patch        | 5.3.0 → 5.3.1        |
| `feat: description`                             | Minor        | 5.3.0 → 5.4.0        |
| `breaking: description` or `major: description` | Major        | 5.3.0 → 6.0.0        |
| Any other format                                | Beta         | 5.3.0 → 5.3.1-beta.1 |

**Examples of proper PR titles:**

- ✅ `fix: resolve calendar overflow issue`
- ✅ `feat: add custom event rendering`
- ✅ `breaking: remove deprecated props`
- ❌ `Updated scheduler component` (will create beta release)
- ❌ `bug fixes` (will create beta release)

### Beta Releases

**Option 1 - Automatic (Recommended for most contributors):**

- If your PR title doesn't follow the convention above, it will automatically create a beta release
- Beta versions are published to npm with the `beta` tag

**Option 2 - Manual:**

- Add the `beta` label to your PR for experimental features
- Beta releases increment like: 5.3.0 → 5.3.1-beta.1 → 5.3.1-beta.2

**Graduating from Beta to Stable:**

- When ready, merge a PR with proper title format (fix/feat/breaking) without the `beta` label
- Example: 5.3.1-beta.3 → 5.3.1 (stable release)

### What Happens After Merge?

For **stable releases** (fix/feat/breaking), the workflow automatically:

1. ✅ Updates version in package.json
2. ✅ Builds the library
3. ✅ Runs tests
4. ✅ Publishes to npm
5. ✅ Creates a Git tag
6. ✅ Creates a GitHub Release with changelog
7. ✅ Comments on your PR with release details

For **beta releases**, the workflow:

1. ✅ Updates version in package.json
2. ✅ Builds and tests
3. ✅ Publishes to npm with `beta` tag
4. ✅ Comments on your PR

### How to Contribute

We value contributions in various forms – from reporting issues and suggesting improvements to submitting feature requests and providing code changes. To get started with your contributions, follow these steps:

1. #### Fork the Repository

   Begin by forking the main repository to your GitHub account. This will create a personal copy of the project that you can work on.

2. #### Set up the Development Environment

   Clone the forked repository to your local machine and set up the development environment using the instructions provided in the [README.md](https://github.com/ansulagrawal/react-big-schedule/blob/master/README.md) file.

3. #### Create a Branch

   Create a new branch for your specific contribution. Please use a descriptive and meaningful name for your branch, such as `fix/issue-123` or `feature/new-feature`.

4. #### Make Changes

   Now comes the coding part! Make the necessary changes to the codebase following the coding guidelines outlined below:

   #####
