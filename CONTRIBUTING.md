# Contributing Guide for react-big-schedule

Welcome to the react-big-schedule project! We're thrilled that you're interested in contributing to our open-source scheduling component for React. By contributing to this project, you can help make it even better and support the broader developer community.

### Code of Conduct

Before you start contributing, please take a moment to read our Code of Conduct. We expect all contributors to adhere to these guidelines to ensure a positive and inclusive community for everyone. You can find our Code of Conduct [here](https://github.com/ansulagrawal/react-big-schedule/blob/master/CODE_OF_CONDUCT.md).

### Getting Started

If you're new to the project, it's a good idea to familiarize yourself with the [README.md](https://github.com/ansulagrawal/react-big-schedule/blob/master/README.md) file, which provides an overview of the project and its features. Also, explore existing issues and pull requests to understand the ongoing work and discussions.

## 🚀 Release Process & Versioning

Releases are automated and happen when a pull request is merged into `master`. Only the latest release (**9.0.0 or later**) is supported, so please test against it before opening an issue or a PR.

### Branch Strategy

- **`master` branch**: all PRs are made against it. Merging triggers the release workflow.

### Versioning Based on PR Labels

The version bump comes from the **labels on the merged PR**:

| PR label            | Result                                           | Example                |
| ------------------- | ------------------------------------------------ | ---------------------- |
| none (default)      | Beta release, published to npm with the `beta` tag | 9.0.0 → 9.0.1-beta.0   |
| `minor`             | Minor release                                    | 9.0.0 → 9.1.0          |
| `major`             | Major release                                    | 9.0.0 → 10.0.0          |
| `skip`              | No release (docs, CI, housekeeping)              | -                      |

Dependabot PRs are always published as betas.

### What Happens After Merge?

For **stable releases** (`minor` / `major`), the workflow:

1. Runs `bun run check` and builds the library
2. Bumps the version in `package.json` and tags it
3. Publishes to npm
4. Creates a GitHub Release (uses `.github/release-notes/v<version>.md` when that file exists, otherwise generated notes)
5. Comments on the PR with the release version

For **beta releases**, the workflow does the same without the GitHub Release and publishes with the `beta` tag.

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
