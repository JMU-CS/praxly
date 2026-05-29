import { NODETYPES, StringFuncs, TYPES } from "./common";

function connectStatements(statements) {
    for (let i = 0; i < statements.length - 1; i++) {
        const currentStatement = statements[i];
        const nextStatement = statements[i + 1];
        if (currentStatement && nextStatement) {
            currentStatement.nextConnection?.connect(nextStatement.previousConnection);
        }
        else if (currentStatement && !nextStatement) {
            // Find the next valid statement in the array
            let j = i + 2;
            while (j < statements.length && !statements[j]) {
                j++;
            }
            if (j < statements.length) {
                // Set the connection from the current statement to the next valid statement
                currentStatement.nextConnection?.connect(statements[j].previousConnection);
            }
        }
        else {
            throw new Error("block connection failed");
        }
    }
}

export const tree2blocks = (workspace, node) => {
    let result;

    switch (node?.type) {

        case NODETYPES.NEWLINE:
            result = workspace.newBlock('praxly_emptyline_block');
            break;

        case NODETYPES.COMMENT:
            result = workspace.newBlock('praxly_comment_block');
            result.setFieldValue(node.value, "COMMENT");
            break;

        case NODETYPES.SINGLE_LINE_COMMENT:
            result = workspace.newBlock('praxly_single_line_comment_block');
            result.setFieldValue(node.value, "COMMENT");
            break;

        case TYPES.INT:
        case TYPES.SHORT:
            result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(node.value, "LITERAL");
            break;

        case NODETYPES.BOOLEAN:
            if (node.value) {
                result = workspace.newBlock('praxly_true_block');
            } else {
                result = workspace.newBlock('praxly_false_block');
            }
            break;

        case TYPES.NULL:
            result = workspace.newBlock('praxly_null_block');
            break;

        case TYPES.CHAR:
            result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(`'${node.value}'`, "LITERAL");
            break;

        case TYPES.STRING:
            result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(`"${node.value}"`, "LITERAL");
            break;

        case TYPES.DOUBLE:
        case TYPES.FLOAT:
            result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(node.value, "LITERAL");
            break;

        case NODETYPES.ADDITION:
        case NODETYPES.SUBTRACTION:
        case NODETYPES.MULTIPLICATION:
        case NODETYPES.DIVISION:
        case NODETYPES.EXPONENTIATION:
        case NODETYPES.MODULUS: {
            result = workspace.newBlock('praxly_arithmetic_block');
            const a = tree2blocks(workspace, node?.left);
            const b = tree2blocks(workspace, node?.right);
            result.setFieldValue(node.type, "OPERATOR");
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            break;
        }

        case NODETYPES.AND:
        case NODETYPES.OR: {
            result = workspace.newBlock('praxly_boolean_operators_block');
            const a = tree2blocks(workspace, node?.left);
            const b = tree2blocks(workspace, node?.right);
            result.setFieldValue(node.type, "OPERATOR");
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            break;
        }

        case NODETYPES.EQUALITY:
        case NODETYPES.LESS_THAN_OR_EQUAL:
        case NODETYPES.GREATER_THAN_OR_EQUAL:
        case NODETYPES.GREATER_THAN:
        case NODETYPES.LESS_THAN:
        case NODETYPES.INEQUALITY: {
            result = workspace.newBlock('praxly_compare_block');
            const a = tree2blocks(workspace, node?.left);
            const b = tree2blocks(workspace, node?.right);
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            result.setFieldValue(node.type, "OPERATOR");
            break;
        }

        case NODETYPES.PRINT: {
            result = workspace.newBlock('praxly_print_block');
            const child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            if (node && node.comment) {
                result.setCommentText(node.comment);
            }
            break;
        }

        case NODETYPES.ASSOCIATION:
            result = tree2blocks(workspace, node?.expression);
            if (result) {
                result.data = JSON.stringify({
                    isParenthesized: true,
                });
            }
            break;

        case NODETYPES.BUILTIN_FUNCTION_CALL: {
            if (node.name === 'input') {
                result = workspace.newBlock('praxly_input_block');
            } else if (node.name === 'random') {
                result = workspace.newBlock('praxly_random_block');
            } else if (node.name === 'randomInt') {
                result = workspace.newBlock('praxly_random_int_block');
                const child = tree2blocks(workspace, node?.args[0]);
                result.getInput('MAX').connection.connect(child?.outputConnection);
            } else if (node.name === 'randomSeed') {
                result = workspace.newBlock('praxly_random_seed_block');
                const child = tree2blocks(workspace, node?.args[0]);
                result.getInput('SEED').connection.connect(child?.outputConnection);
            } else if (node.name === 'int') {
                result = workspace.newBlock('praxly_int_conversion_block');
                const child = tree2blocks(workspace, node?.args[0]);
                result.getInput('CONVERSION').connection.connect(child?.outputConnection);
            } else if (node.name === 'float') {
                result = workspace.newBlock('praxly_float_conversion_block');
                const child = tree2blocks(workspace, node?.args[0]);
                result.getInput('CONVERSION').connection.connect(child?.outputConnection);
            } else if (node.name === 'min') {
                result = workspace.newBlock('praxly_min_block');
                const child1 = tree2blocks(workspace, node?.args[0]);
                result.getInput('A_MIN').connection.connect(child1?.outputConnection);
                const child2 = tree2blocks(workspace, node?.args[1]);
                result.getInput('B_MIN').connection.connect(child2?.outputConnection);
            } else if (node.name === 'max') {
                result = workspace.newBlock('praxly_max_block');
                const child1 = tree2blocks(workspace, node?.args[0]);
                result.getInput('A_MAX').connection.connect(child1?.outputConnection);
                const child2 = tree2blocks(workspace, node?.args[1]);
                result.getInput('B_MAX').connection.connect(child2?.outputConnection);
            } else if (node.name === 'abs') {
                result = workspace.newBlock('praxly_abs_block');
                const child = tree2blocks(workspace, node?.args[0]);
                result.getInput('VALUE').connection.connect(child?.outputConnection);
            } else if (node.name === 'log') {
                result = workspace.newBlock('praxly_log_block');
                const child = tree2blocks(workspace, node?.args[0]);
                result.getInput('VALUE').connection.connect(child?.outputConnection);
            } else if (node.name === 'sqrt') {
                result = workspace.newBlock('praxly_sqrt_block');
                const child = tree2blocks(workspace, node?.args[0]);
                result.getInput('VALUE').connection.connect(child?.outputConnection);
            }
            break;
        }

        case NODETYPES.CODEBLOCK: {
            const statements = node.statements.map(element => tree2blocks(workspace, element));
            connectStatements(statements);
            return statements;
        }

        case NODETYPES.PROGRAM:
            return tree2blocks(workspace, node.value);

        case NODETYPES.STATEMENT: {
            result = workspace.newBlock('praxly_statement_block');
            const child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;
        }

        case NODETYPES.IF: {
            result = workspace.newBlock('praxly_if_block');
            const condition = tree2blocks(workspace, node?.condition);
            const codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;
        }

        case NODETYPES.IF_ELSE: {
            result = workspace.newBlock('praxly_if_else_block');
            const condition = tree2blocks(workspace, node?.condition);
            const codeblock = tree2blocks(workspace, node?.codeblock);
            const alternative = tree2blocks(workspace, node?.alternative);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            if (alternative && alternative.length > 0) {
                result.getInput('ALTERNATIVE').connection.connect(alternative[0]?.previousConnection);
            }
            break;
        }

        case NODETYPES.LOCATION:
            if (node.isArray) {
                result = workspace.newBlock('praxly_array_reference_block');
                result.setFieldValue(node.name, "VARIABLENAME");
                const childLoc = tree2blocks(workspace, node?.index);
                result.getInput('INDEX').connection.connect(childLoc?.outputConnection);
            } else {
                result = workspace.newBlock('praxly_variable_block');
                result.setFieldValue(node.name, "LITERAL");
            }
            break;

        case NODETYPES.ASSIGNMENT: {
            result = workspace.newBlock('praxly_reassignment_block');
            result.setFieldValue(node.location.name, "VARIABLENAME");
            const expression = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;
        }

        case NODETYPES.VARDECL: {
            if (node.value !== undefined) {
                result = workspace.newBlock('praxly_assignment_block');
                const expression = tree2blocks(workspace, node?.value);
                result.setFieldValue(node.varType, "VARTYPE");
                result.setFieldValue(node.name, "VARIABLENAME");
                result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            } else if (node.varType == TYPES.VOID) {
                // procedures look like variables until left paren is typed
                result = workspace.newBlock('praxly_procedure_block');
                result.setFieldValue(node.varType, "RETURNTYPE");
                result.setFieldValue(node.name, 'PROCEDURE_NAME');
                result.setFieldValue(node.name, 'END_PROCEDURE_NAME');
            } else {
                result = workspace.newBlock('praxly_vardecl_block');
                result.setFieldValue(node.varType, "VARTYPE");
                result.setFieldValue(node.name, "VARIABLENAME");
            }
            break;
        }

        case NODETYPES.WHILE: {
            result = workspace.newBlock('praxly_while_loop_block');
            const condition = tree2blocks(workspace, node?.condition);
            const codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;
        }

        case NODETYPES.DO_WHILE: {
            result = workspace.newBlock('praxly_do_while_loop_block');
            const condition = tree2blocks(workspace, node?.condition);
            const codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;
        }

        case NODETYPES.REPEAT_UNTIL: {
            result = workspace.newBlock('praxly_repeat_until_loop_block');
            const condition = tree2blocks(workspace, node?.condition);
            const codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;
        }

        case NODETYPES.NOT: {
            result = workspace.newBlock('praxly_not_block');
            const child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;
        }

        case NODETYPES.NEGATE: {
            result = workspace.newBlock('praxly_negate_block');
            const child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;
        }

        case NODETYPES.RETURN: {
            result = workspace.newBlock('praxly_return_block');
            const child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;
        }

        case NODETYPES.FUNCCALL: {
            result = workspace.newBlock('praxly_function_call_block');
            const params = workspace.newBlock('praxly_parameter_block');
            result.setFieldValue(node?.name, 'PROCEDURE_NAME');
            result.getInput('PARAMS').connection.connect(params?.outputConnection);
            const argsList = node?.args ?? [];
            for (let i = 0; i < argsList.length; i++) {
                params.appendValueInput(`PARAM_${i}`);
                const argument = tree2blocks(workspace, argsList[i]);
                params.getInput(`PARAM_${i}`).connection.connect(argument?.outputConnection);
            }
            params.initSvg();
            break;
        }

        case NODETYPES.SPECIAL_STRING_FUNCCALL: {
            if (!node.right) {
                break;  // user still typing (nothing after the dot)
            }
            const name = node.right.name;
            const args = node.right.args;

            // create applicable string method block and connect args
            if (name === StringFuncs.CHARAT) {
                result = workspace.newBlock('praxly_charAt_block');
                if (args?.length == 1) {
                    const index = tree2blocks(workspace, args[0]);
                    result.getInput('INDEX').connection.connect(index?.outputConnection);
                }
            }
            else if (name === StringFuncs.CONTAINS) {
                result = workspace.newBlock('praxly_contains_block');
                if (args?.length == 1) {
                    const param = tree2blocks(workspace, args[0]);
                    result.getInput('PARAM').connection.connect(param?.outputConnection);
                }
            }
            else if (name === StringFuncs.INDEXOF) {
                result = workspace.newBlock('praxly_indexOf_block');
                if (args?.length == 1) {
                    const param = tree2blocks(workspace, args[0]);
                    result.getInput('PARAM').connection.connect(param?.outputConnection);
                }
            }
            else if (name === StringFuncs.LENGTH) {
                result = workspace.newBlock('praxly_length_block');
            }
            else if (name === StringFuncs.SUBSTRING) {
                result = workspace.newBlock('praxly_substring_block');
                if (args?.length == 2) {
                    const param1 = tree2blocks(workspace, args[0]);
                    const param2 = tree2blocks(workspace, args[1]);
                    result.getInput('PARAM1').connection.connect(param1?.outputConnection);
                    result.getInput('PARAM2').connection.connect(param2?.outputConnection);
                }
            }
            else if (name === StringFuncs.TOLOWERCSE) {
                result = workspace.newBlock('praxly_toLowerCase_block');
            }
            else if (name === StringFuncs.TOUPPERCASE) {
                result = workspace.newBlock('praxly_toUpperCase_block');
            } else {
                break;  // user still typing or misspelled name
            }

            // connect the string on the left of the result block
            const recipient = tree2blocks(workspace, node.left);
            result.getInput("EXPRESSION").connection.connect(recipient.outputConnection);
            break;
        }

        case NODETYPES.FUNCDECL: {
            const returnType = node?.returnType;
            const argsList = node?.params ?? [];
            result = workspace.newBlock('praxly_procedure_block');
            const params = workspace.newBlock('praxly_parameter_block');
            result.setFieldValue(returnType, "RETURNTYPE");
            result.setFieldValue(node?.name, 'PROCEDURE_NAME');
            result.setFieldValue(node?.name, 'END_PROCEDURE_NAME');
            result.getInput('PARAMS').connection.connect(params?.outputConnection);
            const codeblock = tree2blocks(workspace, node?.codeblock);
            if (codeblock && codeblock.length > 0) {
                result.getInput('CODEBLOCK').connection.connect(codeblock[0]?.previousConnection);
            }
            for (let i = 0; i < argsList.length; i++) {
                params.appendValueInput(`PARAM_${i}`);
                const parameterBlock = workspace.newBlock('praxly_singular_param_block');
                parameterBlock.setFieldValue(argsList[i][0], "VARTYPE");
                parameterBlock.setFieldValue(argsList[i][1], 'VARIABLENAME');
                params.getInput(`PARAM_${i}`).connection.connect(parameterBlock?.outputConnection);
                parameterBlock.initSvg();
            }
            params.initSvg();
            break;
        }

        case NODETYPES.FOR: {
            result = workspace.newBlock('praxly_for_loop_block');
            let initialization = tree2blocks(workspace, node?.initialization);
            let container1;
            if (!initialization) {
                // do nothing; user still typing
            } else if (initialization.type == 'praxly_statement_block') {
                // unpack the expression statement
                container1 = initialization;
                initialization = initialization.getInputTargetBlock('EXPRESSION');
            } else if (initialization.type == 'praxly_assignment_block'
                || initialization.type == 'praxly_reassignment_block') {
                // convert statement to expression
                initialization.dispose();
                if (node?.initialization?.varType) {
                    initialization = workspace.newBlock('praxly_assignment_expression_block');
                    initialization.setFieldValue(node?.initialization?.varType, "VARTYPE");
                    initialization.setFieldValue(node?.initialization?.name, "VARIABLENAME");
                } else {
                    initialization = workspace.newBlock('praxly_reassignment_expression_block');
                    const location = tree2blocks(workspace, node?.initialization?.location);
                    initialization.getInput('LOCATION').connection.connect(location?.outputConnection);
                }
                const expression = tree2blocks(workspace, node?.initialization?.value);
                initialization.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
                initialization.initSvg();
            }

            // this will always be an expression, so nothing more to do
            const condition = tree2blocks(workspace, node?.condition);

            let increment = tree2blocks(workspace, node?.increment);
            let container2;
            if (!increment) {
                // do nothing; user still typing
            } else if (increment.type == 'praxly_statement_block') {
                // unpack the expression statement
                container2 = increment;
                increment = increment.getInputTargetBlock('EXPRESSION');
            } else {
                // was likely praxly_reassignment_block
                increment.dispose();
                increment = workspace.newBlock('praxly_reassignment_expression_block');
                const location2 = tree2blocks(workspace, node?.increment?.location);
                const expression2 = tree2blocks(workspace, node?.increment?.value);
                increment.getInput('LOCATION').connection.connect(location2?.outputConnection);
                increment.getInput('EXPRESSION').connection.connect(expression2?.outputConnection);
                increment.initSvg();
            }

            // get the for loop body
            const codeblock = tree2blocks(workspace, node?.codeblock);

            // connect everything together
            result.getInput('INITIALIZATION').connection.connect(initialization?.outputConnection);
            container1?.dispose();
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            result.getInput('REASSIGNMENT').connection.connect(increment?.outputConnection);
            container2?.dispose();
            if (codeblock && codeblock.length > 0) {
                result.getInput('CODEBLOCK').connection.connect(codeblock[0]?.previousConnection);
            }
            break;
        }

        case NODETYPES.ARRAY_LITERAL: {
            const argsList = node?.params ?? [];
            const params = workspace.newBlock('praxly_parameter_block');
            for (let i = 0; i < argsList.length; i++) {
                params.appendValueInput(`PARAM_${i}`);
                const parameterBlock = tree2blocks(workspace, argsList[i]);
                params.getInput(`PARAM_${i}`).connection.connect(parameterBlock?.outputConnection);
            }
            result = params;
            break;
        }

        case NODETYPES.ARRAY_CREATE: {
            const arrayLength = tree2blocks(workspace, node?.arrayLength);
            result = workspace.newBlock('praxly_array_create_block');
            result.setFieldValue(node?.varType, 'VARTYPE');
            result.setFieldValue(node?.name, "VARIABLENAME");
            result.setFieldValue(node?.elemType, "ELEMTYPE");
            result.getInput("LENGTH").connection.connect(arrayLength?.outputConnection);
            break;
        }

        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT: {
            result = workspace.newBlock('praxly_array_reference_reassignment_block');
            result.setFieldValue(node.location.name, "VARIABLENAME");
            const child = tree2blocks(workspace, node.location.index);
            result.getInput('INDEX').connection.connect(child?.outputConnection);
            const expression = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;
        }

        case NODETYPES.ARRAY_ASSIGNMENT: {
            const expression = tree2blocks(workspace, node?.value);
            result = workspace.newBlock('praxly_array_assignment_block');
            result.setFieldValue(node?.varType, 'VARTYPE');
            result.setFieldValue(node?.name, 'VARIABLENAME');
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;
        }
    }

    // update blocks only if result is valid
    if (node && result) {
        node.blockID = result?.id;
        result.initSvg();
    }
    return result;
}
