#!/usr/bin/env node

import { generateSitemapAndRobots } from "./generate-sitemap.js";

const defaultOptions = {
  baseUrl: "http://localhost:3000",
  outDir: "./public",
  maxDepth: 3,
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  ...defaultOptions,
  ...Object.fromEntries(
    args
      .map((arg) => arg.split("="))
      .map(([key, value]) => [
        key,
        key === "maxDepth" ? parseInt(value) : value,
      ])
  ),
};

console.log("Generating sitemap with options:", options);

generateSitemapAndRobots(options)
  .then(() => {
    console.log("Sitemap generated successfully");
  })
  .catch((err) => {
    console.error("Sitemap generation failed:", err);
    process.exit(1);
  });
