/**
 * FitX design preview server.
 * Zero dependencies: static files from this directory + live reload over SSE.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const RELOAD_CLIENT = `
(() => {
  try {
    const source = new EventSource('/__reload');
    source.onmessage = () => location.reload();
  } catch (_) {}
})();
`;

const clients = new Set();
let debounce;

try {
  watch(ROOT, { recursive: true }, (_event, file) => {
    if (!file || file.startsWith(".") || file.includes("node_modules")) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      for (const res of clients) res.write("data: reload\n\n");
    }, 80);
  });
} catch (error) {
  console.warn("file watching unavailable:", error.message);
}

setInterval(() => {
  for (const res of clients) res.write(": ping\n\n");
}, 25000).unref();

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");

  if (url.pathname === "/__reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("retry: 800\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (url.pathname === "/__reload.js") {
    res.writeHead(200, { "Content-Type": MIME[".js"], "Cache-Control": "no-cache" });
    res.end(RELOAD_CLIENT);
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = normalize(join(ROOT, pathname));
  if (!filePath.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    let body = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    if (type.startsWith("text/html")) {
      body = Buffer.from(
        body.toString("utf8").replace("</body>", '<script src="/__reload.js"></script></body>')
      );
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`FitX preview running on http://0.0.0.0:${PORT}`);
});
