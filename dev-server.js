const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const url = require("node:url");

const root = __dirname;
const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || "0.0.0.0";
const clients = new Set();

const loadDotEnv = () => {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const [key, ...rest] = line.split("=");
    if (!key || process.env[key]) continue;
    process.env[key] = rest.join("=").trim();
  }
};

loadDotEnv();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const configScript = () =>
  `window.NINE_PILLARS_CONFIG = ${JSON.stringify(
    {
      version: fs.readFileSync(path.join(root, "VERSION"), "utf8").trim(),
      siteUrl: `http://localhost:${port}/`,
      previewUrl:
        "https://github.com/2298741867/eight-pillars-covenant-/blob/main/index.html",
      statusUrl: `http://localhost:${port}/status.html`,
      issueUrl:
        "https://github.com/2298741867/eight-pillars-covenant-/issues/new?template=deployment-feedback.md",
      analytics: {
        enabled: process.env.ANALYTICS_ENABLED === "true",
        provider: process.env.ANALYTICS_PROVIDER || "plausible",
        domain: process.env.ANALYTICS_DOMAIN || "",
        siteId: process.env.ANALYTICS_SITE_ID || "",
        scriptSrc: process.env.ANALYTICS_SCRIPT_SRC || "",
        apiHost: process.env.ANALYTICS_API_HOST || "",
        eventMap: {
          "Pillar Expanded": "PILLAR",
          "Document Opened": "DOCOPEN",
          "Scroll Depth": "SCROLL",
          "Time On Page": "TIMEON",
          "Exit Intent": "EXITLY",
        },
      },
    },
    null,
    2
  )};\n`;

const injectReload = (html) =>
  html.replace(
    "</body>",
    `<script src="/__reload.js"></script></body>`
  );

const reloadScript = () =>
  `const stream = new EventSource("/__events");
stream.addEventListener("reload", () => window.location.reload());
`;

const send = (res, status, body, contentType) => {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(body);
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || "/");
  const requestPath = parsed.pathname || "/";

  if (requestPath === "/__events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-store",
    });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (requestPath === "/healthz") {
    return send(
      res,
      200,
      JSON.stringify({
        status: "ok",
        version: fs.readFileSync(path.join(root, "VERSION"), "utf8").trim(),
        checkedAt: new Date().toISOString(),
      }),
      "application/json; charset=utf-8"
    );
  }

  if (requestPath === "/site-config.js") {
    return send(res, 200, configScript(), mimeTypes[".js"]);
  }

  if (requestPath === "/__reload.js") {
    return send(res, 200, reloadScript(), mimeTypes[".js"]);
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    return send(res, 400, "Bad request", mimeTypes[".txt"]);
  }

  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return send(res, 404, "Not found", mimeTypes[".txt"]);
  }

  const realRoot = fs.realpathSync(root);
  const realPath = fs.realpathSync(absolutePath);
  const relativeToRoot = path.relative(realRoot, realPath);
  if (
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot) ||
    fs.statSync(realPath).isDirectory()
  ) {
    return send(res, 404, "Not found", mimeTypes[".txt"]);
  }

  const extension = path.extname(realPath);
  const content = fs.readFileSync(realPath, extension === ".html" ? "utf8" : null);
  if (extension === ".html") {
    return send(res, 200, injectReload(content), mimeTypes[".html"]);
  }

  return send(res, 200, content, mimeTypes[extension] || mimeTypes[".txt"]);
});

[
  "index.html",
  "status.html",
  "styles.css",
  "script.js",
  "analytics.js",
  "README.md",
  "analytics.json",
  "VERSION",
].forEach((file) => {
  fs.watch(path.join(root, file), { persistent: true }, () => {
    for (const client of clients) client.write("event: reload\ndata: update\n\n");
  });
});

server.listen(port, host, () => {
  console.log(`Nine Pillars Covenant dev server listening on http://${host}:${port}`);
  console.log("Shalom ❤️");
});
