import ace from 'ace-builds';
import './mode-praxly.js';

// this is going to be the place where all shared enums and constants. (this is the place for all shared enums and constants.)

/**
 * this is the 'enum' that I use when I refer to types.
 */
export const TYPES = {
    BOOLEAN:        "boolean",
    CHAR:           "char",
    DOUBLE:         "double",
    FLOAT:          "float",
    INT:            "int",
    SHORT:          "short",
    STRING:         "String",

    BOOLEAN_ARRAY:  "boolean[]",
    CHAR_ARRAY:     "char[]",
    DOUBLE_ARRAY:   "double[]",
    FLOAT_ARRAY:    "float[]",
    INT_ARRAY:      "int[]",
    SHORT_ARRAY:    "short[]",
    STRING_ARRAY:   "String[]",

    INVALID:        "INVALID",
    NULL:           "null",
    VOID:           "void",
};

export function isPrimative(type) {
    const primatives = ["boolean", "char", "double", "float", "int", "short", "String"];
    return primatives.includes(type);
}

/**
 * this is the 'enum' that I refer to when dealing with operations.
 */
export const OP = {
    ASSIGNMENT:                     "ASSIGNMENT",
    ADDITION:                       "ADDITION",
    SUBTRACTION:                    "SUBTRACTION",
    MULTIPLICATION:                 "MULTIPLICATION",
    DIVISION:                       "DIVISION",
    MODULUS:                        "MODULUS",
    EXPONENTIATION:                 "EXPONENTIATION",
    EQUALITY:                       "EQUALITY",
    INEQUALITY:                     "INEQUALITY",
    GREATER_THAN:                   "GREATER THAN",
    LESS_THAN:                      "LESS THAN",
    GREATER_THAN_OR_EQUAL:          "GREATER THAN OR EQUAL",
    LESS_THAN_OR_EQUAL:             "LESS THAN OR EQUAL",
    AND:                            "AND",
    OR:                             "OR",
    NOT:                            "NOT",
    NEGATE:                         "NEGATE",
};

export const NODETYPES = {
    ...OP,
    ...TYPES,
    PRINT:                          "PRINT",
    ASSOCIATION:                    "ASSOCIATION",
    BUILTIN_FUNCTION_CALL:          "BUILTIN_FUNCTION_CALL",
    CODEBLOCK:                      "CODEBLOCK",
    PROGRAM:                        "PROGRAM",
    STATEMENT:                      "STATEMENT",
    IF:                             "IF",
    IF_ELSE:                        "IF_ELSE",
    VARDECL:                        "VARDECL",
    ARRAY_ASSIGNMENT:               "ARRAY_ASSIGNMENT",
    LOCATION:                       "LOCATION",
    FOR:                            "FOR",
    WHILE:                          "WHILE",
    DO_WHILE:                       "DO_WHILE",
    REPEAT_UNTIL:                   "REPEAT_UNTIL",
    COMMENT:                        "COMMENT",
    SINGLE_LINE_COMMENT:            "SINGLE_LINE_COMMENT",
    FUNCDECL:                       "FUNCDECL",
    FUNCCALL:                       "FUNCTION_CALL",
    RETURN:                         "RETURN",
    ARRAY_LITERAL:                  "ARRAY_LITERAL",
    ARRAY_CREATE:                   "ARRAY_CREATE",
    ARRAY_REFERENCE:                "ARRAY_REFERENCE",
    ARRAY_REFERENCE_ASSIGNMENT:     "ARRAY_REFERENCE_ASSIGNMENT", // remove?
    SPECIAL_STRING_FUNCCALL:        "SPECIAL_STRING_FUNCCALL",
    NEWLINE:                        "NEWLINE",
}


export var errorOutput = "";  // buffer for error messages (don't display until run)
export const MAX_LOOP = 100;  // prevents accidental infinite loops

// this is the special Error type that is thrown when there is in error in the IDE.
export class PraxlyError extends Error {
    constructor(message, line) {
        super("runtime error occurred on line " + line + ":<br>" + message);
        textError("runtime", message, line);
    }
}

/**
 * This is commonly used for lexing and parsing errors so that the correct tree
 * is inferred but there is an error displayed for bad syntax.
 * @param {string} type the type of error
 * @param {string} message the error message
 * @param {number} line the error line number
 */
export function textError(type, message, line) {
    if (errorOutput) {
        errorOutput += "<br><br>";
    }
    errorOutput += type + " error occurred on line " + line + ":<br>" + message;
}

export function defaultError(message) {
    if (errorOutput) {
        errorOutput += "<br><br>";
    }
    errorOutput += message
        + '<br><br><br>Will you please submit a '
        + '<a href="https://forms.gle/ULnV7mxYjrqjx8ATA" target="_blank">bug report</a>'
        + ' for this error?';
}

export function clearErrors() {
    errorOutput = "";
}


export function consoleOutput(message) {
    const stdOut = document.querySelector('.stdout');
    stdOut.insertAdjacentHTML('beforeend', message);
}

export function consoleInput() {
    // This function is called when the input node of an AST is evaluated. It
    // injects a text input in the console and awaits a string from the user.
    // Unlike prompt, this is a non-blocking operation. It returns a promise
    // that is resolved when the user hits enter. After the resolve, the input
    // remains in the console in read-only mode.

    // To keep the user from clicking other things before submitting an input,
    // an overlay sits atop all other elements and blocks mouse events.

    // .stdout is a misleading term. The element is a console that shows both
    // both input and output.
    const stdOut = document.querySelector('.stdout');
    const blocker = document.getElementById('blocker');

    const inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'text');
    stdOut.appendChild(inputElement);
    inputElement.focus();

    stdOut.appendChild(document.createElement('br'));

    blocker.style.display = 'block';
    inputElement.classList.add('prompt');
    inputElement.addEventListener('animationend', () => {
      inputElement.classList.remove('attract');
    });

    const clickListener = () => {
      inputElement.classList.add('attract');
      inputElement.focus();
    };
    blocker.addEventListener('click', clickListener);

    return new Promise((resolve, reject) => {
      const listener = event => {
        if (event.key === 'Enter' || event.key === 'Escape') {
          inputElement.removeEventListener('keyup', listener);
          inputElement.readOnly = true;
          inputElement.classList.remove('prompt');
          blocker.style.display = 'none';
          if (event.key === 'Enter') {
            resolve(inputElement.value);
          } else if (event.key === 'Escape') {
            reject();
          }
        }
      };
      inputElement.addEventListener('keyup', listener);
    });
}


/**
 * This will highlight a line of code.
 * old param: {number} line the desired line that you want to highlight
 * old param: {boolean} debug set this flag to true if this is being used for debugging. (it changes the color to green)
 * old returns: the marker id associated with the marker.
 */
export function highlightAstNode(environment, node, cssClass) {
    if (DEV_LOG) {
        console.log(`attempting to highlight: `, node.startIndex[0], node.startIndex[1], node.endIndex[0], node.endIndex[1]);
    }

    // scroll the text into view if necessary
    if (node.line) {
        let row = node.line - 1;
        if (!textEditor.isRowFullyVisible(row)) {
            // arguments: line number, center vertically, animate the scroll
            textEditor.scrollToLine(row, true, true);
        }
    }

    // highlight the text
    var Range = ace.require('ace/range').Range;
    var debugRange = new Range(node.startIndex[0], node.startIndex[1], node.endIndex[0], node.endIndex[1]);
    var markerId = textEditor.session.addMarker(debugRange, cssClass, 'text');

    // highlight the block
    if (node.blockID) {
        environment.global.blocklyWorkspace.highlightBlock(node.blockID);
    }

    return markerId;
}

export const lineToAceRange = (line) => {
    var Range = ace.require('ace/range').Range;
    return new Range(line, 0, line, 1);
};

export function indexToAceRange(startIndex, endIndex) {
    var Range = ace.require('ace/range').Range;
    return new Range(startIndex[0], startIndex[1], endIndex[0], endIndex[1]);
};


export const StringFuncs = {
    CHARAT: "charAt",
    CONTAINS: "contains",
    INDEXOF: "indexOf",
    LENGTH: "length",
    SUBSTRING: "substring",
    TOLOWERCSE: "toLowerCase",
    TOUPPERCASE: "toUpperCase"
}


let debugMode = false;
export function setDebugMode(value) {
    debugMode = value;
}
export function getDebugMode() {
    return debugMode;
}

let stepInto = false;
export function setStepInto(value) {
    stepInto = value;
}
export function getStepInto() {
    return stepInto;
}

let stopClicked = false;
export function setStopClicked(value) {
    stopClicked = value;
}
export function getStopClicked() {
    return stopClicked;
}


// const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
// const fontSize = isFirefox ? 18 : 16;

export const textEditor = ace.edit("aceCode", {
  fontSize: 16,
  mode: 'ace/mode/praxly',
});

export const debugButton = document.getElementById('debugButton');
export const stepButton = document.getElementById('stepButton');
export const stopButton = document.getElementById('stopButton');
export const stepIntoButton = document.getElementById('stepIntoButton');

/**
 * This function will present a coming soon toast.
 * This works as a great eventListener for buttons that are not yet implemented.
 */
export function comingSoon() {
    const ComingSoonToast = document.getElementById('comingSoon');

    ComingSoonToast.style.display = 'block';
    setTimeout(function () {
        ComingSoonToast.style.display = 'none';
    }, 3000); // Hide the toast after 3 seconds (adjust as needed)
}


// this will let information deemed important to be logged to the console
export const DEV_LOG = false;
