# ponytail-chunks

A fork of [ponytail](https://github.com/DietrichGebert/ponytail) that adds a verification gate,
because the two failures I kept hitting were agents implementing everything at once and then
declaring it done off a smoke test that proved nothing.

Two rules changed, nothing else:

- **One chunk at a time** — a chunk is one thing that runs on its own. If it needs more than one
  new file, it is not a chunk. Each chunk gets a real input and a real output before the next one
  starts, so a failure tells you which chunk broke.
- **Do not trust the output you generated** — reading your own code back confirms what you meant,
  not what it does. Run it with an input you chose before you saw the answer, and name the command
  and its output before saying "done". Tests are optional; running the real thing is not.

The rest (YAGNI ladder, shortest working diff, never cut validation or security) is upstream
ponytail, trimmed of the modes and the extra skills.

## Layout

```
skills/ponytail-chunks/SKILL.md   the rules; also the single source the extension injects
extensions/ponytail-chunks.ts     injects them only in sessions that look like coding work
test/gate.test.mjs                the gate and the rules path
```

## Install

```bash
pi install /home/pau/Developement/ponytail-chunks
```

Then drop upstream so the two rulesets do not stack:

```bash
pi remove git:github.com/DietrichGebert/ponytail
```

## When it applies

`extensions/ponytail-chunks.ts` appends the ruleset to the system prompt when the working directory
holds a code marker (`.git`, `package.json`, `pyproject.toml`, …). Anywhere else it adds nothing.
The section is injected through `systemPromptOptions.sections`, so pi patches it once and keeps
the prefix cached instead of resending it every turn.

Cost of the trade: asking a general question from inside a repo still loads the rules (~800 tokens,
once, cached). A stricter gate would miss real coding turns, which is the failure worth avoiding.

`/skill:ponytail-chunks` loads it by hand anywhere, including outside a repo.
