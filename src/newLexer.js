export class Token {
    constructor(type, text, line) {
       token_type = type;
       value = text;
       line = line
    }
  }


export const TokenTypes = {
  INT: "INT",
  FLOAT: "FLOAT",
  STRING: "STRING",
  DOUBLE: "DOUBLE",
  CHAR: "CHAR",
  BOOLEAN: "BOOLEAN",
  COMMENT: "COMMENT", 
  LONG_COMMENT: "LONG_COMMENT", 
  KEYWORD: "KEYWORD",
  TYPE: "TYPE",
  INDENTIFIER: "IDENTIFIER", 
  SYMBOL: "SYMBOL",
  EOF: "EOF",

};






export function tokenize(source) {
    let tokens = [];
    let index = 0;
    let token_so_far = "";
    let keywords = ["if", "else", "end", "print", "println", "for", "while", 'and', 'or', 'do', 'repeat', 'until', 'not', 'return'];
    let types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void', 'int[]'];
    let oneCharSymbols = ['+', '-', '*', '/', '=', '>', '<', ',', ';', '[', ']', '(', ')', '%', '≠']; 
    let twoCharOperators = ['==', '!=', '>=', '<=', '->'];

    let currentLine = 0;

                // These nested Helper functions will determine what the next character is
        function printTokens() {
            for (let tok of tokens) {
            console.log(`Token: ${tok.token_type}, Value: ${tok.value}`);
            }
        }

        function has_letter() {
            let a = source[index];
            return /^[A-Za-z]$/.test(a);
        }

        function has_letter() {
            let a = source[index];
            return /^[A-Za-z]$/.test(a);
        }

        function has(c) {
            return index < source.length && source[index] === c;
        }

        function hasNot(c) {
            return index < source.length && source[index] !== c;    
        }

        function has_ahead(c) {
            return index < source.length && source[index + 1] === c; 
        }

        function has_type(){
            return index < source.length &&  types.includes(source[index]);
        }

        function has_digit() {
            let a = source[index];
            return /^[0-9]+$/.test(a);
        }

        function has_digit() {
            let a = source[index];
            return /^[0-9]+$/.test(a);
        }

        function has_oneCharOp(){
            for (let c of oneCharSymbols){
                if (c === source[index]){
                    return true;
                }
            }
            return false;
        }

        function has_twoCharOp(){
            for (let c of twoCharOperators){
                if (c === source[index] + source[index + 1]){
                    return true;
                }
            }
            return false;
        }

        function capture() {
            token_so_far += source[index];
            index++;
        }



        function skip() {
            index++;
        }

        function emit_token(type){
            tokens.push({token_type: type, value: token_so_far, line: currentLine});
            token_so_far = "";
        }

        while (index < source.length){

            if (has('/') && has_ahead('/')){
                skip();
                skip();
                while(hasNot('\n')){
                   capture();
                }
                skip();
                emit_token(TokenTypes.COMMENT);
                currentLine++;
            } else if ( has_digit()) {
                while (has_digit()) {
                   capture();
                }
                if (has(".")) {
                   capture();
                  while (has_digit()) {
                     capture();
                  }
                   emit_token(TokenTypes.DOUBLE);
                } else {
                   emit_token(TokenTypes.INT);
                }
                //ignore tabs and whitespace
            } else if ( has(" ") || has('\t')) {
                skip();
            
            //ignore emptylines
            } else if (has('\n')){
                while (has('\n')){
                    capture();
                    currentLine++;
                }
                emit_token(TokenTypes.SYMBOL);
    
            } else if ( has('\'')){
             skip();
            if ( has_letter &&  has_ahead('\'')) {
               capture();
               skip();
               emit_token(TokenTypes.CHAR);
            } else {
            //   textError('lexing', 'invalid char. \n \tRemember chars start and end with a single quote mark (\').',stringStart,  i - 1);
            }

            } else if ( has("\"") ){
                 skip();
                while (hasNot("\"")) {
                     capture();
                }
                if ( has("\"")){
                 skip();
                 emit_token(TokenTypes.STRING);
                }
                else {
                // textError('lexing', 'looks like you didn\'t close your quotes on your String. \n \tRemember Strings start and end with a single or double quote mark (\' or \").',stringStart,  i - 1);
                }
            
            } else if ( has_letter()) {
                while ( has_letter() ||  has_digit() || has('_')) {
                   capture();
                }
      
                if ( token_so_far === "true" ||  token_so_far === "false") {
                   emit_token(TokenTypes.BOOLEAN);
                } else if ( token_so_far === 'end'){
                  while ( hasNot('\n')) {
                     capture();
                  }
                   emit_token( token_so_far);
                }
                else if (keywords.includes( token_so_far)) {
                   emit_token(TokenTypes.KEYWORD);  
                  
                } 
                else if ( types.includes( token_so_far)) {
                  
                   emit_token(TokenTypes.TYPE);  
                }
                 else {
                  if ( token_so_far !== ''){
                     emit_token(TokenTypes.INDENTIFIER);
    
                  }
    
                }
            


            }else if (has_twoCharOp()) {
                    capture();
                    capture();
                    emit_token(TokenTypes.SYMBOL);
            } else if (has_oneCharOp()){
                capture();
                emit_token(TokenTypes.SYMBOL);
            } else {
                // textError('lexing',  `invalid character \"${source[index] }\"`);
                skip();
                console.log("invalid character at index ", i);
        }

    }
    emit_token(TokenTypes.EOF);
    return tokens;
  
    
}

const nodeTypes = {
    BLOCK: "BLOCK", 
    VARDECL: "VARDECL", 
    ASSIGNMENT: "ASSIGNMENT", 
    REASSIGNEMNT: "REASSIGNMENT", 
    FUNCDECL: "FUNCATION_DECLARATION",
    FUNCCALL: "FUNCCALL",
}


function newParser(tokens){
    let index = 0;

    function next_token_type(){
        return tokens[index].token_type;
    }

    function has_mlultiplicitive(){
        return tokens[index].token_type === TokenTypes.SYMBOL 
            && (next_token_type() === '*' || next_token_type() === '/' || next_token_type() === '%');
    }

    function has_additive(){
        return tokens[index].token_type === TokenTypes.SYMBOL 
        && (next_token_type() === '+' || next_token_type() === '-');
    }

    function has_value(c){
        return tokens[index].value === c;
    }

    function has_type(c){
        return tokens[index].token_type === c;
    }

    function match_and_discard_next_token(value){
        if (token[index].value !== value){
            //TODO: throw error at this line

        } else {
            index++;
        }
    }






    return parse_program();

    function parse_block(){
        let statements = []
        while ( index < tokens.length && tokens[index].token_type !== TokenTypes.EOF){
            statements.push(parse_statement());
        }
        return {
            type: nodeTypes.BLOCK, 
            statements: statements,
            blockID: "code"
         };
    }
    
    function parse_statement(){
        let result = null;
        let condition = null;
        let line = tokens[index].line;
        if(has_type(TokenTypes.INDENTIFIER)){
            let loc = parse_location(input);
            if (loc.type === nodeTypes.FUNCCALL){
                result = loc;
            } else {
                match_and_discard_next_token('=');
                value = parse_expression();
                result = {
                    type: nodeTypes.REASSIGNEMNT, 
                    location: loc,
                    value: value,
                }

            }
        } else if (has_type(TokenTypes.KEYWORD)){
            

        } else if (has_type(TokenTypes.COMMENT)){

        } else if (has_type(TokenTypes.LONG_COMMENT)){

        }

    }


}


// export function textError(type, error, startIndex, endIndex){
  
//   if (endIndex ?? 0  < startIndex){
//     // console.error('invalid index for error');

//     endIndex = textEditor?.getValue().length - 1;
//   }

//   var ranges = indextoAceRange(startIndex, endIndex);
//   errorOutput += `<pre>${type} error occured on line ${ranges[0]}:  ${error} \n\t (highlighting index ${startIndex ?? '?'} to ${endIndex ?? '?'})</pre>`;
//   appendAnnotation(error, startIndex, endIndex);
//   // highlightError(ranges[0], ranges[1], ranges[2], ranges[3]);
// }

// export function defaultError(message){
//   errorOutput += `<pre>default error:  ${message} \n\t Ben has not written an error message for this issue yet. Contact him thrrough the bug report form on the help page. </pre>`;
// }


// export function addBlockErrors(workspace){
//   for (var key in blockErrorsBuffer){
//       var block = workspace.getBlockById(key);
//       block.setWarningText(blockErrorsBuffer[key]);

//   }

// }

// export function sendRuntimeError(errormessage, blockjson){
//   textError('runtime', errormessage, blockjson.startIndex, blockjson.endIndex);
//   // if (typeof(blockjson.blockid !== 'undefined')){
//       blockErrorsBuffer[blockjson.blockID] = errormessage;
//   // }
//   // appendAnnotation(`the variable \'${blockjson.name}\' is not recognized by the program. Perhaps you forgot to initialize it?`, blockjson.startIndex, blockjson.endIndex);
//   console.log('here are the block errors');
//   console.log(blockErrorsBuffer);
// }



// export function appendAnnotation(errorMessage, startindex, endindex) {
//   // endindex = (endindex ?? 0) < startindex ? textEditor.getValue().length : endindex;
//   var ranges = indextoAceRange(startindex, endindex);
//   var annotation = {
//     row: ranges[0] - 1, // no idea why the rows start with zero here but start with 1 everywhere else, but okay
//     column: ranges[1],
//     text: errorMessage,
//     type: "error"
//   };
//   annotationsBuffer.push(annotation);
//   highlightError(ranges[0], ranges[1], ranges[2], ranges[3]);

// }

// // this doesnt work
// function highlightError(startRow, startColumn, endRow, endColumn) {
//   // console.error(`startRow: ${startRow}\t, start column: ${startColumn}\nedRow: ${endRow}, \tendcolumn: ${endColumn}`);
//   var session = textEditor.session;
//   var Range = ace.require('ace/range').Range;

//   var errorRange = new Range(startRow - 1, startColumn, endRow - 1, endColumn);
//   var markerId = session.addMarker(errorRange, 'error-marker', 'text');

//   var markerCss = `
//     .error-marker {
//       position: absolute;
//       z-index: 1;
//       background-color: rgba(255, 0, 0, 0.2);
//       border-bottom: 2px solid red;
//     }
//   `;

//   // Check if the style tag already exists
//   var existingStyleTag = document.getElementById('custom-style');
//   if (!existingStyleTag) {
//     // If it doesn't exist, create a new style tag and set its ID
//     console.error(`couldn\'t find the stylesheet`);
//     existingStyleTag = document.createElement('style');
//     existingStyleTag.setAttribute('id', 'custom-style');
//     document.head.appendChild(existingStyleTag);
//   }

//   // Append the error-marker rules to the existing style tag
//   existingStyleTag.appendChild(document.createTextNode(markerCss));

//   console.log('attempted to highlight');
//   markersBuffer.push(markerId);
//   return markerId;
// }










// // Get the underlying DOM element of the Ace editor

// export const indextoAceRange = (startindex, endindex) => {
//   let code = textEditor?.getValue();
//   console.log(`the length is ${code.length} and the endIndex is ${endindex}`);
//   var startLine = 0;
//   var startLineIndex = 0;
//   var endLine = 0;
//   var endLineIndex = 0;
//   var currentLine = 0; // Change to 0 to represent zero-based line numbers
//   var currentLineIndex = 0;

//   for (let i = 0; i < code.length; i++) { // Remove -1 from loop condition
//     if (i === startindex) {
//       startLine = currentLine;
//       startLineIndex = currentLineIndex;
//     }
//     if (i === endindex) {
//       endLine = currentLine;
//       endLineIndex = currentLineIndex;
//       break; // Once endindex is found, exit the loop
//     }
//     if (code[i] === '\n') {
//       currentLine += 1;
//       currentLineIndex = 0;
//     } else {
//       currentLineIndex += 1;
//     }
//   }

//   // Add 1 to both row and column values to represent one-based line numbers and column numbers
//   var start = { row: startLine + 1, column: startLineIndex };
//   var end = { row: endLine + 1, column: endLineIndex };

//   // console.log("Start:", start);
//   // console.log("End:", end);

//   return [start.row, start.column, end.row, end.column];
// };



// export const text2tree = () => {
//   let code = textEditor?.getValue();

//     console.log(code);
//     let lexer = new Lexer(code);
//     let tokens = lexer?.lex();
//     // console.log('here are the new lexer tokens:');
//     // console.log(tokenize(code));
//     console.log(tokens);
//     let parser = new Parser(tokens);
//     let textjson = parser?.parse();
//     console.log(textjson);
//     return textjson;
// }

// class Token {
//     constructor(type, text, startIndex, endIndex, line) {
//       this.token_type = type;
//       this.value = text;
//       this.startIndex = startIndex;
//       this.endIndex = endIndex;
//       this.line = line
//     }
//   }
  
//   class Lexer {
//     constructor(source) {
//       if (source?.length > 0 && source[source?.length - 1] !== '\n'){
//         source += "\n";
//       } 
//       this.source = source;
//       this.tokens = [];
//       this.i = 0;
//       this.length = this.source?.length;
//       this.token_so_far = "";
//       this.keywords = ["if", "else", "end", "print", "println", "for", "while", 'and', 'or', 'do', 'repeat', 'until', 'not', 'return'];
//       this.types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void', 'int[]'];
//       this.startToken = 0;
//       this.currentLine = 0;
//     }
  
//     printTokens() {
//       for (let tok of this.tokens) {
//         console.log(`Token: ${tok.token_type}, Value: ${tok.value}`);
//       }
//     }
  
//     has_letter() {
//       const a = this.source[this.i];
//       return /^[A-Za-z]$/.test(a);
//     }

  
//     has(c) {
//       return this.i < this.length && this.source[this.i] === c;
//     }

//     hasNot(c) {
//       return this.i < this.length && this.source[this.i] !== c;
//     }

//     has_type(){
//       return this.i < this.length &&  this.types.includes(this.source[this.i]);
//     }

//     has_ahead(c) {
//       return this.i < this.length && this.source[this.i + 1] === c;
//     }
//     has_ahead_ahead(c) {
//       return this.i < this.length && this.source[this.i + 2] === c;
//     }

//     hasNot_ahead(c) {
//       return this.i < this.length && !this.source[this.i + 1] !== c;
//     }


//     has_digit() {
//         const a = this.source[this.i];
//         return /^[0-9]+$/.test(a);
//       }
  
//     capture() {
//       this.token_so_far += this.source[this.i];
//       this.i++;
//     }
  
//     skip() {
//       this.i++;
//       this.startToken ++;
//     }

  
//     emit_token(type) {

//       this.tokens.push(new Token(type, this.token_so_far, this.startToken, this.i, this.currentLine));
//       this.token_so_far = '';
//       this.startToken = this.i;
//     }
  
//       lex() {
//       while (this.i < this.length) {
//         if (this.has("+")) {
//             this.capture();
//             this.emit_token("ADD");
//         } else if (this.has('/') && this.has_ahead('*')){
//           this.skip();
//           var commentStart = this.i;
//           this.skip();
//           while (this.hasNot('*') && this.hasNot_ahead('/')){
//             this.capture();
//           }

//           if (this.has('*') && this.has_ahead('/')){
//             this.skip();
//             this.skip();
//             this.emit_token('comment');
//             if (this.has('\n')){
//               this.skip();
//             }
//           } 
//           else {
//             textError('lexing', 'looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.',commentStart, this.i);
//             // appendAnnotation('looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.',commentStart, this.i);
//             this.i -= 1;
//             this.emit_token();
  
//           }
          
//         } else if (this.has("-")) {
//           this.capture();
//           this.emit_token("SUBTRACT");
//         } else if (this.has("%")) {
//           this.capture();
//           this.emit_token("MOD");
//         } else if (this.has("*")) {
//             this.capture();
//             this.emit_token("MULTIPLY");
//         } else if (this.has("^")) {
//             this.capture();
//             this.emit_token("EXPONENT");
//          } else if (this.has("≠")) {
//             this.capture();
//             this.emit_token("Not_Equal");
//          } else if (this.has('/') && this.has_ahead('/')){
//           this.skip();
//           this.skip();
//           while(this.hasNot('\n')){
//             this.capture();
//           }
//           this.skip();
//           this.emit_token("single_line_comment");

//         } else if (this.has("/")) {
//             this.capture();
//             this.emit_token("DIVIDE");
//         } else if (this.has("<")) {
//           this.capture();
//           if (this.has("=")) {
//             this.capture();
//             this.emit_token("Less_Than_Equal_To");
//           } else {
//             this.emit_token("Less_Than");
//           }
//         } else if (this.has("!")) {
//           this.capture();
//           if (this.has("=")) {
//             this.capture();
//             this.emit_token("Not_Equal");
//           } 
//         } else if (this.has("=") || this.has('←')) {
//           this.capture();
//           if (this.has('=')){
//             this.capture();
//             this.emit_token("Equals");
//           } else {
//             this.emit_token("Assignment");
//           }      
//         } else if (this.has(">")) {
//           this.capture();
//           if (this.has("=")) {
//             this.capture();
//             this.emit_token("Greater_Than_Equal_To");
//           } else {
//             this.emit_token("Greater_Than");
//           }
//         } else if (this.has_digit()) {
//             while (this.i < this.length && this.has_digit()) {
//               this.capture();
//             }
//             if (this.i < this.length && this.has(".")) {
//               this.capture();
//               while (this.i < this.length && this.has_digit()) {
//                 this.capture();
//               }
//               this.emit_token("Double");
//             } else {
//               this.emit_token("INT");
//             }
//           } else if (this.has(" ")) {
//             this.skip();

//           } else if (this.has('\'')){
//             this.skip();
//             if (this.has_letter && this.has_ahead('\'')) {
//               this.capture();
//               this.skip();
//               this.emit_token('char');
//             } else {
//               textError('lexing', 'looks like you didn\'t close your quotes on your String. \n \tRemember Strings start and end with a single or double quote mark (\' or \").',stringStart, this.i - 1);
//             }
          

//           } else if (this.has("\"") || this.has("\'") ){
//             var stringStart = this.i;
//             this.skip();
//             while (this.i < this.length && !this.has("\"") && !this.has("\'")) {
//                 this.capture();
//               }
//             if (this.has("\"") || this.has("\'") ){
//               this.skip();
//               this.emit_token("String");
              
//             }
//             else {
//               textError('lexing', 'looks like you didn\'t close your quotes on your String. \n \tRemember Strings start and end with a single or double quote mark (\' or \").',stringStart, this.i - 1);
//               this.i -= 1;
//               this.emit_token();
//             }
        
//           } else if (this.has_letter()) {
//             while (this.i < this.length && (this.has_letter() || this.has_digit())) {
//               this.capture();
//             }
  
//             if (this.token_so_far === "true" || this.token_so_far === "false") {
//               this.emit_token("boolean");
//             } else if (this.token_so_far === 'end'){
//               while (this.hasNot('\n')) {
//                 this.capture();
//               }
//               this.emit_token(this.token_so_far);
//             }
//             else if (this.keywords.includes(this.token_so_far)) {
//               this.emit_token(this.token_so_far);  
              
//             } 
//             else if (this.types.includes(this.token_so_far)) {
              
//               this.emit_token('Type');  
//             }

//             else if (this.has('(') || this.has_ahead(')')){
//               this.emit_token('function');
//             }

//              else {
//               if (this.token_so_far !== ''){
//                 this.emit_token("Variable");

//               }

//             }

          
//           } else if (this.has(",")) {
//             this.capture();
//             this.emit_token(",");
          
//           } else if (this.has(";")) {
//               this.capture();
//               this.emit_token(";");
            
//           } else if (this.has("(")) {
//             this.capture();
//             this.emit_token("(");
//           } else if (this.has(")")) {
//             this.capture();
//             this.emit_token(")");
//           } else if (this.has("{")) {
//             this.capture();
//             this.emit_token("{");
//           } else if (this.has("}")) {
//             this.capture();
//             this.emit_token("}");
//           } else if (this.has("[")) {
//             this.capture();
//             this.emit_token("[");
//           } else if (this.has("]")) {
//             this.capture();
//             this.emit_token("]");
//          } else if (this.has("\n")) {
//             this.capture();
//             this.emit_token("\n");
//             this.currentLine += 1;
//             while(this.has('\n')){
//               this.skip();
//               this.currentLine += 1;
//             }

//           } else if (this.has('\t')){
//             // skip tabs since they only apppear to be for style
//             this.skip();
//           } 
//           else {
//             textError('lexing',  `invalid character \"${this.source[this.i] }\"`, this.i, this.i + 1);

//             console.log("invalid character at index ", this.i);
//             return 0;
//           }
//         }
//         this.emit_token("EOF");
//         return this.tokens;
//       }
//     }

// class Parser {
//   constructor(tokens) {
//     this.statements = [];
//     this.tokens = tokens;
//     this.i = 0;
//     this.j = 0;
//     this.length = tokens?.length;
//     this.eof = false;
//     this.keywords = ["if", "else", "then", "done"];
//     this.statementKeywords = ['if', 'print', 'for', 'while', 'println'];

//   }

//   hasNot(type) {
//     return this.i < this.length && this.tokens[this.i].token_type !== type;
//   }

//   has(type) {
//     return this.i < this.length && this.tokens[this.i].token_type === type;
//   }

//   hasAny(types){
//     return this.i < this.length && types.includes(this.tokens[this.i].token_type);
//   }

//   hasNotAny(types){
//     return this.i < this.length && !types.includes(this.tokens[this.i].token_type);
//   }

//   has_ahead(type) {
//     return this.i + 1 < this.length && this.tokens[this.i + 1].token_type === type;
//   }

//   hasNot_ahead(type) {
//     return this.i + 1 < this.length && this.tokens[this.i + 1].token_type != type;
//   }

//   has_type() {
//     return this.i < this.length && this.tokens[this.i].token_type === 'Type';
//   }

//   has_keyword() {
//     return this.keywords.includes(this.tokens[this.i].token_type);
//   }
//   has_statementKeyword() {
//     return this.statementKeywords.includes(this.tokens[this.i].token_type);
//   }

//   match_and_discard_next_token(type){
//     if (this.tokens[this.i].token_type === type ){
//       this.advance();
//     } else{
//       sendRuntimeError(`did not detect desired token at this location. \nexpected: \'${type}\'\n but was: ${this.tokens[this.i].token_type}`);
//     }
//   }





//   //peeks ahead to determine if this annoying array syntax is correct.
//   //assumes that if an = is seen before a newline, it must be an assignment
//   has_array_reference_assignment(){
//     var j = this.i;
//     while(j < this.length && this.tokens[j].token_type !== '\n'){
//       if(this.tokens[j].token_type === 'Assignment'){
//         return true;
//       }
//       j++
//     }
//     return false;
//   }

//   advance() {
//     this.i++;
//   }




//   parse() {
//     if (!this.tokens){
//       return;
//     }
//     return this.program();
    
//   }



//   atom() {
    
//     const tok = this.tokens[this.i];
//     var startIndex = this.tokens[this.i].startIndex;
//     var endIndex = this.tokens[this.i].endIndex;
    


//     if (this.has('EOF')){
//       this.eof = true;
//       return;
//     }

//     if (this.has(',')){
//       return;
//     }
//     else if (this.has("INT")) {

//       this.advance();
//       return {
//         value: tok.value, 
//         type: tok.token_type,
//         blockID: "code",
//         startIndex: startIndex, 
//         endIndex: endIndex,
//         beg: startIndex, 
//         end: endIndex
        
//       };
//     } else if (this.has("String")) {
//         this.advance();
//         return {
//           value: tok.value, 
//           type: 'STRING',
//           blockID: "code",
//           startIndex: startIndex, 
//           endIndex: endIndex,
//           beg: startIndex, 
//           end: endIndex
//         };
//     } else if (this.has("char")) {
//         this.advance();
//         return {
//           value: tok.value, 
//           type: "CHAR",
//           blockID: "code",
//           startIndex: startIndex, 
//           endIndex: endIndex,
//           beg: startIndex, 
//           end: endIndex
//         };
//     } else if (this.has("Double")) {
//         this.advance();
//         return {
//           value: tok.value, 
//           type: "DOUBLE",
//           blockID: "code",
//           startIndex: startIndex, 
//           endIndex: endIndex,
//           beg: startIndex, 
//           end: endIndex
//         };
//     } else if (this.has("boolean")) {
//       this.advance();
//       return {
//         value: tok.value, 
//         type: 'BOOLEAN',
//         blockID: "code",
//         startIndex: startIndex, 
//         endIndex: endIndex,
//         beg: startIndex, 
//         end: endIndex
//       };

//     } else if (this.has('{')){
//       let result = {
//         blockID: 'code', 
//         startIndex: startIndex, 
//         endIndex: endIndex, 
//         beg: startIndex,
//         type: 'ARRAY',
//       };
//       // result.type = 'ARRAY';
//       // result.name = this.tokens[this.i].value;
//       var args = [];
//       this.advance();
//       var loopBreak = 0;
//       while (this.hasNot('}') &&  loopBreak < maxLoop) {
//         // this.advance();
//         var param = this.boolean_operation();
//         args.push(param);
//         if (this.has(',')) {
//           this.advance();
          
//         }
//         loopBreak++;
//       }
//       console.log('here are the array contents');
//       console.log(args);
//       result.params = args;
//       if (this.hasNot('}')){
//         appendAnnotation("didnt detect closing curlybrace in the array declaration", this.tokens[this.i].startIndex, this.tokens[this.i].endIndex);
//         // console.error('didnt detect closing parintheses in the arguments of  a function call');
//       }
//       result.endIndex = this.tokens[this.i]?.endIndex;
//       result.end = result?.endIndex;
//       this.advance();
//       return result;
    
//     } 
//     else if (this.has("(")) {
//       this.advance();
//       const expression = this.boolean_operation();
//       if (this.has(")")) {
//         this.advance();
//       } else {
//         textError('parsing', 'did not detect closing parentheses', startIndex, endIndex);
//         // console.log("did not detect closing parentheses");
//       }
//       return expression;

//     }else if (this.has("Variable")){
//       this.advance();
//       if(this.has('[')){
//         this.advance();
//         var index = this.boolean_operation();
//         if (this.has("]")) {
//           this.advance();
//         } else {
//           textError('parsing', 'did not detect closing bracket', startIndex, endIndex);
//           // console.log("did not detect closing parentheses");
//         }
//         return {
//           name: tok.value, 
//           type: 'ARRAY_REFERENCE',
//           index: index,
//           blockID: "code",
//           startIndex: startIndex, 
//           endIndex: endIndex,
//           beg: startIndex, 
//           end: endIndex 
          
//         };
//       }
//       return {
//         name: tok.value, 
//         type: 'VARIABLE',
//         blockID: "code",
//         startIndex: startIndex, 
//         endIndex: endIndex,
//         beg: startIndex, 
//         end: endIndex 
        
//       };

//     } else if (this.has('function')){
//         let result = {
//           blockID: 'code', 
//           startIndex: startIndex, 
//           endIndex: endIndex, 
//           beg: startIndex
//         };
//         result.type = 'FUNCTION_CALL';
//         result.name = this.tokens[this.i].value;
//         this.advance();
//         var args = [];
//         if (this.has('(')){
//           this.advance();
//           var loopBreak = 0;
//           while (this.hasNot(')') &&  loopBreak < maxLoop) {
//             // this.advance();
//             var param = this.boolean_operation();
//             args.push(param);
//             if (this.has(',')) {
//               this.advance();
              
//             }
//             loopBreak++;
//           }
//           console.log('here are the function call params:');
//           console.log(args);
//           result.params = args;
//           if (this.hasNot(')')){
//             appendAnnotation("didnt detect closing parintheses in the arguments of  a function call", this.tokens[this.i].startIndex, this.tokens[this.i].endIndex);
//             // console.error('didnt detect closing parintheses in the arguments of  a function call');
//           }
//           result.endIndex = this.tokens[this.i]?.endIndex;
//           result.end = result?.endIndex;
//           this.advance();
//           return result;
//         }
      
//     }else if (this.has("\n")){
//       // this.advance();
//       return;
    
//     } else {
//       // textError('parsing', `Missing or Unrecognized token: ${this.i} This is likely the result of a lexing error?.', startIndex, endIndex`);
//       console.log(`atom problem at this token: ${this.tokens[this.i].token_type}`);
//       return;
//     }
//   }

//   exponent() {
//     let l =this.unary();
//     // let l =this.atom();
//     while (this.has("EXPONENT")) {
//       var startIndex = this.tokens[this.i].startIndex;
//       var endIndex = this.tokens[this.i].endIndex;
//       this.advance();
//       const r =this.exponent();
//       // l =new Operators.Exponent(left, right);
//       l ={
//               left: l, 
//               right: r,
//               type: "EXPONENT", 
//               blockID: "code", 
//               beg: l?.beg, 
//               end: r?.end,
//               endIndex: endIndex,
//               startIndex: startIndex

//           }
//     }
//     return l;
//   }

  
//   location(){
//     var tok = this.tokens[this.i];
//     if (this.has('Variable')) {
//       this.advance();
//       if (this.has('[')){
//         this.advance();
//       }

//     }
//   }






//   multiplicitive() {
//     let l =this.exponent();
//     while (this.has("MULTIPLY") || this.has("DIVIDE") || this.has("MOD")) {
//       var endIndex = this.tokens[this.i].endIndex;
//       var startIndex = this.tokens[this.i].startIndex;
//       if (this.has("MULTIPLY")) {
//         this.advance();
//         const r =this.exponent();
//         // l =new Operators.Multiplication(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "MULTIPLY", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       } else if (this.has("DIVIDE")) {
//         this.advance();
//         const r =this.exponent();
//         // l =new Operators.Division(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "DIVIDE", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       } else if (this.has("MOD")) {
//         this.advance();
//         const r =this.exponent();
//         // l =new Operators.Modulo(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "MOD", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       }
//     }
//     return l;
//   }

  



//   additive() {
//     let l =this.multiplicitive();
//     while (this.has("ADD") || this.has("SUBTRACT")) {
//       var endIndex = this.tokens[this.i].endIndex;
//       var startIndex = this.tokens[this.i].startIndex;
//       if (this.has("SUBTRACT")) {
//         this.advance();
//         const r =this.multiplicitive();
//         // l =new Operators.Subtraction(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "SUBTRACT", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       } else if (this.has("ADD")) {
//         this.advance();
//         const r =this.multiplicitive();
//         // l =new Operators.Addition(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "ADD", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       }
//     }
//     return l;
//   }

//   unary(){
//     if (!this.has('not') && !this.has('SUBTRACT')){
//       return this.atom();
//     }
//     while (this.has('not')){
//       var endIndex = this.tokens[this.i].endIndex;
//       var startIndex = this.tokens[this.i].startIndex;
//       var result = {
//         blockID: 'code',
//         startIndex: startIndex, 
//         endIndex: endIndex
//       };
//       if (this.has('not')){
//         this.advance();
//         var expression = this.boolean_operation();
//         result.type = 'NOT';
//         result.value = expression;
//         result.beg = startIndex;
//         result.end = endIndex;
//       }
//     }
//     return result;
//   }

//   comparable() {
//     let l =this.additive();
//     while (
//       this.has("Less_Than_Equal_To") ||
//       this.has("Greater_Than_Equal_To") ||
//       this.has("Less_Than") ||
//       this.has("Greater_Than") ||
//       this.has("Equals") ||
//       this.has("Not_Equal")
//       ) {
//         var startIndex = this.tokens[this.i].startIndex;
//         var endIndex = this.tokens[this.i].endIndex;
//       if (this.has("Less_Than_Equal_To")) {
//         this.advance();
//         const r =this.additive();
//         // l =new Operators.Less_Than_Equal_To(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "LESS_THAN_EQUAL", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       } else if (this.has("Greater_Than_Equal_To")) {
//         this.advance();
//         const r =this.additive();
//         // l =new Operators.Greater_Than_EqualTo(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "GREATER_THAN_EQUAL", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       } else if (this.has("Less_Than")) {
//         this.advance();
//         const r =this.additive();
//         // l =new Operators.Less_Than(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "LESS_THAN", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//       } else if (this.has("Greater_Than")) {
//         this.advance();
//         const r =this.additive();
//         // l =new Operators.Greater_Than(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "GREATER_THAN", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//     } else if (this.has("Equals")) {
//         this.advance();
//         const r =this.additive();
//         // l =new Operators.Greater_Than_EqualTo(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "EQUALS", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//     } else if (this.has("Not_Equal")) {
//         this.advance();
//         const r =this.additive();
//         // l =new Operators.Greater_Than_EqualTo(left, right);
//         l ={
//             left: l, 
//             right: r,
//             type: "NOT_EQUAL", 
//             blockID: "code", 
//             startIndex: startIndex, 
//             endIndex: endIndex, 
//             beg: l?.beg, 
//             end: r?.end,
//         }
//     }
    
// }
// return l;
// }

// // not() {
// //   let l =this.additive();
// //   while (
// //     this.has("not")
// //   ) {
    
  
// // }
// // return l;
// // }



// boolean_operation() {
//   let l =this.comparable();
//   while (
//     this.has("and") ||
//     this.has("or")
//     ) {
//       var startIndex = this.tokens[this.i].startIndex;
//       var endIndex = this.tokens[this.i].endIndex;
//     if (this.has("and")) {
//       this.advance();
//       const r =this.comparable();
//       // l =new Operators.Less_Than_Equal_To(left, right);
//       l ={
//           left: l, 
//           right: r,
//           type: "AND", 
//           blockID: "code", 
//           startIndex: startIndex, 
//           endIndex: endIndex, 
//           beg: l?.beg, 
//           end: r?.end,
//       }
//     } else if (this.has("or")) {
//       this.advance();
//       const r =this.comparable();
//       // l =new Operators.Greater_Than_EqualTo(left, right);
//       l ={
//           left: l, 
//           right: r,
//           type: "OR", 
//           blockID: "code", 
//           startIndex: startIndex, 
//           endIndex: endIndex, 
//           beg: l?.beg, 
//           end: r?.end,
//       }
    
//   }
  
// }
// return l;
// }


// program() {
//   return {
//     type: "PROGRAM", 
//     value: this.codeBlock('EOF'), 
//     blockID: 'code'
//   }

// }


// codeBlock(endToken) {
//   let praxly_blocks = [];
//    const argsArray = Array.from(arguments);
//   //  while (!this.eof) {
//   while (this.hasNotAny(argsArray)) {
//     praxly_blocks.push(this.statement());
//     this.advance();
//    }
//    return {
//       type: "CODEBLOCK", 
//       statements: praxly_blocks,
//       blockID: "code"
//    }

// }

// statement() {
//   // while loop here?
//   var startIndex = this.tokens[this.i].startIndex;
//   var endIndex = this.tokens[this.i].endIndex;
//   let result = {
//     blockID: 'code', 
//     startIndex: startIndex, 
//     endIndex: endIndex, 
//     beg: startIndex
//   };
//   if (this.has("if")) {

//     result.type = "IF";
//     this.advance();
//     result.condition = this.boolean_operation();
//     if (this.has('\n')){
//       this.advance();
//       result.statement = this.codeBlock('else', 'end if');
//       if (this.has('else')) {
//         this.advance();
//         if (this.has('\n')){
//           this.advance();
//         } 
//         result.type = "IF_ELSE";
//         result.alternative = this.codeBlock('end if');
        
//       }
//       if (this.has('end if')) {
//         result.end = this.tokens[this.i].endIndex;
//         this.advance();
//         return result;
//       }
//       else {
//         // sendRuntimeError("missing the \'end if\' token", blockjson);
//         textError('compile time', "missing the \'end if\' token", result.startIndex ,result.endIndex);
//         return {
//           type: 'INVALID'
//         };
//       }
//     } 
//   } 
//   else if (this.has('for')){
//     result.type = "FOR";
//     this.advance();
//     if (this.hasNot('(')){
//       return result;
//     }
//     this.advance();
//     result.initialization = this.statement();
//     if (this.has(';')) {
//       this.advance();
//       result.condition = this.boolean_operation();
//       // this.advance();
//       if (this.has(';')) {
//         this.advance();
//         result.incriment = this.statement();
//         if (this.hasNot(')')){
//           return result;
//         }
//         this.advance();
//         if (this.has('\n')){
//           this.advance();
//           result.statement = this.codeBlock('end for');
//           if (this.has('end for')){
//             result.end = this.tokens[this.i].endIndex;
//             this.advance();
//             return result;
//           }
//           else{
//             textError('compile time', "missing the \'end for\' token", result.startIndex ,result.endIndex);
//           }
//         }
//       }
      
//     }
//     console.log(`parser messing up, current token is ${this.tokens[this.i].token_type}`);
//     return result;
   



//   }
//   else if (this.has('while')){
//     result.type = "WHILE";
//     this.advance();
//     result.condition = this.boolean_operation();
//     if (this.has('\n')){
//       this.advance();
//       result.statement = this.codeBlock( 'end while');
        
//       }
//       if (this.has('end while')) {
//         result.end = this.tokens[this.i].endIndex;
//         this.advance();
//         return result;
//       } else {
//         textError('compile time', "missing the \'end while\' token", result.startIndex ,result.endIndex);
//         //gohere
//       }
//   } 
   
//   else if (this.has('do')){
//     result.type = "DO_WHILE";
//     this.advance();
//     if (this.has('\n')){
//       this.advance();
//       result.statement = this.codeBlock( 'while');
      
//     }
//     if (this.has('while')) {
//       this.advance();
//       if (this.hasNot('(')){
//         //error
//         return result;
//       }
//       this.advance();
//       result.condition = this.boolean_operation();
//       if (this.hasNot(')')){
//         return result;
//       }
//       this.advance();
//       if (this.hasNot('\n')){
//         return result;
//         //error
//       }
//       this.advance()
//       result.end = this.tokens[this.i].endIndex;
//         return result;
//       }
//   }

//   else if (this.has('repeat')){
//     result.type = "REPEAT_UNTIL";
//     this.advance();
//     if (this.has('\n')){
//       this.advance();
//       result.statement = this.codeBlock( 'until');
      
//     }
//     if (this.has('until')) {
//       this.advance();
//       if (this.hasNot('(')){
//         //error
//         return result;
//       }
//       this.advance();
//       result.condition = this.boolean_operation();
//       if (this.hasNot(')')){
//         return result;
//       }
//       this.advance();
//       if (this.hasNot('\n')){
//         return result;
//         //error
//       }
//       this.advance()
//       result.end = this.tokens[this.i].endIndex;
//         return result;
//       }
//   }

//   else if (this.has("print")) {
//     // while (this.has('print')) {
//       this.advance();
//       const expression = this.boolean_operation();
//       if (this.has(';')){
//         this.advance();
//       }
//       if (this.has('\n')){
//         // this.advance();
//         result.type = 'PRINT';
//         result.value = expression;
//         result.end = expression?.end; 
//         return result;
//       }
//   }

//   else if (this.has("println")) {
//     // while (this.has('print')) {
//       this.advance();
//       const expression = this.boolean_operation();
//       if (this.has(';')){
//         this.advance();
//       }
//       if (this.has('\n')){
//         // this.advance();
//         result.type = 'PRINTLN';
//         result.value = expression;
//         result.end = expression?.end; 
//         return result;
//       }
//   }

//   else if (this.has("return")) {
//     // while (this.has('print')) {
//       this.advance();
//       const expression = this.boolean_operation();
//       if (this.has(';')){
//         this.advance();
//       }
//       if (this.has('\n')){
//         // this.advance();
//         result.type = 'RETURN';
//         result.value = expression;
//         result.end = expression.end; 
//         return result;
//       }

//   }else if (this.has('comment')){
//     result.type = 'COMMENT', 
//     result.value = this.tokens[this.i].value;
//     result.end = result.endIndex;
//     return result;
  
//   } else if (this.has('single_line_comment')){
//     result.type = 'SINGLE_LINE_COMMENT', 
//     result.value = this.tokens[this.i].value;
//     result.end = result.endIndex;
//     return result;
//   }



  
//   else if (this.has_type() && this.has_ahead('Variable')){
//     var returnType = this.tokens[this.i].value.toUpperCase();
//       this.advance();
//       if (this.has("Variable")){
//         result.type = 'ASSIGNMENT';
//         result.name = this.tokens[this.i].value;
//         this.advance();
//         if (this.has('Assignment')){
//           result.startIndex = this.tokens[this.i].startIndex;
//           result.endIndex = this.tokens[this.i].endIndex;
//           this.advance();
//           result.value = this.boolean_operation();
//           result.end = result.value.end;
//           result.varType = returnType;
//         }
//       }
//       return result;
//   }

//   else if (this.has_type() && this.has_ahead('[')){
//     var returnType = 'Praxly_' + this.tokens[this.i].value;
//       this.advance();
//       this.advance();
//       if (this.has("]")) {
//         this.advance();
//       } else {
//         textError('parsing', 'did not detect closing bracket', startIndex, endIndex);
//         // console.log("did not detect closing parentheses");
//       }
//       if (this.has("Variable")){
//         result.type = 'ARRAY_ASSIGNMENT';
//         result.name = this.tokens[this.i].value;
//         this.advance();
//         if (this.has('Assignment')){
//           result.startIndex = this.tokens[this.i].startIndex;
//           result.endIndex = this.tokens[this.i].endIndex;
//           this.advance();
//           result.value = this.boolean_operation();
//           result.end = result.value.end;
//           result.varType = returnType;
//         }
//       }
//       return result;
//   }

//   //annoying stuff because array syntax sucks to impliment
//   else if (this.has('Variable') && this.has_ahead('[') && this.has_array_reference_assignment()){
//     result.name = this.tokens[this.i].value;
//     this.advance();
//     // console.error(`made it here`);
//     if(this.has('[')){
//       this.advance();
//       var index = this.boolean_operation();
//       if (this.has("]")) {
//         this.advance();
//       } else {
//         textError('parsing', 'did not detect closing bracket', startIndex, endIndex);
//         // console.log("did not detect closing parentheses");
//       }
//       result.type = 'ARRAY_REFERENCE_ASSIGNMENT';
//       result.index = index;
//       if (this.has('Assignment')){
//         result.startIndex = this.tokens[this.i].startIndex;
//         this.advance();
//         result.value = this.boolean_operation();
//         result.end = result.value.end;
//       } else {
//         console.error(`the array reference asssignement function failed. `);
//       }
//     }
//     if (this.has(';')){
//       this.advance();
//     }
//     return result;
//   }


  
//   else if (this.has('Variable') && this.has_ahead('Assignment')){
//     if (this.has("Variable")){
//       result.type = 'ASSIGNMENT';
//       result.name = this.tokens[this.i].value;
//       this.advance();
//       if (this.has('Assignment')){
//         result.startIndex = this.tokens[this.i].startIndex;
//         this.advance();
//         result.value = this.boolean_operation();
//         result.end = result.value.end;
//         result.varType = 'reassignment';
//       }
//     }
//     if (this.has(';')){
//       this.advance();
//     }
//     return result;
//   }

//   else if (this.has_type()&& this.has_ahead('function')){
//     // console.log('saw function');
//     //function code here
//     result.type = 'FUNCTION_ASSIGNMENT';
//     result.returnType = this.tokens[this.i].value;
//     this.advance();
//     if (this.hasNot('function')){
//       console.error('no function name here, there is a problem');
//     }
//     result.name = this.tokens[this.i].value;
//     this.advance();
//     var args = [];
//     if (this.has('(')){
//       this.advance();
//       var stopLoop = 0;
//       while (this.hasNot(')') && stopLoop < maxLoop) {
//         var param = [];
//         if (this.has_type()){
//           param.push(this.tokens[this.i].value);
//           this.advance();
//         }
//         if (this.has('Variable')){
//           param.push(this.tokens[this.i].value);
//           this.advance();
//         }
//         args.push(param);
//         if (this.has(',')){
//           this.advance();
//         }
//         stopLoop+= 1;
        
//       }
//       console.log ('here are the params');
//       console.log(args);
 
//       if(this.has(')')){
//         this.advance();
//       } else {
//           console.error('missing closing parinthesees');
//           textError("compile time", "didnt detect closing parintheses in the arguments of  a function definition", this.tokens[this.i].startIndex, this.tokens[this.i].endIndex);
    
//       }
//       result.params = args;
//       result.endindex = this.tokens[this.i].endIndex;
//       if (this.has(';')){
//         this.advance();
//       }
//       if (this.has('\n')){
//         this.advance();
//       }
//     } else {
//       console.error('error, detected function but did not find parinthesees');
//       return;
//     }
//     var contents = this.codeBlock('end ' + result.name);
//     result.contents = contents;
//     result.end = this.tokens[this.i]?.endIndex;
//     if (this.hasNot('end ' + result.name)){
//       textError('compile time', `missing the \'end ${result.name}\' token`, result.startIndex ,result.endIndex);
//       return result;
//     }
//     this.advance();
//     return result;
//   }

//   // expressions can be statements too, might cause bugs
//   else if (this.has('/n')){

//     return {
//       type: "EMPTYLINE", 
//       blockID: "code"
//     };
//   }

//   else {
//     // console.log(`the current token is ${this.tokens[this.i].token_type} and the next one is ${this.tokens[this.i + 1].token_type}`)
//     let contents = this.boolean_operation();
//     if (contents === undefined || contents === null){
//       return;
//     }
//     if (this.has(';')){
//       this.advance();
//     }
//     if (this.has('\n')){
//       // this.advance();
//       result = {
//         type: "STATEMENT", 
//         value: contents, 
//         blockID: "code"
//       };
//     }

//   }

//   return result;
  
// }




// }