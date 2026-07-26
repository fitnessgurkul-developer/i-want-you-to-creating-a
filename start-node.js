#!/usr/bin/env node
/**
 * Fitness Gurukul launcher.
 * Prefers the Node backend (server.js). Falls back to Python server.py.
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = __dirname;
const checkOnly = process.argv.includes("--check");
const nodeServer = path.join(root, "server.js");
const pyServer = path.join(root, "server.py");

if (fs.existsSync(nodeServer)) {
  if (checkOnly) {
    const result = spawnSync(process.execPath, ["--check", nodeServer], {
      cwd: root,
      stdio: "inherit",
    });
    process.exit(result.status == null ? 1 : result.status);
  }
  const args = process.argv.slice(2).filter((a) => a !== "--check");
  const result = spawnSync(process.execPath, [nodeServer, ...args], {
    cwd: root,
    stdio: "inherit",
  });
  process.exit(result.status == null ? 1 : result.status);
}

// Legacy Python fallback
const candidates = [["py", "-3"], ["py"], ["python"], ["python3"]];
function pythonWorks(cmd) {
  const result = spawnSync(cmd[0], [...cmd.slice(1), "-c", "import sys; print(sys.version_info[0])"], {
    encoding: "utf8",
  });
  if (result.error || result.status !== 0) return false;
  return String(result.stdout || "").trim().startsWith("3");
}
const python = candidates.find(pythonWorks);
if (!python) {
  console.error("Neither Node server.js nor Python 3 is available.");
  process.exit(1);
}
const args = checkOnly
  ? [...python.slice(1), "-m", "py_compile", pyServer]
  : [...python.slice(1), pyServer, ...process.argv.slice(2).filter((a) => a !== "--check")];
const result = spawnSync(python[0], args, { cwd: root, stdio: "inherit" });
process.exit(result.status == null ? 1 : result.status);
