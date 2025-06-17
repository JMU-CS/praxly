import { NODETYPES, TYPES } from "./common";

export const tree2text = (node, indentation) => {
    if (!node?.type) {
        return;  // undefined
    }

    switch (node.type) {
        case TYPES.BOOLEAN:
        case TYPES.DOUBLE:
        case TYPES.INT:
            var result = node.value.toString();
            return result;

        case NODETYPES.LOCATION:
            var result = node.name.toString();
            if (node.isArray) {
                result += `[${tree2text(node.index, 0)}]`;
            }
            return result;

        case TYPES.CHAR:
            var result = '\'' + node.value + '\'';
            return result;

        case TYPES.STRING:
            var result = '\"' + node.value + '\"';
            return result;

        case TYPES.INVALID:
            var result = "// Invalid " + node.value;
            return result;

        case NODETYPES.COMMENT:
            var result = '    '.repeat(indentation) + '/* ' + node.value + ' */\n';
            return result;

        case NODETYPES.NEWLINE:
            var result = '\n';
            return result;

        case NODETYPES.SINGLE_LINE_COMMENT:
            var result = '    '.repeat(indentation) + '// ' + node.value + '\n';
            return result;

        case NODETYPES.ADDITION:
            var a_operand = tree2text(node.left, 0);
            var operator = " + ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.SUBTRACTION:
            var a_operand = tree2text(node.left, 0);
            var operator = " - ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.MULTIPLICATION:
            var a_operand = tree2text(node.left, 0);
            var operator = " * ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.DIVISION:
            var a_operand = tree2text(node.left, 0);
            var operator = " / ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.EXPONENTIATION:
            var a_operand = tree2text(node.left, 0);
            var operator = " ^ ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.MODULUS:
            var a_operand = tree2text(node.left, 0);
            var operator = " % ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.AND:
            var a_operand = tree2text(node.left, 0);
            var operator = " and ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.OR:
            var a_operand = tree2text(node.left, 0);
            var operator = " or ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.EQUALITY:
            var a_operand = tree2text(node.left, 0);
            var operator = " == ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.LESS_THAN_OR_EQUAL:
            var a_operand = tree2text(node.left, 0);
            var operator = " ≤ ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.GREATER_THAN_OR_EQUAL:
            var a_operand = tree2text(node.left, 0);
            var operator = " ≥ ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.GREATER_THAN:
            var a_operand = tree2text(node.left, 0);
            var operator = " > ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.LESS_THAN:
            var a_operand = tree2text(node.left, 0);
            var operator = " < ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.INEQUALITY:
            var a_operand = tree2text(node.left, 0);
            var operator = " ≠ ";
            var b_operand = tree2text(node.right, 0);
            return a_operand + operator + b_operand;

        case NODETYPES.PRINT:
            var result = '    '.repeat(indentation) + "print ";
            var expression = tree2text(node.value, 0);
            if (node.comment) {
                expression += '  // ' + node.comment;
            }
            expression += '\n';
            return result + expression;

        case NODETYPES.ASSOCIATION:
            return `(${tree2text(node.expression, 0)})`;

        case NODETYPES.BUILTIN_FUNCTION_CALL: {
            if (node.name === 'input') {
                return "input()";
            } else if (node.name === 'random') {
                return "random()";
            } else if (node.name === 'randomInt') {
                const max = tree2text(node.args[0], 0);
                return `randomInt(${max})`;
            } else if (node.name === 'randomSeed') {
                const seed = tree2text(node.args[0], 0);
                return `randomSeed(${seed})`;
            } else if (node.name === 'int') {
                const conversion = tree2text(node.args[0], 0);
                return `int(${conversion})`;
            } else if (node.name === 'float') {
                const conversion = tree2text(node.args[0], 0);
                return `float(${conversion})`;
            } else if (node.name === 'min') {
                const a_value = tree2text(node.args[0], 0);
                const b_value = tree2text(node.args[1], 0);
                return "min(" + a_value + ", " + b_value + ")";
            } else if (node.name === 'max') {
                const a_value = tree2text(node.args[0], 0);
                const b_value = tree2text(node.args[1], 0);
                return "max(" + a_value + ", " + b_value + ")";
            } else if (node.name === 'abs') {
                const value = tree2text(node.args[0], 0);
                return `abs(${value})`;
            } else if (node.name === 'log') {
                const value = tree2text(node.args[0], 0);
                return `log(${value})`;
            } else if (node.name = 'sqrt') {
                const value = tree2text(node.args[0], 0);
                return `sqrt(${value})`;
            }
        }

        case NODETYPES.RETURN:
            var result = '    '.repeat(indentation) + "return ";
            var expression = tree2text(node.value, 0) + '\n';
            return result + expression;

        case NODETYPES.PROGRAM:
            return tree2text(node.value, indentation);

        case NODETYPES.STATEMENT:
            var result = '    '.repeat(indentation);
            var expression = tree2text(node.value, 0) + '\n';
            return result + expression;

        case NODETYPES.CODEBLOCK:
            var statements = node.statements.map(element => {
                return tree2text(element, indentation);
            });
            return statements.join('');

        case NODETYPES.IF:
            var result = '    '.repeat(indentation) + "if (";
            var condition = tree2text(node.condition, 0) + ")\n";
            var codeblock = tree2text(node.codeblock, indentation + 1) +
                '    '.repeat(indentation) + 'end if\n';
            return result + condition + codeblock;

        case NODETYPES.IF_ELSE:
            var result = '    '.repeat(indentation) + "if (";
            var condition = tree2text(node.condition, 0) + ")\n";
            var codeblock = tree2text(node.codeblock, indentation + 1);
            var alternative = '    '.repeat(indentation) + '\else\n' +
                tree2text(node.alternative, indentation + 1) +
                '    '.repeat(indentation) + 'end if\n';
            return result + condition + codeblock + alternative;

        // Note: reassignment (either a statement or in a for loop)
        case NODETYPES.ASSIGNMENT:
            var varname = tree2text(node.location, indentation);
            var operator = ' ← ';
            var expression = tree2text(node.value, 0);
            return '    '.repeat(indentation) + varname + operator + expression + '\n';

        // Note: declaration and assignment (possibly in a for loop)
        case NODETYPES.VARDECL:
            var vartype = node.varType.toString();
            var varname = vartype + ' ' + node.name.toString();
            if (node.value !== undefined) {
                var operator = ' ← ';
                var expression = tree2text(node.value, 0);
                return '    '.repeat(indentation) + varname + operator + expression + '\n';
            } else {
                return '    '.repeat(indentation) + varname + '\n';
            }

        case NODETYPES.WHILE:
            var result = '    '.repeat(indentation) + "while";
            var condition = " (" + tree2text(node.condition, 0) + ")\n";
            var codeblock = tree2text(node.codeblock, indentation + 1) +
                '    '.repeat(indentation) + 'end while\n';
            return result + condition + codeblock;

        case NODETYPES.DO_WHILE:
            var result = '    '.repeat(indentation) + 'do\n';
            var codeblock = tree2text(node.codeblock, indentation + 1);
            var condition = '    '.repeat(indentation) + "while (" + tree2text(node.condition, 0) + ")\n";
            return result + codeblock + condition;

        case NODETYPES.REPEAT_UNTIL:
            var result = '    '.repeat(indentation) + 'repeat\n';
            var codeblock = tree2text(node.codeblock, indentation + 1);
            var condition = '    '.repeat(indentation) + "until (" + tree2text(node.condition, 0) + ")\n";
            return result + codeblock + condition;

        case NODETYPES.NOT:
            var result = "not ";
            var expression = tree2text(node.value, 0);
            return result + expression;

        case NODETYPES.NEGATE:
            var result = "-";
            var expression = tree2text(node.value, 0);
            return result + expression;

        case NODETYPES.FOR:
            var result = '    '.repeat(indentation) + "for";
            var initialization = " (" + tree2text(node.initialization, 0);
            initialization = initialization.replace("\n", "") + '; ';
            var condition = tree2text(node.condition, 0) + '; ';
            var increment = tree2text(node.increment, 0);
            increment = increment.replace("\n", "") + ')\n';
            var codeblock = tree2text(node.codeblock, indentation + 1) +
                '    '.repeat(indentation) + 'end for\n';
            return result + initialization + condition + increment + codeblock;

        case NODETYPES.FUNCDECL:
            var vartype = node.returnType.toString();
            var result = vartype + ' ' + node.name + '(';
            var argsList = node.params;
            if (argsList !== null && argsList.length !== 0) {
                argsList.forEach(element => {
                    result += element[0] + ' ' + element[1] + ', ';
                });
                result = result.slice(0, result.length - 2)
            }
            result += ')';
            result += '\n';
            var codeblock = tree2text(node.codeblock, indentation + 1);
            result += codeblock;
            result += '    '.repeat(indentation) + `end ${node.name}\n`;
            return result;

        case NODETYPES.FUNCCALL:
            var result = node.name + '(';
            var argsList = node.args;
            if (argsList !== null && argsList.length > 0) {
                argsList.forEach(element => {
                    result += tree2text(element, 0) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += ')';
            return result;

        case NODETYPES.SPECIAL_STRING_FUNCCALL:
            var result = '    '.repeat(indentation) + tree2text(node.left, 0) + '.' + node.right.name;
            result += '(';
            var argsList = node.right.args;
            if (argsList !== null && argsList.length !== 0) {
                argsList.forEach(element => {
                    result += tree2text(element, 0) + ', ';
                });
                result = result.slice(0, result.length - 2)
            }
            result += ')';
            return result;


        case NODETYPES.ARRAY_LITERAL:
            var result = '{';
            var argsList = node.params;
            if (argsList !== null && argsList.length > 0) {
                argsList.forEach(element => {
                    result += tree2text(element, 0) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += '}';
            return result;

        case NODETYPES.ARRAY_CREATE:
            return node.varType + "[] " + node.name + " ← " + node.elemType + '[' + tree2text(node.arrayLength) + ']\n';

        case NODETYPES.ARRAY_REFERENCE:
            result = node.name + '[';
            var expression = tree2text(node.index, 0) + ']';
            return result + expression;

        case NODETYPES.ARRAY_ASSIGNMENT:
            var varname = node.varType.toString() + '[] ' + node.name.toString();
            var operator = ' ← ';
            var result = '{';
            var argsList = node.value.params;
            if (argsList !== null && argsList.length > 0) {
                argsList.forEach(element => {
                    result += tree2text(element, 0) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += '}\n';
            return '    '.repeat(indentation) + varname + operator + result;

        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT:
            var index = tree2text(node.index, 0) + ']';
            var varname = node.name.toString() + '[' + index;
            var operator = ' ← ';
            var expression = tree2text(node.value, 0) + '\n';
            return '    '.repeat(indentation) + varname + operator + expression;

        default:
            throw new Error("unknown node type " + node.type);
    }
}
