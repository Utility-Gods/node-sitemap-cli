# node-sitemap-generator

A lightweight, dependency-minimal Node.js library for generating XML sitemaps by crawling websites. It can be used as a standalone script, a module in your project, or as a Vite plugin.

## Features

- Crawls websites and generates XML sitemaps
- Lightweight with minimal dependencies
- Configurable crawl depth and output directory
- Supports both http and https protocols
- Extracts `lastmod` from meta tags when available
- Calculates `priority` based on page depth
- Can be used as a Vite plugin for automatic sitemap generation during build

## Installation

Install the package using npm:

```bash
npm install node-sitemap-generator
```

## Usage

### As a standalone script

1. Create a file named `generateSitemap.js` with the following content:

```javascript
const { generateSitemapFile } = require("node-sitemap-generator");

generateSitemapFile(
  {
    baseUrl: "https://example.com",
    outDir: "public",
    maxDepth: 5,
  },
  (err) => {
    if (err) {
      console.error("Error generating sitemap:", err);
      process.exit(1);
    }
    console.log("Sitemap generation complete!");
  },
);
```

2. Run the script:

```bash
node generateSitemap.js
```

### As a module in your project

```javascript
const { generateSitemapFile } = require("node-sitemap-generator");

generateSitemapFile(
  {
    baseUrl: "https://example.com",
    outDir: "public",
    maxDepth: 3,
  },
  (err) => {
    if (err) {
      console.error("Error generating sitemap:", err);
    } else {
      console.log("Sitemap generation complete!");
    }
  },
);
```

### As a Vite plugin

To use node-sitemap-generator as a Vite plugin, add it to your `vite.config.js` file:

```javascript
import { defineConfig } from "vite";
import { vitePluginSitemap } from "node-sitemap-generator/vite-plugin";

export default defineConfig({
  plugins: [
    // ... other plugins
    vitePluginSitemap({
      baseUrl: "https://example.com",
      outDir: "dist",
      maxDepth: 5,
    }),
  ],
});
```

This will automatically generate a sitemap.xml file in your output directory when you run the Vite build command.

## Configuration Options

- `baseUrl` (string): The starting URL for crawling. Default: 'http://localhost:3000'
- `outDir` (string): The directory where the sitemap will be saved. Default: 'dist'
- `maxDepth` (number): The maximum depth to crawl. Default: 5

## Environment Variables

You can also configure the generator using environment variables:

- `BASE_URL`: Sets the base URL to crawl
- `OUT_DIR`: Sets the output directory
- `MAX_DEPTH`: Sets the maximum crawl depth

Example:

```bash
BASE_URL=https://example.com OUT_DIR=public MAX_DEPTH=3 node generateSitemap.js
```

## Limitations

- Does not execute JavaScript, so dynamically generated content may be missed
- Does not respect `robots.txt` rules
- Does not handle rate limiting, use with caution on large sites

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
