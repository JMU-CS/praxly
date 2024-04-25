import { NODETYPES, TYPES } from "./common";

export const tree2text = (node, indentation) => {
    if (!node.type) {
        return;  // undefined
    }

    switch (node.type) {
        case TYPES.BOOLEAN:
        case TYPES.DOUBLE:
        case TYPES.INT:
            try {
                var result = node.value.toString();
                return result;
            } catch (error) {
                return " ";
            }

        case NODETYPES.LOCATION:
            try {
                var result = node.name.toString();
                if (node.isArray) {
                    result += `[${tree2text(node.index)}]`;
                }
                return result;
            } catch (error) {
                return " ";
            }

        case TYPES.CHAR:
            try {
                var result = '\'' + node.value + '\'';
                return result;
            } catch (error) {
                return " ";
            }

        case TYPES.STRING:
            try {
                var result = '\"' + node.value + '\"';
                return result;
            } catch (error) {
                return " ";
            }

        case NODETYPES.COMMENT:
            try {
                var result = '    '.repeat(indentation) + '/*' + node.value + '*/\n';
                return result;
            } catch (error) {
                return " ";
            }
        case NODETYPES.NEWLINE:
            try {
                var result = '\n';
                return result;
            } catch (error) {
                return " ";
            }
        case NODETYPES.SINGLE_LINE_COMMENT:
            try {
                var result = '    '.repeat(indentation) + '//' + node.value + '\n';
                return result;
            } catch (error) {
                return " ";
            }

        case NODETYPES.ADDITION:
            var a_operand = tree2text(node.left, indentation);
            var operator = " + ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.SUBTRACTION:
            var a_operand = tree2text(node.left, indentation);
            var operator = " - ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.MULTIPLICATION:
            var a_operand = tree2text(node.left, indentation);
            var operator = " * ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.DIVISION:
            var a_operand = tree2text(node.left, indentation);
            var operator = " / ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.EXPONENTIATION:
            var a_operand = tree2text(node.left, indentation);
            var operator = " ^ ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.MODULUS:
            var a_operand = tree2text(node.left, indentation);
            var operator = " % ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.AND:
            var a_operand = tree2text(node.left, indentation);
            var operator = " and ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.OR:
            var a_operand = tree2text(node.left, indentation);
            var operator = " or ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.EQUALITY:
            var a_operand = tree2text(node.left, indentation);
            var operator = " == ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.LESS_THAN_OR_EQUAL:
            var a_operand = tree2text(node.left, indentation);
            var operator = " ≤ ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.GREATER_THAN_OR_EQUAL:
            var a_operand = tree2text(node.left, indentation);
            var operator = " ≥ ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.GREATER_THAN:
            var a_operand = tree2text(node.left, indentation);
            var operator = " > ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.LESS_THAN:
            var a_operand = tree2text(node.left, indentation);
            var operator = " < ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.INEQUALITY:
            var a_operand = tree2text(node.left, indentation);
            var operator = " ≠ ";
            var b_operand = tree2text(node.right, node.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.PRINT:
            var result = '    '.repeat(indentation) + "print ";
            var expression = tree2text(node.value, node.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.PRINTLN:
            var result = '    '.repeat(indentation) + "println ";
            var expression = tree2text(node.value, node.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.INPUT:
            return "input";

        case NODETYPES.RETURN:
            var result = '    '.repeat(indentation) + "return ";
            var expression = tree2text(node.value, node.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.PROGRAM:
            return tree2text(node.value, indentation);

        case NODETYPES.STATEMENT:
            var result = '    '.repeat(indentation);
            var expression = tree2text(node.value, node.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.CODEBLOCK:
            var statements = node.statements.map(element => {
                try {
                    return tree2text(element, indentation);
                } catch (error) {
                    console.error('An error occurred: empty statement', error);
                    return null;
                }
            });
            return statements.join('');

        case NODETYPES.IF:
            var result = '    '.repeat(indentation) + "if (";
            var condition = tree2text(node.condition, 0) + ")\n";
            var contents = tree2text(node.statement, indentation + 1) +
                '    '.repeat(indentation) + 'end if\n';
            return result + condition + contents;

        case NODETYPES.IF_ELSE:
            var result = '    '.repeat(indentation) + "if (";
            var condition = tree2text(node.condition, indentation) + ")\n";
            var contents = tree2text(node.statement, indentation + 1);
            var alternative = '    '.repeat(indentation) + '\else\n' +
                tree2text(node.alternative, indentation + 1) +
                '    '.repeat(indentation) + 'end if\n';
            return result + condition + contents + alternative;

        case NODETYPES.ASSIGNMENT:
            var varname = tree2text(node.location, node.endIndex, indentation);
            var operator = ' ← ';
            var expression = tree2text(node.value, node.endIndex, indentation);
            return varname + operator + expression;

        case NODETYPES.VARDECL:
            try {
                var vartype = node.varType.toString()
                var varname = vartype + ' ' + node.name.toString();
                if (node.value !== undefined) {
                    var operator = ' ← ';
                    var expression = tree2text(node.value, node.endIndex, indentation);
                    return '    '.repeat(indentation) + varname + operator + expression + '\n';
                } else {
                    return '    '.repeat(indentation) + varname + '\n';
                }
            } catch (error) {
                console.error(error);
                return " ";
            }

        case NODETYPES.WHILE:
            var result = '    '.repeat(indentation) + "while";
            var condition = " (" + tree2text(node.condition, indentation) + ")\n";
            var contents = tree2text(node.statement, indentation + 1) +
                '    '.repeat(indentation) + 'end while\n';
            return result + condition + contents;

        case NODETYPES.DO_WHILE:
            var result = '    '.repeat(indentation) + 'do\n';
            var contents = '    '.repeat(indentation) + tree2text(node.statement, indentation + 1);
            var condition = '    '.repeat(indentation) + "while (" + tree2text(node.condition, indentation) + ")\n";
            return result + contents + condition;

        case NODETYPES.REPEAT_UNTIL:
            var result = '    '.repeat(indentation) + 'repeat\n';
            var contents = '    '.repeat(indentation) + tree2text(node.statement, indentation + 1);
            var condition = '    '.repeat(indentation) + "until (" + tree2text(node.condition, indentation) + ")\n";
            return result + contents + condition;

        case NODETYPES.NOT:
            var result = "not ";
            var expression = tree2text(node.value, node.endIndex, indentation);
            return result + expression;

        case NODETYPES.NEGATE:
            var result = "-";
            var expression = tree2text(node.value, node.endIndex, indentation);
            return result + expression;

        case NODETYPES.FOR:
            var result = '    '.repeat(indentation) + "for";
            var initialization = " (" + tree2text(node.initialization, 0);
            initialization = initialization.replace("\n", "") + '; ';
            var condition = tree2text(node.condition, 0) + '; ';
            var increment = tree2text(node.increment, 0);
            increment = increment + ")\n";
            var contents = '    '.repeat(indentation) + tree2text(node.statement, indentation + 1) +
                '    '.repeat(indentation) + 'end for\n';
            return result + initialization + condition + increment + contents;

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
            var contents = '    '.repeat(indentation) + tree2text(node.contents, indentation + 1);
            result += contents;
            result += '    '.repeat(indentation) + `end ${node.name}\n`;
            return result;

        case NODETYPES.FUNCCALL:
            var result = node.name + '(';
            var argsList = node.args;
            if (argsList !== null && argsList.length > 0) {
                argsList.forEach(element => {
                    result += tree2text(element, indentation) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += ')';
            return result;

        case NODETYPES.SPECIAL_STRING_FUNCCALL:
            var result = '    '.repeat(indentation) + tree2text(node.left, indentation) + '.' + node.right.name;
            result += '(';
            var argsList = node.right.args;
            if (argsList !== null && argsList.length !== 0) {
                argsList.forEach(element => {
                    result += tree2text(element, indentation) + ', ';
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
                    result += tree2text(element, indentation) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += '}';
            return result;

        case NODETYPES.ARRAY_REFERENCE:
            result = node.name + '[';
            var expression = tree2text(node.index, node.endIndex, indentation) + ']';
            return result + expression;

        case NODETYPES.ARRAY_ASSIGNMENT:
            try {
                var varname = node.varType.toString().toLowerCase() + '[] ' + node.name.toString();
                var operator = ' ← ';
                var result = '{';
                var argsList = node.value.params;
                if (argsList !== null && argsList.length > 0) {
                    argsList.forEach(element => {
                        result += tree2text(element, indentation) + ', ';
                    });
                    result = result.slice(0, result.length - 2);
                }
                result += '}\n';
                return '    '.repeat(indentation) + varname + operator + result;
            } catch (error) {
                console.error(error);
                return "assignment for arrays broke";
            }

        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT:
            try {
                var index = tree2text(node.index, node.endIndex, indentation) + ']';
                var varname = node.name.toString() + '[' + index;
                var operator = ' ← ';
                var expression = tree2text(node.value, node.endIndex, indentation) + '\n';
                return '    '.repeat(indentation) + varname + operator + expression;
            } catch (error) {
                return " ";
            }

        default:
            console.warn("Unknown node.type:" + node.type);
            break;
    }
}
