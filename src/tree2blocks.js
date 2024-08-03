import { NODETYPES, TYPES } from "./common";

function connectStatements(statements) {
    for (let i = 0; i < statements.length - 1; i++) {
        let currentStatement = statements[i];
        let nextStatement = statements[i + 1];
        if (currentStatement && nextStatement) {
            currentStatement.nextConnection.connect(nextStatement.previousConnection);
        } else if (currentStatement && !nextStatement) {
            // Find the next valid statement in the array
            var j = i + 2;
            while (j < statements.length && !statements[j]) {
                j++;
            }
            if (j < statements.length) {
                // Set the connection from the current statement to the next valid statement
                currentStatement.nextConnection.connect(statements[j].previousConnection);
            }
        }
        else {
            console.error("connection failed");
        }
    }
}

export const tree2blocks = (workspace, node) => {

    switch (node?.type) {

        case NODETYPES.NEWLINE:
            var result = workspace.newBlock('praxly_emptyline_block');
            break;

        case NODETYPES.COMMENT:
            var result = workspace.newBlock('praxly_comment_block');
            result.setFieldValue(node.value, "COMMENT");
            break;

        case NODETYPES.SINGLE_LINE_COMMENT:
            var result = workspace.newBlock('praxly_single_line_comment_block');
            result.setFieldValue(node.value, "COMMENT");
            break;

        case TYPES.INT:
        case TYPES.SHORT:
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(node.value, "LITERAL");
            break;

        case NODETYPES.BOOLEAN:
            var result;
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
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue('\'' + node.value + '\'', "LITERAL");
            break;

        case TYPES.STRING:
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue('\"' + node.value + '\"', "LITERAL");
            break;

        case TYPES.DOUBLE:
        case TYPES.FLOAT:
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(node.value, "LITERAL");
            break;

        case NODETYPES.ADDITION:
        case NODETYPES.SUBTRACTION:
        case NODETYPES.MULTIPLICATION:
        case NODETYPES.DIVISION:
        case NODETYPES.EXPONENTIATION:
        case NODETYPES.MODULUS:
            var result = workspace.newBlock('praxly_arithmetic_block');
            var a = tree2blocks(workspace, node?.left);
            var b = tree2blocks(workspace, node?.right);
            result.setFieldValue(node.type, "OPERATOR");
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            break;

        case NODETYPES.AND:
        case NODETYPES.OR:
            var result = workspace.newBlock('praxly_boolean_operators_block');
            var a = tree2blocks(workspace, node?.left);
            var b = tree2blocks(workspace, node?.right);
            result.setFieldValue(node.type, "OPERATOR");
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            break;

        case NODETYPES.EQUALITY:
        case NODETYPES.LESS_THAN_OR_EQUAL:
        case NODETYPES.GREATER_THAN_OR_EQUAL:
        case NODETYPES.GREATER_THAN:
        case NODETYPES.LESS_THAN:
        case NODETYPES.INEQUALITY:
            var result = workspace.newBlock('praxly_compare_block');
            var a = tree2blocks(workspace, node?.left);
            var b = tree2blocks(workspace, node?.right);
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            result.setFieldValue(node.type, "OPERATOR");
            break;

        case NODETYPES.PRINT:
            var result = workspace.newBlock('praxly_print_block');
            var child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            if (node && node.comment) {
                result.setCommentText(node.comment);
            }
            break;

        case NODETYPES.ASSOCIATION:
            var result = tree2blocks(workspace, node?.expression);
            result.data = JSON.stringify({
              isParenthesized: true,
            });
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

        case NODETYPES.CODEBLOCK:
            var statements = node.statements.map(element => {
                try {
                    return tree2blocks(workspace, element);
                }
                catch (error) {
                    console.error('invalid statement', error);
                    return null;
                }
            });
            connectStatements(statements);
            return statements;

        case NODETYPES.PROGRAM:
            return tree2blocks(workspace, node.value);

        case NODETYPES.STATEMENT:
            var result = workspace.newBlock('praxly_statement_block');
            var child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.IF:
            var result = workspace.newBlock('praxly_if_block');
            var condition = tree2blocks(workspace, node?.condition);
            var codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;

        case NODETYPES.IF_ELSE:
            var result = workspace.newBlock('praxly_if_else_block');
            var condition = tree2blocks(workspace, node?.condition);
            var statements = tree2blocks(workspace, node?.codeblock);
            var alternatives = tree2blocks(workspace, node?.alternative);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (statements && statements.length > 0) {
                result.getInput('STATEMENT').connection.connect(statements[0]?.previousConnection);
            }
            if (alternatives && alternatives.length > 0) {
                result.getInput('ALTERNATIVE').connection.connect(alternatives[0]?.previousConnection);
            }
            break;

        case NODETYPES.LOCATION:
            if (node.isArray) {
                var result = workspace.newBlock('praxly_array_reference_block');
                result.setFieldValue(node.name, "VARIABLENAME");
                var child = tree2blocks(workspace, node?.index);
                result.getInput('INDEX').connection.connect(child?.outputConnection);
            } else {
                var result = workspace.newBlock('praxly_variable_block');
                result.setFieldValue(node.name, "LITERAL");
            }
            break;

        case NODETYPES.ASSIGNMENT:
            var result = workspace.newBlock('praxly_reassignment_block');
            result.setFieldValue(node.location.name, "VARIABLENAME");
            var expression = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;

        case NODETYPES.VARDECL:
            if (node.value !== undefined) {
                var result = workspace.newBlock('praxly_assignment_block');
                var expression = tree2blocks(workspace, node?.value);
                result.setFieldValue(node.varType, "VARTYPE");
                result.setFieldValue(node.name, "VARIABLENAME");
                result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            } else if (node.varType == TYPES.VOID) {
                // procedures look like variables until left paren is typed
                var result = workspace.newBlock('praxly_procedure_block');
                result.setFieldValue(node.varType, "RETURNTYPE");
                result.setFieldValue(node.name, 'PROCEDURE_NAME');
                result.setFieldValue(node.name, 'END_PROCEDURE_NAME');
            } else {
                var result = workspace.newBlock('praxly_vardecl_block');
                result.setFieldValue(node.varType, "VARTYPE");
                result.setFieldValue(node.name, "VARIABLENAME");
            }
            break;

        case NODETYPES.WHILE:
            var result = workspace.newBlock('praxly_while_loop_block');
            var condition = tree2blocks(workspace, node?.condition);
            var codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;

        case NODETYPES.DO_WHILE:
            var result = workspace.newBlock('praxly_do_while_loop_block');
            var condition = tree2blocks(workspace, node?.condition);
            var codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;

        case NODETYPES.REPEAT_UNTIL:
            var result = workspace.newBlock('praxly_repeat_until_loop_block');
            var condition = tree2blocks(workspace, node?.condition);
            var codeblock = tree2blocks(workspace, node?.codeblock);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblock && codeblock.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblock[0]?.previousConnection);
            }
            break;

        case NODETYPES.NOT:
            var result = workspace.newBlock('praxly_not_block');
            var child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.NEGATE:
            var result = workspace.newBlock('praxly_negate_block');
            var child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.RETURN:
            var result = workspace.newBlock('praxly_return_block');
            var child = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.FUNCCALL:
            var result = workspace.newBlock('praxly_function_call_block');
            var params = workspace.newBlock('praxly_parameter_block');
            result.setFieldValue(node?.name, 'PROCEDURE_NAME');
            result.getInput('PARAMS').connection.connect(params?.outputConnection);
            var argsList = node?.args;
            for (var i = 0; i < (argsList?.length ?? 0); i++) {
                params.appendValueInput(`PARAM_${i}`);
                var argument = tree2blocks(workspace, argsList[i]);
                params.getInput(`PARAM_${i}`).connection.connect(argument?.outputConnection);
            }
            params.initSvg();
            break;

        case NODETYPES.SPECIAL_STRING_FUNCCALL:
            var result = workspace.newBlock('praxly_StringFunc_block');
            var params = workspace.newBlock('praxly_parameter_block');
            var recipient = tree2blocks(workspace, node.left);
            result.setFieldValue(node?.right?.name, 'FUNCTYPE');
            result.getInput('PARAMS').connection.connect(params?.outputConnection);
            var argsList = node?.right?.args;
            for (var i = 0; i < (argsList?.length ?? 0); i++) {
                params.appendValueInput(`PARAM_${i}`);
                var argument = tree2blocks(workspace, argsList[i]);
                params.getInput(`PARAM_${i}`).connection.connect(argument?.outputConnection);
            }
            result.getInput("EXPRESSION").connection.connect(recipient.outputConnection);
            params.initSvg();
            break;


        case NODETYPES.FUNCDECL:
            var returnType = node?.returnType;
            var argsList = node?.params;
            var result = workspace.newBlock('praxly_procedure_block');
            var params = workspace.newBlock('praxly_parameter_block');
            result.setFieldValue(returnType, "RETURNTYPE");
            result.setFieldValue(node?.name, 'PROCEDURE_NAME');
            result.setFieldValue(node?.name, 'END_PROCEDURE_NAME');
            result.getInput('PARAMS').connection.connect(params?.outputConnection);
            var contents = tree2blocks(workspace, node?.contents);
            if (contents && contents.length > 0) {
                result.getInput('CONTENTS').connection.connect(contents[0]?.previousConnection);
            }
            for (var i = 0; i < (argsList?.length ?? 0); i++) {
                params.appendValueInput(`PARAM_${i}`);
                var parameterBlock = workspace.newBlock('praxly_singular_param_block');
                parameterBlock.setFieldValue(argsList[i][0], "VARTYPE");
                parameterBlock.setFieldValue(argsList[i][1], 'VARIABLENAME');
                params.getInput(`PARAM_${i}`).connection.connect(parameterBlock?.outputConnection);
                parameterBlock.initSvg();
            }
            params.initSvg();
            break;

        case NODETYPES.FOR:
            var result = workspace.newBlock('praxly_for_loop_block');
            try {
                var initialization = tree2blocks(workspace, node?.initialization);
                if (!initialization) {
                    // do nothing; user still typing
                } else if (initialization.type == 'praxly_statement_block') {
                    // unpack the expression statement
                    var container1 = initialization;
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
                        var location = tree2blocks(workspace, node?.initialization?.location);
                        initialization.getInput('LOCATION').connection.connect(location?.outputConnection);
                    }
                    var expression = tree2blocks(workspace, node?.initialization?.value);
                    initialization.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
                    initialization.initSvg();
                }

                // this will always be an expression, so nothing more to do
                var condition = tree2blocks(workspace, node?.condition);

                var increment = tree2blocks(workspace, node?.increment);
                if (!increment) {
                    // do nothing; user still typing
                } else if (increment.type == 'praxly_statement_block') {
                    // unpack the expression statement
                    var container2 = increment;
                    increment = increment.getInputTargetBlock('EXPRESSION');
                } else {
                    // was likely praxly_reassignment_block
                    increment.dispose();
                    increment = workspace.newBlock('praxly_reassignment_expression_block');
                    var location2 = tree2blocks(workspace, node?.increment?.location);
                    var expression2 = tree2blocks(workspace, node?.increment?.value);
                    increment.getInput('LOCATION').connection.connect(location2?.outputConnection);
                    increment.getInput('EXPRESSION').connection.connect(expression2?.outputConnection);
                    increment.initSvg();
                }

                // get the for loop body
                var codeblock = tree2blocks(workspace, node?.codeblock);

                // connect everything together
                result.getInput('INITIALIZATION').connection.connect(initialization?.outputConnection);
                container1?.dispose();
                result.getInput('CONDITION').connection.connect(condition?.outputConnection);
                result.getInput('REASSIGNMENT').connection.connect(increment?.outputConnection);
                container2?.dispose();
                if (codeblock && codeblock.length > 0) {
                    result.getInput('CODEBLOCK').connection.connect(codeblock[0]?.previousConnection);
                }
            }
            catch (error) {
                console.error('for loop header', error);
                // the question marks here helped the for loop block generate when just typing
                // the word "for", giving a little bit of predictive block rendering.
                initialization?.dispose();
                condition?.dispose();
                increment?.dispose();
            }
            break;

        case NODETYPES.ARRAY_LITERAL:
            var argsList = node?.params;
            var params = workspace.newBlock('praxly_parameter_block');
            for (var i = 0; i < (argsList?.length ?? 0); i++) {
                params.appendValueInput(`PARAM_${i}`);
                var parameterBlock = tree2blocks(workspace, argsList[i]);
                params.getInput(`PARAM_${i}`).connection.connect(parameterBlock?.outputConnection);
            }
            var result = params;
            break;

        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT:
            var result = workspace.newBlock('praxly_array_reference_reassignment_block');
            result.setFieldValue(node.location.name, "VARIABLENAME");
            var child = tree2blocks(workspace, node.location.index);
            result.getInput('INDEX').connection.connect(child?.outputConnection);
            var expression = tree2blocks(workspace, node?.value);
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;

        case NODETYPES.ARRAY_ASSIGNMENT:
            var expression = tree2blocks(workspace, node?.value);
            var result = workspace.newBlock('praxly_array_assignment_block');
            result.setFieldValue(node?.varType, 'VARTYPE');
            result.setFieldValue(node?.name, 'VARIABLENAME');
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;
    }

    // update blocks only if result is valid
    if (node && result) {
        node.blockID = result?.id;
        result.initSvg();
    }
    return result;
}
