# Build Instructions for sitemap-cli-gen

This document outlines the process for setting up, building, testing, and publishing the sitemap-cli-gen package.

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/sitemap-cli-gen.git
   cd sitemap-cli-gen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

1. Make your code changes in the JavaScript files.

2. Test your changes locally:
   ```bash
   npm test
   ```

## CLI Usage

The package includes a CLI tool. After installation, you can use it as follows:

```bash
npx sitemap-cli-gen baseUrl=https://example.com outDir=./public maxDepth=3
```

Or if installed globally:

```bash
sitemap-cli-gen baseUrl=https://example.com outDir=./public maxDepth=3
```

## Testing

We use Jest for testing. To run the test suite:

```bash
npm test
```

To run tests in watch mode during development:

```bash
npm run test:watch
```

## Publishing

We use a bash script to automate the publication process. Here's how to use it:

1. Ensure you have the necessary permissions:

   ```bash
   chmod +x publish.sh
   ```

2. Run the publication script:

   ```bash
   ./publish.sh <version_type>
   ```

   Replace `<version_type>` with either `patch`, `minor`, or `major`.

   For example:

   ```bash
   ./publish.sh patch
   ```

3. If you encounter permission issues with the script, you can run the commands manually:

   ```bash
   # Ensure you're on the main branch
   git checkout main

   # Pull latest changes
   git pull origin main

   # Run tests
   npm test

   # Bump version (replace 'patch' with 'minor' or 'major' as needed)
   npm version patch -m "Bump version to %s"

   # Push changes and tags
   git push && git push --tags

   # Publish to npm
   npm publish
   ```

## Troubleshooting

If you encounter a "permission denied" error when running the publish script:

1. Check file permissions:

   ```bash
   ls -l publish.sh
   ```

2. If needed, change file ownership:

   ```bash
   sudo chown yourusername:yourgroupname publish.sh
   ```

3. Ensure you're in the correct directory:

   ```bash
   pwd
   ```

4. Try running with bash explicitly:
   ```bash
   bash publish.sh patch
   ```

## Notes

- Always ensure all tests pass before publishing.
- Update the CHANGELOG.md file with any significant changes before publishing.
- Make sure you're logged into npm (`npm login`) before attempting to publish.
- The main CLI file is `cli.js`. Ensure this file has the correct permissions to be executed.

For any questions or issues, please open an issue on the GitHub repository.
