
// import { workspace } from "./main";


import { appendAnnotation, sendRuntimeError } from "./lexer-parser";
import { printBuffer } from "./lexer-parser";
import { addToPrintBuffer } from "./lexer-parser";



var scopes = {};

// new 08/24/23
// this will be the error that will halt execution and return code. 
class ReturnException extends Error {
    constructor(errorData) {
      super(`attempting to return. this should return ${errorData}`);
      this.name = this.constructor.name;
      this.errorData = errorData;
    }
  }


// export function clearOutput() {
//     printBuffer = "";
//     errorOutput = "";
//     blockErrorsBuffer = {};
// }





export const createExecutable = (blockjson) => {
    if (typeof blockjson === 'undefined' || typeof blockjson.type === 'undefined'  ) {
        console.error('error constructing the tree: reached an invalid branch that is either undefined or has an undefined type');
        return new Praxly_invalid(blockjson);
      }
      


    console.log(blockjson.type);
    switch(blockjson.type) {
        case 'INT':
            return new Praxly_int( blockjson.value, blockjson);
        case 'STRING':
            return new Praxly_String(blockjson.value, blockjson);
        case 'BOOLEAN':
            return new Praxly_boolean( blockjson.value, blockjson);
        case 'DOUBLE':
            return new Praxly_double( blockjson.value, blockjson);
        case 'ADD':
            return new Praxly_addition(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'SUBTRACT':
            return new Praxly_subtraction(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'MULTIPLY':
            return new Praxly_multiplication(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'DIVIDE':
            return new Praxly_division(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'EXPONENT':
            return new Praxly_exponent(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'MOD':
            return new Praxly_modulo(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'AND':
            return new Praxly_and(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'OR':
            return new Praxly_or(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'EQUALS':
            return new Praxly_equals(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'LESS_THAN_EQUAL':
            return new Praxly_less_than_equal(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'GREATER_THAN_EQUAL':
            return new Praxly_greater_than_equal(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'GREATER_THAN':
            return new Praxly_greater_than(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'LESS_THAN':
            return new Praxly_less_than(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        case 'NOT_EQUAL':
            return new Praxly_not_equals(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);
        
        
        case 'PRINT':
            return new Praxly_print(createExecutable(blockjson.value), blockjson);

        case 'PRINTLN':
            return new Praxly_println(createExecutable(blockjson.value), blockjson);

        case 'CODEBLOCK':
            let statements = blockjson.statements;
            
            let result = statements.map((statement) => {
                try {
                    return createExecutable(statement);
                } catch (error)  {
                    // console.error('An error occurred: empty statement', error);
                    return new Praxly_emptyLine(blockjson);
                    
                }
                
            });
            return new Praxly_codeBlock(result);

        case 'PROGRAM':
            // variableList = {};
            scopes = {
                global: {
                    variableList: {}, 
                    functionList: {},

                }
            };
            return new Praxly_program(createExecutable( blockjson.value));
            
        case 'STATEMENT':
            try {
                return new Praxly_statement( createExecutable(blockjson.value), blockjson);
            } catch (error)  {
                // console.error('An error occurred: empty statement', error);
                return new Praxly_emptyLine(blockjson);
            }

        case 'IF':
            try{
                return new Praxly_if(createExecutable(blockjson.condition), createExecutable(blockjson.statement), blockjson);
            }
            catch (error) {

                sendRuntimeError('there is an error with this statement. it is likely empty or has something invalid', blockjson);
                // console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'IF_ELSE':
            try{
                return new Praxly_if_else(createExecutable(blockjson.condition), createExecutable(blockjson.statement), createExecutable(blockjson.alternative), blockjson);
            }
            catch (error) {
                sendRuntimeError('there is an error with this statement. it is likely empty or has something invalid', blockjson);
                // console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'ASSIGNMENT':
            try {
                return new Praxly_assignment(blockjson, blockjson.varType, blockjson.name, createExecutable(blockjson.value), blockjson);
            } 
            catch (error) {
                sendRuntimeError('assignment error', blockjson);
                console.error('assignment error: ', error);
                return null;
            }

        case 'ARRAY_ASSIGNMENT':
            try {
                return new Praxly_array_assignment(blockjson, blockjson.varType, blockjson.name, createExecutable(blockjson.value), blockjson);
            } 
            catch (error) {
                sendRuntimeError('assignment error', blockjson);
                console.error('assignment error: ', error);
                return null;
            }

        
        case 'VARIABLE':
            try {
                return new Praxly_variable(blockjson, blockjson.name, blockjson);
            } 
            catch (error) {
                sendRuntimeError('assignment error', blockjson);
                // console.error('assignment error: ', error);
                return;
            }
        case 'FOR':
            try{
                var initialization = createExecutable(blockjson.initialization);
                var condition = createExecutable(blockjson.condition);
                var incrimentation = createExecutable(blockjson.incriment);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_for(initialization, condition, incrimentation, statement, blockjson);
            }
            catch (error) {
                console.error( error);
                return  new Praxly_statement(null);
            }
        case 'WHILE':
            try{
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_while(condition, statement, blockjson);
            }
            catch (error) {
                console.error( error);
                return  new Praxly_statement(null);
            }
        case 'DO_WHILE':
            try{
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_do_while(condition, statement, blockjson);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'REPEAT_UNTIL':
            try{
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_repeat_until(condition, statement, blockjson);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'NOT':
            return new Praxly_not(createExecutable(blockjson.value), blockjson);
        case 'COMMENT':
            return  new Praxly_comment(blockjson.value, blockjson);
        case 'SINGLE_LINE_COMMENT':
            return  new Praxly_single_line_comment(blockjson.value, blockjson);
        case 'FUNCTION_ASSIGNMENT':
            var contents = createExecutable(blockjson.contents);
            return new Praxly_function_assignment(blockjson.returnType, blockjson.name, blockjson.params, contents, blockjson);
        case 'FUNCTION_CALL':
            var args = [];
            blockjson.params.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_function_call(blockjson.name, args, blockjson);
        case 'RETURN':
            return new Praxly_return(createExecutable(blockjson.value), blockjson);

        case 'ARRAY':
            var args = [];
            blockjson.params.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_array( args, blockjson);
        case 'ARRAY_REFERENCE':
            // console.error(createExecutable(blockjson.index));
            return new Praxly_array_reference(blockjson.name, createExecutable(blockjson.index), blockjson);
            //go here

        case 'ARRAY_REFERENCE_ASSIGNMENT':
            return new Praxly_array_reference_assignment(blockjson.name, createExecutable(blockjson.index), createExecutable(blockjson.value), blockjson);
        
        case 'INVALID':
            return new Praxly_invalid(blockjson);

        default: 
            console.error(`I donot recognize this type: ${blockjson.type}}`);
            

    }
}

class Praxly_array_reference_assignment{
    constructor(name, index, value, blockjson){
        this.json = blockjson;
        this.name = name; 
        this.value = value;
        this.index = index;

    }
    evaluate(environment){
        environment.variableList[this.name].elements[this.index.evaluate(environment).value] = this.value.evaluate(environment);
    }
}

class Praxly_single_line_comment {
    constructor(value, blockjson){
        this.jsonType = 'Praxly_single_line_comment';
        this.json = blockjson;
        this.value = value;
    }

    evaluate(environment) {
        return;
    }
}


class Praxly_comment {
    constructor(value, blockjson) {
        this.jsonType = 'Praxly_comment';
        this.json = blockjson;
        this.value = value;
    }
    evaluate(environment) {
        return;
    }

}

class Praxly_int {
    constructor( value, blockjson ) {
        this.jsonType = 'Praxly_int';
        this.json = blockjson;
        this.value = Math.floor(value);
        this.realType = TYPES.INT;
    }
    evaluate(environment) {
        return this;
    }

}

class Praxly_short {
    constructor( value, blockjson ) {
        this.jsonType = 'Praxly_int';
        this.json = blockjson;
        this.value = Math.floor(value);
        this.realType = TYPES.SHORT;
    }
    evaluate(environment) {
        return this;
    }

}

class Praxly_double {
    constructor( value , blockjson ) {
        this.jsonType = 'Praxly_double';
        this.json = blockjson;
        this.value = parseFloat(value).toFixed(1);
        this.realType = TYPES.DOUBLE;

    }
    evaluate(environment) {
        return this;
    }

}

class Praxly_float {
    constructor( value , blockjson ) {
        this.jsonType = 'Praxly_double';
        this.json = blockjson;
        this.value = parseFloat(value).toFixed(1);
        this.realType = TYPES.FLOAT;

    }
    evaluate(environment) {
        return this;
    }

}

class Praxly_boolean {
    constructor( value  , blockjson) {
        this.json = blockjson;
        this.jsonType = 'Praxly_boolean';
        this.value = value;
        this.realType = TYPES.BOOLEAN;

    }
    evaluate(environment) {
        return this;
    }

}

class Praxly_char {
    constructor( value  , blockjson) {
        this.value = value;
        this.json = blockjson;
        this.jsonType = 'Praxly_String';
        this.realType = TYPES.CHAR;

    }
    evaluate(environment) {
        return this;
    }

}

class Praxly_String {
    constructor( value  , blockjson) {
        this.jsonType = 'Praxly_String';
        this.json = blockjson;
        this.value = value;
        this.realType = TYPES.STRING;
    }
    evaluate(environment) {
        return this;
    }
}

class Praxly_array{
    constructor(elements, blockjson){
        this.elements = elements;
        this.blockjson = blockjson;
        this.jsonType = 'Praxly_array';
    }
    evaluate(environment){
        return this;
    }
}

class Praxly_print {
      
    constructor(value  , blockjson){
        this.json = blockjson;
        this.expression = value;
    }
    evaluate(environment) {
        // console.log(this.expression.evaluate(environment));
        addToPrintBuffer((this.expression.evaluate(environment).value.toString()));
        return null;
    }
}

class Praxly_println {
      
    constructor(value  , blockjson){
        this.json = blockjson;
        this.expression = value;
    }
    evaluate(environment) {
        // console.log(this.expression.evaluate(environment));
        addToPrintBuffer((this.expression.evaluate(environment).value.toString()) + '<br>');
        return null;
    }
}



class Praxly_return {
      
    constructor(value  , blockjson){
        this.json = blockjson;
        this.expression = value;
        this.isreturn = true;
    }
    evaluate(environment) {
        // console.log(this.expression.evaluate(environment));
        throw new ReturnException(this.expression.evaluate(environment));
        // return this.expression.evaluate(environment);
    }
}

class Praxly_addition {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.ADDITION, a.realType, b.realType, this.json), a.value + b.value); 
    }
}

class Praxly_subtraction {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate(environment)   {
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.SUBTRACTION, a.realType, b.realType, this.json), a.value - b.value); 
    }
}

class Praxly_multiplication {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate(environment)   {
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.MULTIPLICATION, a.realType, b.realType, this.json), a.value * b.value); 
    }
}

class Praxly_division {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate(environment)   {
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.DIVISION, a.realType, b.realType, this.json), a.value / b.value); 
    }
}

class Praxly_modulo {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate(environment)   {
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.MODULUS, a.realType, b.realType, this.json), a.value % b.value); 
    }
}

class Praxly_exponent {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate(environment)   {
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.EXPONENTIATION, a.realType, b.realType, this.json), a.value ** b.value); 
    }
}

class Praxly_and {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.AND, a.realType, b.realType, this.json), a.value && b.value); 
    }      
}

class Praxly_or {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        let b = this.b_operand.evaluate(environment);
        let a = this.a_operand.evaluate(environment);
        return litNode_new(master_typecheck(OP.OR, a.realType, b.realType, this.json), a.value || b.value); 
    }      
}

class Praxly_equals {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        return new Praxly_boolean( this.a_operand.evaluate(environment).value === this.b_operand.evaluate(environment).value);
    }      
}

class Praxly_not_equals {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        return new Praxly_boolean( this.a_operand.evaluate(environment).value != this.b_operand.evaluate(environment).value);
    }      
}

class Praxly_greater_than {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        return new Praxly_boolean( this.a_operand.evaluate(environment).value > this.b_operand.evaluate(environment).value);
    }      
}

class Praxly_less_than {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        return new Praxly_boolean( this.a_operand.evaluate(environment).value < this.b_operand.evaluate(environment).value);
    }      
}

class Praxly_greater_than_equal {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        return new Praxly_boolean( this.a_operand.evaluate(environment).value >= this.b_operand.evaluate(environment).value);
    }      
}

class Praxly_less_than_equal {
    a_operand  ;
    b_operand  ;

    constructor(a, b, blockjson  ) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment)   {
        return new Praxly_boolean( this.a_operand.evaluate(environment).value <= this.b_operand.evaluate(environment).value);
    }      
}

class Praxly_if {
    constructor(condition, code, blockjson) {
        this.json = blockjson;
        this.condition = condition;
        this.code = code;
    }
    evaluate(environment) {
        if(this.condition.evaluate(environment).value) {
            this.code.evaluate(environment);
        }
        return 'success';
    }
}

class Praxly_if_else {
    constructor(condition, code, alternitive, blockjson) {
        this.json = blockjson;
        this.condition = condition;
        this.code = code;
        this.alternitive = alternitive;
    }
    evaluate(environment) {
        if(this.condition.evaluate(environment).value) {
            this.code.evaluate(environment);
        } else {
            this.alternitive.evaluate(environment);
        }
        return 'success';
    }
}



// this might be useless but it it meant to package statements 
class Praxly_statement {
    constructor(contents){
        this.contents = contents;
    }
    evaluate(environment){
        try{
            return this.contents.evaluate(environment);
        } catch (error)  {
            // addError('error from index ');
            // console.error('An error occurred: empty statement', error);
            return; 
        }
        
        
    }
}



// this is a wrapper for the whole program
class Praxly_program {
    constructor(codeblockk) {
        this.codeBlock = codeblockk;
    }
    evaluate() {
        return this.codeBlock.evaluate(scopes.global);
    }
}

class Praxly_codeBlock {
    constructor(praxly_blocks) {
        this.praxly_blocks = praxly_blocks;
        console.log(this.praxly_blocks);

    }
    evaluate(environment) {
        // let exitLoop = false;
      
        for (let i = 0; i < this.praxly_blocks.length; i++) {
          const element = this.praxly_blocks[i];
        
          //aborts if it detects a return statement. Hopefully this doesn't cause problems later ahaha
              if (element?.isreturn) {
                return element.evaluate(environment);       
            } else {
                element.evaluate(environment);
            }
        } 
      
        return "Exit_Success";
      }

}



class Praxly_assignment {
    constructor( json, type, name, expression, blockjson){
        this.json = blockjson;
        this.type = type;
        this.name = name;
        this.value = expression;
        // console.error(this.value);
    }
    evaluate(environment) {
        // if it is a reassignment, the variable must be in the list and have a matching type. 
        let valueEvaluated = this.value.evaluate(environment);
        if (this.type === "reassignment"){
            let currentStoredVariableEvaluated = environment.variableList[this.name].evaluate(environment);
            // console.log(variableList);
            if (!environment.variableList.hasOwnProperty(this.name)){
                sendRuntimeError(`Error: variable name ${this.name} does not currently exist in this scope: \n ${environment.variableList}`, this.json);
            }
    
            if (!can_assign(currentStoredVariableEvaluated.realType, valueEvaluated.realType)){
                sendRuntimeError(`Error: varible reassignment does not match declared type: \n\t Expected: `
                + `${currentStoredVariableEvaluated.realType}, \n\t Actual: ${valueEvaluated.realType}`, this.json);
                // sendRuntimeError("Error: varible reassignment does not match declared type:", this.json);
            }
          
        } else {
            // if (environment.variableList.hasOwnProperty(this.name)){
            //     sendRuntimeError(`variable ${this.name}as already been declared in this scope. `)
            // }
            if (!can_assign(this.type, valueEvaluated.realType)){
                
                sendRuntimeError(`varible assignment does not match declared type:\n\texpected type: ${this.type} \n\texpression type: ${valueEvaluated.realType}`, this.json);
            }
            // environment.variableList[this.name] = this.expression;
                  
        }
        environment.variableList[this.name] = valueEvaluated;
    }
}


class Praxly_array_assignment {
    constructor( json, type, name, expression, blockjson){
        this.json = blockjson;
        this.type = type;
        this.name = name;
        this.value = expression;
        console.error(this.value);
    }
    evaluate(environment) {
        // if it is a reassignment, the variable must be in the list and have a matching type. 
        let valueEvaluated = this.value.evaluate(environment);   
            for (var k = 0; k < valueEvaluated.elements.length; k++){
                if (valueEvaluated.elements[k].jsonType !== this.type){
                    
                    sendRuntimeError(`at least one element in the array did not match declared type:\n\texpected type: ${this.type.slice(7)} \n\texpression type: ${valueEvaluated.jsonType}`, this.json);
                }
            }
        environment.variableList[this.name] = valueEvaluated;
    }
}








class Praxly_variable {
    constructor(json, name, blockjson){
        this.json = blockjson;
        this.name = name;
    }
    evaluate(environment){
        if (!environment.variableList.hasOwnProperty(this.name)){
            sendRuntimeError(`the variable \'${this.name}\' is not recognized by the program. \n\tPerhaps you forgot to initialize it?`, this.json);
            return new Praxly_invalid(this.json);
        }
        return environment.variableList[this.name];
    }
}


class Praxly_array_reference {
    constructor(name, index,  blockjson){
        this.json = blockjson;
        this.name = name;
        this.index = index;
    }
    evaluate(environment){
        if (!environment.variableList.hasOwnProperty(this.name)){
            sendRuntimeError(`the variable \'${this.name}\' is not recognized by the program. \n\tPerhaps you forgot to initialize it?`, this.json);
            return new Praxly_invalid(this.json);
        }
        return environment.variableList[this.name].elements[this.index.evaluate(environment).value].evaluate(environment);
    }
}



class Praxly_for {
    constructor(initialization, condition, incrimentation, statement, blockjson){
        this.json = blockjson;
        this.initialization = initialization;
        this.condition = condition; 
        this.incrimentation = incrimentation;
        this.statement = statement;
    }
    evaluate(environment) {
        this.initialization.evaluate(environment);
        var loopLimit = 0;
        while (loopLimit < 500 && this.condition.evaluate(environment).value) {
            this.statement.evaluate(environment);
            this.incrimentation.evaluate(environment);

        }
    }
}

class Praxly_while {
    constructor(condition, statement, blockjson){
        this.json = blockjson;
        this.condition = condition; 
        this.statement = statement;
    }
    evaluate(environment) {
        var loopLimit = 0;
        while (loopLimit < 500 && this.condition.evaluate(environment).value) {
            this.statement.evaluate(environment);
        }
    }
}
class Praxly_do_while {
    constructor(condition, statement, blockjson){
        this.json = blockjson;
        this.condition = condition; 
        this.statement = statement;
    }
    evaluate(environment) {
        this.statement.evaluate(environment);
        var loopLimit = 0;
        while (loopLimit < 500 && this.condition.evaluate(environment).value) {
            this.statement.evaluate(environment);
        }
    }
}
class Praxly_repeat_until {
    constructor(condition, statement, blockjson){
        this.json = blockjson;
        this.condition = condition; 
        this.statement = statement;
    }
    evaluate(environment) {
        var loopLimit = 0;
        this.statement.evaluate(environment);
        while (loopLimit < 500 && ! this.condition.evaluate(environment).value) {
            this.statement.evaluate(environment);
        }
    }
}

class Praxly_not {
    constructor(value  , blockjson){
        this.json = blockjson;
        this.expression = value;
    }

    evaluate(environment) {
        return new Praxly_boolean(!this.expression.evaluate(environment).value);
    }
}

class Praxly_invalid {
    constructor() {
        this.value = 'error';
        
    }
    evaluate(environment) {
        console.error(`invalid tree. Problem detected here:`);
        // throw new Error('problem');
    }
}

class Praxly_function_assignment{
    constructor(returnType, name, params, contents, blockjson){
        this.returnType = returnType;
        this.name = name;
        this.params = params;
        this.contents = contents;
        this.json = blockjson;
    }
    evaluate(environment){
        environment.functionList[this.name] = {
            returnType: this.returnType,
            params: this.params, 
            contents: this.contents,    
        }
    }
}

class Praxly_function_call {
    constructor(name, args, blockjson){
        this.args = args;
        this.name = name;
        this.json = blockjson;
    }
    
    //this one was tricky
    evaluate(environment){
        var functionParams = environment.functionList[this.name].params;
        var functionContents = environment.functionList[this.name].contents;
        var returnType = environment.functionList[this.name].returnType;
        if (functionParams.length !== this.args.length){
            sendRuntimeError(`incorrect amount of arguments passed, expected ${functionParams.length}, was ${this.args.length}`, this.json);
            console.log(`incorrect amount of arguments passed, expected ${functionParams.length}, was ${this.args.length}`);
            return new Praxly_invalid(this.json);
        }
        // copy the new parameters to the duplicate of the global scope
        // var newScope = JSON.parse(JSON.stringify(environment));
        // var newScope = Object.assign({}, environment);
        var newScope = {
            functionList: environment.functionList, 
            variableList: Object.assign({}, environment.variableList),
        };
        for (let i = 0; i < this.args.length; i++){
            let parameterName = functionParams[i][1];
            let parameterType = functionParams[i][0];
            let argument = this.args[i];
            //TODO: typecheck
            newScope.variableList[parameterName] = argument.evaluate(environment);
        }
        console.log(`here is the new scope in the function named ${this.name}`);
        console.log(newScope);
        //new: add  try/catch
        let result = null;
        console.log(functionContents);
        try{
            result = functionContents.evaluate(newScope);    
        }
        catch (error){
            if (error instanceof ReturnException) {
                result = error.errorData;
                // console.log(res)
            }
            // console.error(`return `, error);
            // console.error(error.errorData);
            
        }

        // due to lack of time, these datatypes will be considered the same. 
        if (returnType === 'short'){
            returnType = 'int';
        }
        if (returnType === 'float'){
            returnType = 'double';
        }
        if ((result === "Exit_Success" && returnType !== 'void') || (returnType !== (result?.jsonType?.slice(7) ?? "void"))){
            sendRuntimeError(`this function has an invalid return type.\n\t Expected: ${returnType}\n\t Actual: ${result?.jsonType?.slice(7) ?? "void"} `, this.json);
            console.error(`invalid return type: ${returnType} `);
        }
        return result;
    }
}

class Praxly_emptyLine{
    constructor(blockjson){
        this.blockjson = blockjson;
    }
    evaluate(environment){
        console.log('newline detected at ');
        console.log(this.blockjson);
        console.log('this should not exist');
    }
}


  export const OP = {
    ASSIGNMENT: "ASSIGNMENT",
    ADDITION: "ADDITION",
    SUBTRACTION: "SUBTRACTION",
    MULTIPLICATION: "MULTIPLICATION",
    DIVISION: "DIVISION",
    MODULUS: "MODULUS",
    EXPONENTIATION: "EXPONENTIATION",
    ASSIGNMENT: "ASSIGNMENT",
    EQUALITY: "EQUALITY",
    INEQUALITY: "INEQUALITY",
    GREATER_THAN: "GREATER THAN",
    LESS_THAN: "LESS THAN",
    GREATER_THAN_OR_EQUAL: "GREATER THAN OR EQUAL",
    LESS_THAN_OR_EQUAL: "LESS THAN OR EQUAL",
    AND: "AND",
    OR: "OR",
    NOT: "NOT",
};


export const TYPES = {
    INT: "INT",
    DOUBLE: "DOUBLE",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    FLOAT: "FLOAT",
    SHORT: "SHORT",
    CHAR: "CHAR",
    VOID: "VOID",
    INVALID: "INVALID"
  };

function can_assign(varType, expressionType) {
    if (varType === TYPES.INT) {
      return expressionType === TYPES.INT || expressionType === TYPES.SHORT || expressionType === TYPES.CHAR;
    } else if (varType === TYPES.DOUBLE) {
      return expressionType === TYPES.INT || expressionType === TYPES.DOUBLE || expressionType === TYPES.FLOAT;
    } else if (varType === TYPES.STRING) {
      return expressionType === TYPES.STRING;
    } else if (varType === TYPES.BOOLEAN) {
      return expressionType === TYPES.BOOLEAN;
    } else if (varType === TYPES.FLOAT) {
      return expressionType === TYPES.INT || expressionType === TYPES.DOUBLE || expressionType === TYPES.FLOAT;
    } else if (varType === TYPES.SHORT) {
      return expressionType === TYPES.SHORT || expressionType === TYPES.CHAR || expressionType === TYPES.INT; 
    } else if (varType === TYPES.CHAR) {
      return expressionType === TYPES.CHAR;
    } else {
      return false; // Invalid varType
    }
  }


function can_add(type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }

    if (type1 === TYPES.STRING || type2 === TYPES.STRING) {
        return TYPES.STRING;
    }

    if (type1 === TYPES.INT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT || type1 === TYPES.SHORT || type1 === TYPES.CHAR) {
        if (type2 === TYPES.INT || type2 === TYPES.DOUBLE || type2 === TYPES.FLOAT || type2 === TYPES.SHORT || type2 === TYPES.CHAR) {
            return TYPES.DOUBLE; // Result is promoted to double for numeric types
        }
    }
    sendRuntimeError(`bad operand tpyes for addition, \n\tleft: ${type1}\n\tright: ${type2}`, json);
    return TYPES.INVALID; // Invalid addition
}

function can_subtract(type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }

    if (type1 === TYPES.INT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT || type1 === TYPES.SHORT || type1 === TYPES.CHAR) {
        if (type2 === TYPES.INT || type2 === TYPES.DOUBLE || type2 === TYPES.FLOAT || type2 === TYPES.SHORT || type2 === TYPES.CHAR) {
            return TYPES.DOUBLE; // Result is promoted to double for numeric types
        }
    }
    sendRuntimeError(`bad operand tpyes for subtraction, \n\tleft: ${type1}\n\tright: ${type2}`, json);
    return TYPES.INVALID; // Invalid subtraction
}

function can_multiply(type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }
    if (type1 === TYPES.INT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT || type1 === TYPES.SHORT || type1 === TYPES.CHAR) {
        if (type2 === TYPES.INT || type2 === TYPES.DOUBLE || type2 === TYPES.FLOAT || type2 === TYPES.SHORT || type2 === TYPES.CHAR) {
            return TYPES.DOUBLE; // Result is promoted to double for numeric types
        }
    }
    sendRuntimeError(`bad operand tpyes for multiplication or exponentiation, \n\tleft: ${type1}\n\tright: ${type2}`, json);
    return TYPES.INVALID; // Invalid multiplication
}

function can_divide(type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }
    if (type1 === TYPES.INT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT || type1 === TYPES.SHORT || type1 === TYPES.CHAR) {
        if (type2 === TYPES.INT || type2 === TYPES.DOUBLE || type2 === TYPES.FLOAT || type2 === TYPES.SHORT || type2 === TYPES.CHAR) {
            if (type1 === TYPES.INT && type2 === TYPES.INT) {
                return TYPES.INT; // Integer division results in an integer
            } else {
                return TYPES.DOUBLE; // Result is promoted to double for numeric types
            }
        }
    }
    sendRuntimeError(`bad operand tpyes for division, \n\tleft: ${type1}\n\tright: ${type2}`, json);
    return TYPES.INVALID; // Invalid division
}

function can_modulus(type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }
    if (type1 === TYPES.INT || type1 === TYPES.SHORT || type1 === TYPES.CHAR) {
        if (type2 === TYPES.INT || type2 === TYPES.SHORT || type2 === TYPES.CHAR) {
            return TYPES.INT; // Modulus of integers is an integer
        }
    }
    sendRuntimeError(`bad operand tpyes for modulus, \n\tleft: ${type1}\n\tright: ${type2}`, json);
    return TYPES.INVALID; // Invalid modulus
}

function can_boolean_operation(operation, type1, type2) {
    if (operation === OP.AND || operation === OP.OR) {
        return type1 === TYPES.BOOLEAN && type2 === TYPES.BOOLEAN ? TYPES.BOOLEAN : TYPES.INVALID;
    } else if (operation === OP.NOT) {
        return type1 === TYPES.BOOLEAN ? TYPES.BOOLEAN : TYPES.INVALID;
    } else {
        return TYPES.INVALID; // Invalid boolean operation
    }
}


function can_compare(operation, type1, type2) {
    if (operation === OP.EQUALITY || operation === OP.INEQUALITY || operation === OP.GREATER_THAN || operation === OP.LESS_THAN || operation === OP.GREATER_THAN_OR_EQUAL || operation === OP.LESS_THAN_OR_EQUAL) {
        if (type1 === type2) {
            return TYPES.BOOLEAN; // Result of comparison is always a boolean
        }
    }

    return TYPES.INVALID; // Invalid comparison operation
}


/* 
this function will take in the operation and the types of the operands and report what type the result will be 
upon evaluation. If the operators are incompatible, then it will throw an error.
*/
function master_typecheck(operation, type1, type2, json) {
    switch(operation) {

        case OP.ADDITION:
            return can_add(type1, type2, json);

        case OP.SUBTRACTION:
            return can_subtract(type1, type2, json);

        case OP.MULTIPLICATION:
        case OP.EXPONENTIATION:
            return can_multiply(type1, type2, json);

        case OP.DIVISION:
            return can_divide(type1, type2, json);

        case OP.MODULUS:
            return can_modulus(type1, type2, json);

        case OP.AND:
        case OP.OR:
        case OP.NOT:
            return can_boolean_operation(operation, type1, type2, json);

        case OP.EQUALITY:
        case OP.INEQUALITY:
        case OP.GREATER_THAN:
        case OP.LESS_THAN:
        case OP.GREATER_THAN_OR_EQUAL:
        case OP.LESS_THAN_OR_EQUAL:
            return can_compare(operation, type1, type2, json);

        default:
            // sendRuntimeError(`bad operand tpyes for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json);
            return TYPES.INVALID; // Invalid operation
    }
}


function litNode_new(type, value){
    switch(type){
        case TYPES.INT:
            return new Praxly_int(value); 
        case TYPES.STRING:
            return new Praxly_String(value);
        case TYPES.DOUBLE:
            return new Praxly_double(value);
        case TYPES.BOOLEAN:
            return new Praxly_boolean(value);
        case TYPES.FLOAT:
            return new Praxly_float(value);
        case TYPES.CHAR:    
            return new Praxly_char(value);
        case TYPES.SHORT:
            return new Praxly_short(value);
        case TYPES.INVALID:
            return new Praxly_invalid();
    }
}