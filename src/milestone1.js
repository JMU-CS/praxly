
// import { workspace } from "./main";

// import { highlightError, indextoAceRange } from "./milestone2";
// import { textEditor } from "./milestone2";
// import { block } from "blockly/core/tooltip";
import { sendRuntimeError } from "./milestone2";
import { printBuffer } from "./milestone2";
import { addToPrintBuffer } from "./milestone2";


var scopes = {};
// export var printBuffer = "";
// export var errorOutput = "";
// export var blockErrorsBuffer = {};




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
                console.error('assignment error: ', error);
                return null;
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
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'WHILE':
            try{
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_while(condition, statement, blockjson);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
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
        case 'FUNCTION_ASSIGNMENT':
            var contents = createExecutable(blockjson.contents);
            return new Praxly_function_assignment(blockjson.returnType, blockjson.name, blockjson.params, contents, blockjson);
        case 'FUNCTION_CALL':
            var args = [];
            blockjson.params.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_function_call(blockjson.name, args, blockjson);
        


            

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

class Praxly_double {
    constructor( value , blockjson ) {
        this.jsonType = 'Praxly_double';
        this.json = blockjson;
        this.value = value;

    }

}

class Praxly_float {
    constructor( value  , blockjson) {
        this.jsonType = 'Praxly_float';
        this.json = blockjson;
        this.value = Math.floor(value);

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
        this.jsonType = 'Praxly_char';

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

class Praxly_print {
      
    constructor(value  , blockjson){
        this.json = blockjson;
        this.expression = value;
    }
    evaluate(environment) {
        
        addToPrintBuffer((this.expression.evaluate(environment).value.toString()) + '<br>');
        return null;
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
        this.praxly_blocks.forEach(element => {
            try{
                element.evaluate(environment);
            } catch (error)  {
                console.error('An error occurred: empty statement', error);
            }
            
        });
        return "Exit_Success";
    }
}



class Praxly_assignment {
    constructor( json, type, name, expression, blockjson){
        this.json = blockjson;
        this.type = type;
        this.name = name;
        this.value = expression;
        
    }
    evaluate(environment) {
        // if it is a reassignment, the variable must be in the list and have a matching type. 
        if (this.type === "reassignment"){
            // console.log(variableList);
            if (!environment.variableList.hasOwnProperty(this.name)){
                console.error(`Error: variable name ${this.name} not in the variablelist: \n ${environment.variableList}`);
            }
    
            if (environment.variableList[this.name].evaluate(environment).jsonType !== this.value.evaluate(environment).jsonType){
                console.error("Error: varible reassignment does not match declared type:");
            }
          
        } else {
            if (this.value.evaluate(environment).jsonType !== this.type){
                console.error(`Error: varible assignment does not match declared type:\n expression type: ${environment.variableList[this.name].evaluate(environment).jsonType} \n type: ${type}`);
            }
            // environment.variableList[this.name] = this.expression;
                  
        }
        environment.variableList[this.name] = this.value.evaluate(environment);
    }
}

class Praxly_variable {
    constructor(json, name, blockjson){
        this.json = blockjson;
        this.name = name;
    }
    evaluate(environment){
        if (!environment.variableList.hasOwnProperty(this.name)){
            sendRuntimeError('this variable is not recognized by the program. Perhaps you forgot to initialize it?', blockjson);
            console.error("Error: variable name not in the variablelist:");
        }
        return environment.variableList[this.name];
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
        this.error = 'error\n';
    }
    evaluate(environment) {
        addToPrintBuffer( this.error);
    }
}

class Praxly_function_assignment{
    constructor(returnType, name, params, contents, blockjson){
        this.returnType = returnType;
        this.name = name;
        this.params = params;
        this.contents = contents;
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
    }
    
    //this one was tricky
    evaluate(environment){
        var functionParams = environment.functionList[this.name].params;
        var functionContents = environment.functionList[this.name].contents;
        if (functionParams.length !== this.args.length){
            console.error(`incorrect amount of arguments passed, expected ${functionParams.length}, was ${this.args.length}`);
            return;
        }
        var newScope = JSON.parse(JSON.stringify(environment));
        // copy the new parameters to the duplicate of the global scope
        for (let i = 0; i < this.args.length; i++){
            let parameterName = functionParams[i][1];
            let parameterType = functionParams[i][0];
            let argument = this.args[i];
            //TODO: typecheck
            newScope.variableList[parameterName] = argument;
        }
        console.log(`here is the new scope in the function named ${this.name}`);
        console.log(newScope);
        let result = functionContents.evaluate(newScope);
        //TODO: tpyecheck that it matches the returnType
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
    if (
      (op1 instanceof Praxly_int && op2 instanceof Praxly_int) ||
      (op1 instanceof Praxly_double && op2 instanceof Praxly_double)
    ) {
      return ResultType.INT;
    } else if (
      op1 instanceof Praxly_int ||
      op2 instanceof Praxly_int ||
      op1 instanceof Praxly_double ||
      op2 instanceof Praxly_double ||
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
  


