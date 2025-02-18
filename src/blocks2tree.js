import { NODETYPES, StringFuncs, TYPES } from './common';

function containsOnlyNumbers(str) {
    return /^-?\d+$/.test(str);
}

function isValidIdentifier(str) {
    const regex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    return regex.test(str);
}

export const blocks2tree = (workspace, generator) => {
    var topBlocks = workspace.getTopBlocks();

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
        value: generator['codeBlockJsonBuilder'](topBlocks[0])
    }

    return result;
}

function customizeMaybe(block, node) {
    if (block?.data) {
        const data = JSON.parse(block.data);
        if (data.isParenthesized) {
            node = {
                type: NODETYPES.ASSOCIATION,
                blockID: block.id,
                expression: node,
            };
        }
    }
    return node;
}

export const makeGenerator = () => {
    const praxlyGenerator = [];

    praxlyGenerator[undefined] = (block) => {
        return null;  // incomplete block
    }

    praxlyGenerator['codeBlockJsonBuilder'] = (headBlock) => {
        var codeblock = {
            type: NODETYPES.CODEBLOCK,
            blockID: "blocks[]",
        }
        var statements = [];
        let currentBlock = headBlock;
        if (currentBlock) {
            while (currentBlock.getNextBlock() != null) {
                statements.push(praxlyGenerator[currentBlock.type](currentBlock));
                currentBlock = currentBlock.getNextBlock();
            }
            statements.push(praxlyGenerator[currentBlock.type](currentBlock));
        }
        codeblock.statements = statements;
        return customizeMaybe(headBlock, codeblock);
    }

    praxlyGenerator['praxly_arithmetic_block'] = (block) => {
        const children = block.getChildren(true);
        const a = children[0];
        const b = children[1];
        const node = {
            blockID: block.id,
            left: praxlyGenerator[a?.type](a),
            right: praxlyGenerator[b?.type](b)
        }
        node.type = block.getFieldValue('OPERATOR');
        return customizeMaybe(block, node);
    }

    praxlyGenerator['praxly_print_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            type: 'PRINT',
            value: praxlyGenerator[expression?.type](expression),
            comment: block.getCommentText(),
        })
    }

    praxlyGenerator['praxly_random_block'] = (block) => {
        return customizeMaybe(block, {
            name: 'random',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [],
        });
    }

    praxlyGenerator['praxly_random_int_block'] = (block) => {
        const expression = block.getInputTargetBlock('MAX');
        return customizeMaybe(block, {
            name: 'randomInt',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
              praxlyGenerator[expression?.type](expression),
            ],
        });
    }

    praxlyGenerator['praxly_random_seed_block'] = (block) => {
        const expression = block.getInputTargetBlock('SEED');
        return customizeMaybe(block, {
            name: 'randomSeed',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
              praxlyGenerator[expression?.type](expression),
            ],
        });
    }

    praxlyGenerator['praxly_int_conversion_block'] = (block) => {
        const expression = block.getInputTargetBlock('CONVERSION');
        return customizeMaybe(block, {
            name: 'int',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
              praxlyGenerator[expression?.type](expression),
            ],
        });
    }

    praxlyGenerator['praxly_float_conversion_block'] = (block) => {
        const expression = block.getInputTargetBlock('CONVERSION');
        return customizeMaybe(block, {
            name: 'float',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
              praxlyGenerator[expression?.type](expression),
            ],
        });
    }

    praxlyGenerator['praxly_min_block'] = (block) => {
        const a = block.getInputTargetBlock('A_MIN');
        const b = block.getInputTargetBlock('B_MIN');
        return customizeMaybe(block, {
            name: 'min',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
                praxlyGenerator[a?.type](a),
                praxlyGenerator[b?.type](b),
            ],
        });
    }

    praxlyGenerator['praxly_max_block'] = (block) => {
        const a = block.getInputTargetBlock('A_MAX');
        const b = block.getInputTargetBlock('B_MAX');
        return customizeMaybe(block, {
            name: 'max',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
                praxlyGenerator[a?.type](a),
                praxlyGenerator[b?.type](b),
            ],
        });
    }

    praxlyGenerator['praxly_abs_block'] = (block) => {
        const expression = block.getInputTargetBlock('VALUE');
        return customizeMaybe(block, {
            name: 'abs',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
                praxlyGenerator[expression?.type](expression),
            ],
        });
    }

    praxlyGenerator['praxly_log_block'] = (block) => {
        const expression = block.getInputTargetBlock('VALUE');
        return customizeMaybe(block, {
            name: 'log',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
                praxlyGenerator[expression?.type](expression),
            ],
        });
    }

    praxlyGenerator['praxly_sqrt_block'] = (block) => {
        const expression = block.getInputTargetBlock('VALUE');
        return customizeMaybe(block, {
            name: 'sqrt',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [
                praxlyGenerator[expression?.type](expression),
            ],
        });
    }

    praxlyGenerator['praxly_input_block'] = (block) => {
        return customizeMaybe(block, {
            name: 'input',
            blockID: block.id,
            type: NODETYPES.BUILTIN_FUNCTION_CALL,
            args: [],
        });
    }

    praxlyGenerator['praxly_statement_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            type: NODETYPES.STATEMENT,
            value: praxlyGenerator[expression?.type](expression),
        })
    }

    praxlyGenerator['praxly_array_reference_block'] = (block) => {
        var index = block.getInputTargetBlock("INDEX");
        return customizeMaybe(block, {
            blockID: block.id,
            type: NODETYPES.LOCATION,
            name: block.getFieldValue("VARIABLENAME"),
            index: praxlyGenerator[index?.type](index),
            isArray: true,
        })
    }

    praxlyGenerator['praxly_array_create_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        var variableName = block.getFieldValue("VARIABLENAME");
        var elemType = block.getFieldValue('ELEMTYPE');
        var arrayLength = block.getInputTargetBlock('LENGTH');

        return customizeMaybe(block, {
            type: NODETYPES.ARRAY_CREATE,
            varType: varType,
            name: variableName,
            elemType: elemType,
            arrayLength: praxlyGenerator[arrayLength?.type](arrayLength),
            isArray: true,
            blockID: block.id,
        });
    }

    // NOTE: praxly_literal_block and praxly_variable_block work the same way.
    // The only differences are the color of the outline and the error message
    // when invalid. Ideally this code would not be duplicated.

    praxlyGenerator['praxly_literal_block'] = (block) => {
        const input = block.getFieldValue('LITERAL');
        const node = {
            blockID: block.id,
            isArray: false,
            value: input,
        }
        if (input[0] === '\"' && input[input.length - 1] === '\"') {
            node.type = TYPES.STRING;
            node.value = input.slice(1, -1);
        } else if (input[0] === '\'' && input[input.length - 1] === '\'') {
            node.type = NODETYPES.CHAR;
            node.value = input.slice(1, -1);
        } else if (input.includes('.')) {
            node.type = TYPES.DOUBLE;
        } else if (containsOnlyNumbers(input)) {
            node.type = TYPES.INT;
        } else if (isValidIdentifier(input)) {
            node.type = NODETYPES.LOCATION;
            node.name = input;
        } else {
            node.type = TYPES.INVALID;
            node.value = "literal: " + input;
        }
        return customizeMaybe(block, node);
    }

    praxlyGenerator['praxly_variable_block'] = (block) => {
        const input = block.getFieldValue('LITERAL');
        const node = {
            blockID: block.id,
            isArray: false,
            value: input,
        }
        if (input[0] === '\"' && input[input.length - 1] === '\"') {
            node.type = TYPES.STRING;
            node.value = input.slice(1, -1);
        } else if (input[0] === '\'' && input[input.length - 1] === '\'') {
            node.type = NODETYPES.CHAR;
            node.value = input.slice(1, -1);
        } else if (input.includes('.')) {
            node.type = TYPES.DOUBLE;
        } else if (containsOnlyNumbers(input)) {
            node.type = TYPES.INT;
        } else if (isValidIdentifier(input)) {
            node.type = NODETYPES.LOCATION;
            node.name = input;
        } else {
            node.type = TYPES.INVALID;
            node.value = "variable: " + input;
        }
        return customizeMaybe(block, node);
    }

    praxlyGenerator['praxly_boolean_operators_block'] = (block) => {
        const children = block.getChildren(true);
        const a = children[0];
        const b = children[1];
        const node = {
            blockID: block.id,
            left: praxlyGenerator[a?.type](a),
            right: praxlyGenerator[b?.type](b)
        }
        node.type = block.getFieldValue('OPERATOR');
        return customizeMaybe(block, node);
    }

    praxlyGenerator['praxly_compare_block'] = (block) => {
        const children = block.getChildren(true);
        const a = children[0];
        const b = children[1];
        const node = {
            blockID: block.id,
            left: praxlyGenerator[a?.type](a),
            right: praxlyGenerator[b?.type](b)
        }
        node.type = block.getFieldValue('OPERATOR');
        return customizeMaybe(block, node);
    }

    praxlyGenerator['praxly_true_block'] = (block) => {
        return customizeMaybe(block, {
            blockID: block.id,
            value: true,
            type: NODETYPES.BOOLEAN,
        });
    }

    praxlyGenerator['praxly_false_block'] = (block) => {
        return customizeMaybe(block, {
            blockID: block.id,
            value: false,
            type: NODETYPES.BOOLEAN,
        });
    }

    praxlyGenerator['praxly_comment_block'] = (block) => {
        return customizeMaybe(block, {
            blockID: block.id,
            value: block.getFieldValue('COMMENT'),
            type: NODETYPES.COMMENT,
        });
    }

    praxlyGenerator['praxly_single_line_comment_block'] = (block) => {
        return customizeMaybe(block, {
            blockID: block.id,
            value: block.getFieldValue('COMMENT'),
            type: NODETYPES.SINGLE_LINE_COMMENT,
        });
    }

    praxlyGenerator['praxly_emptyline_block'] = (block) => {
        return customizeMaybe(block, {
            blockID: block.id,
            type: NODETYPES.NEWLINE,
        });
    }

    praxlyGenerator['praxly_if_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return customizeMaybe(block, {
            type: NODETYPES.IF,
            blockID: block.id,
            condition: praxlyGenerator[condition?.type](condition),
            codeblock: praxlyGenerator['codeBlockJsonBuilder'](statements)
        })
    }

    praxlyGenerator['praxly_if_else_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        const alternative = block.getInputTargetBlock("ALTERNATIVE");
        return customizeMaybe(block, {
            type: NODETYPES.IF_ELSE,
            blockID: block.id,
            condition: praxlyGenerator[condition?.type](condition),
            codeblock: praxlyGenerator['codeBlockJsonBuilder'](statements),
            alternative: praxlyGenerator['codeBlockJsonBuilder'](alternative),
        })
    }

    praxlyGenerator['praxly_vardecl_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        var variableName = block.getFieldValue('VARIABLENAME');
        return customizeMaybe(block, {
            type: NODETYPES.VARDECL,
            name: variableName,
            blockID: block.id,
            varType: varType,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
        })
    }

    // Note: declaration and assignment (as a statement)
    praxlyGenerator['praxly_assignment_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var value = praxlyGenerator[expression?.type](expression);
        return customizeMaybe(block, {
            type: NODETYPES.VARDECL,
            name: variableName,
            value: value,
            blockID: block.id,
            varType: varType,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
        })
    }

    praxlyGenerator['praxly_array_assignment_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        var variableName = block.getFieldValue('VARIABLENAME');
        var args = block.getInputTargetBlock('EXPRESSION');
        var argschildren = args?.getChildren(true);
        var argsList = [];
        argschildren?.forEach(element => {
            argsList.push(praxlyGenerator[element?.type](element));
        });

        return customizeMaybe(block, {
            type: 'ARRAY_ASSIGNMENT',
            name: variableName,
            value: {
                blockID: args?.id,
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
        })
    }

    praxlyGenerator['praxly_reassignment_block'] = (block) => {
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var value = praxlyGenerator[expression?.type](expression);
        return customizeMaybe(block, {
            type: NODETYPES.ASSIGNMENT,
            name: variableName,
            value: value,
            blockID: block.id,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
        })
    }

    praxlyGenerator['praxly_array_reference_reassignment_block'] = (block) => {
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var indexInput = block.getInputTargetBlock('INDEX');
        var value = praxlyGenerator[expression?.type](expression);
        var index = praxlyGenerator[indexInput?.type](indexInput);
        return customizeMaybe(block, {
            type: NODETYPES.ARRAY_REFERENCE_ASSIGNMENT,
            name: variableName,
            index: index,
            value: value,
            blockID: block.id,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
                isArray: true,
                index: index,
            },
        })
    }

    // declaration and assignment (likely in a for loop)
    praxlyGenerator['praxly_assignment_expression_block'] = (block) => {
        var varType = block.getFieldValue('VARTYPE');
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var value = praxlyGenerator[expression?.type](expression);
        return customizeMaybe(block, {
            type: NODETYPES.VARDECL,
            name: variableName,
            value: value,
            blockID: block.id,
            varType: varType,
            location: {
                name: variableName,
                type: NODETYPES.LOCATION,
            },
        })
    }

    praxlyGenerator['praxly_reassignment_expression_block'] = (block) => {
        var location = block.getInputTargetBlock('LOCATION');
        var expression = block.getInputTargetBlock('EXPRESSION');
        var loc = praxlyGenerator[location?.type](location);
        var value = praxlyGenerator[expression?.type](expression);
        return customizeMaybe(block, {
            type: NODETYPES.ASSIGNMENT,
            name: loc?.name,
            location: loc,
            value: value,
            blockID: block.id,
        })
    }

    praxlyGenerator['praxly_while_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return customizeMaybe(block, {
            type: NODETYPES.WHILE,
            blockID: block.id,
            condition: praxlyGenerator[condition?.type](condition),
            codeblock: praxlyGenerator['codeBlockJsonBuilder'](statements)
        });
    }

    praxlyGenerator['praxly_do_while_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return customizeMaybe(block, {
            type: NODETYPES.DO_WHILE,
            blockID: block.id,
            condition: praxlyGenerator[condition?.type](condition),
            codeblock: praxlyGenerator['codeBlockJsonBuilder'](statements)
        });
    }

    praxlyGenerator['praxly_repeat_until_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return customizeMaybe(block, {
            type: NODETYPES.REPEAT_UNTIL,
            blockID: block.id,
            condition: praxlyGenerator[condition?.type](condition),
            codeblock: praxlyGenerator['codeBlockJsonBuilder'](statements)
        });
    }

    praxlyGenerator['praxly_not_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            type: NODETYPES.NOT,
            value: praxlyGenerator[expression?.type](expression),
        })
    }

    praxlyGenerator['praxly_negate_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            type: NODETYPES.NEGATE,
            value: praxlyGenerator[expression?.type](expression),
        })
    }

    praxlyGenerator['praxly_for_loop_block'] = (block) => {
        var initialization = block.getInputTargetBlock('INITIALIZATION');
        var condition = block.getInputTargetBlock("CONDITION");
        var reassignment = block.getInputTargetBlock('REASSIGNMENT');
        const statements = block.getInputTargetBlock("CODEBLOCK");
        return customizeMaybe(block, {
            type: NODETYPES.FOR,
            blockID: block.id,
            initialization: praxlyGenerator[initialization?.type](initialization),
            condition: praxlyGenerator[condition?.type](condition),
            increment: praxlyGenerator[reassignment?.type](reassignment),
            codeblock: praxlyGenerator['codeBlockJsonBuilder'](statements),
        });
    }

    praxlyGenerator['praxly_procedure_block'] = (block) => {
        var returnType = block.getFieldValue('RETURNTYPE');
        var args = block.getInputTargetBlock('PARAMS');
        var argschildren = args?.getChildren(true);
        var argsList = [];
        argschildren?.forEach(element => {
            var param = [];
            param[0] = (element?.getFieldValue('VARTYPE'));
            param[1] = element?.getFieldValue('VARIABLENAME');
            argsList.push(param);
        });
        var procedureName = block.getFieldValue('PROCEDURE_NAME');
        const statements = block.getInputTargetBlock("CODEBLOCK");
        block.setFieldValue(procedureName, 'END_PROCEDURE_NAME');
        return customizeMaybe(block, {
            type: NODETYPES.FUNCDECL,
            name: procedureName,
            params: argsList,
            returnType: returnType,
            codeblock: praxlyGenerator['codeBlockJsonBuilder'](statements),
            blockID: block.id,
        })
    }

    praxlyGenerator['praxly_function_call_block'] = (block) => {
        var procedureName = block.getFieldValue('PROCEDURE_NAME');
        var args = block.getInputTargetBlock('PARAMS');
        var argschildren = args?.getChildren(true);
        var argsList = [];
        argschildren?.forEach(element => {
            argsList.push(praxlyGenerator[element?.type](element));
        });
        return customizeMaybe(block, {
            blockID: block.id,
            type: NODETYPES.FUNCCALL,
            name: procedureName,
            args: argsList,
        })
    }

    praxlyGenerator['praxly_return_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            type: NODETYPES.RETURN,
            value: praxlyGenerator[expression?.type](expression),
        })
    }

    praxlyGenerator['praxly_charAt_block'] = (block) => {
        const procedureName = StringFuncs.CHARAT;
        const expression = block.getInputTargetBlock('EXPRESSION');
        const index = block.getInputTargetBlock('INDEX');
        return customizeMaybe(block, {
            blockID: block.id,
            name: procedureName,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression?.type](expression),
            right: {
                name: procedureName,
                args: [praxlyGenerator[index?.type](index)],
                type: NODETYPES.FUNCCALL
            }
        });
    }

    praxlyGenerator['praxly_contains_block'] = (block) => {
        const procedureName = StringFuncs.CONTAINS;
        const expression = block.getInputTargetBlock('EXPRESSION');
        const param = block.getInputTargetBlock('PARAM');
        return customizeMaybe(block, {
            blockID: block.id,
            name: procedureName,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression?.type](expression),
            right: {
                name: procedureName,
                args: [praxlyGenerator[param?.type](param)],
                type: NODETYPES.FUNCCALL
            }
        });
    }

    praxlyGenerator['praxly_indexOf_block'] = (block) => {
        const procedureName = StringFuncs.INDEXOF;
        const expression = block.getInputTargetBlock('EXPRESSION');
        const param = block.getInputTargetBlock('PARAM');
        return customizeMaybe(block, {
            blockID: block.id,
            name: procedureName,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression?.type](expression),
            right: {
                name: procedureName,
                args: [praxlyGenerator[param?.type](param)],
                type: NODETYPES.FUNCCALL
            }
        });
    }

    praxlyGenerator['praxly_length_block'] = (block) => {
        const procedureName = StringFuncs.LENGTH;
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            name: procedureName,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression?.type](expression),
            right: {
                name: procedureName,
                args: []
            }
        });
    }

    praxlyGenerator['praxly_substring_block'] = (block) => {
        const procedureName = StringFuncs.SUBSTRING;
        const expression = block.getInputTargetBlock('EXPRESSION');
        const param1 = block.getInputTargetBlock('PARAM1');
        const param2 = block.getInputTargetBlock('PARAM2');
        return customizeMaybe(block, {
            blockID: block.id,
            name: procedureName,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression?.type](expression),
            right: {
                name: procedureName,
                args: [praxlyGenerator[param1?.type](param1),
                       praxlyGenerator[param2?.type](param2)],
                type: NODETYPES.FUNCCALL
            }
        });
    }

    praxlyGenerator['praxly_toLowerCase_block'] = (block) => {
        const procedureName = StringFuncs.TOLOWERCSE;
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            name: procedureName,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression?.type](expression),
            right: {
                name: procedureName,
                args: []
            }
        });
    }

    praxlyGenerator['praxly_toUpperCase_block'] = (block) => {
        const procedureName = StringFuncs.TOUPPERCASE;
        const expression = block.getInputTargetBlock('EXPRESSION');
        return customizeMaybe(block, {
            blockID: block.id,
            name: procedureName,
            type: NODETYPES.SPECIAL_STRING_FUNCCALL,
            left: praxlyGenerator[expression?.type](expression),
            right: {
                name: procedureName,
                args: []
            }
        });
    }

    return praxlyGenerator;
}
