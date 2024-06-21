const http = require("http");
const fs = require("fs");
const path = require("path");

const generateSitemapFile = require("../dist/index").default;

// Promisify generateSitemapFile with timeout
const generateSitemapFileAsync = (options, timeout = 25000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`generateSitemapFile timed out after ${timeout}ms`));
    }, timeout);

    generateSitemapFile(options, (err) => {
      clearTimeout(timeoutId);
      if (err) reject(err);
      else resolve();
    });
  });
};

describe("node-sitemap-generator", () => {
  let server;
  const PORT = 6969;
  const BASE_URL = `http://localhost:${PORT}`;
  const OUT_DIR = path.join(__dirname, "test_output");

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
      await generateSitemapFileAsync({
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

  // ... (other tests remain similar, with try-catch blocks added)
});
