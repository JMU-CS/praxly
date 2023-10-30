import ace from 'ace-builds';
import { FieldNumber } from 'blockly';
import { tokenize } from './newLexer';
import { praxlyDefaultTheme } from './theme';



export const textEditor = ace.edit("aceCode", {fontSize: 19, mode: 'ace/mode/java'});
// textEditor.session.setMode("ace/mode/java");

// var AceRange = ace.require('ace/range').Range;



export class PraxlyErrorException extends Error {
  constructor(message, line) {
    super(`<pre>error occured on line ${line}:\n\t${message}</pre>`);
    this.errorMessage = this.message;
    appendAnnotation(message, line);
    errorOutput += this.message;

  }
}

export const MAX_LOOP = 100;

export var printBuffer = "";
export var errorOutput = "";
export var blockErrorsBuffer = {};
export var annotationsBuffer = [];
export var markersBuffer = [];

export function addToPrintBuffer (message){
  printBuffer += message;
}


export function clearOutput() {
  annotationsBuffer = [];
  printBuffer = "";
  errorOutput = "";
  blockErrorsBuffer = {};
  markersBuffer.forEach((markerId)=> {
    textEditor.session.removeMarker(markerId);
  });
}


// might delete
// this is a unique function that will throw an error, but not halt execution. That way we can attempt to build as accurate of a tree as possible before shutting down. 
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

// might delete
// this will likely be replaced as well
export function sendRuntimeError(errormessage, json){
  textError('runtime', errormessage, json.line);
  blockErrorsBuffer[blockjson.blockID] = errormessage;

}


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

function highlightLine(line, debug = false) {
  var session = textEditor.session;
  
  var errorRange = indextoAceRange(line - 1);
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






// Get the underlying DOM element of the Ace editor

export const indextoAceRange = (line) => {

  var Range = ace.require('ace/range').Range;
  return new Range(line, 0, line, 1);
};



export const text2tree = () => {
  let code = textEditor?.getValue();

    console.log(code);
    let lexer = new Lexer(code);
    let tokens = lexer?.lex();
    // console.log('here are the new lexer tokens:');
    // console.log(tokenize(code));
    console.info('here are the tokens:');
    console.debug(tokens);
    let parser = new Parser(tokens);
    let textjson = parser?.parse();
    console.info('here is the tree:');
    console.debug(textjson);
    return textjson;
}

class Token {
    constructor(type, text, line) {
      this.token_type = type;
      this.value = text;
      this.line = line
    }
  }
  
  class Lexer {
    constructor(source) {
      if (source?.length > 0 && source[source?.length - 1] !== '\n'){
        source += "\n";
      } 
      this.source = source;
      this.tokens = [];
      this.i = 0;
      this.length = this.source?.length;
      this.token_so_far = "";
      this.keywords = ["if", "else", "end", "print", "println", "for", "while", 'and', 'or', 'do', 'repeat', 'until', 'not', 'return'];
      this.types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void', 'int[]'];
      this.startToken = 0;
      this.currentLine = 1;
    }
  
    printTokens() {
      for (let tok of this.tokens) {
        console.log(`Token: ${tok.token_type}, Value: ${tok.value}`);
      }
    }
  
    has_letter() {
      const a = this.source[this.i];
      return /^[A-Za-z]$/.test(a);
    }

  
    has(c) {
      return this.i < this.length && this.source[this.i] === c;
    }

    hasNot(c) {
      return this.i < this.length && this.source[this.i] !== c;
    }

    has_type(){
      return this.i < this.length &&  this.types.includes(this.source[this.i]);
    }

    has_ahead(c) {
      return this.i < this.length && this.source[this.i + 1] === c;
    }
    has_ahead_ahead(c) {
      return this.i < this.length && this.source[this.i + 2] === c;
    }

    hasNot_ahead(c) {
      return this.i < this.length && !this.source[this.i + 1] !== c;
    }


    has_digit() {
        const a = this.source[this.i];
        return /^[0-9]+$/.test(a);
      }
  
    capture() {
      this.token_so_far += this.source[this.i];
      this.i++;
    }
  
    skip() {
      this.i++;
      this.startToken ++;
    }

  
    emit_token(type) {

      this.tokens.push(new Token(type, this.token_so_far, this.currentLine));
      this.token_so_far = '';
      this.startToken = this.i;
    }
  
      lex() {
      while (this.i < this.length) {
        if (this.has("+")) {
            this.capture();
            this.emit_token("ADD");
        } else if (this.has('/') && this.has_ahead('*')){
          this.skip();
          var commentStart = this.i;
          this.skip();
          while (this.hasNot('*') && this.hasNot_ahead('/')){
            this.capture();
          }

          if (this.has('*') && this.has_ahead('/')){
            this.skip();
            this.skip();
            this.emit_token('comment');
            if (this.has('\n')){
              this.skip();
            }
          } 
          else {
            textError('lexing', 'looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.',commentStart, this.currentLine);
            // throw new PraxlyErrorException('looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.', this.currentLine);
            // appendAnnotation('looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.',commentStart, this.i);
            this.i -= 1;
            this.emit_token();
  
          }
          
        } else if (this.has("-")) {
          this.capture();
          this.emit_token("SUBTRACT");
        } else if (this.has("%")) {
          this.capture();
          this.emit_token("MOD");
        } else if (this.has("*")) {
            this.capture();
            this.emit_token("MULTIPLY");
        } else if (this.has("^")) {
            this.capture();
            this.emit_token("EXPONENT");
         } else if (this.has("≠")) {
            this.capture();
            this.emit_token("Not_Equal");
         } else if (this.has('/') && this.has_ahead('/')){
          this.skip();
          this.skip();
          while(this.hasNot('\n')){
            this.capture();
          }
          this.skip();
          this.emit_token("single_line_comment");

        } else if (this.has("/")) {
            this.capture();
            this.emit_token("DIVIDE");
        } else if (this.has("<")) {
          this.capture();
          if (this.has("=")) {
            this.capture();
            this.emit_token("Less_Than_Equal_To");
          } else if (this.has("-")){
            this.capture();
            this.emit_token("Assignment");
          } else {
            this.emit_token("Less_Than");
          }
        } else if (this.has("!")) {
          this.capture();
          if (this.has("=")) {
            this.capture();
            this.emit_token("Not_Equal");
          } 
        } else if (this.has("=") || this.has('←')) {
          this.capture();
          if (this.has('=')){
            this.capture();
            this.emit_token("Equals");
          } else {
            this.emit_token("Assignment");
          }      
        } else if (this.has(">")) {
          this.capture();
          if (this.has("=")) {
            this.capture();
            this.emit_token("Greater_Than_Equal_To");
          } else {
            this.emit_token("Greater_Than");
          }
        } else if (this.has_digit()) {
            while (this.i < this.length && this.has_digit()) {
              this.capture();
            }
            if (this.i < this.length && this.has(".")) {
              this.capture();
              while (this.i < this.length && this.has_digit()) {
                this.capture();
              }
              this.emit_token("Double");
            } else {
              this.emit_token("INT");
            }
          } else if (this.has(" ")) {
            this.skip();

          } else if (this.has('\'')){
            this.skip();
            if (this.has_letter && this.has_ahead('\'')) {
              this.capture();
              this.skip();
              this.emit_token('char');
            } else {
              textError('lexing', 'looks like you didn\'t close your quotes on your char. \n \tRemember chars start and end with a single or double quote mark (\').',this.currentLine);
            }
          

          } else if (this.has("\"")){
            var stringStart = this.currentLine;
            this.skip();
            while (this.i < this.length && !this.has("\"") && !this.has("\'")) {
                this.capture();
              }
            if (this.has("\"")){
              this.skip();
              this.emit_token("String");
              
            }
            else {
              textError('lexing', 'looks like you didn\'t close your quotes on your String. \n \tRemember Strings start and end with a single or double quote mark (\").',stringStart);
              this.i -= 1;
              this.emit_token();
            }
        
          } else if (this.has_letter()) {
            while (this.i < this.length && (this.has_letter() || this.has_digit())) {
              this.capture();
            }
  
            if (this.token_so_far === "true" || this.token_so_far === "false") {
              this.emit_token("boolean");
            } else if (this.token_so_far === 'end'){
              while (this.hasNot('\n')) {
                this.capture();
              }
              this.emit_token(this.token_so_far);
            }
            else if (this.keywords.includes(this.token_so_far)) {
              this.emit_token(this.token_so_far);  
              
            } 
            else if (this.types.includes(this.token_so_far)) {
              
              this.emit_token('Type');  
            }

            else if (this.has('(') || this.has_ahead(')')){
              this.emit_token('function');
            }

             else {
              if (this.token_so_far !== ''){
                this.emit_token("Variable");

              }

            }

          
          } else if (this.has(",")) {
            this.capture();
            this.emit_token(",");
          
          } else if (this.has(";")) {
              this.capture();
              this.emit_token(";");
            
          } else if (this.has("(")) {
            this.capture();
            this.emit_token("(");
          } else if (this.has(")")) {
            this.capture();
            this.emit_token(")");
          } else if (this.has("{")) {
            this.capture();
            this.emit_token("{");
          } else if (this.has("}")) {
            this.capture();
            this.emit_token("}");
          } else if (this.has("[")) {
            this.capture();
            this.emit_token("[");
          } else if (this.has("]")) {
            this.capture();
            this.emit_token("]");
         } else if (this.has("\n")) {
            this.capture();
            this.emit_token("\n");
            this.currentLine += 1;
            while(this.has('\n')){
              this.skip();
              this.currentLine += 1;
            }

          } else if (this.has('\t')){
            // skip tabs since they only apppear to be for style
            this.skip();
          } 
          else {
            textError('lexing',  `invalid character \"${this.source[this.i] }\"`, this.i, this.i + 1);

            console.log("invalid character at index ", this.i);
            return 0;
          }
        }
        this.emit_token("EOF");
        return this.tokens;
      }
    }

class Parser {
  constructor(tokens) {
    this.statements = [];
    this.tokens = tokens;
    this.i = 0;
    this.j = 0;
    this.length = tokens?.length;
    this.eof = false;
    this.keywords = ["if", "else", "then", "done"];
    this.statementKeywords = ['if', 'print', 'for', 'while', 'println'];

  }


  hasNot(type) {
    return this.i < this.length && this.tokens[this.i].token_type !== type;
  }

  has(type) {
    return this.i < this.length && this.tokens[this.i].token_type === type;
  }

  hasAny(types){
    return this.i < this.length && types.includes(this.tokens[this.i].token_type);
  }

  hasNotAny(types){
    return this.i < this.length && !types.includes(this.tokens[this.i].token_type);
  }

  has_ahead(type) {
    return this.i + 1 < this.length && this.tokens[this.i + 1].token_type === type;
  }

  hasNot_ahead(type) {
    return this.i + 1 < this.length && this.tokens[this.i + 1].token_type != type;
  }

  has_type() {
    return this.i < this.length && this.tokens[this.i].token_type === 'Type';
  }

  has_keyword() {
    return this.keywords.includes(this.tokens[this.i].token_type);
  }
  has_statementKeyword() {
    return this.statementKeywords.includes(this.tokens[this.i].token_type);
  }

  match_and_discard_next_token(type){
    if (this.tokens[this.i].token_type === type ){
      this.advance();
    } else{
      sendRuntimeError(`did not detect desired token at this location. \nexpected: \'${type}\'\n but was: ${this.tokens[this.i].token_type}`);
    }
  }





  //peeks ahead to determine if this annoying array syntax is correct.
  //assumes that if an = is seen before a newline, it must be an assignment
  has_array_reference_assignment(){
    var j = this.i;
    while(j < this.length && this.tokens[j].token_type !== '\n'){
      if(this.tokens[j].token_type === 'Assignment'){
        return true;
      }
      j++
    }
    return false;
  }

  advance() {
    this.i++;
  }




  parse() {
    if (!this.tokens){
      return;
    }
    return this.program();
    
  }



  atom() {
    
    const tok = this.tokens[this.i];
    var line = this.tokens[this.i].line;
    


    if (this.has('EOF')){
      this.eof = true;
      return;
    }

    if (this.has(',')){
      return;
    }
    else if (this.has("INT")) {

      this.advance();
      return {
        value: tok.value, 
        type: tok.token_type,
        blockID: "code",
        line: line, 
         line, 
         
        
      };
    } else if (this.has("String")) {
        this.advance();
        return {
          value: tok.value, 
          type: 'STRING',
          blockID: "code",
          line: line, 
          
           line, 
           
        };
    } else if (this.has("char")) {
        this.advance();
        return {
          value: tok.value, 
          type: "CHAR",
          blockID: "code",
          line: line, 
          
           line, 
           
        };
    } else if (this.has("Double")) {
        this.advance();
        return {
          value: tok.value, 
          type: "DOUBLE",
          blockID: "code",
          line: line, 
          
           line, 
           
        };
    } else if (this.has("boolean")) {
      this.advance();
      return {
        value: tok.value, 
        type: 'BOOLEAN',
        blockID: "code",
        line: line, 
        
         line, 
         
      };

    } else if (this.has('{')){
      let result = {
        blockID: 'code', 
        line: line, 
         
         line,
        type: 'ARRAY',
      };
      // result.type = 'ARRAY';
      // result.name = this.tokens[this.i].value;
      var args = [];
      this.advance();
      var loopBreak = 0;
      while (this.hasNot('}') &&  loopBreak < MAX_LOOP) {
        // this.advance();
        var param = this.boolean_operation();
        args.push(param);
        if (this.has(',')) {
          this.advance();
          
        }
        loopBreak++;
      }
      console.log('here are the array contents');
      console.log(args);
      result.params = args;
      if (this.hasNot('}')){
        textError("parsing", "didnt detect closing curlybrace in the array declaration", this.tokens[this.i].line);
        // console.error('didnt detect closing parintheses in the arguments of  a function call');
      }
      this.advance();
      return result;
    
    } 
    else if (this.has("(")) {
      this.advance();
      const expression = this.boolean_operation();
      if (this.has(")")) {
        this.advance();
      } else {
        textError('parsing', 'did not detect closing parentheses', line, );
        // console.log("did not detect closing parentheses");
      }
      return expression;

    }else if (this.has("Variable")){
      this.advance();
      if(this.has('[')){
        this.advance();
        var index = this.boolean_operation();
        if (this.has("]")) {
          this.advance();
        } else {
          textError('parsing', 'did not detect closing bracket', line, );
          // console.log("did not detect closing parentheses");
        }
        return {
          name: tok.value, 
          type: 'ARRAY_REFERENCE',
          index: index,
          blockID: "code",
          line: line, 
          
            
          
        };
      }
      return {
        name: tok.value, 
        type: 'VARIABLE',
        blockID: "code",
        line: line, 
        
         line, 
          
        
      };

    } else if (this.has('function')){
        let result = {
          blockID: 'code', 
          line: line, 
           
           line
        };
        result.type = 'FUNCTION_CALL';
        result.name = this.tokens[this.i].value;
        this.advance();
        var args = [];
        if (this.has('(')){
          this.advance();
          var loopBreak = 0;
          while (this.hasNot(')') &&  loopBreak < MAX_LOOP) {
            // this.advance();
            var param = this.boolean_operation();
            args.push(param);
            if (this.has(',')) {
              this.advance();
              
            }
            loopBreak++;
          }
          console.log('here are the function call params:');
          console.log(args);
          result.params = args;
          if (this.hasNot(')')){
            appendAnnotation("didnt detect closing parintheses in the arguments of  a function call", this.tokens[this.i].line);
            // console.error('didnt detect closing parintheses in the arguments of  a function call');
          }
          
          this.advance();
          return result;
        }
      
    }else if (this.has("\n")){
      // this.advance();
      return;
    
    } else {
      textError("parsing", "missing or invalid base expression. most likely due to a missing operand", line);
    }
  }

  exponent() {
    let l =this.unary();
    // let l =this.atom();
    while (this.has("EXPONENT")) {
      var line = this.tokens[this.i].line;
      
      this.advance();
      const r =this.exponent();
      // l =new Operators.Exponent(left, right);
      l ={
              left: l, 
              right: r,
              type: "EXPONENT", 
              blockID: "code", 
              line: line

          }
    }
    return l;
  }

  
  location(){
    var tok = this.tokens[this.i];
    if (this.has('Variable')) {
      this.advance();
      if (this.has('[')){
        this.advance();
      }

    }
  }






  multiplicitive() {
    let l =this.exponent();
    while (this.has("MULTIPLY") || this.has("DIVIDE") || this.has("MOD")) {
      
      var line = this.tokens[this.i].line;
      if (this.has("MULTIPLY")) {
        this.advance();
        const r =this.exponent();
        // l =new Operators.Multiplication(left, right);
        l ={
            left: l, 
            right: r,
            type: "MULTIPLY", 
            blockID: "code", 
            line: line, 
             
             
        }
      } else if (this.has("DIVIDE")) {
        this.advance();
        const r =this.exponent();
        // l =new Operators.Division(left, right);
        l ={
            left: l, 
            right: r,
            type: "DIVIDE", 
            blockID: "code", 
            line: line, 
             
             
        }
      } else if (this.has("MOD")) {
        this.advance();
        const r =this.exponent();
        // l =new Operators.Modulo(left, right);
        l ={
            left: l, 
            right: r,
            type: "MOD", 
            blockID: "code", 
            line: line, 
             
             
        }
      }
    }
    return l;
  }

  



  additive() {
    let l =this.multiplicitive();
    while (this.has("ADD") || this.has("SUBTRACT")) {
      
      var line = this.tokens[this.i].line;
      if (this.has("SUBTRACT")) {
        this.advance();
        const r =this.multiplicitive();
        // l =new Operators.Subtraction(left, right);
        l ={
            left: l, 
            right: r,
            type: "SUBTRACT", 
            blockID: "code", 
            line: line, 
             
             
        }
      } else if (this.has("ADD")) {
        this.advance();
        const r =this.multiplicitive();
        // l =new Operators.Addition(left, right);
        l ={
            left: l, 
            right: r,
            type: "ADD", 
            blockID: "code", 
            line: line, 
             
             
        }
      }
    }
    return l;
  }

  unary(){
    if (!this.has('not') && !this.has('SUBTRACT')){
      return this.atom();
    }
      
      var line = this.tokens[this.i].line;
      var result = {
        blockID: 'code',
        line: line, 
      };
      if (this.has('not')){
        this.advance();
        var expression = this.atom();
        result.type = 'NOT';
        result.value = expression;
        return result;
      }
      else if (this.has("SUBTRACT")){
      this.advance();
        var expression = this.atom();
        result.type = 'NEGATE';
        result.value = expression;
    }

    return result;
  }

  comparable() {
    let l =this.additive();
    while (
      this.has("Less_Than_Equal_To") ||
      this.has("Greater_Than_Equal_To") ||
      this.has("Less_Than") ||
      this.has("Greater_Than") ||
      this.has("Equals") ||
      this.has("Not_Equal")
      ) {
        var line = this.tokens[this.i].line;
        
      if (this.has("Less_Than_Equal_To")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Less_Than_Equal_To(left, right);
        l ={
            left: l, 
            right: r,
            type: "LESS_THAN_EQUAL", 
            blockID: "code", 
            line: line, 
             
             
        }
      } else if (this.has("Greater_Than_Equal_To")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l ={
            left: l, 
            right: r,
            type: "GREATER_THAN_EQUAL", 
            blockID: "code", 
            line: line, 
             
             
        }
      } else if (this.has("Less_Than")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Less_Than(left, right);
        l ={
            left: l, 
            right: r,
            type: "LESS_THAN", 
            blockID: "code", 
            line: line, 
             
             
        }
      } else if (this.has("Greater_Than")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than(left, right);
        l ={
            left: l, 
            right: r,
            type: "GREATER_THAN", 
            blockID: "code", 
            line: line, 
             
             
        }
    } else if (this.has("Equals")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l ={
            left: l, 
            right: r,
            type: "EQUALS", 
            blockID: "code", 
            line: line, 
             
             
        }
    } else if (this.has("Not_Equal")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l ={
            left: l, 
            right: r,
            type: "NOT_EQUAL", 
            blockID: "code", 
            line: line, 
             
             
        }
    }
    
}
return l;
}

// not() {
//   let l =this.additive();
//   while (
//     this.has("not")
//   ) {
    
  
// }
// return l;
// }



boolean_operation() {
  let l =this.comparable();
  while (
    this.has("and") ||
    this.has("or")
    ) {
      var line = this.tokens[this.i].line;
      
    if (this.has("and")) {
      this.advance();
      const r =this.comparable();
      // l =new Operators.Less_Than_Equal_To(left, right);
      l ={
          left: l, 
          right: r,
          type: "AND", 
          blockID: "code", 
          line: line, 
           
           
      }
    } else if (this.has("or")) {
      this.advance();
      const r =this.comparable();
      // l =new Operators.Greater_Than_EqualTo(left, right);
      l ={
          left: l, 
          right: r,
          type: "OR", 
          blockID: "code", 
          line: line, 
           
           
      }
    
  }
  
}
return l;
}


program() {
  return {
    type: "PROGRAM", 
    value: this.codeBlock('EOF'), 
    blockID: 'code'
  }

}


codeBlock(endToken) {
  let praxly_blocks = [];
   const argsArray = Array.from(arguments);
  //  while (!this.eof) {
  while (this.hasNotAny(argsArray)) {
    praxly_blocks.push(this.statement());
    this.advance();
   }
   return {
      type: "CODEBLOCK", 
      statements: praxly_blocks,
      blockID: "code"
   }

}

statement() {
  // while loop here?
  var line = this.tokens[this.i].line;
  
  let result = {
    blockID: 'code', 
    line: line, 
     
  };
  if (this.has("if")) {

    result.type = "IF";
    this.advance();
    result.condition = this.boolean_operation();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock('else', 'end if');
      if (this.has('else')) {
        this.advance();
        if (this.has('\n')){
          this.advance();
        } 
        result.type = "IF_ELSE";
        result.alternative = this.codeBlock('end if');
        
      }
      if (this.has('end if')) {
        
        this.advance();
        return result;
      }
      else {
        // sendRuntimeError("missing the \'end if\' token", blockjson);
        textError('compile time', "missing the \'end if\' token", result.line);
        return {
          type: 'INVALID'
        };
      }
    } 
  } 
  else if (this.has('for')){
    result.type = "FOR";
    this.advance();
    if (this.hasNot('(')){
      return result;
    }
    this.advance();
    result.initialization = this.statement();
    if (this.has(';')) {
      this.advance();
      result.condition = this.boolean_operation();
      // this.advance();
      if (this.has(';')) {
        this.advance();
        result.incriment = this.statement();
        if (this.hasNot(')')){
          return result;
        }
        this.advance();
        if (this.has('\n')){
          this.advance();
          result.statement = this.codeBlock('end for');
          if (this.has('end for')){
            
            this.advance();
            return result;
          }
          else{
            textError('compile time', "missing the \'end for\' token", result.line);
          }
        }
      }
      
    }
    console.log(`parser messing up, current token is ${this.tokens[this.i].token_type}`);
    return result;
   



  }
  else if (this.has('while')){
    result.type = "WHILE";
    this.advance();
    result.condition = this.boolean_operation();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock( 'end while');
        
      }
      if (this.has('end while')) {
        
        this.advance();
        return result;
      } else {
        textError('compile time', "missing the \'end while\' token", result.line);
        //gohere
      }
  } 
   
  else if (this.has('do')){
    result.type = "DO_WHILE";
    this.advance();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock( 'while');
      
    }
    if (this.has('while')) {
      this.advance();
      if (this.hasNot('(')){
        //error
        return result;
      }
      this.advance();
      result.condition = this.boolean_operation();
      if (this.hasNot(')')){
        return result;
      }
      this.advance();
      if (this.hasNot('\n')){
        return result;
        //error
      }
      this.advance()
      
        return result;
      }
  }

  else if (this.has('repeat')){
    result.type = "REPEAT_UNTIL";
    this.advance();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock( 'until');
      
    }
    if (this.has('until')) {
      this.advance();
      if (this.hasNot('(')){
        //error
        return result;
      }
      this.advance();
      result.condition = this.boolean_operation();
      if (this.hasNot(')')){
        return result;
      }
      this.advance();
      if (this.hasNot('\n')){
        return result;
        //error
      }
      this.advance()
      
        return result;
      }
  }

  else if (this.has("print")) {
      this.advance();
      const expression = this.boolean_operation();
      if (this.has(';')){
        this.advance();
      }
      if (this.has('\n')){
        // this.advance();
        result.type = 'PRINT';
        result.value = expression;
         
        return result;
      }
  }

  else if (this.has("println")) {
    // while (this.has('print')) {
      this.advance();
      const expression = this.boolean_operation();
      if (this.has(';')){
        this.advance();
      }
      if (this.has('\n')){
        // this.advance();
        result.type = 'PRINTLN';
        result.value = expression;
         
        return result;
      }
  }

  else if (this.has("return")) {
    // while (this.has('print')) {
      this.advance();
      const expression = this.boolean_operation();
      if (this.has(';')){
        this.advance();
      }
      if (this.has('\n')){
        // this.advance();
        result.type = 'RETURN';
        result.value = expression;
         
        return result;
      }

  }else if (this.has('comment')){
    result.type = 'COMMENT', 
    result.value = this.tokens[this.i].value;
    
    return result;
  
  } else if (this.has('single_line_comment')){
    result.type = 'SINGLE_LINE_COMMENT', 
    result.value = this.tokens[this.i].value;
    
    return result;
  }



  
  else if (this.has_type() && this.has_ahead('Variable')){
    var returnType = this.tokens[this.i].value.toUpperCase();
      this.advance();
      if (this.has("Variable")){
        result.type = 'ASSIGNMENT';
        result.name = this.tokens[this.i].value;
        this.advance();
        if (this.has('Assignment')){
          result.line = this.tokens[this.i].line;
          
          this.advance();
          result.value = this.boolean_operation();
          if (this.has(";")){
            this.advance();
          }
          
          result.varType = returnType;
        }
      }
      return result;
  }

  else if (this.has_type() && this.has_ahead('[')){
    var returnType = 'Praxly_' + this.tokens[this.i].value;
      this.advance();
      this.advance();
      if (this.has("]")) {
        this.advance();
      } else {
        textError('parsing', 'did not detect closing bracket', line, );
        // console.log("did not detect closing parentheses");
      }
      if (this.has("Variable")){
        result.type = 'ARRAY_ASSIGNMENT';
        result.name = this.tokens[this.i].value;
        this.advance();
        if (this.has('Assignment')){
          result.line = this.tokens[this.i].line;
          
          this.advance();
          result.value = this.boolean_operation();
          
          result.varType = returnType;
        }
      }
      return result;
  }

  //annoying stuff because array syntax sucks to impliment
  else if (this.has('Variable') && this.has_ahead('[') && this.has_array_reference_assignment()){
    result.name = this.tokens[this.i].value;
    this.advance();
    // console.error(`made it here`);
    if(this.has('[')){
      this.advance();
      var index = this.boolean_operation();
      if (this.has("]")) {
        this.advance();
      } else {
        textError('parsing', 'did not detect closing bracket', line, );
        // console.log("did not detect closing parentheses");
      }
      result.type = 'ARRAY_REFERENCE_ASSIGNMENT';
      result.index = index;
      if (this.has('Assignment')){
        result.line = this.tokens[this.i].line;
        this.advance();
        result.value = this.boolean_operation();
        
      } else {
        console.error(`the array reference asssignement function failed. `);
      }
    }
    if (this.has(';')){
      this.advance();
    }
    return result;
  }


  
  else if (this.has('Variable') && this.has_ahead('Assignment')){
    if (this.has("Variable")){
      result.type = 'ASSIGNMENT';
      result.name = this.tokens[this.i].value;
      this.advance();
      if (this.has('Assignment')){
        result.line = this.tokens[this.i].line;
        this.advance();
        result.value = this.boolean_operation();
        
        result.varType = 'reassignment';
      }
    }
    if (this.has(';')){
      this.advance();
    }
    return result;
  }

  else if (this.has_type()&& this.has_ahead('function')){
    // console.log('saw function');
    //function code here
    result.type = 'FUNCTION_ASSIGNMENT';
    result.returnType = this.tokens[this.i].value;
    this.advance();
    if (this.hasNot('function')){
      console.error('no function name here, there is a problem');
    }
    result.name = this.tokens[this.i].value;
    this.advance();
    var args = [];
    if (this.has('(')){
      this.advance();
      var stopLoop = 0;
      while (this.hasNot(')') && stopLoop < MAX_LOOP) {
        var param = [];
        if (this.has_type()){
          param.push(this.tokens[this.i].value);
          this.advance();
        }
        if (this.has('Variable')){
          param.push(this.tokens[this.i].value);
          this.advance();
        }
        args.push(param);
        if (this.has(',')){
          this.advance();
        }
        stopLoop+= 1;
        
      }
      console.log ('here are the params');
      console.log(args);
 
      if(this.has(')')){
        this.advance();
      } else {
          console.error('missing closing parinthesees');
          textError("compile time", "didnt detect closing parintheses in the arguments of  a function definition", this.tokens[this.i].line);
    
      }
      result.params = args;
      
      if (this.has(';')){
        this.advance();
      }
      if (this.has('\n')){
        this.advance();
      }
    } else {
      console.error('error, detected function but did not find parinthesees');
      return;
    }
    var contents = this.codeBlock('end ' + result.name);
    result.contents = contents;
    if (this.hasNot('end ' + result.name)){
      textError('compile time', `missing the \'end ${result.name}\' token`, result.line);
      return result;
    }
    this.advance();
    return result;
  }

  // expressions can be statements too, might cause bugs
  else if (this.has('/n')){

    return {
      type: "EMPTYLINE", 
      blockID: "code"
    };
  }

  else {
    // console.log(`the current token is ${this.tokens[this.i].token_type} and the next one is ${this.tokens[this.i + 1].token_type}`)
    let contents = this.boolean_operation();
    if (contents === undefined || contents === null){
      return;
    }
    if (this.has(';')){
      this.advance();
    }
    if (this.has('\n')){
      // this.advance();
      result = {
        type: "STATEMENT", 
        value: contents, 
        blockID: "code"
      };
    }

  }

  return result;
  
}




}

