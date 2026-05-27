import { NODETYPES, TYPES } from "./common";

export const tree2text = (node, indentation) => {
    if (!node?.type) {
        return;  // undefined
    }

    switch (node.type) {
        case TYPES.BOOLEAN:
        case TYPES.DOUBLE:
        case TYPES.INT:
            return node.value.toString();

        case NODETYPES.LOCATION: {
            let result = node.name.toString();
            if (node.isArray) {
                result += `[${tree2text(node.index, 0)}]`;
            }
            return result;
        }

        case TYPES.CHAR:
            return `'${node.value}'`;

        case TYPES.STRING:
            return `"${node.value}"`;

        case TYPES.INVALID:
            return `// Invalid ${node.value}`;

        case NODETYPES.COMMENT:
            return `${'    '.repeat(indentation)}/* ${node.value} */\n`;

        case NODETYPES.NEWLINE:
            return '\n';

        case NODETYPES.SINGLE_LINE_COMMENT:
            return `${'    '.repeat(indentation)}// ${node.value}\n`;

        case NODETYPES.ADDITION:
            return `${tree2text(node.left, 0)} + ${tree2text(node.right, 0)}`;

        case NODETYPES.SUBTRACTION:
            return `${tree2text(node.left, 0)} - ${tree2text(node.right, 0)}`;

        case NODETYPES.MULTIPLICATION:
            return `${tree2text(node.left, 0)} * ${tree2text(node.right, 0)}`;

        case NODETYPES.DIVISION:
            return `${tree2text(node.left, 0)} / ${tree2text(node.right, 0)}`;

        case NODETYPES.EXPONENTIATION:
            return `${tree2text(node.left, 0)} ^ ${tree2text(node.right, 0)}`;

        case NODETYPES.MODULUS:
            return `${tree2text(node.left, 0)} % ${tree2text(node.right, 0)}`;

        case NODETYPES.AND:
            return `${tree2text(node.left, 0)} and ${tree2text(node.right, 0)}`;

        case NODETYPES.OR:
            return `${tree2text(node.left, 0)} or ${tree2text(node.right, 0)}`;

        case NODETYPES.EQUALITY:
            return `${tree2text(node.left, 0)} == ${tree2text(node.right, 0)}`;

        case NODETYPES.LESS_THAN_OR_EQUAL:
            return `${tree2text(node.left, 0)} ≤ ${tree2text(node.right, 0)}`;

        case NODETYPES.GREATER_THAN_OR_EQUAL:
            return `${tree2text(node.left, 0)} ≥ ${tree2text(node.right, 0)}`;

        case NODETYPES.GREATER_THAN:
            return `${tree2text(node.left, 0)} > ${tree2text(node.right, 0)}`;

        case NODETYPES.LESS_THAN:
            return `${tree2text(node.left, 0)} < ${tree2text(node.right, 0)}`;

        case NODETYPES.INEQUALITY:
            return `${tree2text(node.left, 0)} ≠ ${tree2text(node.right, 0)}`;

        case NODETYPES.PRINT: {
            const indent = '    '.repeat(indentation);
            let expression = tree2text(node.value, 0);
            if (node.comment) {
                expression += `  // ${node.comment}`;
            }
            return `${indent}print ${expression}\n`;
        }

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
            return `${'    '.repeat(indentation)}return ${tree2text(node.value, 0)}\n`;

        case NODETYPES.PROGRAM:
            return tree2text(node.value, indentation);

        case NODETYPES.STATEMENT:
            return `${'    '.repeat(indentation)}${tree2text(node.value, 0)}\n`;

        case NODETYPES.CODEBLOCK:
            return node.statements.map(element => tree2text(element, indentation)).join('');

        case NODETYPES.IF:
            return `${'    '.repeat(indentation)}if (${tree2text(node.condition, 0)})\n` +
                tree2text(node.codeblock, indentation + 1) +
                `${'    '.repeat(indentation)}end if\n`;

        case NODETYPES.IF_ELSE:
            return `${'    '.repeat(indentation)}if (${tree2text(node.condition, 0)})\n` +
                tree2text(node.codeblock, indentation + 1) +
                `${'    '.repeat(indentation)}else\n` +
                tree2text(node.alternative, indentation + 1) +
                `${'    '.repeat(indentation)}end if\n`;

        // Note: reassignment (either a statement or in a for loop)
        case NODETYPES.ASSIGNMENT: {
            const varname = tree2text(node.location, indentation);
            return `${'    '.repeat(indentation)}${varname} ← ${tree2text(node.value, 0)}\n`;
        }

        // Note: declaration and assignment (possibly in a for loop)
        case NODETYPES.VARDECL: {
            const varname = `${node.varType} ${node.name}`;
            if (node.value !== undefined) {
                return `${'    '.repeat(indentation)}${varname} ← ${tree2text(node.value, 0)}\n`;
            } else {
                return `${'    '.repeat(indentation)}${varname}\n`;
            }
        }

        case NODETYPES.WHILE:
            return `${'    '.repeat(indentation)}while (${tree2text(node.condition, 0)})\n` +
                tree2text(node.codeblock, indentation + 1) +
                `${'    '.repeat(indentation)}end while\n`;

        case NODETYPES.DO_WHILE:
            return `${'    '.repeat(indentation)}do\n` +
                tree2text(node.codeblock, indentation + 1) +
                `${'    '.repeat(indentation)}while (${tree2text(node.condition, 0)})\n`;

        case NODETYPES.REPEAT_UNTIL:
            return `${'    '.repeat(indentation)}repeat\n` +
                tree2text(node.codeblock, indentation + 1) +
                `${'    '.repeat(indentation)}until (${tree2text(node.condition, 0)})\n`;

        case NODETYPES.NOT:
            return `not ${tree2text(node.value, 0)}`;

        case NODETYPES.NEGATE:
            return `-${tree2text(node.value, 0)}`;

        case NODETYPES.FOR: {
            const initialization = ` (${tree2text(node.initialization, 0).replace("\n", "")}; `;
            const condition = `${tree2text(node.condition, 0)}; `;
            const increment = `${tree2text(node.increment, 0).replace("\n", "")})\n`;
            return `${'    '.repeat(indentation)}for${initialization}${condition}${increment}` +
                tree2text(node.codeblock, indentation + 1) +
                `${'    '.repeat(indentation)}end for\n`;
        }

        case NODETYPES.FUNCDECL: {
            const argsList = node.params;
            let header = `${node.returnType} ${node.name}(`;
            if (argsList !== null && argsList.length !== 0) {
                header += argsList.map(element => `${element[0]} ${element[1]}`).join(', ');
            }
            header += ')\n';
            return header +
                tree2text(node.codeblock, indentation + 1) +
                `${'    '.repeat(indentation)}end ${node.name}\n`;
        }

        case NODETYPES.FUNCCALL: {
            const argsList = node.args;
            let result = `${node.name}(`;
            if (argsList !== null && argsList.length > 0) {
                result += argsList.map(element => tree2text(element, 0)).join(', ');
            }
            result += ')';
            return result;
        }

        case NODETYPES.SPECIAL_STRING_FUNCCALL: {
            const argsList = node.right.args;
            let result = `${'    '.repeat(indentation)}${tree2text(node.left, 0)}.${node.right.name}(`;
            if (argsList !== null && argsList.length !== 0) {
                result += argsList.map(element => tree2text(element, 0)).join(', ');
            }
            result += ')';
            return result;
        }

        case NODETYPES.ARRAY_LITERAL: {
            const argsList = node.params;
            let result = '{';
            if (argsList !== null && argsList.length > 0) {
                result += argsList.map(element => tree2text(element, 0)).join(', ');
            }
            result += '}';
            return result;
        }

        case NODETYPES.ARRAY_CREATE:
            return `${node.varType}[] ${node.name} ← ${node.elemType}[${tree2text(node.arrayLength)}]\n`;

        case NODETYPES.ARRAY_REFERENCE:
            return `${node.name}[${tree2text(node.index, 0)}]`;

        case NODETYPES.ARRAY_ASSIGNMENT: {
            const varname = `${node.varType}[] ${node.name}`;
            const argsList = node.value.params;
            let inner = '{';
            if (argsList !== null && argsList.length > 0) {
                inner += argsList.map(element => tree2text(element, 0)).join(', ');
            }
            inner += '}';
            return `${'    '.repeat(indentation)}${varname} ← ${inner}\n`;
        }

        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT: {
            const varname = `${node.name}[${tree2text(node.index, 0)}]`;
            return `${'    '.repeat(indentation)}${varname} ← ${tree2text(node.value, 0)}\n`;
        }

        default:
            throw new Error(`unknown node type ${node.type}`);
    }
}
