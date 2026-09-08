import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const appRoot = dirname(root);
const port = Number(process.env.PORT) || 3000;
const nextBin = join(appRoot, "node_modules/next/dist/bin/next");

function pidsOnPort(p) {
  try {
    return execSync(`lsof -tiTCP:${p} -sTCP:LISTEN`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);
  } catch {
    return [];
  }
}

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* spin */
  }
}

function freePort(p) {
  const pids = pidsOnPort(p);
  if (pids.length === 0) return;

  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }

  const deadline = Date.now() + 2500;
  while (Date.now() < deadline && pidsOnPort(p).length > 0) {
    sleepSync(100);
  }

  for (const pid of pidsOnPort(p)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }

  console.log(`[dev] freed port ${p} (was pid ${pids.join(", ")})`);
}

freePort(port);

const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
  cwd: appRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
