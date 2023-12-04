import Blockly from 'blockly';
import { NODETYPES, TYPES } from './common';

function containsOnlyNumbers(str) {
    return /^-?\d+$/.test(str);
}

export const blocks2tree = (workspace, generator) => {
    var topBlocks = workspace.getTopBlocks();

    // console.error(topBlocks);
    if (topBlocks.length === 0) {
        return {
            type: NODETYPES.PROGRAM,
            blockID: 'blocksRoot',
            value: 0
        };
    }

    var result = {
        type: NODETYPES.PROGRAM,
        blockID: 'blocksRoot',
        value: generator['codeBLockJsonBuilder'](topBlocks[0])
    }

    return result;
}

export const makeGenerator = () => {
    const praxlyGenerator = [];

    praxlyGenerator['codeBLockJsonBuilder'] = (headBlock) => {
        // console.log('this is the head block');
        // console.log(headBlock);

        var codeblock = {
            type: NODETYPES.CODEBLOCK,
            blockID: "blocks[]",
        }
        var statements = [];
        let currentBlock = headBlock;
        while (currentBlock.getNextBlock() != null) {
            statements.push(praxlyGenerator[currentBlock.type](currentBlock));
            currentBlock = currentBlock.getNextBlock();
        }
        statements.push(praxlyGenerator[currentBlock.type](currentBlock));
        codeblock.statements = statements;
        return codeblock;
    }

    praxlyGenerator['praxly_arithmetic_block'] = (block) => {
        const children = block.getChildren(true);
        const a = children[0];
        const b = children[1];
        const node = {
            blockID: block.id,
            left: praxlyGenerator[a.type](a),
            right: praxlyGenerator[b.type](b)
        }
        node.type = block.getFieldValue('OPERATOR');
        return node;

    }
    praxlyGenerator['praxly_print_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return {
            blockID: block.id,
            type: 'PRINT',
            value: praxlyGenerator[expression.type](expression),
        }
    }

    praxlyGenerator['praxly_println_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return {
            blockID: block.id,
            type: NODETYPES.PRINTLN,
            value: praxlyGenerator[expression.type](expression),
        }
    }

    praxlyGenerator['praxly_input_block'] = (block) => {
        return {
            blockID: block.id,
            type: NODETYPES.INPUT,
        };
    }

    praxlyGenerator['praxly_statement_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return {
            blockID: block.id,
            type: NODETYPES.STATEMENT,
            value: praxlyGenerator[expression.type](expression),
        }
    }

    praxlyGenerator['praxly_array_reference_block'] = (block) => {
        var index = block.getInputTargetBlock("INDEX");
        return {
            blockID: block.id,
            type: NODETYPES.LOCATION,
            name: block.getFieldValue("VARIABLENAME"),
            index: praxlyGenerator[index.type](index),
            isArray: true,
        }
    }

    praxlyGenerator['praxly_literal_block'] = (block) => {
        const input = block.getFieldValue('LITERAL');
        const node = {
            blockID: block.id,
            isArray: false,
            value: input,
        }
        if (input[0] === '\"' && input[input.length - 1] === '\"') {
            node.type = NODETYPES.STRING;
            node.value = input.slice(1, -1);
        } else if (input[0] === '\'' && input[input.length - 1] === '\'') {
            node.type = NODETYPES.CHAR;
            node.value = input.slice(1, -1);
        } else if (input.includes('.')) {
            node.type = TYPES.DOUBLE;
        } else if (containsOnlyNumbers(input)) {
            node.type = TYPES.INT;
        } else {
            node.type = NODETYPES.LOCATION;
            node.name = input;
        }
        return node;
    }

    praxlyGenerator['praxly_variable_block'] = (block) => {
        const input = block.getFieldValue('LITERAL');
        const node = {
            blockID: block.id,
            value: input,
        }
        if (input[0] === '\"' && input[input.length - 1] === '\"') {
            node.type = TYPES.STRING;
            node.value = input.slice(1, -1);
        } else if (input.includes('.')) {
            node.type = TYPES.DOUBLE;

        } else if (containsOnlyNumbers(input)) {
            node.type = TYPES.INT;
        } else {
            node.type = NODETYPES.LOCATION;
            node.name = input;
        }
        return node;
    }

    praxlyGenerator['praxly_boolean_operators_block'] = (block) => {
        const children = block.getChildren(true);
        const a = children[0];
        const b = children[1];
        const node = {
            blockID: block.id,
            left: praxlyGenerator[a.type](a),
            right: praxlyGenerator[b.type](b)
        }
        node.type = block.getFieldValue('OPERATOR');
        return node;
    }

    praxlyGenerator['praxly_compare_block'] = (block) => {
        const children = block.getChildren(true);
        const a = children[0];
        const b = children[1];
        const node = {
            blockID: block.id,
            left: praxlyGenerator[a.type](a),
            right: praxlyGenerator[b.type](b)
        }
        node.type = block.getFieldValue('OPERATOR');
        return node;
    }

    praxlyGenerator['praxly_true_block'] = (block) => {
        return {
            blockID: block.id,
            value: true,
            type: NODETYPES.BOOLEAN,
        };
    }

    praxlyGenerator['praxly_false_block'] = (block) => {
        return {
            blockID: block.id,
            value: false,
            type: NODETYPES.BOOLEAN,
        };
    }

    praxlyGenerator['praxly_comment_block'] = (block) => {
        return {
            blockID: block.id,
            value: block.getFieldValue('COMMENT'),
            type: NODETYPES.COMMENT,
        };
    }

    praxlyGenerator['praxly_single_line_comment_block'] = (block) => {
        return {
            blockID: block.id,
            value: block.getFieldValue('COMMENT'),
            type: NODETYPES.SINGLE_LINE_COMMENT,
        };
    }

    praxlyGenerator['praxly_if_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: NODETYPES.IF,
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition),
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements)
        }
    }

    praxlyGenerator['praxly_if_else_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        const alternative = block.getInputTargetBlock("ALTERNATIVE");
        return {
            type: NODETYPES.IF_ELSE,
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition),
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements),
            alternative: praxlyGenerator['codeBLockJsonBuilder'](alternative),
        }
    }

    praxlyGenerator['praxly_vardecl_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        var variableName = block.getFieldValue('VARIABLENAME');
        return {
            type: NODETYPES.VARDECL,
            name: variableName,
            blockID: block.id,
            varType: varType,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
        }
    }

    praxlyGenerator['praxly_assignment_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: NODETYPES.VARDECL,
            name: variableName,
            value: value,
            blockID: block.id,
            varType: varType,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
        }
    }

    praxlyGenerator['praxly_array_assignment_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        console.log(`field input is ${varType}`);
        var variableName = block.getFieldValue('VARIABLENAME');
        var args = block.getInputTargetBlock('EXPRESSION');
        var argschildren = args.getChildren(true);
        var argsList = [];
        argschildren.forEach(element => {
            argsList.push(praxlyGenerator[element.type](element));
        });

        return {
            type: 'ARRAY_ASSIGNMENT',
            name: variableName,
            value: {
                blockID: args.id,
                params: argsList,
                type: NODETYPES.ARRAY_LITERAL,
                isArray: true,
            },
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
            blockID: block.id,
            varType: varType,
        }
    }

    praxlyGenerator['praxly_reassignment_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        console.log(`field input is ${varType}`);
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: NODETYPES.ASSIGNMENT,
            name: variableName,
            value: value,
            blockID: block.id,
            varType: 'reassignment'
        }
    }

    praxlyGenerator['praxly_array_reference_reassignment_block'] = (block) => {
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var indexInput = block.getInputTargetBlock('INDEX');
        var value = praxlyGenerator[expression.type](expression);
        var index = praxlyGenerator[indexInput.type](indexInput);
        return {
            type: NODETYPES.ARRAY_REFERENCE_ASSIGNMENT,
            name: variableName,
            index: index,
            value: value,
            blockID: block.id,
        }
    }

    praxlyGenerator['praxly_assignment_expression_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        console.log(`field input is ${varType}`);
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: NODETYPES.VARDECL,
            name: variableName,
            value: value,
            blockID: block.id,
            varType: varType,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
        }
    }

    praxlyGenerator['praxly_reassignment_expression_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        // console.log(`field input is ${varType}`);
        var location = block.getInputTargetBlock('LOCATION');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var loc = praxlyGenerator[location.type](location);
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: NODETYPES.ASSIGNMENT,
            name: loc.name,
            location: loc,
            value: value,
            blockID: block.id,
            varType: varType,
        }
    }

    praxlyGenerator['praxly_while_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: NODETYPES.WHILE,
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition),
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements)
        };
    }

    praxlyGenerator['praxly_do_while_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: NODETYPES.DO_WHILE,
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition),
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements)
        };
    }

    praxlyGenerator['praxly_repeat_until_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: NODETYPES.REPEAT_UNTIL,
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition),
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements)
        };
    }

    praxlyGenerator['praxly_not_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return {
            blockID: block.id,
            type: NODETYPES.NOT,
            value: praxlyGenerator[expression.type](expression),
        }
    }

    praxlyGenerator['praxly_negate_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return {
            blockID: block.id,
            type: NODETYPES.NEGATE,
            value: praxlyGenerator[expression.type](expression),
        }
    }

    praxlyGenerator['praxly_for_loop_block'] = (block) => {
        var initialization = block.getInputTargetBlock('INITIALIZATION');
        var condition = block.getInputTargetBlock("CONDITION");
        var reassignment = block.getInputTargetBlock('REASSIGNMENT');
        const statements = block.getInputTargetBlock("CODEBLOCK");
        return {
            type: NODETYPES.FOR,
            blockID: block.id,
            initialization: praxlyGenerator[initialization.type](initialization),
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements),
            increment: praxlyGenerator[reassignment.type](reassignment),
            condition: praxlyGenerator[condition.type](condition),
        };
    }

    praxlyGenerator['praxly_procedure_block'] = (block) => {
        var returnType = block.getFieldValue('RETURNTYPE');
        // console.log(`field input is ${varType}`);
        var args = block.getInputTargetBlock('PARAMS');
        var argschildren = args.getChildren(true);
        var argsList = [];
        argschildren.forEach(element => {
            var param = [];
            param[0] = (element.getFieldValue('VARTYPE'));
            param[1] = element.getFieldValue('VARIABLENAME');
            argsList.push(param);
        });
        var procedureName = block.getFieldValue('PROCEDURE_NAME');
        const statements = block.getInputTargetBlock("CONTENTS");
        block.setFieldValue(procedureName, 'END_PROCEDURE_NAME');
        return {
            type: NODETYPES.FUNCDECL,
            name: procedureName,
            params: argsList,
            returnType: returnType,
            contents: praxlyGenerator['codeBLockJsonBuilder'](statements),
            blockID: block.id,
        }
    }

    praxlyGenerator['praxly_function_call_block'] = (block) => {
        var procedureName = block.getFieldValue('PROCEDURE_NAME');
        var args = block.getInputTargetBlock('PARAMS');
        var argschildren = args.getChildren(true);
        var argsList = [];
        argschildren.forEach(element => {
            argsList.push(praxlyGenerator[element.type](element));
        });
        return {
            blockID: block.id,
            type: NODETYPES.FUNCCALL,
            name: procedureName,
            args: argsList,
        }
    }

    praxlyGenerator['praxly_return_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return {
            blockID: block.id,
            type: NODETYPES.RETURN,
            value: praxlyGenerator[expression.type](expression),
        }
    }

    praxlyGenerator['praxly_StringFunc_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        var procedureName = block.getFieldValue('FUNCTYPE');
        var args = block.getInputTargetBlock('PARAMS');
        var argschildren = args.getChildren(true);
        var argsList = [];
        argschildren.forEach(element => {
            argsList.push(praxlyGenerator[element.type](element));
        });
        return {
            blockID: block.id,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression.type](expression),
            right: {
                name: procedureName, 
                args: argsList ,
                type: NODETYPES.FUNCCALL
            }
        }
    }

    return praxlyGenerator;
}
