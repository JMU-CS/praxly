
import { workspace } from "./main";
import { tree2blocks } from "./tree2blocks";

// test change

export const tree2text = (blockjson, startIndex, indentation) => {
    
    // try {
        console.log(blockjson.type);
        // console.log(`startindex is ${startIndex}\n`);
        
    // }
    // catch (error) {
    //     console.error('An error occurred: could not generate code for the nested block', error);
    //     return "";
    // }
    switch(blockjson.type) {
        case 'INT':
        case 'BOOLEAN':
            
            try {
                var result = blockjson.value.toString();
                blockjson.startIndex = startIndex;
                blockjson.endIndex = startIndex + result.length;
                blockjson.beg = startIndex;
                blockjson.end = startIndex + result.length;
                return  result;
            }
            catch (error){
                return " ";
            }
        case "VARIABLE":
            try {
                var result = blockjson.name.toString();
                blockjson.startIndex = startIndex;
                blockjson.endIndex = startIndex + result.length;
                blockjson.beg = startIndex;
                blockjson.end = startIndex + result.length;
                return  result;
                
            }
            catch (error){
                return " ";
            }
        case 'STRING':
            try {
                var result = '\"' + blockjson.value + '\"';
                blockjson.startIndex = startIndex;
                blockjson.endIndex = startIndex + result.length;
                blockjson.beg = startIndex;
                blockjson.end = startIndex + result.length;
                return  result;
                
            }
            catch (error){
                return " ";
            }
        case 'COMMENT':
            try {
                var result = '/*' + blockjson.value + '*/\n';
                blockjson.startIndex = startIndex;
                blockjson.endIndex = startIndex + result.length;
                blockjson.beg = startIndex;
                blockjson.end = startIndex + result.length;
                return  result;
                
            }
            catch (error){
                return " ";
            }
        case 'SINGLE_LINE_COMMENT':
            try {
                var result = '// ' + blockjson.value + '\n';
                blockjson.startIndex = startIndex;
                blockjson.endIndex = startIndex + result.length;
                blockjson.beg = startIndex;
                blockjson.end = startIndex + result.length;
                return  result;
                
            }
            catch (error){
                return " ";
            }
        case 'ADD':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " + ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'SUBTRACT':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " - ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'MULTIPLY':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " * ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'DIVIDE':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " / ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'EXPONENT':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " ^ ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'MOD':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " % ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'AND':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " and ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'OR':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " or ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'EQUALS':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " == ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'LESS_THAN_EQUAL':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " <= ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'GREATER_THAN_EQUAL':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " >= ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'GREATER_THAN':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " > ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'LESS_THAN':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = " < ";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;
        case 'NOT_EQUAL':
            blockjson.beg = startIndex;
            var a_operand = tree2text(blockjson.left, startIndex, indentation);
            blockjson.startIndex = a_operand.length;
            var operator = "≠";
            blockjson.endIndex = blockjson.startIndex + operator.length;
            var b_operand = tree2text(blockjson.right, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + b_operand.length;
            return a_operand + operator + b_operand;   
        case 'PRINT':
            
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex; // - indentation???????
            var result = '\t'.repeat(indentation) + "print ";
            blockjson.endIndex = startIndex + result.length;
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
            blockjson.end = blockjson.endIndex + expression.length;
            return result + expression;     

        case 'RETURN':
            
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex; // - indentation???????
            var result = '\t'.repeat(indentation) + "return ";
            blockjson.endIndex = startIndex + result.length;
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
            blockjson.end = blockjson.endIndex + expression.length;
            return result + expression;
            

        case 'PROGRAM': 
            return tree2text(blockjson.value, startIndex, indentation);   
        case 'STATEMENT':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex; // - indentation???????
            var result = '\t'.repeat(indentation);
            blockjson.endIndex = startIndex + result.length;
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
            blockjson.end = blockjson.endIndex + expression.length;
            return result + expression;
        case 'CODEBLOCK':
            var statements = blockjson.statements.map(element => {
                try {
                    return tree2text(element, startIndex, indentation);
                } 
                catch (error) {
                    console.error('An error occurred: empty statement', error);
                    return null;
                }
                
            });
            
            //BIG PROBLEM FOR INDECIES
            return statements.join('');
        case 'IF':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex;
            blockjson.endIndex = startIndex + 2;
            var result = '\t'.repeat(indentation) + "if (" ;
            var condition =  tree2text(blockjson.condition, startIndex + result.length, indentation) + ")\n" ;
            var contents = tree2text(blockjson.statement, startIndex + result.length + condition.length, indentation + 1)
                + '\t'.repeat(indentation) +'end if\n';
            blockjson.end = startIndex + result.length + condition.length + contents.length;
            return result + condition + contents;
        case 'IF_ELSE':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex;
            blockjson.endIndex = startIndex + 2;
            var result = '\t'.repeat(indentation) + "if (" ;
            var condition =  tree2text(blockjson.condition, startIndex + result.length, indentation) + ")\n" ;
            var contents =  tree2text(blockjson.statement, startIndex + result.length + condition.length, indentation + 1);
            var alternative = '\t'.repeat(indentation) +'\else\n' 
            + '\t'.repeat(indentation) + tree2text(blockjson.alternative, startIndex + result.length + condition.length + contents.length, indentation + 1) 
            + '\t'.repeat(indentation) +'end if\n';
            blockjson.end = startIndex + result.length + condition.length + contents.length + alternative.length;
            return result + condition + contents + alternative;

        case 'ASSIGNMENT':
            if (blockjson.varType === 'reassignment') {
                try {
                    blockjson.beg = startIndex;
                    var varname = blockjson.name.toString();
                    blockjson.startIndex = startIndex + varname.length;
                    var operator = ' = ';
                    blockjson.endIndex = blockjson.startIndex + operator.length;
                    var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
                    blockjson.end = blockjson.endIndex + expression.length;
                    return '\t'.repeat(indentation) + varname + operator + expression;
                }
                catch (error){
                    return " ";
                }
            } else {
                try {
                    blockjson.beg = startIndex;
                    var varname = blockjson.varType.toString().substring(7) + ' ' + blockjson.name.toString();
                    blockjson.startIndex = startIndex + varname.length + 1;
                    var operator = ' = ';
                    blockjson.endIndex = blockjson.startIndex + 1;
                    var expression = tree2text(blockjson.value, blockjson.endIndex, indentation) + '\n';
                    blockjson.end = blockjson.endIndex + expression.length;
                    return '\t'.repeat(indentation) + varname + operator + expression;
                }
                catch (error){
                    console.error(error);
                    return " ";
                }
            }
        case 'WHILE':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex + indentation;
            var result = '\t'.repeat(indentation) + "while";
            blockjson.endIndex = blockjson.beg + result.length;
            var condition = " (" + tree2text(blockjson.condition, startIndex + result.length ,indentation) + ")\n" ;
            var  contents = '\t'.repeat(indentation) + tree2text(blockjson.statement, startIndex + result.length + condition.length, indentation + 1) 
            + '\t'.repeat(indentation) +'end while\n';
            blockjson.end = result.length + condition.length + contents.length;
            return result + condition + contents;

        case 'DO_WHILE':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex + indentation;
            var result = '\t'.repeat(indentation) + 'do\n' ;
            blockjson.endIndex = startIndex + result.length;
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.statement, startIndex + result.length ,indentation + 1);
            var condition =  '\t'.repeat(indentation) + "while (" + tree2text(blockjson.condition, startIndex + result.length + contents.length, indentation) + ")\n" ;
            blockjson.end = startIndex + result.length + contents.length + condition.length;
            return result + contents + condition;
            
            
        case 'REPEAT_UNTIL':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex + indentation;
            var result = '\t'.repeat(indentation) + 'repeat\n' ;
            blockjson.endIndex = startIndex + result.length;
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.statement, startIndex + result.length ,indentation + 1);
            var condition =  '\t'.repeat(indentation) + "until (" + tree2text(blockjson.condition, startIndex + result.length + contents.length, indentation) + ")\n" ;
            blockjson.end = startIndex + result.length + contents.length + condition.length;
            return result + contents + condition;
        case 'NOT':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex;
            var result =  "not ";
            blockjson.endIndex = startIndex + result.length;
            var expression = tree2text(blockjson.value, blockjson.endIndex, indentation);
            blockjson.end = blockjson.endIndex + expression.length;
            return result + expression;
        case 'FOR':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex + indentation;
            var result = '\t'.repeat(indentation) + "for";
            blockjson.endIndex = startIndex + result.length;
            var initialization = " (" + tree2text(blockjson.initialization, startIndex + result.length ,indentation);
            initialization = initialization.slice(0, -1) + '; ';
            var condition = tree2text(blockjson.condition, startIndex + result.length + initialization.length, indentation) + '; ';
            var incriment = tree2text(blockjson.incriment, startIndex + result.length + initialization.length + condition.length, indentation);
            incriment = incriment.slice(0, -1) +")\n";
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.statement, startIndex + result.length + initialization.length + condition.length + incriment.length, indentation + 1) 
            + '\t'.repeat(indentation) +'end for\n';
            blockjson.end = startIndex + result.length + initialization.length + condition.length + incriment.length + contents.length;
            return result + initialization + condition + incriment + contents;
        
        case 'FUNCTION_ASSIGNMENT':
            
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex;
            var result = blockjson.returnType + ' ' + blockjson.name + '(';
            blockjson.endIndex = startIndex + result.length - 1;
            var argsList = blockjson.params;
            if (argsList !== null && argsList.length !== 0){
                argsList.forEach(element => {
                    result += element[0] + ' ' + element[1] + ', ';
                });
                result = result.slice(0, result.length - 2)
            }
            result += ')';
            result += '\n';
            var contents = '\t'.repeat(indentation) + tree2text(blockjson.contents, startIndex + result.length, indentation + 1);
            result += contents;
            result += '\t'.repeat(indentation) +`end ${blockjson.name}\n`;
            blockjson.end = startIndex + result.length;
            return result;
        case 'FUNCTION_CALL':
            blockjson.beg = startIndex;
            blockjson.startIndex = startIndex;
            var result =  blockjson.name + '(';
            blockjson.endIndex = startIndex + result.length - 1;
            var argsList = blockjson.params;
            
            if (argsList !== null && argsList.length > 0){
                argsList.forEach(element => {
                    result += tree2text(element, startIndex + result.length, indentation) + ', ';
                });
                result = result.slice(0, result.length - 2);
            }
            result += ')';
            blockjson.end = startIndex + result.length;
            return result;

    }
}
