# node-sitemap-generator

A flexible sitemap generator for Node.js projects.

## Installation

Install the package globally using npm:

```bash
npm install -g node-sitemap-generator
```

Or locally in your project:

```bash
npm install node-sitemap-generator
```

## Usage

### Global Installation

If you've installed the package globally, you can generate a sitemap by running:

```bash
generate-sitemap
```

To customize options:

```bash
generate-sitemap baseUrl=https://your-site.com outDir=./public maxDepth=5
```

### Local Installation

If you've installed the package locally, you can add a script to your `package.json`:

```json
{
  "scripts": {
    "generate-sitemap": "generate-sitemap"
  }
}
```

Then run:

```bash
npm run generate-sitemap
```

Or with custom options:

```bash
npm run generate-sitemap -- baseUrl=https://your-site.com outDir=./public maxDepth=5
```

## Configuration Options

- `baseUrl` (string): The starting URL for crawling. Default: 'http://localhost:3000'
- `outDir` (string): The directory where the sitemap will be saved. Default: './public'
- `maxDepth` (number): The maximum depth to crawl. Default: 3

## Important Notes

1. Ensure your Node.js version is 14.x or later.

2. The sitemap generator crawls your site, so make sure your `baseUrl` is accessible when generating the sitemap.

3. If you're generating a sitemap for a development environment:

   - Start your local development server first.
   - Use the appropriate localhost URL and port as the `baseUrl`.
   - Example: `generate-sitemap baseUrl=http://localhost:3000`

4. For production sitemap generation, ensure you're using your live website URL as the `baseUrl`.

5. Generation may take some time for larger sites.

## Limitations

- The generator cannot crawl pages that require authentication.
- JavaScript-rendered content may not be included in the sitemap.
- Very large sites may require additional optimization or breaking the sitemap into multiple files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
