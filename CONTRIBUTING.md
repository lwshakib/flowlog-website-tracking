# Contributing to Flowlog

First off, thank you for considering contributing to Flowlog! It's people like you that make Flowlog such a great tool for developers.

---

## 🚀 Contribution Workflow

Follow these steps to ensure a smooth contribution process:

### 1. Fork the Repository

Click the **Fork** button at the top right of this page to create a copy of the repository in your own GitHub account.

### 2. Clone Your Fork

Clone your fork to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/flowlog-website-tracking.git
cd flowlog-website-tracking
```

### 3. Set Up Upstream Remote

Add the original repository as the upstream remote to stay synced:

```bash
git remote add upstream https://github.com/lwshakib/flowlog-website-tracking.git
```

### 4. Install Dependencies

Ensure you have [Bun](https://bun.sh) installed, then run:

```bash
bun install
```

### 5. Configure Environment

Copy `.env.example` to `.env` and configure your local development environment (Database, Auth, S3/R2).

```bash
cp .env.example .env
```

### 6. Create a Feature Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-awesome-feature
```

### 7. Development & Quality Checks

As you develop, please ensure your code follows our quality standards:

- **Format your code**: `bun run format`
- **Lint your code**: `bun run lint`
- **Test your changes**: Ensure the app builds with `bun run build`

### 8. Push to Your Fork

Once your changes are ready and verified:

```bash
git add .
git commit -m "feat: add some amazing feature"
git push origin feature/your-awesome-feature
```

### 9. Open a Pull Request

Go to the original Flowlog repository on GitHub. You should see a prompt to open a Pull Request from your branch. Provide a clear description of your changes and reference any related issues.

---

## 📋 Quality Standards

### Coding Standards

- **TypeScript Only**: We use TypeScript for all application logic.
- **Component Design**: Follow the existing design aesthetics. All new components must be responsive.
- **Modern Logic**: Use React hooks and modern patterns (Next.js App Router).

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Reference issues and pull requests liberally.
- Follow conventional commits if possible (e.g., `feat:`, `fix:`, `docs:`, `style:`).

---

## 🐛 Reporting Bugs & Suggestions

- **Check existing issues** before opening a new one.
- **Use templates** for bug reports and feature requests.
- **Be descriptive**: Include steps to reproduce, environment details, and expected behavior.

---

## Maintainer

**lwshakib** - [GitHub Profile](https://github.com/lwshakib)

Thank you for contributing!
