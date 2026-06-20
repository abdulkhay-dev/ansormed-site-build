// Dev-раннер: поднимает локальный CORS-прокси к API и запускает `next dev`.
//
// Зачем: статический экспорт (output: "export") несовместим с rewrites/route
// handlers, поэтому проксировать API внутри Next в dev нельзя. Реальный API
// (api.ansormed.uz) не отдаёт CORS-заголовки, и браузер не может ходить к нему
// напрямую. Прокси добавляет Access-Control-Allow-Origin, а фронтенд в dev
// обращается к нему через NEXT_PUBLIC_API_BASE. На проде ту же роль выполняет
// redirect /api/* из netlify.toml (там прокси серверный, CORS не нужен).

import http from "node:http";
import { spawn } from "node:child_process";

const API_TARGET = process.env.API_ORIGIN || "https://api.ansormed.uz";
const PROXY_PORT = Number(process.env.DEV_PROXY_PORT || 8787);

const proxy = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", async () => {
    try {
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const upstream = await fetch(API_TARGET + req.url, {
        method: req.method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      });
      res.end(text);
    } catch (err) {
      res.writeHead(502);
      res.end(JSON.stringify({ detail: String(err) }));
    }
  });
});

proxy.listen(PROXY_PORT, () => {
  console.log(`▸ API dev-proxy: http://localhost:${PROXY_PORT} → ${API_TARGET}`);
});

const next = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_API_BASE: `http://localhost:${PROXY_PORT}` },
});

const shutdown = () => {
  proxy.close();
  if (!next.killed) next.kill("SIGINT");
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
next.on("exit", (code) => {
  proxy.close();
  process.exit(code ?? 0);
});
