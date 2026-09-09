const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;

const requiredFiles = [
  "index.html",
  "status.html",
  "styles.css",
  "script.js",
  "analytics.js",
  "site-config.js",
  "README.md",
  "DEPLOYMENT.md",
  "DEVELOPMENT.md",
  "ANALYTICS.md",
  "analytics.json",
  "VERSION",
  "version.json",
  "status.json",
  "healthz.json",
  "deployment-certificate.json",
  "robots.txt",
  "sitemap.xml",
  ".env.example",
  "docker-compose.yml",
  "Makefile",
  ".github/workflows/github-pages.yml",
  ".github/ISSUE_TEMPLATE/deployment-feedback.md",
];

const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

requiredFiles.forEach((file) => {
  if (!exists(file)) failures.push(`Missing required file: ${file}`);
});

const linkPattern = /href="([^"#][^"]*)"/g;
const validateRelativeLinks = (file) => {
  const content = read(file);
  for (const match of content.matchAll(linkPattern)) {
    const target = match[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    if (!exists(target)) failures.push(`${file} references missing file: ${target}`);
  }
};

if (exists("index.html")) {
  const index = read("index.html");
  [
    "Content-Security-Policy",
    'src="site-config.js"',
    'src="analytics.js"',
    'href="status.html"',
    'href="DEPLOYMENT.md"',
  ].forEach((needle) => {
    if (!index.includes(needle)) failures.push(`index.html is missing ${needle}`);
  });
  validateRelativeLinks("index.html");
}

if (exists("status.html")) validateRelativeLinks("status.html");

if (exists("README.md")) {
  const readme = read("README.md");
  ["View Live", "Quick Start", "DEPLOYMENT.md", "DEVELOPMENT.md", "ANALYTICS.md"].forEach(
    (needle) => {
      if (!readme.includes(needle)) failures.push(`README.md is missing ${needle}`);
    }
  );
}

if (exists("version.json") && exists("VERSION")) {
  const version = read("VERSION").trim();
  const versionJson = JSON.parse(read("version.json"));
  if (versionJson.version !== version) failures.push("VERSION does not match version.json");
}

["analytics.json", "status.json", "healthz.json", "deployment-certificate.json"].forEach((file) => {
  if (!exists(file)) return;
  try {
    JSON.parse(read(file));
  } catch (error) {
    failures.push(`${file} is not valid JSON`);
  }
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Site validation passed.");
console.log("Shalom ❤️");
