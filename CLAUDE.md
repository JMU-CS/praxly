# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Praxly

Praxly is a web-based IDE for reading, writing, and running the pseudocode used in the [CS Praxis Test](https://praxis.ets.org/test/5652.html). It features bidirectional sync between a block editor (Blockly) and a text editor (Ace). There are three HTML entry points: `index.html` (landing page), `main.html` (full IDE), and `embed.html` (iframe-embeddable version).

## Commands

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build
# or with a custom server path:
PRAXLY_PATH=/relative/path/on/server npm run build

# Deploy to JMU server (manual)
./deploy.sh

# Run all tests (requires local dev server running, Firefox, and pip packages: colorama selenium)
cd test && ./run_all.sh

# Run a single CSV test file against a specific HTML page
cd test && python3 run_csv.py basics.csv embed.html
```

## Architecture

The user's program has an **Intermediate Representation (IR)** called `mainTree` (a JSON tree of nodes). When either editor changes, the IR is rebuilt and the other editor is updated:

- Text → Blocks: `turnCodeToBlocks()` → `text2tree()` → `tree2blocks()`
- Blocks → Text: `turnBlocksToCode()` → `blocks2tree()` → `tree2text()`

When the user runs a program, the IR is compiled to an **AST** and evaluated:
- `runTasks()` → `createExecutable(mainTree)` → `executable.evaluate(environment)`

The `environment` object carries variable/function scopes, a reference to the global scope (`environment.global`), and the PRNG state. `ReturnException` is used (thrown/caught) to implement `return` statements across async `evaluate()` calls.

## Source Files (`src/`)

| File | Role |
|---|---|
| `main.js` | Application entry point; wires up all editors, buttons, URL config, and `runTasks()` |
| `common.js` | Shared constants (`TYPES`, `OP`, `NODETYPES`), the Ace editor singleton, error/output helpers |
| `ast.js` | Walks the IR and constructs executable AST nodes; each node has an async `evaluate()` method |
| `text2tree.js` | Hand-written `Lexer` + `Parser` that produces the IR from source text |
| `blocks2tree.js` | Blockly generator that produces the IR from the block workspace |
| `tree2text.js` | Renders the IR back to formatted source text |
| `tree2blocks.js` | Renders the IR back into Blockly blocks |
| `newBlocks.js` | Defines all Blockly block shapes, inputs, and field configs |
| `toolbox.js` | Blockly toolbox categories and default block values |
| `debugger.js` | Step-through debugger UI: variable table, step/continue flow |
| `share.js` | Encodes/decodes program code in the URL fragment (`#code=...`) |
| `examples.js` | Sample programs shown in the examples modal |
| `theme.js` | Blockly dark/light theme definitions |
| `mode-praxly.js` | Ace editor syntax highlighting mode for Praxly pseudocode |

## URL / Embed Configuration

`embed.html` and `main.html` accept query parameters:

| Parameter | Options | Default (embed / main) |
|---|---|---|
| `?editor=` | `text`, `blocks`, `both` | `text` / `both` |
| `?button=` | `run`, `debug`, `both` | `run` / `both` |
| `?result=` | `output`, `vars`, `both` | `output` / `both` |
| `#code=` | URL-encoded pseudocode | — |

## Testing

Tests are Selenium-driven Python scripts that launch Firefox and connect to the local dev server at `http://localhost:5173`. Test cases are defined in CSV files (`test/*.csv`). `run_v2_csv.py` / `run_v2_all.sh` are newer variants of the same harness.
