import { NODETYPES, TYPES } from "./common";

export const tree2text = (blockjson, indentation) => {
    if (!blockjson.type) {
        return;  // undefined
    }
    // console.log(blockjson.type);

    switch (blockjson.type) {
        case TYPES.BOOLEAN:
        case TYPES.DOUBLE:
        case TYPES.INT:
            try {
                var result = blockjson.value.toString();
                return result;
            } catch (error) {
                return " ";
            }

        case NODETYPES.LOCATION:
            try {
                var result = blockjson.name.toString();
                if (blockjson.isArray) {
                    result += `[${tree2text(blockjson.index)}]`;
                }
                return result;
            } catch (error) {
                return " ";
            }

        case TYPES.CHAR:
            try {
                var result = '\'' + blockjson.value + '\'';
                return result;
            } catch (error) {
                return " ";
            }

        case TYPES.STRING:
            try {
                var result = '\"' + blockjson.value + '\"';
                return result;
            } catch (error) {
                return " ";
            }

        case NODETYPES.COMMENT:
            try {
                var result = '\t'.repeat(indentation) + '/*' + blockjson.value + '*/\n';
                return result;
            } catch (error) {
                return " ";
            }

        case NODETYPES.SINGLE_LINE_COMMENT:
            try {
                var result = '\t'.repeat(indentation) + '//' + blockjson.value + '\n';
                return result;
            } catch (error) {
                return " ";
            }

        case NODETYPES.ADDITION:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " + ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.SUBTRACTION:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " - ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.MULTIPLICATION:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " * ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.DIVISION:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " / ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.EXPONENTIATION:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " ^ ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.MODULUS:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " % ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.AND:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " and ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.OR:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " or ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.EQUALITY:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " == ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.LESS_THAN_OR_EQUAL:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " ≤ ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.GREATER_THAN_OR_EQUAL:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " ≥ ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.GREATER_THAN:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " > ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.LESS_THAN:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " < ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.INEQUALITY:
            var a_operand = tree2text(blockjson.left, indentation);
            var operator = " ≠ ";
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            return a_operand + operator + b_operand;

        case NODETYPES.PRINT:
            var result = '\t'.repeat(indentation) + "print ";
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.PRINTLN:
            var result = '\t'.repeat(indentation) + "println ";
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.INPUT:
            return "input";

        case NODETYPES.RETURN:
            var result = '\t'.repeat(indentation) + "return ";
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.PROGRAM:
            return tree2text(blockjson.value, indentation);

        case NODETYPES.STATEMENT:
            var result = '\t'.repeat(indentation);
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
            return result + expression;

        case NODETYPES.CODEBLOCK:
            var statements = blockjson.statements.map(element => {
                try {
                    return tree2text(element, indentation);
                } catch (error) {
                    console.error('An error occurred: empty statement', error);
                    return null;
                }
            });
            return statements.join('');

        case NODETYPES.IF:
            var result = '\t'.repeat(indentation) + "if (";
            var condition = tree2text(blockjson.condition, indentation) + ")\n";
            var contents = tree2text(blockjson.statement, indentation + 1) +
                '\t'.repeat(indentation) + 'end if\n';
            return result + condition + contents;

        case NODETYPES.IF_ELSE:
            var result = '\t'.repeat(indentation) + "if (";
            var condition = tree2text(blockjson.condition, indentation) + ")\n";
            var contents = tree2text(blockjson.statement, indentation + 1);
            var alternative = '\t'.repeat(indentation) + '\else\n' +
                tree2text(blockjson.alternative, indentation + 1) +
                '\t'.repeat(indentation) + 'end if\n';
            return result + condition + contents + alternative;

        case NODETYPES.ASSIGNMENT:
            var varname = tree2text(blockjson.location, blockjson.endIndex, indentation);
            var operator = ' ← ';
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation);
            return varname + operator + expression;

        case NODETYPES.VARDECL:
            try {
                var vartype = blockjson.varType.toString()
                var varname = vartype + ' ' + blockjson.name.toString();
                if (blockjson.value !== undefined) {
                    var operator = ' ← ';
                    var expression = tree2text(blockjson.value, blockjson.endIndex, indentation);
                    return '\t'.repeat(indentation) + varname + operator + expression + '\n';
                } else {
                    return '\t'.repeat(indentation) + varname + '\n';
                }
            } catch (error) {
                console.error(error);
                return " ";
            }

        case NODETYPES.WHILE:
            var result = '\t'.repeat(indentation) + "while";
            var condition = " (" + tree2text(blockjson.condition, indentation) + ")\n";
            var contents = tree2text(blockjson.statement, indentation + 1) +
                '\t'.repeat(indentation) + 'end while\n';
            return result + condition + contents;

        case NODETYPES.DO_WHILE:
            var result = '\t'.repeat(indentation) + 'do\n';
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1);
            var condition = '\t'.repeat(indentation) + "while (" + tree2text(blockjson.condition, indentation) + ")\n";
            return result + contents + condition;

        case NODETYPES.REPEAT_UNTIL:
            var result = '\t'.repeat(indentation) + 'repeat\n';
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1);
            var condition = '\t'.repeat(indentation) + "until (" + tree2text(blockjson.condition, indentation) + ")\n";
            return result + contents + condition;

        case NODETYPES.NOT:
            var result = "not ";
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation);
            return result + expression;

        case NODETYPES.NEGATE:
            var result = "-";
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation);
            return result + expression;

        case NODETYPES.FOR:
            var result = '\t'.repeat(indentation) + "for";
            var initialization = " (" + tree2text(blockjson.initialization, 0);
            initialization = initialization.replace("\n", "") + '; ';
            var condition = tree2text(blockjson.condition, 0) + '; ';
            var increment = tree2text(blockjson.increment, 0);
            increment = increment + ")\n";
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1) +
                '\t'.repeat(indentation) + 'end for\n';
            return result + initialization + condition + increment + contents;

        case NODETYPES.FUNCDECL:
            var vartype = blockjson.returnType.toString();
            var result = vartype + ' ' + blockjson.name + '(';
            var argsList = blockjson.params;
            if (argsList !== null && argsList.length !== 0) {
                argsList.forEach(element => {
                    result += element[0] + ' ' + element[1] + ', ';
                });
                result = result.slice(0, result.length - 2)
            }
            result += ')';
            result += '\n';
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.contents, indentation + 1);
            result += contents;
            result += '\t'.repeat(indentation) + `end ${blockjson.name}\n`;
            return result;

        case NODETYPES.FUNCCALL:
            var result = blockjson.name + '(';
            var argsList = blockjson.args;
            if (argsList !== null && argsList.length > 0) {
                argsList.forEach(element => {
                    result += tree2text(element, indentation) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += ')';
            return result;

        case NODETYPES.ARRAY_LITERAL:
            var result = '{';
            var argsList = blockjson.params;
            if (argsList !== null && argsList.length > 0) {
                argsList.forEach(element => {
                    result += tree2text(element, indentation) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += '}';
            return result;

        case NODETYPES.ARRAY_REFERENCE:
            result = blockjson.name + '[';
            var expression = tree2text(blockjson.index, blockjson.endIndex, indentation) + ']';
            return result + expression;

        case NODETYPES.ARRAY_ASSIGNMENT:
            try {
                var varname = blockjson.varType.toString().toLowerCase() + '[] ' + blockjson.name.toString();
                var operator = ' ← ';
                var result = '{';
                var argsList = blockjson.value.params;
                if (argsList !== null && argsList.length > 0) {
                    argsList.forEach(element => {
                        result += tree2text(element, indentation) + ', ';
                    });
                    result = result.slice(0, result.length - 2);
                }
                result += '}\n';
                return '\t'.repeat(indentation) + varname + operator + result;
            } catch (error) {
                console.error(error);
                return "assignment for arrays broke";
            }

        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT:
            try {
                var index = tree2text(blockjson.index, blockjson.endIndex, indentation) + ']';
                var varname = blockjson.name.toString() + '[' + index;
                var operator = ' ← ';
                var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
                return '\t'.repeat(indentation) + varname + operator + expression;
            } catch (error) {
                return " ";
            }

        default:
            console.warn("Unknown blockjson.type:" + blockjson.type);
            break;
    }
}
