// Injects the better-code ruleset only in sessions that look like coding work, so a chat
// session pays nothing. The gate is a filesystem check: no prompt guessing, no model call.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const RULES = fileURLToPath(new URL("../skills/better-code/SKILL.md", import.meta.url));
const MARKERS = [".git", "package.json", "pyproject.toml", "Cargo.toml", "go.mod", "Gemfile", "pom.xml", "build.gradle"];

export const isCodeProject = (cwd: string) => MARKERS.some((m) => existsSync(join(cwd, m)));

// Read per turn, not memoized: an edit to the markdown applies without reloading the extension.
function rules(): string {
  try {
    return readFileSync(RULES, "utf8").replace(/^---[\s\S]*?---\s*/, "");
  } catch {
    return ""; // a missing skill file must never break the session
  }
}

export default function betterCode(pi: ExtensionAPI) {
  pi.on("before_agent_start", (event, ctx) => {
    const text = isCodeProject(ctx.cwd) ? rules() : "";
    if (text) event.systemPromptOptions.sections.better_code = text;
    else delete event.systemPromptOptions.sections.better_code;
  });
}
