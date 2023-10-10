class Token {
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






function tokenize(source) {
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