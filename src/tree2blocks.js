import { textEditor } from "./lexer-parser";



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
      else{
        console.log("connection failed");
      }
    }
  }




export const tree2blocks = (workspace, blockjson) => {
    try{
        // console.log(blockjson.type);
    } catch (error)  {
        // console.error('An error occurred: could not generate block from text', error);
        return 0; 
    }
    
    switch(blockjson?.type) {
        case 'COMMENT':
            var result = workspace.newBlock('praxly_comment_block');
            result.setFieldValue(blockjson.value, "COMMENT");
            break;     

        case 'INT':
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(blockjson.value, "LITERAL");
            break;

        case 'BOOLEAN':
            var result = 0;
            if (blockjson.value === 'true') {
                result = workspace.newBlock('praxly_true_block');                  
            }
            if (blockjson.value === 'false') {
                result = workspace.newBlock('praxly_false_block');                  
            }
            break;

        case 'STRING':
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue('\"' + blockjson.value + '\"', "LITERAL");
            break;
             
        case 'DOUBLE':
        case 'CHAR':
            var result = workspace.newBlock('praxly_literal_block');
            result.setFieldValue(blockjson.value, "LITERAL");
            break;
             
        case 'ADD':         
        case 'SUBTRACT':
        case 'MULTIPLY':
        case 'DIVIDE':
        case 'EXPONENT':
        case 'MOD':
            var result = workspace.newBlock('praxly_arithmetic_block');
            var a = tree2blocks(workspace, blockjson?.left);
            var b = tree2blocks(workspace, blockjson?.right);
            result.setFieldValue(blockjson.type, "OPERATOR");
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            break;
             
        case 'AND':
        case 'OR':
            var result = workspace.newBlock('praxly_boolean_operators_block');
            var a = tree2blocks(workspace, blockjson?.left);
            var b = tree2blocks(workspace, blockjson?.right);
            result.setFieldValue(blockjson.type, "OPERATOR");
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            break;

        case 'EQUALS':
        case 'LESS_THAN_EQUAL':
        case 'GREATER_THAN_EQUAL':
        case 'GREATER_THAN':
        case 'LESS_THAN':
        case 'NOT_EQUAL':
            var result = workspace.newBlock('praxly_compare_block');
            var a = tree2blocks(workspace, blockjson?.left);
            var b = tree2blocks(workspace, blockjson?.right);
            result.getInput('A_OPERAND').connection.connect(a?.outputConnection);
            result.getInput('B_OPERAND').connection.connect(b?.outputConnection);
            result.setFieldValue(blockjson.type, "OPERATOR");
            break;
        
        case 'PRINT':
            var result = workspace.newBlock('praxly_print_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;
            
        case 'CODEBLOCK':
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
        case 'PROGRAM':
            return tree2blocks(workspace, blockjson.value);
        case 'STATEMENT':
            return tree2blocks(workspace, blockjson?.value);
            
        case 'IF':
            var result = workspace.newBlock('praxly_if_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            break;
             
        case 'IF_ELSE':
            var result = workspace.newBlock('praxly_if_else_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var statements = tree2blocks(workspace, blockjson?.statement);
            var alternatives = tree2blocks(workspace, blockjson?.alternative);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            result.getInput('STATEMENT').connection.connect(statements[0]?.previousConnection);
            result.getInput('ALTERNATIVE').connection.connect(alternatives[0]?.previousConnection);
            break;
             
        case 'VARIABLE':
            var result = workspace.newBlock('praxly_variable_block');
            result.setFieldValue(blockjson.name, "LITERAL");
            break;
             

        case 'ASSIGNMENT':
            var expression = tree2blocks(workspace, blockjson?.value); 
            if (blockjson.varType === 'reassignment'){
                var result = workspace.newBlock('praxly_reassignment_block');
            }
            else {
                var result = workspace.newBlock('praxly_assignment_block');
                result.setFieldValue(blockjson.varType.substring(7), "VARTYPE");
            }
            result.setFieldValue(blockjson.name, "VARIABLENAME");
            result.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
            break;
             
        case 'WHILE':
            var result = workspace.newBlock('praxly_while_loop_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            break;
             
        case 'DO_WHILE':
            var result = workspace.newBlock('praxly_do_while_loop_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            break;
             
        case 'REPEAT_UNTIL':
            var result = workspace.newBlock('praxly_repeat_until_loop_block');
            var condition = tree2blocks(workspace, blockjson?.condition);
            var codeblocks = tree2blocks(workspace, blockjson?.statement);
            result.getInput('CONDITION').connection.connect(condition?.outputConnection);
            result.getInput('STATEMENT').connection.connect(codeblocks[0]?.previousConnection);
            break;
             
        case 'NOT':
            var result = workspace.newBlock('praxly_not_block');
            var child = tree2blocks(workspace, blockjson?.value);
            result.getInput('EXPRESSION').connection.connect(child?.outputConnection);
            break;
             
        case 'FOR':

            var result = workspace.newBlock('praxly_for_loop_block');
            try {
                var initialization = workspace.newBlock('praxly_assignment_expression_block');
                var incriment = workspace.newBlock('praxly_reassignment_expression_block');
                var expression = tree2blocks(workspace, blockjson?.initialization.value); 
                initialization.setFieldValue(blockjson?.initialization.varType.substring(7), "VARTYPE");
                initialization.setFieldValue(blockjson?.initialization.name, "VARIABLENAME");
                initialization.getInput('EXPRESSION').connection.connect(expression?.outputConnection);
                result.getInput('INITIALIZATION').connection.connect(initialization?.outputConnection);
                var condition = tree2blocks(workspace, blockjson?.condition);
                result.getInput('CONDITION').connection.connect(condition.outputConnection);
                var expression2 = tree2blocks(workspace, blockjson?.incriment.value); 
                incriment.setFieldValue(blockjson?.incriment.name, "VARIABLENAME");
                incriment.getInput('EXPRESSION').connection.connect(expression2?.outputConnection);
                result.getInput('REASSIGNMENT').connection.connect(incriment?.outputConnection);
                var codeblocks = tree2blocks(workspace, blockjson?.statement);
                result.getInput('CODEBLOCK').connection.connect(codeblocks[0]?.previousConnection);
                initialization.initSvg();
                incriment.initSvg();
            }
            catch (error)  {
                console.error('An error occurred: could not generate the nested block', error);
                initialization.dispose();
                incriment.dispose();

            }
            break;

        default: 
            return null;


    }
    blockjson.blockID = result.id;
    result.initSvg();
    return result;
     
}
