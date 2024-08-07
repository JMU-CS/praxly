import { MAX_LOOP, NODETYPES, OP, textEditor, textError } from './common';

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
  let parser = new Parser(tokens);
  ir = parser?.parse();
  return ir;
}

/**
 * This is the object that I use to tokenize the source code to prepare it for parsing.
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
    // insert a final newline at the end of the program if missing
    if (source?.length > 0 && source[source?.length - 1] !== '\n') {
      source += '\n';
    }
    this.source = source;
    this.tokens = [];
    this.i = 0;
    this.index_before_this_line = 0;
    this.length = this.source?.length;
    this.token_so_far = "";
    this.multi_Char_symbols = ['>', '<', '=', '!', '-'];
    this.symbols = [",", ";", "(", ")", "{", "}", "[", "]", ".", "+", "/", "*", "%", "^", "≠", "←", "⟵", "≥", "≤"];
    this.builtins = ['input', 'random', 'randomInt', 'randomSeed', 'int', 'float', 'min', 'max', 'abs', 'log', 'sqrt'];
    this.keywords = ["if", "else", "end", "print", "for", "while", 'and', 'or', 'do', 'repeat',
      'until', 'not', 'return', 'null'];
    this.types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void'];
    this.startToken = [0, 0];
    this.currentLine = 0;
  }

  has_letter() {
    const a = this.source[this.i];
    // Ex: The pizza emoji has the surrogate pair \uD83C\uDF55.
    const regex = /^[A-Za-z_]|[\uD83C-\uDBFF]|[\uDC00-\uDFFF]$/;
    return regex.test(a);
  }

  has_valid_symbol() {
    return this.i < this.length && this.symbols.includes(this.source[this.i]);
  }

  has_multi_char_symbol() {
    return this.i < this.length && this.multi_Char_symbols.includes(this.source[this.i]);
  }

  has_builtin() {
    return this.i < this.length && this.builtins.includes(this.token_so_far);
  }

  has_keyword() {
    return this.i < this.length && this.keywords.includes(this.token_so_far);
  }

  has_boolean() {
    return this.i < this.length && (this.token_so_far === 'true' || this.token_so_far === 'false');
  }

  has_type() {
    return this.i < this.length && this.types.includes(this.token_so_far);
  }

  has_short_comment() {
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

  skip(times = 1) {
    this.i += times;
    this.startToken = [this.currentLine, this.i - this.index_before_this_line];
  }

  emit_token(type = null) {
    var endIndex = this.i - this.index_before_this_line;
    this.tokens.push(new Token(type ?? this.token_so_far, this.token_so_far, this.currentLine, this.startToken, [this.currentLine, endIndex]));
    this.token_so_far = '';
    this.startToken = [this.currentLine, endIndex];
  }

  /**
   * This function will take all of the text and it will convert it into tokens
   * @returns an array of Token objects
   */
  lex() {
    while (this.i < this.length) {

      // end-of-line comment
      if (this.has_short_comment()) {
        this.skip(2);
        while (this.hasNot('\n')) {
          this.capture();
        }
        // Trim whitespace before/after comment text.
        this.token_so_far = this.token_so_far.trim()
        this.emit_token(NODETYPES.SINGLE_LINE_COMMENT);
        continue;
      }

      // missing code (/* comment */)
      if (this.has_long_comment()) {
        this.skip(2);
        while (this.hasNot('*') && this.hasNot_ahead('/') && this.hasNot('\n')) {
          this.capture();
        }
        if (this.hasNot('\n')) {
          this.skip(2);
        } else {
          textError('lexing', `looks like you didn\'t close your comment. Remember comments
            start with a \'/*\' and end with a \'*/\'.`, this.currentLine + 1);
        }
        this.emit_token(NODETYPES.COMMENT);
        continue;
      }

      // character literal (single quotes)
      if (this.has('\'')) {
        this.skip();
        while (this.i < this.length && !this.has("\'") && !this.has("\n")) {
          this.capture();
        }
        if (!this.has("\'")) {
          textError('lexing', 'unclosed character literal (missing single quote mark)', this.currentLine + 1);
          this.emit_token(NODETYPES.CHAR);
          continue;
        }
        this.skip();  // close single quote
        const length = this.token_so_far.length;
        if (this.token_so_far.length != 1) {
          textError('lexing', 'incorrect character length: ' + length, this.currentLine + 1);
        }
        this.emit_token(NODETYPES.CHAR);
        continue;
      }

      // string literal (double quotes)
      if (this.has("\"")) {
        this.skip();
        while (this.i < this.length && !this.has("\"") && !this.has("\n")) {
          this.capture();
        }
        if (!this.has("\"")) {
          textError('lexing', 'unclosed string literal (missing double quote mark)', this.currentLine + 1);
          this.emit_token(NODETYPES.STRING);
          continue;
        }
        this.skip();  // close double quote
        this.emit_token(NODETYPES.STRING);
        continue;
      }

      // operators and punctuation
      if (this.has_valid_symbol()) {
        this.capture();
        this.emit_token();
        continue;
      }
      if (this.has_multi_char_symbol()) {
        while (this.has_multi_char_symbol()) {
          this.capture();
        }
        this.emit_token();
        continue;
      }

      // integers and floating-points
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

      // ignore spaces
      if (this.has(' ')) {
        this.skip();
        continue;
      }

      // newline (increment line number)
      if (this.has("\n")) {
        this.capture();
        this.emit_token("\n");
        this.currentLine += 1;
        this.index_before_this_line = this.i;
        this.startToken = [this.currentLine, this.i - this.index_before_this_line];
        continue;
      }

      // get the next word
      if (!this.has_letter()) {
        textError('lexing', `unrecognized character \"${this.source[this.i]}\"`, this.currentLine + 1);
        this.skip();
        continue;
      }
      while (this.i < this.length && (this.has_letter() || this.has_digit())) {
        this.capture();
      }

      // built-in types and functions
      if (this.has_type()) {
        this.emit_token('Type');
        continue;
      }
      if (this.has_builtin()) {
        this.emit_token(NODETYPES.BUILTIN_FUNCTION_CALL);
        continue;
      }

      // end keyword (if, for, while, proc)
      if (this.token_so_far === 'end') {
        if (this.has(' ')) {
          this.capture();
        } else {
          textError('lexing', 'missing space after end keyword', this.currentLine + 1);
        }
        while (this.has(' ')) {  // ignore extra spaces
          this.skip();
        }
        while (this.has_letter()) {
          this.capture();
        }
        this.emit_token();
        continue;
      }

      // true/false literal
      if (this.has_boolean()) {
        this.emit_token(NODETYPES.BOOLEAN);
        continue;
      }

      // other keywords
      if (this.has_keyword()) {
        this.emit_token();
        continue;
      }

      // variable/procedure names
      this.emit_token('Location');
    }

    // That's all folks!
    this.emit_token("EOF");
    return this.tokens;
  }
}


class Parser {

  constructor(tokens) {
    this.tokens = tokens;
    this.i = 0;
    this.length = tokens?.length;
  }

  getCurrentToken() {
    return this.tokens[this.i];
  }

  getCurrentLine() {
    return this.tokens[this.i].line;
  }

  getCurrentValue() {
    return this.tokens[this.i].value;
  }

  getPrevTokenType() {
    return this.tokens[this.i - 1].token_type;
  }

  has(type) {
    return this.i < this.length && this.tokens[this.i].token_type === type;
  }

  hasNot(type) {
    return this.i < this.length && this.tokens[this.i].token_type !== type;
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

  match_and_discard_next_token(type) {
    if (this.tokens[this.i].token_type === type) {
      this.advance();
    } else {
      textError('parsing', `did not detect desired token at this location. \nexpected: \'${type}\'\n but was: ${this.tokens[this.i].token_type}`, this.getCurrentLine());
    }
  }

  advance() {
    this.i++;
    return this.tokens[this.i - 1];
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
  binaryOpNode_new(operation, l, r, line) {
    var type;
    switch (operation) {
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
        textError('parsing', 'invalid operator ' + operation, line);
        break;
    }
    return {
      blockID: "code",
      line: line,
      left: l,
      right: r,
      type: type,
      startIndex: l?.startIndex,
      endIndex: r?.endIndex,
    }
  }

  /**
   * Creates a new node for literal values in the AST.
   * @param {*} token
   * @returns ASTNODE
   */
  literalNode_new(token) {
    return {
      blockID: "code",
      line: token.line,
      value: token.token_type === NODETYPES.BOOLEAN ? token.value === 'true' : token.value,
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
  unaryOPNode_new(operation, expression, line, startIndex) {
    var type;
    switch (operation) {
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
      endIndex: expression?.endIndex,
    }
  }

  /**
   * This will recursively handle any combination of Binary operations
   * @param {*} precedence recursive parameter to keep track of the precedence level
   * @returns an AST node
   */
  parse_expression(precedence = 9) {
    let operation = this.getCurrentToken().token_type;
    let line = this.getCurrentLine();
    let startIndex = this.getCurrentToken().startIndex;
    switch (precedence) {

      // or logical operator
      case 9:
        var l = this.parse_expression(precedence - 1);
        while (this.has("or")) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentLine();
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      // and logical operator
      case 8:
        var l = this.parse_expression(precedence - 1);
        while (this.has("and")) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentLine();
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      // relational operators
      case 7:
        var l = this.parse_expression(precedence - 1);
        while (this.hasAny('<', '>', '==', '!=', '>=', '<=', '≠', '≥', '≤')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentLine();
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      // addition, subtraction
      case 6:
        var l = this.parse_expression(precedence - 1);
        while (this.hasAny('+', '-')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentLine();
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      // multiplication, division, modulo
      case 5:
        var l = this.parse_expression(precedence - 1);
        while (this.hasAny('*', '/', '%')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentLine();
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      // raise to the power
      case 4:
        var l = this.parse_expression(precedence - 1);
        while (this.hasAny('^')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentLine();
          this.advance();
          const r = this.parse_expression(precedence - 1);
          l = this.binaryOpNode_new(operation, l, r, line);
        }
        return l;

      // not logical operator, negation operator
      case 3:
        if (this.hasNotAny('not', '-')) {
          return this.parse_expression(precedence - 1);
        }
        operation = this.getCurrentToken().token_type;
        line = this.getCurrentLine();
        this.advance();
        var exp = this.parse_expression(precedence - 1);
        return this.unaryOPNode_new(operation, exp, line, startIndex);

      // dot operator (for string methods)
      case 2:
        var l = this.parse_expression(precedence - 1);
        while (this.hasAny('.')) {
          operation = this.getCurrentToken().token_type;
          line = this.getCurrentLine();
          this.advance();
          const r = this.parse_expression(precedence - 1);
          if (r.type != NODETYPES.FUNCCALL) {
            textError('parsing', "classes are not fully supported yet. the right side of the dot operator must be a supported string function", line);
          }
          l = {
            left: l,
            right: r,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            blockID: "code",
            line: line,
            startIndex: startIndex,
            endIndex: r.endIndex,
          }
        }
        return l;

      // This one gets really complicated
      case 1:
        switch (operation) {
          case 'EOF':
            return 'EOF';

          // literal value
          case NODETYPES.BOOLEAN:
          case NODETYPES.CHAR:
          case NODETYPES.DOUBLE:
          case NODETYPES.FLOAT:
          case NODETYPES.INT:
          case NODETYPES.SHORT:
          case NODETYPES.STRING:
            this.advance();
            return this.literalNode_new(this.tokens[this.i - 1]);

          // parentheses
          case '(':
            const leftToken = this.advance();
            const expression = this.parse_expression();
            if (this.has(")")) {
              const rightToken = this.advance();
              return {
                blockID: "code",
                expression,
                line,
                type: NODETYPES.ASSOCIATION,
                startIndex: leftToken.startIndex,
                endIndex: rightToken.endIndex,
              };
            } else {
              textError('parsing', 'did not detect closing parentheses', line);
            }

          // ah yes, array literals....very fun
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
              var param = this.parse_expression();
              args.push(param);
              if (this.has(',')) {
                this.advance();
              }
              loopBreak++;
            }
            result.params = args;
            if (this.hasNot('}')) {
              textError('parsing', "didn't detect closing curly brace in the array declaration", this.getCurrentLine());
            }
            result.endIndex = this.getCurrentToken().endIndex;
            this.advance();
            return result;

          // built-in function call
          case NODETYPES.BUILTIN_FUNCTION_CALL:
          case 'Type':  // type conversion function
            if (this.has_ahead('(')) {
              return this.parse_builtin_function_call(line);
            }
            else {
              // parse as 'Location' instead (Ex: variable named max)
            }

          // variable assignment or procedure call
          case 'Location':
            var l = this.parse_location();
            if (this.hasAny('=', '<-', "←", "⟵")) {
              this.advance();
              var value = this.parse_expression();
              l = {
                type: l.isArray ? NODETYPES.ARRAY_REFERENCE_ASSIGNMENT : NODETYPES.ASSIGNMENT,
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
                var param = this.parse_expression();
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
            }
            l.endIndex = this.tokens[this.i - 1].endIndex;
            return l;

          default:
            if (this.getCurrentValue() != '\n') {
              textError('parsing', `invalid token ${this.getCurrentValue()}`, line);
              this.advance();
            } else {
              textError('parsing', `invalid end of line`, line);
            }

        } // switch (operation)
    } // switch (precedence)
  }

  parse_builtin_function_call(line) {
    // Assumes identifier token is up.
    const nameToken = this.advance();
    if (this.has('(')) {
      this.advance();

      // Expect 0 or more arguments.
      const args = [];
      if (this.hasNot(')')) {
        const parameter = this.parse_expression();
        args.push(parameter);
        while (this.has(',')) {
          this.advance();
          const parameter = this.parse_expression();
          args.push(parameter);
        }
      }

      if (this.has(')')) {
        const rightParenthesisToken = this.advance();
        return {
          blockID: "code",
          name: nameToken.value,
          line,
          args,
          type: NODETYPES.BUILTIN_FUNCTION_CALL,
          startIndex: nameToken.startIndex,
          endIndex: rightParenthesisToken.endIndex,
        };
      } else {
        textError('parsing', 'did not detect right parenthesis', line);
      }
    } else {
      textError('parsing', `missing parentheses for built-in ${nameToken.value}() function`, line);
    }
  }

  parse_location() {
    if (this.getCurrentValue() == '\n') {
      return;  // incomplete line
    }
    var result = {
      type: NODETYPES.LOCATION,
      name: this.getCurrentValue(),
      isArray: false,
      blockID: 'code',
      line: this.getCurrentLine(),
      index: null,
      startIndex: this.tokens[this.i].startIndex,
      endIndex: this.tokens[this.i].endIndex,
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

    // return type
    var isArray = false;
    var type = NODETYPES.VARDECL;
    var vartype = this.getCurrentToken().value;
    var startIndex = this.getCurrentToken().startIndex;
    this.advance();
    if (this.has('[') && this.has_ahead(']')) {
      this.advance();
      this.advance();
      type = NODETYPES.ARRAY_ASSIGNMENT;
      isArray = true;
    }

    // variable/procedure name
    var location = this.parse_location();
    var result = {
      type: type,
      varType: vartype,
      name: location?.name,
      isArray: isArray,
      blockID: 'code',
      location: location,
      line: this.getCurrentLine(),
      index: null,
      startIndex: startIndex,
      endIndex: location.endIndex,
    }

    // initialization (optional)
    if (this.hasAny('=', '<-', "←", "⟵")) {
      this.advance();
      result.value = this.parse_expression();
      result.endIndex = this.tokens[this.i - 1].endIndex;
    }

    // procedure definition
    else if (this.has('(')) {
      result.type = NODETYPES.FUNCDECL;
      result.returnType = vartype;
      if (type == NODETYPES.ARRAY_ASSIGNMENT) {
        result.returnType += "[]";
      }

      // parameter list
      this.match_and_discard_next_token('(');
      var params = [];
      var stopLoop = 0;
      while (this.hasNot(')') && stopLoop < MAX_LOOP) {
        var param = [];
        if (this.has_type()) {
          param.push(this.getCurrentValue());
          this.advance();
        }
        if (this.has('[') && this.has_ahead(']')) {
          this.advance();
          this.advance();
          param[0] += "[]";
        }
        if (this.has('Location')) {
          param.push(this.getCurrentValue());
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

      // procedure body
      result.codeblock = this.parse_block('end ' + result.name);
    }

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
   * parses a block of statements (think curly braces)
   * @param  {...any} endToken any tokens that will determine the end of the block.
   * @returns
   */
  parse_block(...endToken) {
    let block_statements = [];

    // parse end of line at beginning of the block
    if (this.i > 0) {
      let comment = this.parse_end_of_line(true);
      if (comment) {
        // move trailing comment into the new block
        block_statements.push(comment);
      }
    }

    // parse all statements inside the block
    while (!this.has('EOF') && this.hasNotAny(...endToken)) {
      let stmt = this.parse_statement();
      let comment = this.parse_end_of_line(false);
      if (stmt?.codeblock) {
        // move trailing comment after the block end
        block_statements.push(stmt);
        if (comment) {
            block_statements.push(comment);
        }
      } else {
        // move trailing comment above the statement
        if (comment) {
            block_statements.push(comment);
        }
        block_statements.push(stmt);
      }
    }

    // make sure the block is correctly terminated
    if (this.hasAny(...endToken)) {
      this.advance();
    } else {
      let name = endToken[endToken.length - 1];
      textError('parsing', `missing the '${name}' token`, this.getCurrentLine());
    }

    // return the resulting block of statements
    return {
      type: NODETYPES.CODEBLOCK,
      statements: block_statements,
      blockID: "code"
    }
  }

  parse_statement() {
    var line = this.getCurrentLine();
    let result = {
      startIndex: this.getCurrentToken().startIndex,
      endIndex: this.getCurrentToken().endIndex,
      blockID: 'code',
      line: line,
    };

    // blank line (no statement)
    if (this.has('\n')) {
      result.type = NODETYPES.NEWLINE;
      return result;
    }

    // if or if-else
    else if (this.has("if")) {
      result.type = NODETYPES.IF;
      this.advance();
      if (this.hasNot('(')) {
        return result;
      }
      this.advance();
      result.condition = this.parse_expression();
      result.endIndex = this.getCurrentToken().endIndex;
      if (this.hasNot(')')) {
        return result;
      }
      this.advance();

      result.codeblock = this.parse_block('else', 'end if');
      if (this.getPrevTokenType() == 'else') {
        result.type = NODETYPES.IF_ELSE;
        result.alternative = this.parse_block('end if');
      }
    }

    // for loop
    else if (this.has('for')) {
      result.type = NODETYPES.FOR;
      this.advance();
      if (this.hasNot('(')) {
        return result;
      }
      this.advance();

      if (this.has_type()) {
        result.initialization = this.parse_funcdecl_or_vardecl();
      } else {
        result.initialization = this.parse_expression(1);
      }
      if (this.hasNot(';')) {  // 1st required
        return result;
      }
      this.advance();

      result.condition = this.parse_expression();
      if (this.hasNot(';')) {  // 2nd required
        return result;
      }
      this.advance();

      result.increment = this.parse_expression(1);
      result.endIndex = this.getCurrentToken().endIndex;
      if (this.hasNot(')')) {
        return result;
      }
      this.advance();

      result.codeblock = this.parse_block('end for');
      return result;
    }

    // while loop
    else if (this.has('while')) {
      result.type = NODETYPES.WHILE;
      this.advance();
      if (this.hasNot('(')) {
        return result;
      }
      this.advance();
      result.condition = this.parse_expression();
      result.endIndex = this.getCurrentToken().endIndex;
      if (this.hasNot(')')) {
        return result;
      }
      this.advance();
      result.codeblock = this.parse_block('end while');
    }

    // do-while loop
    else if (this.has('do')) {
      result.type = NODETYPES.DO_WHILE;
      this.advance();
      result.codeblock = this.parse_block('while');
      if (this.hasNot('(')) {
        return result;
      }
      this.advance();
      result.condition = this.parse_expression();
      result.endIndex = this.getCurrentToken().endIndex;
      if (this.hasNot(')')) {
        return result;
      }
      this.advance();
      return result;
    }

    // repeat-until loop
    else if (this.has('repeat')) {
      result.type = NODETYPES.REPEAT_UNTIL;
      this.advance();
      result.codeblock = this.parse_block('until');
      if (this.hasNot('(')) {
        return result;
      }
      this.advance();
      result.condition = this.parse_expression();
      if (this.hasNot(')')) {
        return result;
      }
      this.advance();
      return result;
    }

    // print statement
    else if (this.has("print")) {
      this.advance();
      const expression = this.parse_expression();
      result.endIndex = expression?.endIndex ?? this.getCurrentToken().endIndex;

      while (this.has(';')) {  // special case: bundle comment with print node
        this.advance();
      }

      if (this.has(NODETYPES.SINGLE_LINE_COMMENT)) {
        const token = this.advance();
        result.comment = token.value;
      } else {
        result.comment = null;
      }

      result.type = NODETYPES.PRINT;
      result.value = expression;
      return result;
    }

    // return statement
    else if (this.has("return")) {
      this.advance();
      const expression = this.parse_expression();
      result.type = NODETYPES.RETURN;
      result.value = expression;
      result.endIndex = expression?.endIndex;
      return result;
    }

    // missing code (/* comment */)
    else if (this.has(NODETYPES.COMMENT)) {
      const token = this.advance();
      result.type = NODETYPES.COMMENT;
      result.value = token.value;
      return result;
    }

    // end-of-line comment
    else if (this.has(NODETYPES.SINGLE_LINE_COMMENT)) {
      const token = this.advance();
      result.type = NODETYPES.SINGLE_LINE_COMMENT;
      result.value = token.value;
      return result;
    }

    // variable/function declaration
    else if (this.has_type()) {
      if (this.hasNot_ahead('(')) {
        return this.parse_funcdecl_or_vardecl();
      } else {
        // type conversion function
        let call = this.parse_builtin_function_call(line);
        return {
          type: NODETYPES.STATEMENT,
          value: call,
          blockID: "code",
          line: call.line,
          startIndex: call?.startIndex,
          endIndex: call?.endIndex,
        };
      }
    }

    // most likely a function call
    else {
      let expr = this.parse_expression();
      // special case: assume that assignment is a statement
      // if in a for loop, later code will rebuild the object
      if (expr?.type.endsWith("ASSIGNMENT")) {
        return expr;
      }
      result = {
        type: NODETYPES.STATEMENT,
        value: expr,
        blockID: "code",
        line: expr.line,
        startIndex: expr?.startIndex,
        endIndex: expr?.endIndex,
      };
    }
    return result;
  }

  /**
   * Called at the expected end of each line to advance the parser to
   * the next line. Parses any semicolons, optional comments, and the
   * newline character.
   *
   * @param {boolean} new_block true if starting a new block (no semicolons)
   */
  parse_end_of_line(new_block) {

    // optional semicolons
    if (new_block && this.has(';')) {
      textError('parsing', "semicolon not allowed here", this.getCurrentLine());
    }
    while (this.has(';')) {
      this.advance();
    }

    // optional end-of-line comment
    let comment;
    if (this.has(NODETYPES.SINGLE_LINE_COMMENT) || this.has(NODETYPES.COMMENT)) {
      const token = this.advance();
      comment = {
        type: token.token_type,
        value: token.value,
        startIndex: token.startIndex,
        endIndex: token.endIndex,
        blockID: 'code',
        line: token.line,
      };
    }

    // required newline character
    if (this.has('\n')) {
      this.advance();
    } else if (!this.has('EOF')) {
      textError('parsing', "expected end of line", this.getCurrentLine())
      while (!this.has('\n')) {
        this.advance();
      }
      this.advance();
    }
    return comment;
  }
}
