import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const outputDirectory = "_site";
const siteOrigin = "https://lemon314.com";
const navigationRoutes = [
  "/index.html",
  "/puns.html",
  "/answers.html",
  "/resume.html",
  "/webpages.html",
  "/photogallery.html",
  "/biography.html",
  "/familyhistory.html",
  "/pressreports/press_articles.html",
];

function readPage(route) {
  return readFileSync(join(outputDirectory, route), "utf8");
}

function htmlRoutes(directory = outputDirectory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) return htmlRoutes(filename);
    return entry.name.endsWith(".html")
      ? [`/${filename.slice(outputDirectory.length + 1)}`]
      : [];
  });
}

function publicUrl(route) {
  return siteOrigin + (route === "/index.html" ? "/" : route);
}

function assertLocalFile(reference, route) {
  const url = new URL(reference, siteOrigin + route);
  if (url.origin !== siteOrigin) return;
  const pathname = decodeURIComponent(url.pathname);
  const filename = join(
    outputDirectory,
    pathname,
    pathname.endsWith("/") ? "index.html" : "",
  );
  assert.ok(
    statSync(filename).isFile(),
    `${route} references a missing generated file: ${reference}`,
  );
}

test("representative root and nested pages retain the shared layout and legacy URLs", () => {
  for (const route of ["/index.html", "/pressreports/000301herald.html", "/answers/07route66.html"]) {
    const html = readPage(route);
    assert.match(html, /<!doctype html>/i, `${route} has an HTML document`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${route} has a page title`);
    assert.ok(
      html.includes(`rel="canonical" href="${publicUrl(route)}"`),
      `${route} has its public canonical URL`,
    );
    for (const target of navigationRoutes) {
      assert.ok(html.includes(`href="${target}"`), `${route} links to ${target}`);
    }
  }
});

test("publishes the images, styles, audio, and local navigation targets", () => {
  for (const route of htmlRoutes()) {
    const html = readPage(route);
    for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
      const reference = match[1];
      if (/^(?:mailto:|tel:|javascript:|data:|#)/i.test(reference)) continue;
      assertLocalFile(reference, route);
    }
    for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/g)) {
      for (const candidate of match[1].split(",")) {
        assertLocalFile(candidate.trim().split(/\s+/)[0], route);
      }
    }
  }
  assert.match(readPage("/index.html"), /<audio\b[^>]*src="\/images\/tea\.mp3"/);
  assert.match(readPage("/index.html"), /<picture>/);
  assert.match(readPage("/index.html"), /type="image\/avif"/);
  assert.match(readPage("/index.html"), /type="image\/webp"/);
});

test("retains the original pun image maps and family history content", () => {
  const mapTags = (html) => html.match(/<\/?map\b[^>]*>|<area\b[^>]*>/gi);
  const originalPuns = readFileSync("src/puns.html", "utf8");
  const generatedPuns = readPage("/puns.html");
  assert.ok(mapTags(originalPuns).length > 0, "the legacy image maps exist");
  assert.deepEqual(mapTags(generatedPuns), mapTags(originalPuns));
  assert.equal(
    [...generatedPuns.matchAll(/href="answers\/07route66\.html"/g)].length,
    2,
    "both original image-map areas retain the legacy answer link",
  );
  assert.match(readPage("/answers/07route66.html"), /<h2>Kicks on Route 66<\/h2>/);

  const originalFamilyHistory = readFileSync("src/familyhistory.html", "utf8");
  const familyContent = originalFamilyHistory.replace(/^---\n[\s\S]*?\n---\n/, "");
  assert.ok(
    readPage("/familyhistory.html").includes(familyContent.trim()),
    "the nested family history tables retain their content",
  );
});

test("lists every public HTML page in the sitemap and advertises it to crawlers", () => {
  const sitemap = readFileSync(join(outputDirectory, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    locations.sort(),
    htmlRoutes().map(publicUrl).sort(),
  );
  const robots = readFileSync(join(outputDirectory, "robots.txt"), "utf8");
  assert.ok(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`));
});
