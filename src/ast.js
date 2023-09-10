
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
        return new Praxly_invalid();
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
        
        
        // more here coming soon
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




        default: 
            console.error(`I donot recognize this type: ${blockjson.type}}`);
            

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
        switch (typecheck("ADD", a, b)) {
            case "INT":
                return new Praxly_int( a.value + b.value); 
            case "STRING":
                return new Praxly_String( a.value + b.value);
            case "DOUBLE":
                return new Praxly_double( a.value + b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value + b.value);
        }   
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
        switch (typecheck("SUBTRACT", a, b)) {
            case "INT":
                return new Praxly_int( a.value - b.value); 
            case "STRING":
                return new Praxly_String( a.value - b.value);
            case "DOUBLE":
                return new Praxly_double( a.value - b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value - b.value);
        }   
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
        switch (typecheck("MULTIPLY", a, b)) {
            case "INT":
                return new Praxly_int( a.value * b.value); 
            case "STRING":
                return new Praxly_String( a.value * b.value);
            case "DOUBLE":
                return new Praxly_double( a.value * b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value * b.value);
        }   
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
        switch (typecheck("DIVISION", a, b)) {
            case "INT":
                return new Praxly_int( a.value / b.value); 
            case "STRING":
                return new Praxly_String( a.value / b.value);
            case "DOUBLE":
                return new Praxly_double( a.value / b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value / b.value);
        }   
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
        switch (typecheck("MODULO", a, b)) {
            case "INT":
                return new Praxly_int( a.value % b.value); 
            case "STRING":
                return new Praxly_String( a.value % b.value);
            case "DOUBLE":
                return new Praxly_double( a.value % b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value % b.value);
        }   
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
        switch (typecheck("EXPONENT", a, b)) {
            case "INT":
                return new Praxly_int( a.value ** b.value); 
            case "STRING":
                return new Praxly_String( a.value ** b.value);
            case "DOUBLE":
                return new Praxly_double( a.value ** b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value ** b.value);
        }   
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
        
        return new Praxly_boolean( this.a_operand.evaluate(environment).value && this.b_operand.evaluate(environment).value);
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
        return new Praxly_boolean( this.a_operand.evaluate(environment).value || this.b_operand.evaluate(environment).value);
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
        console.error(this.value);
    }
    evaluate(environment) {
        // if it is a reassignment, the variable must be in the list and have a matching type. 
        let valueEvaluated = this.value.evaluate(environment);
        if (this.type === "reassignment"){
            let currentStoredVariableEvaluated = environment.variableList[this.name].evaluate(environment);
            // console.log(variableList);
            if (!environment.variableList.hasOwnProperty(this.name)){
                sendRuntimeError(`Error: variable name ${this.name} not in the variablelist: \n ${environment.variableList}`, this.json);
            }
    
            if (currentStoredVariableEvaluated.jsonType !== valueEvaluated.jsonType){
                sendRuntimeError(`Error: varible reassignment does not match declared type: \n\t Expected:`
                + `${currentStoredVariableEvaluated.jsonType.slice(7)}, \n\t Actual: ${valueEvaluated.jsonType.slice(7)}`, this.json);
                sendRuntimeError("Error: varible reassignment does not match declared type:", this.json);
            }
          
        } else {
            //this should allow ints to be assigned to doubles
            if (valueEvaluated.jsonType === "Praxly_int" && this.type === "Praxly_double"){
                // valueEvaluated.value += 0.0;
                valueEvaluated.jsonType = "Praxly_double";
                
            }
            if (valueEvaluated.jsonType !== this.type){
                
                sendRuntimeError(`varible assignment does not match declared type:\n\texpected type: ${this.type.slice(7)} \n\texpression type: ${valueEvaluated.jsonType}`, this.json);
            }
            // environment.variableList[this.name] = this.expression;
                  
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
            return new Praxly_invalid();
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
            return new Praxly_invalid();
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
            return new Praxly_invalid();
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
            console.error(`return `, error);
            console.error(error.errorData);
            
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

//alright, here's the fun function


const ResultType = {
    INT: "INT",
    DOUBLE: "DOUBLE",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    INVALID: "INVALID"
  };
  
  function typecheck(operation, op1, op2) {
    switch (operation) {
      case "ADD":
        return checkAddition(op1, op2);
      case "SUBTRACT":
      case "MULTIPLY":
      case "DIVIDE":
      case "EXPONENT":
      case "MODULO":
        return checkBinaryOperation(op1, op2);
      case "GREATER_THAN":
      case "EQUAL":
      case "LESS_THAN":
      case "GREATER_THAN_EQUAL":
      case "LESSTHAN_EQUAL":
      case "NOT_EQUAL":
        return checkComparisonOperation(op1, op2);
      default:
        console.log("typecheck issue");
        return null;
    }
  }
  
  function checkAddition(op1, op2) {
    if(op1 instanceof Praxly_String || op2 instanceof Praxly_String){
        return ResultType.STRING;
    }
    if (
        (op1 instanceof Praxly_int && op2 instanceof Praxly_double) ||
        (op1 instanceof Praxly_double && op2 instanceof Praxly_int) ||
        (op1 instanceof Praxly_double && op2 instanceof Praxly_double)
      ) {
        return ResultType.DOUBLE;
      } 
    if (op1 instanceof Praxly_int && op2 instanceof Praxly_int) {
      return ResultType.INT;
    } else if (
      op1 instanceof Praxly_String ||
      op2 instanceof Praxly_String
    ) {
      return ResultType.STRING;
    } else {
      return ResultType.INVALID;
    }
  }
  
  function checkComparisonOperation(op1, op2) {
    if (
      (op1 instanceof Praxly_int && op2 instanceof Praxly_int) ||
      (op1 instanceof Praxly_double && op2 instanceof Praxly_double) ||
      (op1 instanceof Praxly_String && op2 instanceof Praxly_String) ||
      (op1 instanceof Praxly_boolean && op2 instanceof Praxly_boolean) ||
      (op1 instanceof Praxly_char && op2 instanceof Praxly_char)
    ) {
      return ResultType.BOOLEAN;
    } else {
      return ResultType.INVALID;
    }
  }
  
  function checkBinaryOperation(op1, op2) {
    if (
      (op1 instanceof Praxly_int && op2 instanceof Praxly_int) ||
      (op1 instanceof Praxly_double && op2 instanceof Praxly_double)
    ) {
      return ResultType.INT;
    } else {
        console.log('we have an issue');
        return ResultType.INVALID;
    }
  
  

  }
