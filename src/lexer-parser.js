import { MAX_LOOP, NODETYPES, TYPES, textEditor, textError } from './common';

/**
 * this will take all of the text currently in the editor and generate the corresponding Intermediate Representation .
 * @returns the Intermediate Representation as a tree structure in json format.
 */
export function text2tree() {
  let code = textEditor?.getValue();

  // console.log(code);
  let lexer = new Lexer(code);
  let ir;
  try {
    let tokens = lexer.lex();
    // console.info('here are the tokens:');
    // console.debug(tokens);
    let parser = new Parser(tokens);
    ir = parser?.parse();
    // console.info('here is the tree:');
    // console.log(ir);
  }
  catch (error) {
    console.log(error);
  }
  return ir;
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
    if (source?.length > 0 && source[source?.length - 1] !== '\n') {
      source += "\n";
    }
    this.source = source;
    this.tokens = [];
    this.i = 0;
    this.length = this.source?.length;
    this.token_so_far = "";
    this.keywords = ["if", "else", "end", "print", "println", "input", "for", "while", 'and', 'or', 'do', 'repeat', 'until', 'not', 'return', 'null'];
    this.types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void'];
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
    return /^[A-Za-z_]$/.test(a);
  }

  has(c) {
    return this.i < this.length && this.source[this.i] === c;
  }

  hasNot(c) {
    return this.i < this.length && this.source[this.i] !== c;
  }

  has_type() {
    return this.i < this.length && this.types.includes(this.source[this.i]);
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
    this.startToken++;
  }

  insert_newline() {
    if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].token_type !== "\n") {
      this.tokens.push(new Token("\n", "", this.currentLine));
      // Note: the code won't be reformatted if an error occurs
      // this.currentLine += 1;
    }
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

      } else if (this.has('/') && this.has_ahead('*')) {
        this.skip();
        var commentStart = this.i;
        this.skip();
        while (this.hasNot('*') && this.hasNot_ahead('/')) {
          this.capture();
        }
        if (this.has('*') && this.has_ahead('/')) {
          this.skip();
          this.skip();
          this.insert_newline();
          this.emit_token('comment');
          if (this.has('\n')) {
            this.skip();
            this.currentLine += 1;
          }
        }
        else {
          textError('lexing', 'looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.', commentStart, this.currentLine);
          // throw new PraxlyError('looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.', this.currentLine);
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

      } else if (this.has('/') && this.has_ahead('/')) {
        this.skip();
        this.skip();
        while (this.hasNot('\n')) {
          this.capture();
        }
        this.insert_newline();
        this.emit_token('single_line_comment');
        this.skip(); // newline after comment
        this.currentLine += 1;

      } else if (this.has("/")) {
        this.capture();
        this.emit_token("DIVIDE");

      } else if (this.has("<")) {
        this.capture();
        if (this.has("=")) {
          this.capture();
          this.emit_token("Less_Than_Equal_To");
        } else if (this.has("-")) {
          this.capture();
          this.emit_token("Assignment");
        } else {
          this.emit_token("Less_Than");
        }

      } else if (this.has("≤")) {
        this.capture();
        this.emit_token("Less_Than_Equal_To");

      } else if (this.has("!")) {
        this.capture();
        if (this.has("=")) {
          this.capture();
          this.emit_token("Not_Equal");
        }

      } else if (this.has("≠")) {
        this.capture();
        this.emit_token("Not_Equal");

      } else if (this.has("=") || this.has('←') || this.has('⟵')) {
        this.capture();
        if (this.has('=')) {
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

      } else if (this.has("≥")) {
        this.capture();
        this.emit_token("Greater_Than_Equal_To");

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

      } else if (this.has('\'')) {
        this.skip();
        if (this.has_letter && this.has_ahead('\'')) {
          this.capture();
          this.skip();
          this.emit_token('char');
        } else {
          textError('lexing', 'looks like you didn\'t close your quotes on your char. \n \tRemember chars start and end with a single quote mark (\').', this.currentLine);
        }

      } else if (this.has("\"")) {
        var stringStart = this.currentLine;
        this.skip();
        while (this.i < this.length && !this.has("\"")) {
          this.capture();
        }
        if (this.has("\"")) {
          this.skip();
          this.emit_token("String");
        }
        else {
          textError('lexing', 'looks like you didn\'t close your quotes on your String. \n \tRemember Strings start and end with a double quote mark (\").', stringStart);
          this.i -= 1;
          this.token_so_far = "";
          this.emit_token("String");
        }

      } else if (this.has_letter()) {
        while (this.i < this.length && (this.has_letter() || this.has_digit())) {
          this.capture();
        }
        if (this.token_so_far === "true" || this.token_so_far === "false") {
          this.emit_token("boolean");
        } else if (this.token_so_far === 'end') {
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
        // else if (this.has('(') || this.has_ahead(')')){
        //   this.emit_token('function');
        // }
        else {
          if (this.token_so_far !== '') {
            this.emit_token("Location");
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
        while (this.has('\n')) {
          this.skip();
          this.currentLine += 1;
        }

      } else if (this.has('\t')) {
        // skip tabs since they only appear to be for style
        this.skip();

      } else {
        textError('lexing', `invalid character \"${this.source[this.i]}\"`, this.i, this.i + 1);
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

  hasAny(types) {
    return this.i < this.length && types.includes(this.tokens[this.i].token_type);
  }

  hasNotAny(types) {
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
    return this.program();
  }

  parse_atom() {
    const tok = this.tokens[this.i];
    var line = this.tokens[this.i].line;

    if (this.has('EOF')) {
      this.eof = true;
      return;
    }

    if (this.has(',')) {
      return;
    }
    else if (this.has('input')) {
      this.advance();
      return {
        value: tok.value,
        type: NODETYPES.INPUT,
        blockID: "code",
        line: line,
      };
    }
    else if (this.has('null')) {
      this.advance();
      return {
        value: tok.value,
        type: TYPES.NULL,
        blockID: "code",
        line: line,
      };
    }
    else if (this.has("INT")) {
      this.advance();
      return {
        value: tok.value,
        type: TYPES.INT,
        blockID: "code",
        line: line,
      };

    } else if (this.has("String")) {
      this.advance();
      return {
        value: tok.value,
        type: TYPES.STRING,
        blockID: "code",
        line: line,
      };

    } else if (this.has("char")) {
      this.advance();
      return {
        value: tok.value,
        type: TYPES.CHAR,
        blockID: "code",
        line: line,
      };

    } else if (this.has("Double")) {
      this.advance();
      return {
        value: tok.value,
        type: TYPES.DOUBLE,
        blockID: "code",
        line: line,
      };

    } else if (this.has("boolean")) {
      this.advance();
      return {
        value: tok.value === 'true',
        type: TYPES.BOOLEAN,
        blockID: "code",
        line: line,
      };

    } else if (this.has('{')) {
      let result = {
        blockID: 'code',
        line: line,
        type: NODETYPES.ARRAY_LITERAL,
      };
      var args = [];
      this.advance();
      var loopBreak = 0;
      while (this.hasNot('}') && loopBreak < MAX_LOOP) {
        // this.advance();
        var param = this.parse_boolean_operation();
        args.push(param);
        if (this.has(',')) {
          this.advance();
        }
        loopBreak++;
      }
      // console.log('here are the array contents');
      // console.log(args);
      result.params = args;
      if (this.hasNot('}')) {
        textError("parsing", "didn't detect closing curly brace in the array declaration", this.tokens[this.i].line);
        // console.error('didn't detect closing parentheses in the arguments of  a function call');
      }
      this.advance();
      return result;
    }

    else if (this.has("(")) {
      this.advance();
      const expression = this.parse_boolean_operation();
      if (this.has(")")) {
        this.advance();
      } else {
        textError('parsing', 'did not detect closing parentheses', line,);
      }
      return expression;

    } else if (this.has("Location")) {
      var l = this.parse_location();
      if (this.has('Assignment')) {
        this.advance();
        var value = this.parse_boolean_operation()
        l = {
          type: NODETYPES.ASSIGNMENT,
          blockID: "code",
          line: line,
          location: l,
          value: value,
        }
      } else if (this.has('(')) {
        this.advance();
        var args = [];
        var loopBreak = 0;
        while (this.hasNot(')') && loopBreak < MAX_LOOP) {
          var param = this.parse_boolean_operation();
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
          args: args
        }
      }
      return l;

    } else if (this.has("\n")) {
      return;

    } else {
      textError("parsing", "missing or invalid base expression. most likely due to a missing operand", line);
    }
  }

  exponent() {
    let l = this.unary();
    // let l =this.atom();
    while (this.has("EXPONENT")) {
      var line = this.tokens[this.i].line;

      this.advance();
      const r = this.exponent();
      // l =new Operators.Exponent(left, right);
      l = {
        left: l,
        right: r,
        type: NODETYPES.EXPONENTIATION,
        blockID: "code",
        line: line
      }
    }
    return l;
  }

  multiplicative() {
    let l = this.exponent();
    while (this.has("MULTIPLY") || this.has("DIVIDE") || this.has("MOD")) {

      var line = this.tokens[this.i].line;
      if (this.has("MULTIPLY")) {
        this.advance();
        const r = this.exponent();
        // l =new Operators.Multiplication(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.MULTIPLICATION,
          blockID: "code",
          line: line,
        }

      } else if (this.has("DIVIDE")) {
        this.advance();
        const r = this.exponent();
        // l =new Operators.Division(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.DIVISION,
          blockID: "code",
          line: line,
        }

      } else if (this.has("MOD")) {
        this.advance();
        const r = this.exponent();
        // l =new Operators.Modulo(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.MODULUS,
          blockID: "code",
          line: line,
        }
      }
    }
    return l;
  }

  additive() {
    let l = this.multiplicative();
    while (this.has("ADD") || this.has("SUBTRACT")) {

      var line = this.tokens[this.i].line;
      if (this.has("SUBTRACT")) {
        this.advance();
        const r = this.multiplicative();
        // l =new Operators.Subtraction(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.SUBTRACTION,
          blockID: "code",
          line: line,
        }

      } else if (this.has("ADD")) {
        this.advance();
        const r = this.multiplicative();
        // l =new Operators.Addition(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.ADDITION,
          blockID: "code",
          line: line,
        }
      }
    }
    return l;
  }

  unary() {
    if (!this.has('not') && !this.has('SUBTRACT')) {
      return this.parse_atom();
    }
    var line = this.tokens[this.i].line;
    var result = {
      blockID: 'code',
      line: line,
    };
    if (this.has('not')) {
      this.advance();
      var expression = this.parse_atom();
      result.type = NODETYPES.NOT;
      result.value = expression;
      return result;
    }
    else if (this.has("SUBTRACT")) {
      this.advance();
      var expression = this.parse_atom();
      if (expression.type === TYPES.INT || expression.type === TYPES.SHORT
        || expression.type === TYPES.DOUBLE || expression.type === TYPES.FLOAT) {
        // negative literal value
        result.type = expression.type;
        result.value = "-" + expression.value;
      } else {
        // negative expression
        result.type = NODETYPES.NEGATE;
        result.value = expression;
      }
    }
    return result;
  }

  parse_comparable() {
    let l = this.additive();
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
        const r = this.additive();
        // l =new Operators.Less_Than_Equal_To(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.LESS_THAN_OR_EQUAL,
          blockID: "code",
          line: line,
        }

      } else if (this.has("Greater_Than_Equal_To")) {
        this.advance();
        const r = this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.GREATER_THAN_OR_EQUAL,
          blockID: "code",
          line: line,
        }

      } else if (this.has("Less_Than")) {
        this.advance();
        const r = this.additive();
        // l =new Operators.Less_Than(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.LESS_THAN,
          blockID: "code",
          line: line,
        }

      } else if (this.has("Greater_Than")) {
        this.advance();
        const r = this.additive();
        // l =new Operators.Greater_Than(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.GREATER_THAN,
          blockID: "code",
          line: line,
        }

      } else if (this.has("Equals")) {
        this.advance();
        const r = this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.EQUALITY,
          blockID: "code",
          line: line,
        }

      } else if (this.has("Not_Equal")) {
        this.advance();
        const r = this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.INEQUALITY,
          blockID: "code",
          line: line,
        }
      }
    }
    return l;
  }

  parse_location() {
    var result = {
      type: NODETYPES.LOCATION,
      name: this.tokens[this.i].value,
      isArray: false,
      blockID: 'code',
      line: this.tokens[this.i].line,
      index: null,
    }
    this.advance();
    if (this.has('[')) {
      this.advance();
      result.index = this.parse_boolean_operation();
      result.isArray = true;
      this.match_and_discard_next_token(']');
    }
    return result;
  }

  // this one kinda a mess ngl, but my goal is to support variable initialization and assignment all together
  parse_funcdecl_or_vardecl() {
    var isArray = false;
    var type = NODETYPES.VARDECL;
    var vartype = this.tokens[this.i].value;
    this.advance();
    if (this.has('[')) {
      this.advance();
      if (this.has(']')) {
        this.advance();
        type = NODETYPES.ARRAY_ASSIGNMENT;
        isArray = true;
      }
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
    }
    if (this.has('Assignment')) {
      this.advance();
      result.value = this.parse_boolean_operation();
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

      // console.log ('here are the params');
      // console.log(args);
      this.match_and_discard_next_token(')');
      result.params = params;

      if (this.has(';')) {
        this.advance();
      }
      if (this.has('\n')) {
        this.advance();
      }

      var contents = this.codeBlock('end ' + result.name);
      result.contents = contents;
      if (this.hasNot('end ' + result.name)) {
        textError('compile time', `missing the \'end ${result.name}\' token`, result.line);
        return result;
      }
      this.advance();
    }
    return result;
  }

  parse_boolean_operation() {
    let l = this.parse_comparable();
    while (
      this.has("and") ||
      this.has("or")
    ) {
      var line = this.tokens[this.i].line;

      if (this.has("and")) {
        this.advance();
        const r = this.parse_comparable();
        // l =new Operators.Less_Than_Equal_To(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.AND,
          blockID: "code",
          line: line,
        }

      } else if (this.has("or")) {
        this.advance();
        const r = this.parse_comparable();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l = {
          left: l,
          right: r,
          type: NODETYPES.OR,
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
      while (this.has('\n')) {
        this.advance();
      }
      praxly_blocks.push(this.parse_statement());
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
      blockID: 'code',
      line: line,
    };

    if (this.has("if")) {
      result.type = NODETYPES.IF;
      this.advance();
      result.condition = this.parse_boolean_operation();
      if (this.has('\n')) {
        this.advance();
        result.statement = this.codeBlock('else', 'end if');
        if (this.has('else')) {
          this.advance();
          if (this.has('\n')) {
            this.advance();
          }
          result.type = NODETYPES.IF_ELSE;
          result.alternative = this.codeBlock('end if');
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
      // if (this.has(';')) {
      //   this.advance();
      result.condition = this.parse_boolean_operation();
      // this.advance();
      if (this.has(';')) {
        this.advance();
        result.increment = this.parse_atom();
        if (this.hasNot(')')) {
          return result;
        }
        this.advance();
        if (this.has('\n')) {
          this.advance();
          result.statement = this.codeBlock('end for');
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
      result.condition = this.parse_boolean_operation();
      if (this.has('\n')) {
        this.advance();
        result.statement = this.codeBlock('end while');
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
        result.statement = this.codeBlock('while');
      }
      if (this.has('while')) {
        this.advance();
        if (this.hasNot('(')) {
          //error
          return result;
        }
        this.advance();
        result.condition = this.parse_boolean_operation();
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
        result.statement = this.codeBlock('until');
      }
      if (this.has('until')) {
        this.advance();
        if (this.hasNot('(')) {
          //error
          return result;
        }
        this.advance();
        result.condition = this.parse_boolean_operation();
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
      const expression = this.parse_boolean_operation();
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
      const expression = this.parse_boolean_operation();
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
      const expression = this.parse_boolean_operation();
      if (this.has(';')) {
        this.advance();
      }
      if (this.has('\n')) {
 
        result.type = NODETYPES.RETURN;
        result.value = expression;
        return result;
      }

    } else if (this.has('comment')) {
      result.type = NODETYPES.COMMENT,
        result.value = this.tokens[this.i].value;
      return result;

    } else if (this.has('single_line_comment')) {
      result.type = NODETYPES.SINGLE_LINE_COMMENT,
        result.value = this.tokens[this.i].value;
      return result;
    }

    else if (this.has_type()) {
      return this.parse_funcdecl_or_vardecl();
    }

    else {
      // this is a stand alone expression as a statement.
      let contents = this.parse_boolean_operation();
      if (contents === undefined || contents === null) {
        return;
      }
      if (this.has(';')) {
        this.advance();
      }
      // if (this.has('\n')) {
      // }
      result = {
        type: NODETYPES.STATEMENT,
        value: contents,
        blockID: "code"
      };
    }
    return result;
  }
}
