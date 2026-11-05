const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const dist = path.join(root, "dist");
const defaultSiteUrl = "https://2298741867.github.io/eight-pillars-covenant-/";
const defaultPreviewUrl =
  "https://github.com/2298741867/eight-pillars-covenant-/blob/main/index.html";

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

const normalizeUrl = (value) => (value.endsWith("/") ? value : `${value}/`);
const readVersion = () => fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
const ensureDir = (target) => fs.mkdirSync(target, { recursive: true });
const copy = (file) => fs.copyFileSync(path.join(root, file), path.join(dist, file));
const write = (file, content) => fs.writeFileSync(path.join(dist, file), content, "utf8");

loadDotEnv();
const version = readVersion();
const generatedAt = new Date().toISOString();
const siteUrl = normalizeUrl(process.env.SITE_URL || defaultSiteUrl);
const previewUrl = process.env.PREVIEW_URL || defaultPreviewUrl;
const customDomain = (process.env.CUSTOM_DOMAIN || "").trim();
const analytics = {
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
};

fs.rmSync(dist, { recursive: true, force: true });
ensureDir(dist);

[
  "index.html",
  "status.html",
  "styles.css",
  "script.js",
  "analytics.js",
  "README.md",
  "DEPLOYMENT.md",
  "DEVELOPMENT.md",
  "ANALYTICS.md",
  "COVENANT_OF_LIGHT.md",
  "MASTER_INDEX_NAVIGATION.md",
  "NINE_PILLARS_COMPLETE.md",
  "NINE_PILLARS_VISUAL_GUIDE.md",
  "RITUAL_IX_METAMORPHOSIS.md",
].forEach(copy);

write(
  "site-config.js",
  `window.NINE_PILLARS_CONFIG = ${JSON.stringify(
    {
      version,
      siteUrl,
      previewUrl,
      statusUrl: `${siteUrl}status.html`,
      issueUrl:
        "https://github.com/2298741867/eight-pillars-covenant-/issues/new?template=deployment-feedback.md",
      analytics,
    },
    null,
    2
  )};\n`
);

write(
  "version.json",
  `${JSON.stringify(
    {
      version,
      generatedAt,
    },
    null,
    2
  )}\n`
);

write(
  "analytics.json",
  `${JSON.stringify(analytics, null, 2)}\n`
);

write(
  "status.json",
  `${JSON.stringify(
    {
      version,
      generatedAt,
      health: "ok",
      certificate: "active",
      analytics: analytics.enabled ? `${analytics.provider}-enabled` : "disabled-by-default",
      endpoints: {
        githubPreview: previewUrl,
        githubPages: siteUrl,
        localDevelopment: `http://localhost:${process.env.PORT || "8000"}/`,
        analyticsGuide: "ANALYTICS.md",
      },
    },
    null,
    2
  )}\n`
);

write(
  "healthz.json",
  `${JSON.stringify(
    {
      status: "ok",
      service: "nine-pillars-covenant-site",
      version,
      checkedAt: generatedAt,
    },
    null,
    2
  )}\n`
);

write(
  "deployment-certificate.json",
  `${JSON.stringify(
    {
      certificate: "Nine Pillars Covenant Deployment Suite",
      version,
      issuedAt: generatedAt,
      activeMethods: [
        "GitHub Preview",
        "GitHub Pages",
        "Local Development Server",
        "Privacy-First Analytics",
      ],
      blessing: "Shalom ❤️",
    },
    null,
    2
  )}\n`
);

write(
  "robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`
);

write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}</loc>\n  </url>\n  <url>\n    <loc>${siteUrl}status.html</loc>\n  </url>\n</urlset>\n`
);

write(
  "_headers",
  `/*\n  Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' https://plausible.io https://cdn.usefathom.com; connect-src 'self' https://plausible.io https://cdn.usefathom.com https://raw.githubusercontent.com; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Permissions-Policy: interest-cohort=()\n  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\n  Cache-Control: public, max-age=300\n`
);

write(".nojekyll", "\n");

if (customDomain) {
  write("CNAME", `${customDomain}\n`);
}

console.log(`Built dist for ${siteUrl}`);
console.log("Shalom ❤️");
