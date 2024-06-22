const http = require("http");
const fs = require("fs");
const path = require("path");
const { generateSitemapAndRobots } = require("../dist/index");

const PORT = 6969;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = path.join(__dirname, "test_output");

let server;

// Promisify generateSitemapAndRobots
const generateSitemapAndRobotsAsync = (options) => {
  return new Promise((resolve, reject) => {
    generateSitemapAndRobots(options).then(resolve).catch(reject);
  });
};

// Global setup
beforeAll((done) => {
  console.log("Setting up test server...");
  server = http.createServer((req, res) => {
    console.log(`Received request for ${req.url}`);
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        '<html><body><a href="/about">About</a><a href="/contact">Contact</a></body></html>'
      );
    } else if (req.url === "/about" || req.url === "/contact") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        `<html><body><h1>${req.url.slice(
          1
        )}</h1><a href="/">Home</a></body></html>`
      );
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  server.listen(PORT, (err) => {
    if (err) {
      console.error("Failed to start test server:", err);
      done(err);
    } else {
      console.log(`Test server running on ${BASE_URL}`);
      done();
    }
  });
});

// Global teardown
afterAll((done) => {
  console.log("Closing test server...");
  server.close((err) => {
    if (err) {
      console.error("Failed to close test server:", err);
      done(err);
    } else {
      console.log("Test server closed");
      done();
    }
  });
});

describe("node-sitemap-generator", () => {
  beforeEach(() => {
    console.log("Clearing test output directory...");
    if (fs.existsSync(OUT_DIR)) {
      fs.readdirSync(OUT_DIR).forEach((file) => {
        fs.unlinkSync(path.join(OUT_DIR, file));
      });
    } else {
      fs.mkdirSync(OUT_DIR);
    }
  });

  test("generates sitemap with correct URLs", async () => {
    console.log("Starting sitemap generation test...");
    try {
      await generateSitemapAndRobotsAsync({
        baseUrl: BASE_URL,
        outDir: OUT_DIR,
        maxDepth: 2,
      });

      console.log("Sitemap generation complete, checking results...");
      const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const content = fs.readFileSync(sitemapPath, "utf8");
      expect(content).toContain(`<loc>${BASE_URL}/</loc>`);
      expect(content).toContain(`<loc>${BASE_URL}/about</loc>`);
      expect(content).toContain(`<loc>${BASE_URL}/contact</loc>`);

      console.log("Test completed successfully.");
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });

  // test("respects maxDepth parameter", async () => {
  //   console.log("Starting maxDepth test...");
  //   try {
  //     await generateSitemapAndRobotsAsync({
  //       baseUrl: BASE_URL,
  //       outDir: OUT_DIR,
  //       maxDepth: 1,
  //     });

  //     const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
  //     const content = fs.readFileSync(sitemapPath, "utf8");

  //     expect(content).toContain(`<loc>${BASE_URL}/</loc>`);
  //     expect(content).not.toContain(`<loc>${BASE_URL}/about</loc>`);
  //     expect(content).not.toContain(`<loc>${BASE_URL}/contact</loc>`);

  //     console.log("maxDepth test completed successfully.");
  //   } catch (error) {
  //     console.error("maxDepth test failed with error:", error);
  //     throw error;
  //   }
  // });

  test("generates correct robots.txt", async () => {
    console.log("Starting robots.txt test...");
    try {
      const disallowPaths = ["/private", "/admin"];
      await generateSitemapAndRobotsAsync({
        baseUrl: BASE_URL,
        outDir: OUT_DIR,
        maxDepth: 2,
        disallowPaths,
      });

      const robotsPath = path.join(OUT_DIR, "robots.txt");
      const content = fs.readFileSync(robotsPath, "utf8");

      expect(content).toContain("User-agent: *");
      disallowPaths.forEach((path) => {
        expect(content).toContain(`Disallow: ${path}`);
      });
      expect(content).toContain(`Sitemap: ${BASE_URL}/sitemap.xml`);

      console.log("robots.txt test completed successfully.");
    } catch (error) {
      console.error("robots.txt test failed with error:", error);
      throw error;
    }
  });

  test("handles non-existent pages gracefully", async () => {
    console.log("Starting non-existent page test...");
    try {
      await generateSitemapAndRobotsAsync({
        baseUrl: `${BASE_URL}/non-existent`,
        outDir: OUT_DIR,
        maxDepth: 2,
      });

      const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
      const content = fs.readFileSync(sitemapPath, "utf8");

      expect(content).toContain(`<loc>${BASE_URL}/non-existent</loc>`);
      expect(content.match(/<url>/g).length).toBe(1);

      console.log("Non-existent page test completed successfully.");
    } catch (error) {
      console.error("Non-existent page test failed with error:", error);
      throw error;
    }
  });

  test("generates correct priority values", async () => {
    console.log("Starting priority test...");
    try {
      await generateSitemapAndRobotsAsync({
        baseUrl: BASE_URL,
        outDir: OUT_DIR,
        maxDepth: 2,
      });

      const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
      const content = fs.readFileSync(sitemapPath, "utf8");

      expect(content).toContain("<priority>1.00</priority>");
      expect(content).toContain("<priority>0.90</priority>");

      console.log("Priority test completed successfully.");
    } catch (error) {
      console.error("Priority test failed with error:", error);
      throw error;
    }
  });

  // test("handles URLs with query parameters", async () => {
  //   console.log("Starting query parameter test...");
  //   try {
  //     // Modify the server to handle a page with query parameters
  //     server.on("request", (req, res) => {
  //       if (req.url?.startsWith("/page?id=")) {
  //         res.writeHead(200, { "Content-Type": "text/html" });
  //         res.end(
  //           '<html><body><h1>Page with query</h1><a href="/">Home</a></body></html>'
  //         );
  //       }
  //     });

  //     await generateSitemapAndRobotsAsync({
  //       baseUrl: `${BASE_URL}/page?id=1`,
  //       outDir: OUT_DIR,
  //       maxDepth: 1,
  //     });

  //     const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
  //     const content = fs.readFileSync(sitemapPath, "utf8");

  //     expect(content).toContain(`<loc>${BASE_URL}/page?id=1</loc>`);

  //     console.log("Query parameter test completed successfully.");
  //   } catch (error) {
  //     console.error("Query parameter test failed with error:", error);
  //     throw error;
  //   }
  // });

  // test("handles relative URLs correctly", async () => {
  //   console.log("Starting relative URL test...");
  //   try {
  //     // Modify the server to include a page with relative URLs
  //     server.on("request", (req, res) => {
  //       if (req.url === "/relative") {
  //         res.writeHead(200, { "Content-Type": "text/html" });
  //         res.end(
  //           '<html><body><a href="page1">Page 1</a><a href="/page2">Page 2</a></body></html>'
  //         );
  //       }
  //     });

  //     await generateSitemapAndRobotsAsync({
  //       baseUrl: `${BASE_URL}/relative`,
  //       outDir: OUT_DIR,
  //       maxDepth: 2,
  //     });

  //     const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
  //     const content = fs.readFileSync(sitemapPath, "utf8");

  //     expect(content).toContain(`<loc>${BASE_URL}/relative</loc>`);
  //     expect(content).toContain(`<loc>${BASE_URL}/relative/page1</loc>`);
  //     expect(content).toContain(`<loc>${BASE_URL}/page2</loc>`);

  //     console.log("Relative URL test completed successfully.");
  //   } catch (error) {
  //     console.error("Relative URL test failed with error:", error);
  //     throw error;
  //   }
  // });
});
