import Blockly from 'blockly';

function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }

export const blocks2tree = (workspace, generator) => {
    var topBlocks = workspace.getTopBlocks();
    
    // console.error(topBlocks);
    if (topBlocks.length === 0){
        return {
            type: 'PROGRAM', 
            blockID: 'blocksRoot', 
            value: 0
        };
    }

    var result = {
        type: 'PROGRAM', 
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
            type: 'CODEBLOCK', 
            blockID: "blocks[]",
        }
        var statements = [];
        let currentBlock = headBlock;
            while (currentBlock.getNextBlock() != null) {
                statements.push(praxlyGenerator[currentBlock.type] (currentBlock));
                currentBlock = currentBlock.getNextBlock();        
            }
            statements.push(praxlyGenerator[currentBlock.type] (currentBlock));
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
            type: 'PRINTLN', 
            value: praxlyGenerator[expression.type](expression),
        } 
    }

    praxlyGenerator['praxly_statement_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION'); 
        return {
            blockID: block.id,
            type: 'STATEMENT', 
            value: praxlyGenerator[expression.type](expression),
        } 
    }





    praxlyGenerator['praxly_array_reference_block'] = (block) => {
        var index = block.getInputTargetBlock("INDEX");
        return {
            blockID: block.id,
            type: 'ARRAY_REFERENCE', 
            name: block.getFieldValue("VARIABLENAME"),
            index: praxlyGenerator[index.type](index),
        } 
    }

    




    praxlyGenerator['praxly_literal_block'] = (block) =>  {
        const input = block.getFieldValue('LITERAL');
        const node = {
            blockID: block.id,
            value: input,
        }
        if (input[0] === '\"' && input[input.length - 1] === '\"') {
            node.type = "STRING";
            node.value = input.slice(1, -1);
        } else if (input.includes('.')) {
            node.type = 'DOUBLE';

        }else if (containsOnlyNumbers(input)) {
            node.type = 'INT';
        } else {
            node.type = 'VARIABLE';
            node.name = input;
        }
        return node;
    }

    praxlyGenerator['praxly_variable_block'] = (block) =>  {
        const input = block.getFieldValue('LITERAL');
        const node = {
            blockID: block.id,
            value: input,
        }
        if (input[0] === '\"' && input[input.length - 1] === '\"') {
            node.type = "STRING";
            node.value = input.slice(1, -1);
        } else if (input.includes('.')) {
            node.type = 'DOUBLE';

        }else if (containsOnlyNumbers(input)) {
            node.type = 'INT';
        } else {
            node.type = 'VARIABLE';
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
            type: "BOOLEAN",
        };
    }

    praxlyGenerator['praxly_false_block'] = (block) => {
        return {
            blockID: block.id,
            value: false,
            type: "BOOLEAN",
        };
    }

    praxlyGenerator['praxly_comment_block'] = (block) => {
        return {
            blockID: block.id,
            value: block.getFieldValue('COMMENT'),
            type: "COMMENT",
        };
    }

    praxlyGenerator['praxly_single_line_comment_block'] = (block) => {
        return {
            blockID: block.id,
            value: block.getFieldValue('COMMENT'),
            type: "SINGLE_LINE_COMMENT",
        };
    }
    
    praxlyGenerator['praxly_if_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: "IF",
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
            type: "IF_ELSE",
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition), 
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements), 
            alternative: praxlyGenerator['codeBLockJsonBuilder'](alternative), 
        }
    


    }

    praxlyGenerator['praxly_assignment_block'] = (block)=> {
        var varType = block.getFieldValue('VARTYPE');
        console.log(`field input is ${varType}`);
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION'); 
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: 'ASSIGNMENT', 
            name: variableName, 
            value: value, 
            blockID: block.id, 
            varType: varType.toUpperCase(),

        }
    }

    praxlyGenerator['praxly_array_assignment_block'] = (block)=> {
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
                type: 'ARRAY',
              }, 
            blockID: block.id, 
            varType: varType.toUpperCase(),

        }
    }

    praxlyGenerator['praxly_reassignment_block'] = (block)=> {
        var varType = block.getFieldValue('VARTYPE');
        console.log(`field input is ${varType}`);
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION'); 
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: 'ASSIGNMENT', 
            name: variableName, 
            value: value, 
            blockID: block.id, 
            varType: 'reassignment'

        }
    }

    praxlyGenerator['praxly_array_reference_reassignment_block'] = (block)=> {

        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION'); 
        var indexInput = block.getInputTargetBlock('INDEX');
        var value = praxlyGenerator[expression.type](expression);
        var index = praxlyGenerator[indexInput.type](indexInput);
        return {
            type: 'ARRAY_REFERENCE_ASSIGNMENT', 
            name: variableName, 
            index: index,
            value: value, 
            blockID: block.id, 

        }
    }


    praxlyGenerator['praxly_assignment_expression_block'] = (block)=> {
        var varType = block.getFieldValue('VARTYPE');
        console.log(`field input is ${varType}`);
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION'); 
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: 'ASSIGNMENT', 
            name: variableName, 
            value: value, 
            blockID: block.id, 
            varType: varType.toUpperCase(),

        }
    }

    praxlyGenerator['praxly_reassignment_expression_block'] = (block)=> {
        var varType = block.getFieldValue('VARTYPE');
        console.log(`field input is ${varType}`);
        var variableName = block.getFieldValue('VARIABLENAME');
        var expression = block.getInputTargetBlock('EXPRESSION'); 
        var value = praxlyGenerator[expression.type](expression);
        return {
            type: 'ASSIGNMENT', 
            name: variableName, 
            value: value, 
            blockID: block.id, 
            varType: 'reassignment'

        }
    }

    praxlyGenerator['praxly_while_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: 'WHILE', 
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition), 
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements)
        };
    }

    praxlyGenerator['praxly_do_while_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: 'DO_WHILE', 
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition), 
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements)
        };
    }

    praxlyGenerator['praxly_repeat_until_loop_block'] = (block) => {
        const condition = block.getInputTargetBlock("CONDITION");
        const statements = block.getInputTargetBlock("STATEMENT");
        return {
            type: 'REPEAT_UNTIL', 
            blockID: block.id,
            condition: praxlyGenerator[condition.type](condition), 
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements)
        };
    }
    praxlyGenerator['praxly_not_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION'); 
        return {
            blockID: block.id,
            type: 'NOT', 
            value: praxlyGenerator[expression.type](expression),
        } 
    }

    praxlyGenerator['praxly_negate_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION'); 
        return {
            blockID: block.id,
            type: 'NEGATE', 
            value: praxlyGenerator[expression.type](expression),
        } 
    }

    praxlyGenerator['praxly_for_loop_block'] = (block) => {
        var initialization = block.getInputTargetBlock('INITIALIZATION');
        var condition = block.getInputTargetBlock("CONDITION");
        var reassignment = block.getInputTargetBlock('REASSIGNMENT');
        const statements = block.getInputTargetBlock("CODEBLOCK");
        return {
            type: 'FOR', 
            blockID: block.id,
            initialization: praxlyGenerator[initialization.type](initialization), 
            statement: praxlyGenerator['codeBLockJsonBuilder'](statements), 
            incriment: praxlyGenerator[reassignment.type](reassignment),
            condition: praxlyGenerator[condition.type](condition),

        };
    }

    praxlyGenerator['praxly_procedure_block'] = (block)=> {
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
            type: 'FUNCTION_ASSIGNMENT', 
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
            type: 'FUNCTION_CALL', 
            name: procedureName, 
            params: argsList, 
        }
    }

    praxlyGenerator['praxly_return_block'] = (block) => {
        const expression = block.getInputTargetBlock('EXPRESSION'); 
        return {
            blockID: block.id,
            type: 'RETURN', 
            value: praxlyGenerator[expression.type](expression),
        }
    }


    return praxlyGenerator;
}



