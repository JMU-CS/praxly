import { TYPES, OP, NODETYPES, PraxlyError, addToPrintBuffer, defaultError, errorOutput } from "./common";

var SCOPES = {};

const FOR_LOOP_LIMIT = 1000001;
const WHILE_LOOP_LIMIT = 1001;

/**
 * this is meant to halt the execution wherever it is at for return statements.
 */
class ReturnException extends Error {
    constructor(errorData) {
        super(`attempting to return. this should return ${errorData}`);
        this.name = this.constructor.name;
        this.errorData = errorData;
    }
}

export const createExecutable = (blockjson) => {
    if (typeof blockjson === 'undefined' || typeof blockjson.type === 'undefined') {
        if (errorOutput.length === 0) {
            defaultError("invalid program.");
        }
        // console.error(blockjson);
        return new Praxly_invalid(blockjson);
    }

    // console.warn(blockjson.type);
    switch (blockjson.type) {

        case TYPES.INT:
            return new Praxly_int(blockjson.value, blockjson);

        case TYPES.STRING:
            return new Praxly_String(blockjson.value, blockjson);

        case TYPES.CHAR:
            return new Praxly_char(blockjson.value, blockjson);

        case TYPES.BOOLEAN:
            return new Praxly_boolean(blockjson.value, blockjson);

        case TYPES.DOUBLE:
            return new Praxly_double(blockjson.value, blockjson);

        case TYPES.NULL:
            return new Praxly_null(blockjson.value, blockjson);

        case NODETYPES.ADDITION:
            return new Praxly_addition(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.SUBTRACTION:
            return new Praxly_subtraction(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.MULTIPLICATION:
            return new Praxly_multiplication(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.DIVISION:
            return new Praxly_division(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.EXPONENTIATION:
            return new Praxly_exponent(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.MODULUS:
            return new Praxly_modulo(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.AND:
            return new Praxly_and(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.OR:
            return new Praxly_or(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.EQUALITY:
            return new Praxly_equals(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.LESS_THAN_OR_EQUAL:
            return new Praxly_less_than_equal(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.GREATER_THAN_OR_EQUAL:
            return new Praxly_greater_than_equal(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.GREATER_THAN:
            return new Praxly_greater_than(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.LESS_THAN:
            return new Praxly_less_than(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.INEQUALITY:
            return new Praxly_not_equals(createExecutable(blockjson.left), createExecutable(blockjson.right), blockjson);

        case NODETYPES.PRINT:
            return new Praxly_print(createExecutable(blockjson.value), blockjson);

        case NODETYPES.PRINTLN:
            return new Praxly_println(createExecutable(blockjson.value), blockjson);

        case NODETYPES.INPUT:
            return new Praxly_input(blockjson);

        case NODETYPES.CODEBLOCK:
            let statements = blockjson.statements;
            let result = statements.map((statement) => {
                // console.error(statement);
                return createExecutable(statement);
            });
            return new Praxly_codeBlock(result);

        case NODETYPES.PROGRAM:
            // variableList = {};
            SCOPES = {
                global: {
                    parent: "root",
                    variableList: {},
                    functionList: {},
                }
            };
            return new Praxly_program(createExecutable(blockjson.value));

        case NODETYPES.STATEMENT:
            return new Praxly_statement(createExecutable(blockjson.value), blockjson);

        case NODETYPES.IF:
            try {
                return new Praxly_if(createExecutable(blockjson.condition), createExecutable(blockjson.statement), blockjson);
            }
            catch (error) {
                // console.error('An error occurred: empty statement', error);
                return new Praxly_statement(null);
            }

        case NODETYPES.IF_ELSE:
            try {
                return new Praxly_if_else(createExecutable(blockjson.condition), createExecutable(blockjson.statement), createExecutable(blockjson.alternative), blockjson);
            }
            catch (error) {
                // console.error('An error occurred: empty statement', error);
                return new Praxly_statement(null);
            }

        case NODETYPES.ASSIGNMENT:
            try {
                return new Praxly_assignment(blockjson, createExecutable(blockjson.location), createExecutable(blockjson.value), blockjson);
            }
            catch (error) {
                console.error('assignment error: ', error);
                return null;
            }

        case NODETYPES.VARDECL:
            var location = createExecutable(blockjson.location);
            if (blockjson.value !== undefined) {
                return new Praxly_vardecl(blockjson, location, createExecutable(blockjson.value));
            } else {
                return new Praxly_vardecl(blockjson, location, undefined);
            }

        case NODETYPES.ARRAY_ASSIGNMENT:
            try {
                return new Praxly_array_assignment(blockjson, createExecutable(blockjson.location), createExecutable(blockjson.value));
            }
            catch (error) {
                console.error('assignment error: ', error);
                return null;
            }

        case NODETYPES.LOCATION:
            try {
                var index = null;
                if (blockjson.isArray) {
                    index = createExecutable(blockjson.index);
                }
                return new Praxly_Location(blockjson, index);
            }
            catch (error) {
                // console.error('assignment error: ', error);
                return;
            }

        case NODETYPES.FOR:
            try {
                var initialization = createExecutable(blockjson.initialization);
                var condition = createExecutable(blockjson.condition);
                var incrementation = createExecutable(blockjson.increment);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_for(initialization, condition, incrementation, statement, blockjson);
            }
            catch (error) {
                console.error(error);
                return new Praxly_statement(null);
            }

        case NODETYPES.WHILE:
            try {
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_while(condition, statement, blockjson);
            }
            catch (error) {
                console.error(error);
                return new Praxly_statement(null);
            }

        case NODETYPES.DO_WHILE:
            try {
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_do_while(condition, statement, blockjson);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return new Praxly_statement(null);
            }

        case NODETYPES.REPEAT_UNTIL:
            try {
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_repeat_until(condition, statement, blockjson);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return new Praxly_statement(null);
            }

        case NODETYPES.NOT:
            return new Praxly_not(createExecutable(blockjson.value), blockjson);

        case NODETYPES.NEGATE:
            return new Praxly_negate(createExecutable(blockjson.value), blockjson);

        case NODETYPES.COMMENT:
            return new Praxly_comment(blockjson.value, blockjson);

        case NODETYPES.SINGLE_LINE_COMMENT:
            return new Praxly_single_line_comment(blockjson.value, blockjson);

        case NODETYPES.FUNCDECL:
            var contents = createExecutable(blockjson.contents);
            return new Praxly_function_declaration(blockjson.returnType, blockjson.name, blockjson.params, contents, blockjson);

        case NODETYPES.FUNCCALL:
            var args = [];
            blockjson.args.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_function_call(blockjson.name, args, blockjson);

        case NODETYPES.RETURN:
            return new Praxly_return(createExecutable(blockjson.value), blockjson);

        case NODETYPES.ARRAY_LITERAL:
            var args = [];
            blockjson.params.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_array_literal(args, blockjson);

        case NODETYPES.ARRAY_REFERENCE:
            // console.error(createExecutable(blockjson.index));
            return new Praxly_array_reference(blockjson.name, createExecutable(blockjson.index), blockjson);

        //gohere

        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT:
            return new Praxly_array_reference_assignment(blockjson.name, createExecutable(blockjson.index), createExecutable(blockjson.value), blockjson);

        case 'INVALID':
            return new Praxly_invalid(blockjson);

        case 'EMPTYLINE':
            return new Praxly_emptyLine(blockjson);

        default:
            console.error(`I don't recognize this type: ${blockjson.type}}`);
    }
}

class Praxly_array_reference_assignment {

    constructor(name, index, value, blockjson) {
        this.json = blockjson;
        this.name = name;
        this.value = value;
        this.index = index;
    }

    evaluate(environment) {
        environment.variableList[this.name].elements[this.index.evaluate(environment).value] = this.value.evaluate(environment);
    }
}

class Praxly_single_line_comment {

    constructor(value, blockjson) {
        this.jsonType = 'Praxly_single_line_comment';
        this.json = blockjson;
        this.value = value;
    }

    evaluate(environment) {
    }
}

class Praxly_comment {

    constructor(value, blockjson) {
        this.jsonType = 'Praxly_comment';
        this.json = blockjson;
        this.value = value;
    }

    evaluate(environment) {
    }
}

class Praxly_int {

    constructor(value, blockjson) {
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

    constructor(value, blockjson) {
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

    constructor(value, blockjson) {
        this.jsonType = 'Praxly_double';
        this.json = blockjson;
        this.value = parseFloat(value);
        this.realType = TYPES.DOUBLE;
    }

    evaluate(environment) {
        return this;
    }
}

class Praxly_float {

    constructor(value, blockjson) {
        this.jsonType = 'Praxly_double';
        this.json = blockjson;
        this.value = parseFloat(value);
        this.realType = TYPES.FLOAT;
    }

    evaluate(environment) {
        return this;
    }
}

class Praxly_boolean {

    constructor(value, blockjson) {
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

    constructor(value, blockjson) {
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

    constructor(value, blockjson) {
        this.jsonType = 'Praxly_String';
        this.json = blockjson;
        this.value = value;
        this.realType = TYPES.STRING;
    }

    evaluate(environment) {
        return this;
    }
}

class Praxly_null {

    constructor(value, blockjson) {
        this.jsonType = 'Praxly_null';
        this.json = blockjson;
        this.value = value;
        this.realType = TYPES.NULL;
    }

    evaluate(environment) {
        return this;
    }
}

class Praxly_array_literal {

    constructor(elements, blockjson) {
        this.elements = elements;
        this.blockjson = blockjson;
        this.jsonType = 'Praxly_array';

        // set array type to "largest type" of element
        let types = ["boolean", "char", "short", "int", "float", "double", "String"];
        let max_type = -1;
        for (let i = 0; i < elements.length; i++) {
            let cur_type = types.indexOf(elements[i].realType);
            if (cur_type > max_type) {
                max_type = cur_type;
            }
        }
        this.realType = types[max_type] + "[]";
    }

    evaluate(environment) {
        return this;
    }
}

function valueToString(child, json) {
    if (child === "Exit_Success") {
        throw new PraxlyError("no value returned from void procedure", json.line);
    }
    var result;
    if (child.jsonType === 'Praxly_array') {
        let values = child.elements.map(valueToString);
        result = '{' + values.join(", ") + '}';
    } else {
        result = child.value.toString();
        if (child.realType === TYPES.DOUBLE || child.realType === TYPES.FLOAT) {
            if (result.indexOf('.') === -1) {
                result += '.0';
            }
        }
    }
    return result;
}

class Praxly_print {

    constructor(value, blockjson) {
        this.json = blockjson;
        this.expression = value;
    }

    evaluate(environment) {
        var child = this.expression.evaluate(environment);
        var result = valueToString(child, this.json);
        addToPrintBuffer(result);
        return null;
    }
}

class Praxly_println {

    constructor(value, blockjson) {
        this.json = blockjson;
        this.expression = value;
    }

    evaluate(environment) {
        var child = this.expression.evaluate(environment);
        var result = valueToString(child, this.json);
        addToPrintBuffer(result + '<br>');
        return null;
    }
}

class Praxly_input {

    constructor(blockjson) {
        this.json = blockjson;
    }

    evaluate(environment) {
        var result = prompt("input");
        if (result === null) {
            throw new PraxlyError("input canceled", this.json.line);
        }
        // addToPrintBuffer(`<b>${result}</b><br>`);
        return new Praxly_String(result, this.json);
    }
}

class Praxly_return {

    constructor(value, blockjson) {
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
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        return litNode_new(binop_typecheck(OP.ADDITION, a.realType, b.realType, this.json), a.value + b.value);
    }
}

class Praxly_subtraction {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        return litNode_new(binop_typecheck(OP.SUBTRACTION, a.realType, b.realType, this.json), a.value - b.value);
    }
}

class Praxly_multiplication {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        return litNode_new(binop_typecheck(OP.MULTIPLICATION, a.realType, b.realType, this.json), a.value * b.value);
    }
}

class Praxly_division {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        if (b.value === 0) {
            throw new PraxlyError("division by zero", this.json.line);
        }
        return litNode_new(binop_typecheck(OP.DIVISION, a.realType, b.realType, this.json), a.value / b.value);
    }
}

class Praxly_modulo {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        if (b.value === 0) {
            throw new PraxlyError("division by zero", this.json.line);
        }
        return litNode_new(binop_typecheck(OP.MODULUS, a.realType, b.realType, this.json), a.value % b.value);
    }
}

class Praxly_exponent {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        return litNode_new(binop_typecheck(OP.EXPONENTIATION, a.realType, b.realType, this.json), a.value ** b.value);
    }
}

class Praxly_and {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        return litNode_new(binop_typecheck(OP.AND, a.realType, b.realType, this.json), a.value && b.value);
    }
}

class Praxly_or {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        let a = this.a_operand.evaluate(environment);
        let b = this.b_operand.evaluate(environment);
        return litNode_new(binop_typecheck(OP.OR, a.realType, b.realType, this.json), a.value || b.value);
    }
}

class Praxly_equals {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        return new Praxly_boolean(this.a_operand.evaluate(environment).value === this.b_operand.evaluate(environment).value);
    }
}

class Praxly_not_equals {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        return new Praxly_boolean(this.a_operand.evaluate(environment).value != this.b_operand.evaluate(environment).value);
    }
}

class Praxly_greater_than {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        return new Praxly_boolean(this.a_operand.evaluate(environment).value > this.b_operand.evaluate(environment).value);
    }
}

class Praxly_less_than {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        return new Praxly_boolean(this.a_operand.evaluate(environment).value < this.b_operand.evaluate(environment).value);
    }
}

class Praxly_greater_than_equal {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        return new Praxly_boolean(this.a_operand.evaluate(environment).value >= this.b_operand.evaluate(environment).value);
    }
}

class Praxly_less_than_equal {
    a_operand;
    b_operand;

    constructor(a, b, blockjson) {
        this.json = blockjson;
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate(environment) {
        return new Praxly_boolean(this.a_operand.evaluate(environment).value <= this.b_operand.evaluate(environment).value);
    }
}

class Praxly_if {

    constructor(condition, code, blockjson) {
        this.json = blockjson;
        this.condition = condition;
        this.code = code;
    }

    evaluate(environment) {
        if (this.condition.evaluate(environment).value) {
            this.code.evaluate(environment);
        }
        return 'success';
    }
}

class Praxly_if_else {

    constructor(condition, code, alternative, blockjson) {
        this.json = blockjson;
        this.condition = condition;
        this.code = code;
        this.alternative = alternative;
    }

    evaluate(environment) {
        if (this.condition.evaluate(environment).value) {
            this.code.evaluate(environment);
        } else {
            this.alternative.evaluate(environment);
        }
        return 'success';
    }
}

// this might be useless but it is meant to package statements
class Praxly_statement {

    constructor(contents) {
        this.contents = contents;
    }

    evaluate(environment) {
        try {
            return this.contents.evaluate(environment);
        } catch (error) {
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
        return this.codeBlock.evaluate(SCOPES.global);
    }
}

class Praxly_codeBlock {
    constructor(praxly_blocks) {
        this.praxly_blocks = praxly_blocks;
        // console.log(this.praxly_blocks);
    }

    evaluate(environment) {
        var newScope = {
            parent: environment,
            functionList: {},
            variableList: {},
        };

        for (let i = 0; i < this.praxly_blocks.length; i++) {
            const element = this.praxly_blocks[i];

            //aborts if it detects a return statement. Hopefully this doesn't cause problems later ahaha
            if (element?.isreturn) {
                return element.evaluate(newScope);
            } else {
                // console.error(element);
                element.evaluate(newScope);
            }
        }
        return "Exit_Success";
    }
}

// searches through the linked list to find the nearest match to enable shadowing.
function accessLocation(environment, json) {
    // console.error(`looking for ${json.name}`);
    // console.warn(environment.variableList);

    if (environment.variableList.hasOwnProperty(json.name)) {
        return environment.variableList;
    } else if (environment.parent === "root") {
        return null;
        // throw new PraxlyError(`Variable ${json.name} does not exist.`, json.line);
    } else {
        return accessLocation(environment.parent, json);
    }
}

// converts the evaluated value to the variable's type when assigned.
function typeCoercion(varType, praxlyObj) {
    if (varType === praxlyObj.realType) {
        return praxlyObj;
    }
    var newValue;
    switch (varType) {
        case NODETYPES.BOOLEAN:
            newValue = Boolean(praxlyObj.value);
            return new Praxly_boolean(newValue, praxlyObj.json);
        case NODETYPES.CHAR:
            newValue = String.fromCharCode(praxlyObj.value);
            return new Praxly_char(newValue, praxlyObj.json);
        case NODETYPES.DOUBLE:
            newValue = Number(praxlyObj.value);
            return new Praxly_double(newValue, praxlyObj.json);
        case NODETYPES.FLOAT:
            newValue = Number(praxlyObj.value);
            return new Praxly_float(newValue, praxlyObj.json);
        case NODETYPES.INT:
            newValue = Math.trunc(praxlyObj.value);
            return new Praxly_int(newValue, praxlyObj.json);
        case NODETYPES.SHORT:
            newValue = Math.trunc(praxlyObj.value);
            return new Praxly_short(newValue, praxlyObj.json);
        case NODETYPES.STRING:
            newValue = String(praxlyObj.value);
            return new Praxly_String(newValue, praxlyObj.json);
        default:
            console.error("Unhandled varType:" + varType);
            return praxlyObj;
    }
}

class Praxly_assignment {

    constructor(json, location, expression, blockjson) {
        this.json = blockjson;
        this.location = location;
        this.value = expression;
        // console.error(this.value);
    }

    evaluate(environment) {
        // if it is a reassignment, the variable must be in the list and have a matching type.
        let valueEvaluated = this.value.evaluate(environment);
        var storage = accessLocation(environment, this.location);
        if (!storage) {
            throw new PraxlyError(`Variable ${this.location.name} does not exist.`, this.json.line);
        }

        let currentStoredVariableEvaluated = this.location.evaluate(environment);
        if (!can_assign(currentStoredVariableEvaluated.realType, valueEvaluated.realType, this.json.line)) {
            throw new PraxlyError(`Error: variable reassignment does not match declared type: \n\t Expected: `
                + `${currentStoredVariableEvaluated.realType}, \n\t Actual: ${valueEvaluated.realType}`, this.json.line);
        }

        // console.warn(storage);
        valueEvaluated = typeCoercion(currentStoredVariableEvaluated.realType, valueEvaluated);
        if (this.location.isArray) {
            storage[this.location.name].elements[this.location.index.evaluate(environment).value] = valueEvaluated;
        } else {
            storage[this.location.name] = valueEvaluated;
        }
        return valueEvaluated;
    }
}

class Praxly_vardecl {

    constructor(json, location, expression) {
        this.json = json;
        this.location = location;
        this.value = expression;
        this.name = location.name;
        // console.error(this.value);
    }

    evaluate(environment) {
        let valueEvaluated;
        if (this.value !== undefined) {
            valueEvaluated = this.value.evaluate(environment);
        } else {
            // assign default value (declaration without assignment)
            switch (this.json.varType) {
                case NODETYPES.BOOLEAN:
                    valueEvaluated = new Praxly_boolean(false);
                    break;
                case NODETYPES.CHAR:
                    valueEvaluated = new Praxly_char('?');
                    break;
                case NODETYPES.DOUBLE:
                    valueEvaluated = new Praxly_double(0.0);
                    break;
                case NODETYPES.FLOAT:
                    valueEvaluated = new Praxly_float(0.0);
                    break;
                case NODETYPES.INT:
                    valueEvaluated = new Praxly_int(0);
                    break;
                case NODETYPES.SHORT:
                    valueEvaluated = new Praxly_short(0);
                    break;
                case NODETYPES.STRING:
                    valueEvaluated = new Praxly_String("");
                    break;
                default:
                    console.error("Unhandled varType:" + this.json.varType);
                    break;
            }
        }
        if (environment.variableList.hasOwnProperty(this.name)) {
            throw new PraxlyError(`variable ${this.name} has already been declared in this scope. `, this.json.line);
        }
        // console.error(this.json);
        if (!can_assign(this.json.varType, valueEvaluated.realType, this.json.line)) {
            throw new PraxlyError(`incompatible types: ${valueEvaluated.realType} cannot be converted to ${this.json.varType}`, this.json.line);
        }
        valueEvaluated = typeCoercion(this.json.varType, valueEvaluated);
        environment.variableList[this.name] = valueEvaluated;
        // console.log(environment);
        return;
    }
}

class Praxly_array_assignment {

    constructor(json, location, expression) {
        this.json = json;
        this.location = location;
        this.value = expression;
        this.name = location.name;
        // console.error(this.value);
    }

    evaluate(environment) {
        // if it is a reassignment, the variable must be in the list and have a matching type.
        let valueEvaluated = this.value.evaluate(environment);
        for (var k = 0; k < valueEvaluated.elements.length; k++) {
            if (!can_assign(this.json.varType, valueEvaluated.elements[k].realType, this.json.line)) {
                throw new PraxlyError(`at least one element in the array did not match declared type:\n\texpected type: ${this.json.varType} \n\texpression type: ${valueEvaluated.realType}`, this.json.line);
            }
            valueEvaluated.elements[k] = typeCoercion(this.json.varType, valueEvaluated.elements[k]);
        }
        environment.variableList[this.name] = valueEvaluated;
    }
}

class Praxly_variable {

    constructor(json, name, blockjson) {
        this.json = blockjson;
        this.name = name;
    }

    evaluate(environment) {
        if (!environment.variableList.hasOwnProperty(this.name)) {
            throw new PraxlyError(`the variable \'${this.name}\' is not recognized by the program. \n\tPerhaps you forgot to initialize it?`, this.json.line);
            // return new Praxly_invalid(this.json);
        }
        return environment.variableList[this.name];
    }
}

class Praxly_Location {

    constructor(json, index) {
        this.json = json;
        this.name = json.name;
        this.isArray = json.isArray;
        this.index = index;
    }

    evaluate(environment) {
        var storage = accessLocation(environment, this.json);
        if (!storage) {
            throw new PraxlyError(`Variable ${this.name} does not exist.`, this.json.line);
        }

        if (this.isArray) {
            var index = this.index.evaluate(environment).value;
            if (index >= storage[this.name].elements.length) {
                throw new PraxlyError(`index ${index} out of bounds for array named ${this.name}`, this.json.line);
            }
            return storage[this.name].elements[this.index.evaluate(environment).value].evaluate(environment);
        } else {
            // console.warn(storage);
            // console.warn(this.name);
            // console.warn(storage[this.name]);
            // console.warn(storage[this.name].evaluate(environment));
            return storage[this.name].evaluate(environment);
        }
    }
}

class Praxly_for {

    constructor(initialization, condition, incrementation, statement, blockjson) {
        this.json = blockjson;
        this.initialization = initialization;
        this.condition = condition;
        this.incrementation = incrementation;
        this.statement = statement;
    }

    evaluate(environment) {
        this.initialization.evaluate(environment);
        var loopCount = 0;
        while (loopCount < FOR_LOOP_LIMIT && this.condition.evaluate(environment).value) {
            loopCount += 1;
            this.statement.evaluate(environment);
            this.incrementation.evaluate(environment);
        }
        if (loopCount === FOR_LOOP_LIMIT) {
            throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
        }
    }
}

class Praxly_while {
    constructor(condition, statement, blockjson) {
        this.json = blockjson;
        this.condition = condition;
        this.statement = statement;
    }
    evaluate(environment) {
        var loopCount = 0;
        while (loopCount < WHILE_LOOP_LIMIT && this.condition.evaluate(environment).value) {
            loopCount += 1;
            this.statement.evaluate(environment);
        }
        if (loopCount === WHILE_LOOP_LIMIT) {
            throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
        }
    }
}

class Praxly_do_while {

    constructor(condition, statement, blockjson) {
        this.json = blockjson;
        this.condition = condition;
        this.statement = statement;
    }

    evaluate(environment) {
        var loopCount = 1;
        this.statement.evaluate(environment);
        while (loopCount < WHILE_LOOP_LIMIT && this.condition.evaluate(environment).value) {
            loopCount += 1;
            this.statement.evaluate(environment);
        }
        if (loopCount == WHILE_LOOP_LIMIT) {
            throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
        }
    }
}

class Praxly_repeat_until {

    constructor(condition, statement, blockjson) {
        this.json = blockjson;
        this.condition = condition;
        this.statement = statement;
    }

    evaluate(environment) {
        var loopCount = 1;
        this.statement.evaluate(environment);
        while (loopCount < WHILE_LOOP_LIMIT && !this.condition.evaluate(environment).value) {
            loopCount += 1;
            this.statement.evaluate(environment);
        }
        if (loopCount == WHILE_LOOP_LIMIT) {
            throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
        }
    }
}

class Praxly_not {

    constructor(value, blockjson) {
        this.json = blockjson;
        this.expression = value;
    }

    evaluate(environment) {
        var a = this.expression.evaluate(environment);
        return new litNode_new(binop_typecheck(OP.NOT, a.realType, this.json), !a.value, this.json);
    }
}

class Praxly_negate {

    constructor(value, blockjson) {
        this.json = blockjson;
        this.expression = value;
    }

    evaluate(environment) {
        var a = this.expression.evaluate(environment);
        return new litNode_new(binop_typecheck(OP.NEGATE, a.realType, this.json), -1 * a.value, this.json);
    }
}

class Praxly_invalid {

    constructor() {
        this.value = 'error';
    }

    evaluate(environment) {
        console.info(`invalid tree. Problem detected here:`);
        // throw new Error('problem');
    }
}

class Praxly_function_declaration {

    constructor(returnType, name, params, contents, blockjson) {
        this.returnType = returnType;
        this.name = name;
        this.params = params;
        this.contents = contents;
        this.json = blockjson;
    }

    evaluate(environment) {
        environment.functionList[this.name] = {
            returnType: this.returnType,
            params: this.params,
            contents: this.contents,
        }
    }
}

function findFunction(name, environment, json) {
    if (environment.functionList.hasOwnProperty(name)) {
        return environment.functionList[name];
    } else if (environment.parent === "root") {
        throw new PraxlyError(`Error: function ${name} does not exist.`, json.line);
    } else {
        return findFunction(name, environment.parent, json);
    }
}

class Praxly_function_call {

    constructor(name, args, blockjson) {
        this.args = args;
        this.name = name;
        this.json = blockjson;
    }

    //this one was tricky
    evaluate(environment) {
        var func = findFunction(this.name, environment, this.json);
        var functionParams = func.params;
        var functionContents = func.contents;
        var returnType = func.returnType;
        if (functionParams.length !== this.args.length) {
            throw new PraxlyError(`incorrect amount of arguments passed, expected ${functionParams.length}, was ${this.args.length}`, this.json.line);
        }

        //NEW: parameter list is now a linkedList. expect some errors till I fix it.
        var newScope = {
            parent: environment,
            functionList: {},
            variableList: {},
        };
        for (let i = 0; i < this.args.length; i++) {
            let parameterName = functionParams[i][1];
            let parameterType = functionParams[i][0];
            let argument = this.args[i].evaluate(environment);

            if (can_assign(parameterType, argument.realType, this.json.line)) {
                newScope.variableList[parameterName] = argument;
            } else {
                throw new PraxlyError(`argument ${parameterName} does not match parameter type.\n\tExpected: ${parameterType}\n\tActual: ${argument.realType}`);
            }
        }
        // console.log(`here is the new scope in the function named ${this.name}`);
        // console.log(newScope);

        // call the user's function
        let result = null;
        try {
            // console.log(functionContents);
            result = functionContents.evaluate(newScope);
        }
        catch (error) {
            if (error instanceof ReturnException) {
                result = error.errorData;
            }
            else if (error instanceof RangeError) {
                // most likely infinite recursion
                throw new PraxlyError(error.message, this.json.line);
            }
            else {
                throw error;
            }
        }

        // type check the return value
        if (result === "Exit_Success") {
            if (returnType !== TYPES.VOID) {
                throw new PraxlyError(`function ${this.name} missing return statement`, this.json.line);
            }
        } else if (!can_assign(returnType, result.realType, this.json.line)) {
            throw new PraxlyError(`function ${this.name} returned the wrong type.\n\tExpected: ${returnType}\n\tActual: ${result.realType}`, this.json.line);
        }
        return result;
    }
}

class Praxly_emptyLine {

    constructor(blockjson) {
        this.blockjson = blockjson;
    }

    evaluate(environment) {
        //do nothing
    }
}

function can_assign(varType, expressionType, line) {
    if (varType === expressionType) {
        return true;
    }
    // if assigning arrays, remove the []'s from the type names
    if (varType.endsWith("[]") && expressionType.endsWith("[]")) {
        varType = varType.slice(0, -2);
        expressionType = expressionType.slice(0, -2);
    }

    if (varType === TYPES.INT || varType === TYPES.SHORT) {
        if (expressionType === TYPES.DOUBLE || expressionType === TYPES.FLOAT) {
            throw new PraxlyError(`incompatible types: possible lossy conversion from ${expressionType} to ${varType}`, line);
        }
        return expressionType === TYPES.INT || expressionType === TYPES.SHORT;
    } else if (varType === TYPES.DOUBLE || varType === TYPES.FLOAT) {
        return expressionType === TYPES.INT || expressionType === TYPES.DOUBLE || expressionType === TYPES.FLOAT || expressionType === TYPES.SHORT;
    } else if (varType === TYPES.STRING) {
        return expressionType === TYPES.STRING || expressionType === TYPES.NULL;
    } else if (varType === TYPES.BOOLEAN) {
        return expressionType === TYPES.BOOLEAN;
    } else if (varType === TYPES.CHAR) {
        return expressionType === TYPES.CHAR;
    } else {
        return false; // Invalid varType
    }
}

function can_add(operation, type1, type2, json) {
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
    throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid addition
}

function can_subtract(operation, type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }
    if (type1 === TYPES.INT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT || type1 === TYPES.SHORT || type1 === TYPES.CHAR) {
        if (type2 === TYPES.INT || type2 === TYPES.DOUBLE || type2 === TYPES.FLOAT || type2 === TYPES.SHORT || type2 === TYPES.CHAR) {
            return TYPES.DOUBLE; // Result is promoted to double for numeric types
        }
    }
    throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid subtraction
}

function can_multiply(operation, type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }
    if (type1 === TYPES.INT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT || type1 === TYPES.SHORT || type1 === TYPES.CHAR) {
        if (type2 === TYPES.INT || type2 === TYPES.DOUBLE || type2 === TYPES.FLOAT || type2 === TYPES.SHORT || type2 === TYPES.CHAR) {
            return TYPES.DOUBLE; // Result is promoted to double for numeric types
        }
    }
    throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid multiplication
}

function can_divide(operation, type1, type2, json) {
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
    throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid division
}

function can_modulus(operation, type1, type2, json) {
    if (type1 === type2) {
        return type1;
    }
    if (type1 === TYPES.INT || type1 === TYPES.SHORT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT) {
        if (type2 === TYPES.INT || type2 === TYPES.SHORT || type2 === TYPES.DOUBLE || type2 === TYPES.FLOAT) {
            return TYPES.INT; // Modulus of integers is an integer
        }
    }
    throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid modulus
}

function can_boolean_operation(operation, type1, type2, json) {
    if ((operation === OP.AND || operation === OP.OR) && type1 === TYPES.BOOLEAN && type2 === TYPES.BOOLEAN) {
        return TYPES.BOOLEAN;
    } else if (operation === OP.NOT && type1 === TYPES.BOOLEAN) {
        return TYPES.BOOLEAN;
    }
    throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid boolean operation
}

function can_compare(operation, type1, type2, json) {
    if (operation === OP.EQUALITY || operation === OP.INEQUALITY || operation === OP.GREATER_THAN || operation === OP.LESS_THAN || operation === OP.GREATER_THAN_OR_EQUAL || operation === OP.LESS_THAN_OR_EQUAL) {
        if (type1 === type2) {
            return TYPES.BOOLEAN; // Result of comparison is always a boolean
        }
    }
    throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);
    // throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid comparison operation
}

// yea I know this is sloppy but I am getting tired and I'm running outta time
function can_negate(operation, type1, json) {
    if (operation === OP.NEGATE) {
        if (type1 === TYPES.INT || type1 === TYPES.DOUBLE || type1 === TYPES.FLOAT || type1 === TYPES.SHORT) {
            return type1;
        }
    } if (operation === OP.NOT) {
        if (type1 === TYPES.BOOLEAN) {
            return type1;
        }
    }
    throw new PraxlyError(`bad operand types for ${operation}, \n\tchild: ${type1}`, json.line);
    // throw new PraxlyError(`bad operand types for ${operation}, \n\tleft: ${type1}\n\tright: ${type2}`, json.line);// Invalid comparison operation
}

/**
 * this function will take in the operation and the types of the operands and report what type the result will be
 * upon evaluation. If the operators are incompatible, then it will throw an error.
 * @param {string} operation from the OP enum
 * @param {string} type1 from the TYPES enum
 * @param {string} type2 from the TYPES enum
 * @param {*} json
 * @returns
 */
function binop_typecheck(operation, type1, type2, json) {
    if (type1 === undefined || type2 === undefined) {
        throw new PraxlyError(`missing operand type for ${operation}`, json.line);
    }
    switch (operation) {

        case OP.NOT:
        case OP.NEGATE:
            return can_negate(operation, type1, json);

        case OP.ADDITION:
            return can_add(operation, type1, type2, json);

        case OP.SUBTRACTION:
            return can_subtract(operation, type1, type2, json);

        case OP.MULTIPLICATION:
        case OP.EXPONENTIATION:
            return can_multiply(operation, type1, type2, json);

        case OP.DIVISION:
            return can_divide(operation, type1, type2, json);

        case OP.MODULUS:
            return can_modulus(operation, type1, type2, json);

        case OP.AND:
        case OP.OR:
            return can_boolean_operation(operation, type1, type2, json);

        case OP.EQUALITY:
        case OP.INEQUALITY:
        case OP.GREATER_THAN:
        case OP.LESS_THAN:
        case OP.GREATER_THAN_OR_EQUAL:
        case OP.LESS_THAN_OR_EQUAL:
            return can_compare(operation, type1, type2, json);

        default:
            throw new PraxlyError(`typecheck called when it shouldn't have been`, json.line);// Invalid operation
    }
}

function litNode_new(type, value, json) {
    switch (type) {
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
            console.error(`invalid literal:`);
            console.error(json);
            return new Praxly_invalid();
    }
}
