import { MAX_LOOP, NODETYPES, OP, TYPES, indexToAceRange, textEditor, textError } from './common';

/**
 * this will take all of the text currently in the editor and generate the corresponding Intermediate Representation .
 * @returns the Intermediate Representation as a tree structure in json format.
 */
export function text2tree() {
  let code = textEditor?.getValue();
  code = code.replace(/\t/g, "    ");
  let lexer = new Lexer(code);
  let ir;
  let tokens = lexer.lex();
    console.info('here are the tokens:');
    console.debug(tokens);
  let parser = new Parser(tokens);
  ir = parser?.parse();
  return ir;
}

/**
 * This is the object that I use to tokenize the input to prepare it for parsing. 
 */
class Token {
  constructor(type, text, line, startIndex, endIndex) {
    this.token_type = type;
    this.value = text;
    this.line = line + 1;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }
}


class Lexer {
  constructor(source) {
    if (source?.length > 0 && source[source?.length - 1] !== '\n') {
      source += "\n";
    }
    this.source = source;
    this.tokens = [];
    this.i = 0;
    this.index_before_this_line = 0;
    this.length = this.source?.length;
    this.token_so_far = "";
    this.multi_Char_symbols = ['>', '<', '=', '!', '-'];
    this.symbols = [",", ";", "(", ")", "{", "}", "[", "]", ".", "+", "/", "*",  "%", "^", "≠", , "←", "⟵",  "≥", "≤"];
    this.keywords = ["if", "else", "end", "print", "println", "input", "for", "while", 'and', 'or', 'do', 'repeat',
     'until', 'not', 'return', 'null'];
    this.types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void'];
    this.startToken = [0, 0];
    this.currentLine = 0;
  }

  has_letter() {
    const a = this.source[this.i];
    return /^[A-Za-z_]$/.test(a);
  }

  has_valid_symbol(){
    return this.i < this.length && this.symbols.includes(this.source[this.i]); 
  }

  has_multi_char_symbol(){
    return this.i < this.length && this.multi_Char_symbols.includes(this.source[this.i]); 
  }

  has_keyword(){
    return this.i < this.length && this.keywords.includes(this.token_so_far); 
  }

  has_boolean() {
    return this.i < this.length && (this.token_so_far === 'true' || this.token_so_far === 'false');
  }

  
  has_type() {
    return this.i < this.length && this.types.includes(this.token_so_far);
  }

  has_short_comment(){
    return this.has('/') && this.has_ahead('/');

  }

  has_long_comment() {
    return this.has('/') && this.has_ahead('*');
  }

  has(c) {
    return this.i < this.length && this.source[this.i] === c;
  }

  hasNot(c) {
    return this.i < this.length && this.source[this.i] !== c;
  }


  has_ahead(c) {
    return this.i < this.length && this.source[this.i + 1] === c;
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

  skip(times=1) {
    this.i+= times;
    this.startToken = [this.currentLine, this.i - this.index_before_this_line];    
  }

  insert_newline() {
    if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].token_type !== "\n") {
      this.tokens.push(new Token("\n", "", this.currentLine));
      // Note: the code won't be reformatted if an error occurs
      // this.currentLine += 1;
    }
  }

  emit_token(type=null) {
    var endIndex = this.i - this.index_before_this_line;
    // console.error(endIndex);
    this.tokens.push(new Token(type ?? this.token_so_far, this.token_so_far, this.currentLine, this.startToken, [this.currentLine, endIndex]));
    this.token_so_far = '';
    
    // console.error([this.currentLine, endIndex]);
    this.startToken = [this.currentLine, endIndex];
    // console.error(this.startToken);
  }

  /**
   * This function will take all of the text and it will convert it into tokens
   * @returns an array of Token objects
   */
  lex() {
    while (this.i < this.length) {
      
      if (this.has_short_comment()){
        this.skip(2);
        while (this.hasNot('\n')){
          this.capture();
        }
        this.insert_newline();
        this.emit_token(NODETYPES.SINGLE_LINE_COMMENT);
        this.skip(); // newline after comment
        this.currentLine += 1;
        this.index_before_this_line = this.i;
        this.startToken = [this.currentLine, this.i - this.index_before_this_line]; 
        continue;
      }

      if (this.has_long_comment()){
        this.skip(2);
        while (this.hasNot('*') && this.hasNot_ahead('/')){
          this.capture();
        }
        if (this.i === this.length){
          textError('lexing', `looks like you didn\'t close your comment. Remember comments
            start with a \'/*\' and end with a \'*/\'.`, commentStart, this.currentLine);
        }
        this.skip(2);
        this.emit_token(NODETYPES.COMMENT);
        continue;
      }

      if (this.has('\'')) {
        this.skip();
        if (this.has_letter && this.has_ahead('\'')) {
          this.capture();
          this.skip();
          this.emit_token(NODETYPES.CHAR);
          continue;
        } 
        textError('lexing', 'looks like you didn\'t close your quotes on your char. \n \tRemember chars start and end with a single quote mark (\').', this.currentLine);
      }
      
      if (this.has("\"")) {
        var stringStart = this.currentLine;
        this.skip();
        while (this.i < this.length && !this.has("\"")) {
          this.capture();
        }
        if (this.has("\"")) {
          this.skip();
          this.emit_token(NODETYPES.STRING);
          continue;
        }
        textError('lexing', 'looks like you didn\'t close your quotes on your String. \n \tRemember Strings start and end with a double quote mark (\").', stringStart);
        this.i -= 1;
        this.token_so_far = "";
        this.emit_token(NODETYPES.STRING);
        continue;

      }

      if (this.has_valid_symbol()){
        this.capture();
        this.emit_token();
        continue;
      }


      if (this.has_multi_char_symbol()){
        while (this.has_multi_char_symbol()){
          this.capture();
        }
        this.emit_token();
        continue;
      }

      if (this.has_digit()) {
        while (this.i < this.length && this.has_digit()) {
          this.capture();
        }
        if (this.i < this.length && this.has(".")) {
          this.capture();
          while (this.i < this.length && this.has_digit()) {
            this.capture();
          }
          this.emit_token(NODETYPES.DOUBLE);
          continue;
        }
        this.emit_token(NODETYPES.INT);
        continue; 
      }
      if (this.has(' ')){
        this.skip();
        continue;
      }
      if (this.has("\n")) {
        this.capture();
        this.emit_token("\n");
        this.currentLine += 1;
        this.index_before_this_line = this.i;
        this.startToken = [this.currentLine, this.i - this.index_before_this_line]; 
        continue;
      } 
      if (!this.has_letter()){
        textError('lexing', `unrecognized character \"${this.source[this.i]}\"`, this.i, this.i + 1);
        break;
      }
      while (this.i < this.length && (this.has_letter() || this.has_digit())) {
          this.capture();
      }
      if (this.has_type()) {
        this.emit_token('Type');
        continue;
      }
      if (this.token_so_far === 'end') {
        while (this.hasNot('\n')) {
          this.capture();
        }
        this.emit_token();
        continue;
      }
      if (this.has_boolean()) {
        this.emit_token(NODETYPES.BOOLEAN);
        continue;
      }
      if (this.has_keyword()) {
        this.emit_token();
        continue;
      }
      this.emit_token("Location");      
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
    this.length = tokens?.length;
    this.eof = false;
    this.keywords = ["if", "else", "then", "done"];
    this.statementKeywords = ['if', 'print', 'for', 'while', 'println'];
    this.specialStringFunctionKEywords = ["charAt", "contains", "indexOf", "length", "substring", "toLowerCase", "toUpperCase"];
  }

  hasNot(type) {
    return this.i < this.length && this.tokens[this.i].token_type !== type;
  }

  getCurrentToken(){
    return this.tokens[this.i];
  }

  has(type) {
    return this.i < this.length && this.tokens[this.i].token_type === type;
  }

  hasAny() {
    var types = Array.prototype.slice.call(arguments);
    return this.i < this.length && types.includes(this.tokens[this.i].token_type);
  }


  hasNotAny() {
    var types = Array.prototype.slice.call(arguments);
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

  match_and_discard_next_token(type) {
    if (this.tokens[this.i].token_type === type) {
      this.advance();
    } else {
      textError('parsing', `did not detect desired token at this location. \nexpected: \'${type}\'\n but was: ${this.tokens[this.i].token_type}`, this.tokens[this.i].line);
    }
  }

  advance() {
    this.i++;
  }

  parse() {
    if (!this.tokens) {
      return;
    }
    return this.parse_program();
  }



  /**
   * This function creates new nodes for the AST for any binary operation
   * @param {*} operation the operation symbol
   * @param {*} l left operand
   * @param {*} r right operand
   * @param {*} line line that the token is on
   * @returns 
   */
  binaryOpNode_new(operation, l, r, line){
    var type;
    switch (operation){
      case '+':
          type = OP.ADDITION;
          break;
      case '-':
          type = OP.SUBTRACTION;
          break;
      case '*':
          type = OP.MULTIPLICATION;
          break;
      case '/':
          type = OP.DIVISION;
          break;
      case '%':
          type = OP.MODULUS;
          break;
      case '^':
          type = OP.EXPONENTIATION;
          break;
      case '=':
      case '<-':
      case "←": 
      case "⟵":
          type = OP.ASSIGNMENT;
          break;
      case '==':
          type = OP.EQUALITY;
          break;
      case '!=':
      case '≠':
          type = OP.INEQUALITY;
          break;
      case '>':
          type = OP.GREATER_THAN;
          break;
      case '<':
          type = OP.LESS_THAN;
          break;
      case '>=':
      case '≥':
        type = OP.GREATER_THAN_OR_EQUAL;
        break;
      case '<=':
      case '≤':
          type = OP.LESS_THAN_OR_EQUAL;
          break;
      case 'and':
      case '&&':
          type = OP.AND;
          break;
      case '||':
      case 'or':
          type = OP.OR;
          break;
      default:
          // handle unknown type
          break;
  }
    return {
      blockID: "code",
      line: line, 
      left: l, 
      right: r, 
      type: type,
      startIndex: l.startIndex,
      endIndex: r.endIndex,
    }
  }



  /**
   * Creates a new node for literal values in the AST. 
   * @param {*} token 
   * @returns ASTNODE
   */
  literalNode_new(token){
    return {
      blockID: "code",
      line: token.line, 
      value: token.token_type === NODETYPES.BOOLEAN ? token.value === 'true': token.value,
      type: token.token_type, 
      startIndex: token.startIndex, 
      endIndex: token.endIndex,
    }
  }

  /**
   * Creates a new node for the AST for unary operations
   * @param {*} operation the operation (from NODETYPES)
   * @param {*} expression the expression node
   * @param {*} line 
   * @param {*} startIndex
   * @returns 
   */
  unaryOPNode_new(operation, expression, line, startIndex){
    var type;
    switch (operation){
      case '!':
      case 'not':
          type = OP.NOT;
          break;
      case '-':
          type = OP.NEGATE;
          break;
    }
    return {
      blockID: "code",
      line: line, 
      value: expression,
      type: type, 
      startIndex: startIndex,
      endIndex: expression.endIndex,
    }
  }

  /**
   * This will recursively handle any combination of Binary operations
   * @param {*} precedence recursive parameter to keep track of the precedence level
   * @returns an AST node 
   */
  parse_expression(precedence=9){
    let operation = this.getCurrentToken().token_type;
    let line = this.tokens[this.i].line;
    let startIndex = this.getCurrentToken().startIndex;
    let endIndex = this.getCurrentToken().endIndex;
    switch (precedence){
      case 9:
        var l = this.parse_expression(precedence - 1);
        while (this.has("or")) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentToken().line;
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;
      case 8:
        var l = this.parse_expression(precedence - 1);
        while (this.has("and")) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentToken().line;
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      case 7:
        var l = this.parse_expression(precedence - 1);
        while ( this.hasAny('<', '>', '==', '!=', '>=', '<=', '≠', '≥', '≤')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentToken().line;
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;
      case 6:
        var l = this.parse_expression(precedence - 1);
        while ( this.hasAny('+', '-')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentToken().line;
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;
      case 5:
        var l = this.parse_expression(precedence - 1);
        while ( this.hasAny('*', '/', '%')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentToken().line;
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;
      case 4:
        var l = this.parse_expression(precedence - 1);
        while ( this.hasAny('^')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentToken().line;
          this.advance();
          const r = this.parse_expression(precedence);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      case 3:
        if (this.hasNotAny('not', '!', '-')) {
          return this.parse_expression(precedence - 1);
        }
        operation = this.getCurrentToken().token_type;
        line = this.getCurrentToken().line;
        this.advance();
        var exp = this.parse_expression(precedence - 1);
        return this.unaryOPNode_new(operation, exp, line, startIndex);

      // This is the dot operator
      case 2:
      var l = this.parse_expression(precedence - 1);
      while ( this.hasAny('.')) {
        operation = this.getCurrentToken().token_type;
        line = this.getCurrentToken().line;
        this.advance();
        const r = this.parse_expression(precedence);
        if (r.type != NODETYPES.FUNCCALL){
          textError("compile-time", "classes are not fully supported yet. the right side of the . operator must be a supported string function", line);
        }
        l = {
          left: l,
          right: r,
          type: NODETYPES.SPECIAL_STRING_FUNCCALL,
          blockID: "code",
          line: line
        }
      }
      return l;

      //This one gets really complicated 
      case 1:
        switch(operation){
          case 'EOF':
            this.eof = true;
            return 'EOF';
          case NODETYPES.INT:
          case NODETYPES.STRING:
          case NODETYPES.CHAR:
          case NODETYPES.FLOAT:
          case NODETYPES.DOUBLE:
            this.advance();
            return this.literalNode_new(this.tokens[this.i - 1]);
          case 'input':
            this.tokens[this.i].token_type = NODETYPES.INPUT;
            this.advance(); 
            return this.literalNode_new(this.tokens[this.i - 1]);
          case NODETYPES.BOOLEAN: 
            this.advance(); 
            return this.literalNode_new(this.tokens[this.i - 1]);

          case '(':
            this.advance();
            const expression = this.parse_expression(9);
            if (this.has(")")) {
              this.advance();
            } else {
              textError('parsing', 'did not detect closing parentheses', line,);
            }
            return expression;

          //ah yes, array literals....very fun
          case '{':
            let result = {
              blockID: 'code',
              line: line,
              type: NODETYPES.ARRAY_LITERAL,
              startIndex: startIndex,
              endIndex: this.getCurrentToken().endIndex,
            };
            var args = [];
            this.advance();
            var loopBreak = 0;
            while (this.hasNot('}') && loopBreak < MAX_LOOP) {
              var param = this.parse_expression(9);
              args.push(param);
              if (this.has(',')) {
                this.advance();
              }
              loopBreak++;
            }
            result.params = args;
            if (this.hasNot('}')) {
              textError("parsing", "didn't detect closing curly brace in the array declaration", this.tokens[this.i].line);
            }
            result.endIndex = this.getCurrentToken().endIndex;
            this.advance();
            return result; 
          case 'Location':
            var l = this.parse_location();
            if (this.hasAny('=', '<-', "←", "⟵")) {
              this.advance();
              var value = this.parse_expression(9);
              l = {
                type: NODETYPES.ASSIGNMENT,
                blockID: "code",
                line: line,
                location: l,
                value: value,
                startIndex: startIndex,
              }
            } else if (this.has('(')) {
              this.advance();
              var args = [];
              var loopBreak = 0;
              while (this.hasNot(')') && loopBreak < MAX_LOOP) {
                var param = this.parse_expression(9);
                args.push(param);
                if (this.has(',')) {
                  this.advance();
                }
                loopBreak++;
              }
              this.match_and_discard_next_token(')');
              l = {
                type: NODETYPES.FUNCCALL,
                blockID: "code",
                line: line,
                name: l.name,
                value: value,
                args: args, 
                startIndex: startIndex,
              }
              // this is used to give different behavior to these functions in particular
              // if (this.specialStringFunctionKEywords.includes(l.name)){
              //   l.type = NODETYPES.SPECIAL_STRING_FUNCCALL;
              // }
            }
            l.endIndex = this.getCurrentToken().endIndex;
            return l;
          default: 
            textError("parsing", `invalid Token ${this.getCurrentToken().value}`, line);
        }
    }
  }




  parse_location() {
    var result = {
      type: NODETYPES.LOCATION,
      name: this.tokens[this.i].value,
      isArray: false,
      blockID: 'code',
      line: this.tokens[this.i].line,
      index: null,
      startIndex: this.tokens[this.i].startIndex,
    }
    this.advance();
    if (this.has('[')) {
      this.advance();
      result.index = this.parse_expression();
      result.isArray = true;
      result.endIndex = this.getCurrentToken().endIndex;
      this.match_and_discard_next_token(']');
    }
    return result;
  }

  // this one kinda a mess ngl, but my goal is to support variable initialization and assignment all together
  parse_funcdecl_or_vardecl() {
    var isArray = false;
    var type = NODETYPES.VARDECL;
    var vartype = this.tokens[this.i].value;
    var startIndex = this.getCurrentToken().startIndex;
    this.advance();
    if (this.has('[') && this.has_ahead(']')) {
      this.advance();
      this.advance();
      type = NODETYPES.ARRAY_ASSIGNMENT;
      isArray = true;
    }
    
    var location = this.parse_location();
    var result = {
      type: type,
      varType: vartype,
      name: location.name,
      isArray: isArray,
      blockID: 'code',
      location: location,
      line: this.tokens[this.i].line,
      index: null,
      startIndex: startIndex,
    }
    if (this.hasAny('=', '<-', "←", "⟵")) {
      this.advance();
      result.value = this.parse_expression(9);
      if (this.has(';')) {
        this.advance();
      }
    } else if (this.has('(')) {
      result.type = NODETYPES.FUNCDECL;
      result.returnType = vartype;
      if (type == NODETYPES.ARRAY_ASSIGNMENT) {
        result.returnType += "[]";
      }
      this.match_and_discard_next_token('(');
      var params = [];
      var stopLoop = 0;
      while (this.hasNot(')') && stopLoop < MAX_LOOP) {
        var param = [];
        if (this.has_type()) {
          param.push(this.tokens[this.i].value);
          this.advance();
        }
        if (this.has('[') && this.has_ahead(']')) {
          this.advance();
          this.advance();
          param[0] += "[]";
        }
        if (this.has('Location')) {
          param.push(this.tokens[this.i].value);
          this.advance();
        }
        params.push(param);
        if (this.has(',')) {
          this.advance();
        }
        stopLoop += 1;
      }

      
      result.endIndex = this.getCurrentToken().endIndex;
      this.match_and_discard_next_token(')');
      result.params = params;

      if (this.has(';')) {
        this.advance();
      }
      if (this.has('\n')) {
        this.advance();
      }

      var contents = this.parse_block('end ' + result.name);
      result.contents = contents;
      if (this.hasNot('end ' + result.name)) {
        textError('compile time', `missing the \'end ${result.name}\' token`, result.line);
        result.endIndex = this.getCurrentToken().endIndex;
        return result;
      }
      this.advance();
    }
    result.endIndex = this.getCurrentToken().endIndex;
    return result;
  }

  

  parse_program() {
    return {
      type: "PROGRAM",
      value: this.parse_block('EOF'),
      blockID: 'code'
    }
  }

  /**
   * parses a block of statements (think curlybraces)
   * @param  {...any} endToken any tokens that will determine the end of the block. 
   * @returns 
   */
  parse_block(...endToken) {
    let praxly_blocks = [];
    while (this.hasNotAny(...endToken)) {
      
      if (this.has('EOF')){
        break;
      }
      praxly_blocks.push(this.parse_statement());
      // note: I for some reason always assumed that statements will not parse the final token, so I always did it here. 
      // I think its because I assumed that all statements end with a newline. 
      this.advance();
    }
    return {
      type: NODETYPES.CODEBLOCK,
      statements: praxly_blocks,
      blockID: "code"
    }
  }

  parse_statement() {
    var line = this.tokens[this.i].line;
    let result = {
      startIndex: this.getCurrentToken().startIndex,
      endIndex: this.getCurrentToken().endIndex,
      blockID: 'code',
      line: line,
    };
    if(this.has('\n')){
      result.type = NODETYPES.NEWLINE;
      return result;
    }

    if (this.has("if")) {
      result.type = NODETYPES.IF;
      this.advance();
      result.condition = this.parse_expression(9);
      if (this.has('\n')) {
        this.advance();
        result.statement = this.parse_block('else', 'end if');
        if (this.has('else')) {
          this.advance();
          if (this.has('\n')) {
            this.advance();
          }
          result.type = NODETYPES.IF_ELSE;
          result.alternative = this.parse_block('end if');
        }
        if (this.has('end if')) {
          this.advance();
          return result;
        }
        else {
          textError('compile time', "missing the \'end if\' token", result.line);
        }
      }

    } else if (this.has('for')) {
      result.type = NODETYPES.FOR;
      this.advance();
      if (this.hasNot('(')) {
        return result;
      }
      this.advance();
      result.initialization = this.parse_statement();
      result.condition = this.parse_expression(9);

      if (this.has(';')) {
        this.advance();
        result.increment = this.parse_expression(1);
        if (this.hasNot(')')) {
          return result;
        }
        this.advance();
        if (this.has('\n')) {
          this.advance();
          result.statement = this.parse_block('end for');
          if (this.has('end for')) {
            this.advance();
            return result;
          }
          else {
            textError('compile time', "missing the \'end for\' token", result.line);
          }
        }
      }
      console.log(`parser messing up, current token is ${this.tokens[this.i].token_type}`);
      return result;
    }

    else if (this.has('while')) {
      result.type = NODETYPES.WHILE;
      this.advance();
      result.condition = this.parse_expression(9);
      if (this.has('\n')) {
        this.advance();
        result.statement = this.parse_block('end while');
      }
      if (this.has('end while')) {
        this.advance();
        return result;
      } else {
        textError('compile time', "missing the \'end while\' token", result.line);

      }
    }

    else if (this.has('do')) {
      result.type = NODETYPES.DO_WHILE;
      this.advance();
      if (this.has('\n')) {
        this.advance();
        result.statement = this.parse_block('while');
      }
      if (this.has('while')) {
        this.advance();
        if (this.hasNot('(')) {
          //error
          return result;
        }
        this.advance();
        result.condition = this.parse_expression(9);
        if (this.hasNot(')')) {
          return result;
        }
        this.advance();
        if (this.hasNot('\n')) {
          return result;
          //error
        }
        this.advance()
        return result;
      }
    }

    else if (this.has('repeat')) {
      result.type = NODETYPES.REPEAT_UNTIL;
      this.advance();
      if (this.has('\n')) {
        this.advance();
        result.statement = this.parse_block('until');
      }
      if (this.has('until')) {
        this.advance();
        if (this.hasNot('(')) {
          //error
          return result;
        }
        this.advance();
        result.condition = this.parse_expression(9);
        if (this.hasNot(')')) {
          return result;
        }
        this.advance();
        if (this.hasNot('\n')) {
          return result;
          //error
        }
        this.advance()
        return result;
      }
    }

    else if (this.has("print")) {
      this.advance();
      const expression = this.parse_expression(9);
      if (this.has(';')) {
        this.advance();
      }
      if (this.has('\n')) {
        // this.advance();
        result.type = NODETYPES.PRINT;
        result.value = expression;
        return result;
      }
    }

    else if (this.has("println")) {
      this.advance();
      const expression = this.parse_expression(9);
      if (this.has(';')) {
        this.advance();
      }
      if (this.has('\n')) {
        result.type = NODETYPES.PRINTLN;
        result.value = expression;
        return result;
      }
    }

    else if (this.has("return")) {
      this.advance();
      const expression = this.parse_expression(9);
      if (this.has(';')) {
        this.advance();
      }
      if (this.has('\n')) {
        result.type = NODETYPES.RETURN;
        result.value = expression;
        return result;
      }

    } else if (this.has(NODETYPES.COMMENT)) {
      result.type = NODETYPES.COMMENT,
        result.value = this.tokens[this.i].value;
      return result;

    } else if (this.has(NODETYPES.SINGLE_LINE_COMMENT)) {
      result.type = NODETYPES.SINGLE_LINE_COMMENT,
        result.value = this.tokens[this.i].value;
      return result;
    }

    else if (this.has_type() && this.hasNot_ahead('(')) {
      return this.parse_funcdecl_or_vardecl();
    }

    else if (this.has('\n')){
      return {
        type: NODETYPES.NEWLINE, 
        blockID: 'code',
      }
    }

    else {
      // this is a stand alone expression as a statement.
      let contents = this.parse_expression(9);

      // if (!contents?.startIndex ?? false){
      //   console.error(this.getCurrentToken());
      //   console.error(this.tokens[this.i + 1]);
      // }

      if (this.has(';')) {
        this.advance();
      }
      result = {
        type: NODETYPES.STATEMENT,
        value: contents,
        blockID: "code",
        startIndex: contents.startIndex, 
        endIndex: contents.endIndex,
      };
    }
    return result;
  }
}
