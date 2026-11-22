#!/usr/bin/env node
/**
 * Pre-commit secret check. Looks only at the lines being added in the staged
 * diff and blocks the commit if something looks like a real credential.
 * Bypass for a known false positive: git commit --no-verify
 */
const { execSync } = require("node:child_process");

const PATTERNS = [
  ["Google API key", /AIza[0-9A-Za-z_-]{35}/],
  ["JWT / Supabase key", /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
  ["Private key", /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9]{36,}/],
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["Stripe key", /[sr]k_live_[A-Za-z0-9]{20,}/],
  ["OpenAI / Anthropic key", /sk-(proj-|ant-)[A-Za-z0-9_-]{20,}/],
  ["DB URL with password", /(mongodb(\+srv)?|postgres(ql)?|mysql):\/\/[^:\s/]+:[^@\s]+@/],
  ["Hardcoded password", /(password|passwd|secret)\s*[:=]\s*["'][^"'\s$]{6,}["']/i],
];
const BLOCKED_FILES = /(^|\/)(\.env(\.(?!local\.example$)[\w.]+)?|.*\.pem|.*\.key|serviceAccount.*\.json)$/;

const diff = execSync("git diff --cached -U0 --no-color", { encoding: "utf8" });
const hits = [];
let file = "";
for (const line of diff.split("\n")) {
  if (line.startsWith("+++ b/")) {
    file = line.slice(6);
    if (BLOCKED_FILES.test(file)) hits.push(`${file}: this file type should not be committed`);
    continue;
  }
  if (!line.startsWith("+") || line.startsWith("+++")) continue;
  for (const [name, re] of PATTERNS) {
    if (re.test(line)) hits.push(`${file}: possible ${name}`);
  }
}

if (hits.length) {
  console.error("\nCommit blocked, staged changes look like they contain secrets:\n");
  [...new Set(hits)].forEach((h) => console.error("  - " + h));
  console.error("\nMove the value to .env.local. If it's a false positive: git commit --no-verify\n");
  process.exit(1);
}
