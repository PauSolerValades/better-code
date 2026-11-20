import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isCodeProject } from "../extensions/better-code.ts";

const made = [];
const dir = () => {
  const d = mkdtempSync(join(tmpdir(), "pc-gate-"));
  made.push(d);
  return d;
};

test("gate: code markers open it, a bare directory does not", () => {
  const bare = dir();
  assert.equal(isCodeProject(bare), false);
  writeFileSync(join(bare, "package.json"), "{}");
  assert.equal(isCodeProject(bare), true);
  assert.equal(isCodeProject("/nonexistent-better-code-dir"), false);
});

test("rules path still resolves and has a body", () => {
  const file = fileURLToPath(new URL("../skills/better-code/SKILL.md", import.meta.url));
  const raw = readFileSync(file, "utf8");
  const body = raw.replace(/^---[\s\S]*?---\s*/, "");
  assert.match(body, /One step at a time/);
  // A ": " inside a plain YAML scalar makes the whole frontmatter unparseable,
  // and pi then drops the skill without a word. Cost me one silent no-load.
  const description = raw.match(/^description: (.*)$/m)?.[1] ?? "";
  assert.ok(description.length > 0, "description missing");
  assert.ok(!description.includes(": "), `description has a ": ", quote it or use > (${description})`);
});

test.after(() => made.forEach((d) => rmSync(d, { recursive: true, force: true })));
