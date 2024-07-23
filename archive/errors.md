# Old Error Handling

Previously, we showed error messages:

1. In the block editor (as warning text)
2. In the text editor (as annotations)
3. In the output window (in red font)

When we decided to do #3 only, a lot of code was no longer needed:

* annotationsBuffer / textEditor.session.setAnnotations()
* blockErrorsBuffer / addBlockErrors()
* markersBuffer

Larger code snippets are copied below for future reference.

## Old Code Removed

Removed global variables from common.js:

```js
export var blockErrorsBuffer = {};
export var annotationsBuffer = [];
export var markersBuffer = [];
```

Removed exported functions from common.js:

```js
/**
 * This clears the output buffer. It also clears the ace error annotations.
 * It does not clear what the user sees on their screen.
 */
export function clearOutput() {
    const stdOut = document.querySelector('.stdout');
    stdOut.innerHTML = '';
}

export function clearErrors() {
    annotationsBuffer = [];
    errorOutput = "";
    blockErrorsBuffer = {};
    markersBuffer.forEach((markerId) => {
        textEditor.session.removeMarker(markerId);
    });
}

export function addBlockErrors(workspace) {
    for (var key in blockErrorsBuffer) {
        var block = workspace.getBlockById(key);
        block.setWarningText(blockErrorsBuffer[key]);
    }
}
```

Removed from `runTasks()` and `turnCodeToBlocks()`:

```js
textEditor.session.setAnnotations(annotationsBuffer);
addBlockErrors(workspace);
```

Replaced `clearErrors()` with `errorOutput = "";`.
