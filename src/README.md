# Source Files

The main purpose of each source file is described below.

The intermediate representation (IR) of the user's program is
referred to as `mainTree` or `node` in the source code.
On change, the IR is rebuilt and the other editor is updated.

* When the text editor changes:
  `turnCodeToBLocks()` -> `text2tree()` -> `tree2blocks()`.
* When the block editor changes:
  `turnBlocksToCode()` -> `blocks2tree()` -> `tree2text()`.

When the user's program is run, the IR is translated into an
abstract syntax tree (AST).

* The `runTasks()` function first calls `createExecutable()`,
  which calls the constructor of each node of the AST.
* The `runTasks()` function then calls `exec.evaluate()`,
  which calls the `evaluate()` method of each AST node.

If an error occurs during execution, a PraxlyError is thrown,
which displays an error message and line number.

## Main Interpreter

* main.js -- application entry point loaded by index.html
* common.js -- constants, shared functions, output/errors
* ast.js -- executes the user's program by walking the IR

## Program Editors

* blocks2tree.js -- blocks2tree: compile IR from blocks
* text2tree.js -- text2tree: compile IR from text
* tree2blocks.js -- update blocks based on current IR
* tree2text.js -- update program based on current IR

## User Interface

* newBlocks.js -- defines blocks, shapes, inputs, etc.
* toolbox.js -- categories and default values for blocks
* examples.js -- sample programs linked above the editors
* share.js -- load/save text editor contents from/to url
* theme.js -- define Blockly styles for dark/light mode
