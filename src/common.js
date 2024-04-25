import ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/mode-java.js';

// this is going to be the place where all shared enums and constants.


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

  
  export function isPrimative(type){
    const primatives = ["boolean","char","double","float","int","short","String"];
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
    ASSIGNMENT:                     "ASSIGNMENT",
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
    PRINTLN:                        "PRINTLN",
    INPUT:                          "INPUT",
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
    ARRAY_REFERENCE:                "ARRAY_REFERENCE",
    ARRAY_REFERENCE_ASSIGNMENT:     "ARRAY_REFERENCE_ASSIGNMENT", // remove?
    SPECIAL_STRING_FUNCCALL:        "SPECIAL_STRING_FUNCCALL",
    NEWLINE:                        "NEWLINE",
}


// this is the special Error type that is thrown when there is in error in the ide. 
export class PraxlyError extends Error {
  constructor(message, line) {
    super(`<pre>error occurred on line ${line}:\n\t${message}</pre>`);
    this.errorMessage = this.message;
    appendAnnotation(message, line);

    errorOutput = this.message;       // not appending run-time error
  }
}


export const MAX_LOOP = 100;  // prevents accidental infinite loops
export var printBuffer = "";
export var errorOutput = "";
export var blockErrorsBuffer = {};
export var annotationsBuffer = [];
export var markersBuffer = [];

export function addToPrintBuffer(message) {
  printBuffer += message;

  //new: displays the live output
  const stdOut = document.querySelector('.stdout');
  stdOut.innerHTML = printBuffer;
}

/**
 * this clears the output buffer. It does not clear what the user sees on their screen.
 * It also clears all of the ace error annotations.
 */
export function clearOutput() {
  printBuffer = "";
}

export function clearErrors() {
  annotationsBuffer = [];
  errorOutput = "";
  blockErrorsBuffer = {};
  markersBuffer.forEach((markerId) => {
    textEditor.session.removeMarker(markerId);
  });
}

/**
 * This is a unique function that will throw a compiling error. This is commonly used for
 *  lexing and parsing errors so that the correct tree is inferred but there is an error thrown for bad syntax.
 * @param {string} type the type of error
 * @param {string} error the error message
 * @param {number} line the error line number
 */
export function textError(type, error, line) {
  errorOutput += `<pre>${type} error occurred on line ${line}:  ${error} \n\t </pre>`;
  appendAnnotation(error, line);
}

export function defaultError(message) {
  errorOutput += `<pre>default error:  ${message} \n\t Ben has not written an error message for this issue yet. Contact him through the bug report form on the help page. </pre>`;
}

export function addBlockErrors(workspace) {
  for (var key in blockErrorsBuffer) {
    var block = workspace.getBlockById(key);
    block.setWarningText(blockErrorsBuffer[key]);
  }
}

/**
 * This function will create the little 'x' on a message in Praxly's code editor
 * @param {string} errorMessage the string that you want to pass as the error
 * @param {number} line the line number that the error occurred on
 */
export function appendAnnotation(errorMessage, line) {
  var annotation = {
    row: line,
    column: 0,
    text: errorMessage,
    type: "error"
  };
  annotationsBuffer.push(annotation);

  //gohere
  // might cause a bug depending on how line is calculated. 
  highlightLine(line + 1);

}

/**
 * This will highlight a line of code
 * @param {number} line the desired line that you want to highlight
 * @param {boolean} debug set this flag to true if this is being used for debugging. (it changes the color to green)
 * @returns the marker id associated with the marker. This should not be needed.
 */
export function highlightLine(line) {
  var session = textEditor.session;

  // var errorRange = indextoAceRange(line - 1);
  var Range = ace.require('ace/range').Range;
  var errorRange = new Range(line, 0, line - 1, 1);
  var markerId = session.addMarker(errorRange, 'error-marker', 'fullLine');
  var color =`rgba(255, 0, 0, 0.2)`;

  var markerCss = `
      .error-marker {
        position: absolute;
        z-index: 1;
        background-color: ${color};
        border-bottom: 2px solid red;
      }
    `;

  // Check if the style tag already exists
  var existingStyleTag = document.getElementById('custom-style');
  if (!existingStyleTag) {
    // If it doesn't exist, create a new style tag and set its ID
    // console.log(`couldn\'t find custom-style`);
    existingStyleTag = document.createElement('style');
    existingStyleTag.setAttribute('id', 'custom-style');
    document.head.appendChild(existingStyleTag);
  }

  // Append the error-marker rules to the existing style tag
  existingStyleTag.appendChild(document.createTextNode(markerCss));

  // console.log(`attempted to highlight ${line}`);
  markersBuffer.push(markerId);
  return markerId;
}




/**
 * This will highlight a line of code
 * @param {number} line the desired line that you want to highlight
 * @param {boolean} debug set this flag to true if this is being used for debugging. (it changes the color to green)
 * @returns the marker id associated with the marker. This should not be needed.
 */
export function highlightAstNode(node) {
  // console.log(`attempting to highlight index [${node.startIndex[0]},${ node.startIndex[1]}] to [${ node.endIndex[0]}, ${ node.endIndex[1] - 1}]`)
  var session = textEditor.session;

  // var errorRange = indextoAceRange(line - 1);
  var Range = ace.require('ace/range').Range;
  if (DEV_LOG){
    console.log(`attempting to highlight: `, node.startIndex[0], node.startIndex[1], node.endIndex[0], node.endIndex[1]);
  }

  var errorRange = new Range(node.startIndex[0], node.startIndex[1], node.endIndex[0], node.endIndex[1]);
  var markerId = session.addMarker(errorRange, 'error-marker', 'text');
  var color = getStepInto()? `rgba(255, 255, 0, 0.4)` : `rgba(0, 255, 0, 0.2)`;

  var markerCss = `
      .error-marker {
        position: absolute;
        z-index: 1;
        background-color: ${color};
      }
    `;

  // Check if the style tag already exists
  var existingStyleTag = document.getElementById('custom-style');
  if (!existingStyleTag) {
    // If it doesn't exist, create a new style tag and set its ID
    existingStyleTag = document.createElement('style');
    existingStyleTag.setAttribute('id', 'custom-style');
    document.head.appendChild(existingStyleTag);
  }

  // Append the error-marker rules to the existing style tag
  existingStyleTag.appendChild(document.createTextNode(markerCss));

  // console.log(`attempted to highlight ${line}`);
  markersBuffer.push(markerId);
  return markerId;
}

export const lineToAceRange = (line) => {
  var Range = ace.require('ace/range').Range;
  return new Range(line, 0, line, 1);
};

export function indexToAceRange (startIndex, endIndex){
  var Range = ace.require('ace/range').Range;
  return new Range(startIndex[0], startIndex[1], endIndex[0], endIndex[1]);
};


export const StringFuncs = {
  CHARAT: "charAt",
  CONTAINS:  "contains",
  INDEXOF: "indexOf",
  LENGTH:  "length",
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


export const textEditor = ace.edit("aceCode", { fontSize: 19, mode: 'ace/mode/java' });


export const DebugButton = document.getElementById('DebugButton');
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


//this will let information that I deemed important to be logged to the console. 
export const DEV_LOG = true;