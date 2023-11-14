import ace from 'ace-builds';


// this is going to be the place wahere all shared enums and constants.

/**
 * this is the 'enum' that I use when I refer to types.
 */
export const TYPES = {
    INT:            "INT",
    DOUBLE:         "DOUBLE",
    STRING:         "STRING",
    BOOLEAN:        "BOOLEAN",
    FLOAT:          "FLOAT",
    SHORT:          "SHORT",
    CHAR:           "CHAR",
    VOID:           "VOID",
    INVALID:        "INVALID"
  };


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
    PRINT:                          "print", 
    PRINTLN:                        "println", 
    CODEBLOCK:                      "codeblock", 
    PRORAM:                         "program", 
    STATEMENT:                      "statement", 
    IF:                             "if", 
    IF_ELSE:                        "if_else", 
    VARDECL:                        "vardecl", 
    ARRAY_ASSIGNMENT:               "array_assignment", 
    LOCATION:                       "location", 
    FOR:                            "for", 
    WHILE:                          "while", 
    DO_WHILE:                       "do_while", 
    REPEAT_UNTIL:                   "repeat until", 
    COMMENT:                        "comment", 
    SINGLE_LINE_COMMENT:            "single line comment", 
    FUNCDECL:                       "funcdecl", 
    FUNCCALL:                       "function call", 
    RETURN:                         "return", 
    ARRAY_LITERAL:                  "array literal", 
    ARRAY_REFERENCE:                "array reference", 
    ARRAY_REFERENCE_ASSIGNMENT:     "ARRAY_REFERENCE_ASSIGNMENT", // remove?
}

export class PraxlyErrorException extends Error {
  constructor(message, line) {
    super(`<pre>error occured on line ${line}:\n\t${message}</pre>`);
    this.errorMessage = this.message;
    appendAnnotation(message, line);
    errorOutput += this.message;

  }
}

export const MAX_LOOP = 100;  // prevents acccidental infinite loops
export var printBuffer = "";
export var errorOutput = "";
export var blockErrorsBuffer = {};
export var annotationsBuffer = [];
export var markersBuffer = [];

export function addToPrintBuffer (message){
  printBuffer += message;
}

/**
 * this clears the output buffer. It does not clear what the user sees on their screen. 
 * It also clears all of the ace error annotations. 
 */
export function clearOutput() {
    annotationsBuffer = [];
    printBuffer = "";
    errorOutput = "";
    blockErrorsBuffer = {};
    markersBuffer.forEach((markerId)=> {
      textEditor.session.removeMarker(markerId);
    });
  }

/**
 * This is a unique function that will throw a compiling error. 
 * @param {string} type the type of error
 * @param {string} error the error message
 * @param {number} line the error line number 
 */
export function textError(type, error, line){
    errorOutput += `<pre>${type} error occured on line ${line}:  ${error} \n\t </pre>`;
    appendAnnotation(error, line);
  }

export function defaultError(message){
errorOutput += `<pre>default error:  ${message} \n\t Ben has not written an error message for this issue yet. Contact him thrrough the bug report form on the help page. </pre>`;
}

export function addBlockErrors(workspace){
    for (var key in blockErrorsBuffer){
        var block = workspace.getBlockById(key);
        block.setWarningText(blockErrorsBuffer[key]);
    }
  }


/**
 * This function will create the little 'x' on a message in Praxly's code editor
 * @param {string} errorMessage the string that you want to passs as the error
 * @param {number} line the line number that the error occured on
 */
export function appendAnnotation(errorMessage, line) {
    var annotation = {
      row: line - 1, // no idea why the rows start with zero here but start with 1 everywhere else, but okay
      column: 0,
      text: errorMessage,
      type: "error"
    };
    annotationsBuffer.push(annotation);
    highlightLine(line);
  
  }


/**
 * This will highlight a line of code
 * @param {number} line the desired line that you want to highlight
 * @param {boolean} debug set this flag to true if this is being used for debugging. (it changes the color to green)
 * @returns the marker id associated with the marker. This should not be needed.
 */
function highlightLine(line, debug = false) {
    var session = textEditor.session;
    
    // var errorRange = indextoAceRange(line - 1);
    var Range = ace.require('ace/range').Range;
    var errorRange = new Range(line, 0, line - 1, 1);
    var markerId = session.addMarker(errorRange, 'error-marker', 'fullLine');
  
    var markerCss = `
      .error-marker {
        position: absolute;
        z-index: 1;
        background-color: rgba(255, 0, 0, 0.2);
        border-bottom: 2px solid red;
      }
    `;
  
    // Check if the style tag already exists
    var existingStyleTag = document.getElementById('custom-style');
    if (!existingStyleTag) {
      // If it doesn't exist, create a new style tag and set its ID
      console.error(`couldn\'t find the stylesheet`);
      existingStyleTag = document.createElement('style');
      existingStyleTag.setAttribute('id', 'custom-style');
      document.head.appendChild(existingStyleTag);
    }
  
    // Append the error-marker rules to the existing style tag
    existingStyleTag.appendChild(document.createTextNode(markerCss));
  
    console.log(`attempted to highlight ${line}` );
    markersBuffer.push(markerId);
    return markerId;
  }


  
export const indextoAceRange = (line) => {

    var Range = ace.require('ace/range').Range;
    return new Range(line, 0, line, 1);
  };


  ace.config.set('basePath', './node_modules/ace-builds/src-min-noconflict');
  export const textEditor = ace.edit("aceCode", {fontSize: 19, mode: 'ace/mode/java'});