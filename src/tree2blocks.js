
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
            console.log("connection failed");
        }
    }
}

export const tree2blocks = (workspace, blockjson) => {
    try {
        // console.log(blockjson.type);
    } catch (error) {
        // console.error('An error occurred: could not generate block from text', error);
        return 0;
    }

    switch (blockjson?.type) {

        case NODETYPES.COMMENT:
            var result = workspace.newBlock('praxly_comment_block');
            result.setFieldValue(blockjson.value, "COMMENT");
            break;

        case NODETYPES.SINGLE_LINE_COMMENT:
            var result = workspace.newBlock('praxly_single_line_comment_block');
            result.setFieldValue(blockjson.value, "COMMENT");
            break;

        case TYPES.INT:
        case TYPES.SHORT:
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(blockjson.value, "LITERAL");
            break;

        case NODETYPES.BOOLEAN:
            var result;
            if (blockjson.value) {
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
            result.setFieldValue('\'' + blockjson.value + '\'', "LITERAL");
            break;

        case TYPES.STRING:
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue('\"' + blockjson.value + '\"', "LITERAL");
            break;

        case TYPES.DOUBLE:
        case TYPES.FLOAT:
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(blockjson.value, "LITERAL");
            break;

        case NODETYPES.ADDITION:
        case NODETYPES.SUBTRACTION:
        case NODETYPES.MULTIPLICATION:
        case NODETYPES.DIVISION:
        case NODETYPES.EXPONENTIATION:
        case NODETYPES.MODULUS:
            var result = workspace.newBlock('praxly_arithmetic_block');
            var a = tree2blocks(workspace, blockjson?.left);
            var b = tree2blocks(workspace, blockjson?.right);
            result.setFieldValue(blockjson.type, "OPERATOR");
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            break;

        case NODETYPES.AND:
        case NODETYPES.OR:
            var result = workspace.newBlock('praxly_boolean_operators_block');
            var a = tree2blocks(workspace, blockjson?.left);
            var b = tree2blocks(workspace, blockjson?.right);
            result.setFieldValue(blockjson.type, "OPERATOR");
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
            var a = tree2blocks(workspace, blockjson?.left);
            var b = tree2blocks(workspace, blockjson?.right);
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            result.setFieldValue(blockjson.type, "OPERATOR");
            break;

        case NODETYPES.PRINT:
            var result = workspace.newBlock('praxly_print_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.PRINTLN:
            var result = workspace.newBlock('praxly_println_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.INPUT:
            result = workspace.newBlock('praxly_input_block');
            break;

        case NODETYPES.CODEBLOCK:
            var statements = blockjson.statements.map(element => {
                try {
                    return tree2blocks(workspace, element);
                }
                catch (error) {
                    console.error('An error occurred: empty statement', error);
                    return null;
                }

            });
            connectStatements(statements);
            return statements;

        case NODETYPES.PROGRAM:
            return tree2blocks(workspace, blockjson.value);

        case NODETYPES.STATEMENT:
            var result = workspace.newBlock('praxly_statement_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.IF:
            var result = workspace.newBlock('praxly_if_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblocks && codeblocks.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            }
            break;

        case NODETYPES.IF_ELSE:
            var result = workspace.newBlock('praxly_if_else_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var statements = tree2blocks(workspace, blockjson?.statement);
            var alternatives = tree2blocks(workspace, blockjson?.alternative);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (statements && statements.length > 0) {
                result.getInput('STATEMENT').connection.connect(statements[0]?.previousConnection);
            }
            if (alternatives && alternatives.length > 0) {
                result.getInput('ALTERNATIVE').connection.connect(alternatives[0]?.previousConnection);
            }
            break;

        case NODETYPES.LOCATION:
            if (blockjson.isArray) {
                var result = workspace.newBlock('praxly_array_reference_block');
                result.setFieldValue(blockjson.name, "VARIABLENAME");
                var child = tree2blocks(workspace, blockjson?.index);
                result.getInput('INDEX').connection.connect(child?.outputConnection);
            } else {
                var result = workspace.newBlock('praxly_variable_block');
                result.setFieldValue(blockjson.name, "LITERAL");
            }
            break;

        case NODETYPES.ASSIGNMENT:
            var expression = tree2blocks(workspace, blockjson?.value);
            var result = workspace.newBlock('praxly_reassignment_expression_block');
            var location = tree2blocks(workspace, blockjson.location);
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            result.getInput('LOCATION').connection.connect(location?.outputConnection);
            break;

        case NODETYPES.VARDECL:
            if (blockjson.value !== undefined) {
                var result = workspace.newBlock('praxly_assignment_block');
                var expression = tree2blocks(workspace, blockjson?.value);
                result.setFieldValue(blockjson.varType, "VARTYPE");
                result.setFieldValue(blockjson.name, "VARIABLENAME");
                result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            } else {
                var result = workspace.newBlock('praxly_vardecl_block');
                result.setFieldValue(blockjson.varType, "VARTYPE");
                result.setFieldValue(blockjson.name, "VARIABLENAME");
            }
            break;

        case NODETYPES.WHILE:
            var result = workspace.newBlock('praxly_while_loop_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblocks && codeblocks.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            }
            break;

        case NODETYPES.DO_WHILE:
            var result = workspace.newBlock('praxly_do_while_loop_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblocks && codeblocks.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            }
            break;

        case NODETYPES.REPEAT_UNTIL:
            var result = workspace.newBlock('praxly_repeat_until_loop_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            if (codeblocks && codeblocks.length > 0) {
                result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            }
            break;

        case NODETYPES.NOT:
            var result = workspace.newBlock('praxly_not_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.NEGATE:
            var result = workspace.newBlock('praxly_negate_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.RETURN:
            var result = workspace.newBlock('praxly_return_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;

        case NODETYPES.FUNCCALL:
            var result = workspace.newBlock('praxly_function_call_block');
            var params = workspace.newBlock('praxly_parameter_block');
            result.setFieldValue(blockjson?.name, 'PROCEDURE_NAME');
            result.getInput('PARAMS').connection.connect(params?.outputConnection);
            var argsList = blockjson?.args;
            for (var i = 0; i < (argsList?.length ?? 0); i++) {
                params.appendValueInput(`PARAM_${i}`);
                var argument = tree2blocks(workspace, argsList[i]);
                params.getInput(`PARAM_${i}`).connection.connect(argument?.outputConnection);
            }
            params.initSvg();
            break;

        case NODETYPES.FUNCDECL:
            var returnType = blockjson?.returnType;
            var argsList = blockjson?.params;
            var result = workspace.newBlock('praxly_procedure_block');
            var params = workspace.newBlock('praxly_parameter_block');
            result.setFieldValue(returnType, "RETURNTYPE");
            result.setFieldValue(blockjson?.name, 'PROCEDURE_NAME');
            result.setFieldValue(blockjson?.name, 'END_PROCEDURE_NAME');
            result.getInput('PARAMS').connection.connect(params?.outputConnection);
            var contents = tree2blocks(workspace, blockjson?.contents);
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
            
            //gohere
            try {
                var initialization = tree2blocks(workspace, blockjson?.initialization);
                console.error(initialization?.type);
                if (!initialization || initialization.type !== 'praxly_statement_block'){
                    initialization.dispose();
                    var initialization = workspace.newBlock('praxly_assignment_expression_block');
                    var expression = tree2blocks(workspace, blockjson?.initialization?.value);
                    initialization.setFieldValue(blockjson?.initialization?.varType, "VARTYPE");
                    initialization.setFieldValue(blockjson?.initialization?.name, "VARIABLENAME");
                    initialization.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
                    initialization.initSvg();
                } else {
                    var container = initialization;
                    initialization = initialization.getInputTargetBlock('EXPRESSION');
                    
                }

                // var increment = workspace.newBlock('praxly_reassignment_expression_block');
                // var expression2 = tree2blocks(workspace, blockjson?.increment?.value);
                // increment.setFieldValue(blockjson?.increment?.name, "VARIABLENAME");
                // increment.getInput('EXPRESSION').connection.connect(expression2?.outputConnection);
                // increment.initSvg();

                var condition = tree2blocks(workspace, blockjson?.condition);
                var increment = tree2blocks(workspace, blockjson?.increment);
                var codeblocks = tree2blocks(workspace, blockjson?.statement);

                result.getInput('INITIALIZATION').connection.connect(initialization?.outputConnection);
                container?.dispose();
                result.getInput('CONDITION').connection.connect(condition?.outputConnection);
                result.getInput('REASSIGNMENT').connection.connect(increment?.outputConnection);
                if (codeblocks && codeblocks.length > 0) {
                    result.getInput('CODEBLOCK').connection.connect(codeblocks[0]?.previousConnection);
                }
            }
            catch (error) {
                console.error('An error occurred: could not generate the nested block', error);
                initialization.dispose();
                increment.dispose();
            }
            break;

        case NODETYPES.ARRAY_LITERAL:
            var argsList = blockjson?.params;
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
            console.error(`reached here`);
            result.setFieldValue(blockjson.name, "VARIABLENAME");
            var child = tree2blocks(workspace, blockjson?.index);
            result.getInput('INDEX').connection.connect(child?.outputConnection);
            var expression = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;

        case NODETYPES.ARRAY_ASSIGNMENT:
            var expression = tree2blocks(workspace, blockjson?.value);
            var result = workspace.newBlock('praxly_array_assignment_block');
            result.setFieldValue(blockjson?.varType, 'VARTYPE');
            result.setFieldValue(blockjson?.name, 'VARIABLENAME');
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;
    }

    // update blocks only if result is valid
    if (blockjson && result) {
        blockjson.blockID = result?.id;
        result.initSvg();
    }
    return result;
}
