import {
    TYPES,
    OP,
    NODETYPES,
    PraxlyError,
    consoleOutput,
    consoleInput,
    defaultError,
    errorOutput,
    StringFuncs,
    getDebugMode,
    highlightAstNode,
    textEditor,
    setStepInto,
    getStepInto,
    getStopClicked
} from "./common";
import { generateVariableTable, waitForStep } from "./debugger";
import prand from 'pure-rand';

const FOR_LOOP_LIMIT = 1000000;
const WHILE_LOOP_LIMIT = 1000;

async function stepInto(environment, node, cssClass = "step-marker") {
    if (getStepInto()) {
        let markerId = highlightAstNode(environment, node, cssClass);
        await waitForStep();
        textEditor.session.removeMarker(markerId);
    }
}

async function stepOver(environment, node, cssClass = "step-marker") {
    if (getDebugMode()) {
        await generateVariableTable(environment, 1);
        let markerId = highlightAstNode(environment, node, cssClass);
        await waitForStep();
        textEditor.session.removeMarker(markerId);
    }
}

/**
 * this is meant to halt the execution wherever it is at for return statements.
 */
class ReturnException extends Error {
    constructor(returnValue) {
        super(`attempting to return. this should return ${returnValue}`);
        this.name = this.constructor.name;
        this.returnValue = returnValue;
    }
}

function checkArity(node, expectedArity) {
    const actualArity = node.args.length;
    if (actualArity !== expectedArity) {
        throw new PraxlyError(`Function ${node.name} expects ${expectedArity} parameter${expectedArity === 1 ? '' : 's'}, not ${actualArity}.`, node.line);
    }
}

/**
 * This function will take the Intermediate Representation of the AST and creates an executable version of the tree.
 * This also gives it a chance to run static analysis.
 * @param {*} tree  the abstract Syntax tree Intermediate Representation.
 * @returns
 */
export function createExecutable(tree) {

    switch (tree.type) {

        case TYPES.INT:
            return new Praxly_int(tree.value, tree);

        case TYPES.STRING:
            return new Praxly_String(tree.value, tree);

        case TYPES.CHAR:
            return new Praxly_char(tree.value, tree);

        case TYPES.BOOLEAN:
            return new Praxly_boolean(tree.value, tree);

        case TYPES.DOUBLE:
            return new Praxly_double(tree.value, tree);

        case TYPES.NULL:
            return new Praxly_null(tree.value, tree);

        case NODETYPES.ASSOCIATION:
            return new Praxly_association(createExecutable(tree.expression), tree);

        case NODETYPES.ADDITION:
            return new Praxly_addition(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.SUBTRACTION:
            return new Praxly_subtraction(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.MULTIPLICATION:
            return new Praxly_multiplication(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.DIVISION:
            return new Praxly_division(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.EXPONENTIATION:
            return new Praxly_exponent(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.MODULUS:
            return new Praxly_modulo(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.AND:
            return new Praxly_and(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.OR:
            return new Praxly_or(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.EQUALITY:
            return new Praxly_equals(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.LESS_THAN_OR_EQUAL:
            return new Praxly_less_than_equal(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.GREATER_THAN_OR_EQUAL:
            return new Praxly_greater_than_equal(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.GREATER_THAN:
            return new Praxly_greater_than(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.LESS_THAN:
            return new Praxly_less_than(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.INEQUALITY:
            return new Praxly_not_equals(createExecutable(tree.left), createExecutable(tree.right), tree);

        case NODETYPES.PRINT:
            return new Praxly_print(createExecutable(tree.value), tree);

        case NODETYPES.BUILTIN_FUNCTION_CALL: {
            if (tree.name === 'input') {
                checkArity(tree, 0);
                return new Praxly_input(tree);
            } else if (tree.name === 'random') {
                checkArity(tree, 0);
                return new Praxly_random(tree);
            } else if (tree.name === 'randomInt') {
                checkArity(tree, 1);
                return new Praxly_random_int(createExecutable(tree.args[0]), tree);
            } else if (tree.name === 'randomSeed') {
                checkArity(tree, 1);
                return new Praxly_random_seed(createExecutable(tree.args[0]), tree);
            } else if (tree.name === 'int') {
                checkArity(tree, 1);
                return new Praxly_int_conversion(createExecutable(tree.args[0]), tree);
            } else if (tree.name === 'float') {
                checkArity(tree, 1);
                return new Praxly_float_conversion(createExecutable(tree.args[0]), tree);
            } else if (tree.name === 'min') {
                checkArity(tree, 2);
                return new Praxly_min(createExecutable(tree.args[0]), createExecutable(tree.args[1]), tree);
            } else if (tree.name === 'max') {
                checkArity(tree, 2);
                return new Praxly_max(createExecutable(tree.args[0]), createExecutable(tree.args[1]), tree);
            } else if (tree.name === 'abs') {
                checkArity(tree, 1);
                return new Praxly_abs(createExecutable(tree.args[0]), tree);
            } else if (tree.name === 'log') {
                checkArity(tree, 1);
                return new Praxly_log(createExecutable(tree.args[0]), tree);
            } else if (tree.name == 'sqrt') {
                checkArity(tree, 1);
                return new Praxly_sqrt(createExecutable(tree.args[0]), tree);
            } else {
                throw new Error(`unknown builtin function ${tree.name} (line ${tree.line})`);
            }
        }

        case NODETYPES.SPECIAL_STRING_FUNCCALL:
            switch (tree.right.name) {
                case StringFuncs.LENGTH:
                case StringFuncs.TOLOWERCSE:
                case StringFuncs.TOUPPERCASE:
                    checkArity(tree.right, 0);
                    break;
                case StringFuncs.CHARAT:
                case StringFuncs.CONTAINS:
                case StringFuncs.INDEXOF:
                    checkArity(tree.right, 1);
                    break;
                case StringFuncs.SUBSTRING:
                    checkArity(tree.right, 2);
                    break;
                default:
                    throw new Error(`unknown string method ${tree.right.name} (line ${tree.line})`);
            }
            var args = [];
            tree.right.args.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_String_funccall(tree, createExecutable(tree.left), tree.right.name, args);

        case NODETYPES.CODEBLOCK:
            let statements = tree.statements;
            let result = statements.map((statement) => {
                return createExecutable(statement);
            });
            return new Praxly_codeBlock(result);

        case NODETYPES.PROGRAM:
            return new Praxly_program(createExecutable(tree.value));

        case NODETYPES.STATEMENT:
            return new Praxly_statement(createExecutable(tree.value), tree);

        case NODETYPES.IF:
            try {
                return new Praxly_if(createExecutable(tree.condition), createExecutable(tree.codeblock), tree);
            }
            catch (error) {
                return new Praxly_statement(null);
            }

        case NODETYPES.IF_ELSE:
            try {
                return new Praxly_if_else(createExecutable(tree.condition), createExecutable(tree.codeblock), createExecutable(tree.alternative), tree);
            }
            catch (error) {
                return new Praxly_statement(null);
            }

        case NODETYPES.ASSIGNMENT:
        case NODETYPES.ARRAY_REFERENCE_ASSIGNMENT:
            try {
                return new Praxly_assignment(createExecutable(tree.location), createExecutable(tree.value), tree);
            }
            catch (error) {
                return null;
            }

        case NODETYPES.VARDECL:
            var location = createExecutable(tree.location);
            if (tree.value !== undefined) {
                return new Praxly_vardecl(tree, location, createExecutable(tree.value));
            } else {
                return new Praxly_vardecl(tree, location, undefined);
            }

        case NODETYPES.ARRAY_ASSIGNMENT:
            try {
                return new Praxly_array_assignment(createExecutable(tree.location), createExecutable(tree.value), tree);
            }
            catch (error) {
                return null;
            }

        case NODETYPES.LOCATION:
            try {
                var index = null;
                if (tree.isArray) {
                    index = createExecutable(tree.index);
                }
                return new Praxly_Location(tree, index);
            }
            catch (error) {
                return null;
            }

        case NODETYPES.FOR:
            try {
                var initialization = createExecutable(tree.initialization);
                var condition = createExecutable(tree.condition);
                var incrementation = createExecutable(tree.increment);
                var codeblock = createExecutable(tree.codeblock);
                return new Praxly_for(initialization, condition, incrementation, codeblock, tree);
            }
            catch (error) {
                return new Praxly_statement(null);
            }

        case NODETYPES.WHILE:
            try {
                var condition = createExecutable(tree.condition);
                var codeblock = createExecutable(tree.codeblock);
                return new Praxly_while(condition, codeblock, tree);
            }
            catch (error) {
                return new Praxly_statement(null);
            }

        case NODETYPES.DO_WHILE:
            try {
                var condition = createExecutable(tree.condition);
                var codeblock = createExecutable(tree.codeblock);
                return new Praxly_do_while(condition, codeblock, tree);
            }
            catch (error) {
                return new Praxly_statement(null);
            }

        case NODETYPES.REPEAT_UNTIL:
            try {
                var condition = createExecutable(tree.condition);
                var codeblock = createExecutable(tree.codeblock);
                return new Praxly_repeat_until(condition, codeblock, tree);
            }
            catch (error) {
                return new Praxly_statement(null);
            }

        case NODETYPES.NOT:
            return new Praxly_not(createExecutable(tree.value), tree);

        case NODETYPES.NEGATE:
            return new Praxly_negate(createExecutable(tree.value), tree);

        case NODETYPES.COMMENT:
            return new Praxly_comment(tree.value, tree);

        case NODETYPES.SINGLE_LINE_COMMENT:
            return new Praxly_single_line_comment(tree.value, tree);

        case NODETYPES.FUNCDECL:
            var codeblock = createExecutable(tree.codeblock);
            return new Praxly_function_declaration(tree.returnType, tree.name, tree.params, codeblock, tree);

        case NODETYPES.FUNCCALL:
            var args = [];
            tree.args.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_function_call(tree.name, args, tree);

        case NODETYPES.RETURN:
            return new Praxly_return(createExecutable(tree.value), tree);

        case NODETYPES.ARRAY_LITERAL:
            var args = [];
            tree.params.forEach((arg) => {
                args.push(createExecutable(arg));
            });
            return new Praxly_array_literal(args, tree);

        case NODETYPES.ARRAY_CREATE:
            return new Praxly_array_create(tree.varType, tree.name, tree.elemType, createExecutable(tree.arrayLength), tree);

        case NODETYPES.ARRAY_REFERENCE:
            return new Praxly_array_reference(tree.name, createExecutable(tree.index), tree);

        case NODETYPES.INVALID:
            return new Praxly_invalid(tree);

        case NODETYPES.NEWLINE:
            return new Praxly_emptyLine(tree);

        default:
            throw new Error(`unhandled node type ${tree.type} (line ${tree.line})`);
    }
}

class Praxly_single_line_comment {

    constructor(value, node) {
        this.json = node;
        this.value = value;
    }

    async evaluate(environment) {
    }
}

class Praxly_comment {

    constructor(value, node) {
        this.json = node;
        this.value = value;
    }

    async evaluate(environment) {
    }
}

class Praxly_int {

    constructor(value, node) {
        this.json = node;
        this.value = Math.floor(value);
        this.realType = TYPES.INT;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_short {

    constructor(value, node) {
        this.json = node;
        this.value = Math.floor(value);
        this.realType = TYPES.SHORT;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_double {

    constructor(value, node) {
        this.json = node;
        this.value = parseFloat(value);
        this.realType = TYPES.DOUBLE;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_float {

    constructor(value, node) {
        this.json = node;
        this.value = parseFloat(value);
        this.realType = TYPES.FLOAT;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_boolean {

    constructor(value, node) {
        this.json = node;
        this.value = value;
        this.realType = TYPES.BOOLEAN;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_char {

    constructor(value, node) {
        this.value = value;
        this.json = node;
        this.realType = TYPES.CHAR;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_String {

    constructor(value, node) {
        this.json = node;
        this.value = value;
        this.realType = TYPES.STRING;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_null {

    constructor(value, node) {
        this.json = node;
        this.value = value;
        this.realType = TYPES.NULL;
    }

    async evaluate(environment) {
        return this;
    }
}

class Praxly_array_literal {

    constructor(elements, node, elemType) {
        this.elements = elements;
        this.json = node;
        this.elemType = elemType;
    }

    async evaluate(environment) {
        // evaluate the array elements
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i] = await this.elements[i].evaluate(environment);
        }
        // infer the array's data type
        if (this.elemType) {
            this.realType = this.elemType + "[]";
        } else {
            // set array type to "largest type" of element
            let types = ["boolean", "char", "short", "int", "float", "double", "String"];
            let max_type = -1;
            for (let i = 0; i < this.elements.length; i++) {
                let cur_type = types.indexOf(this.elements[i].realType);
                if (cur_type > max_type) {
                    max_type = cur_type;
                }
            }
            this.realType = types[max_type] + "[]";
        }
        return this;
    }
}

class Praxly_array_create {

    constructor(varType, varName, elemType, arrayLength, node) {
        this.varType = varType;
        this.varName = varName;
        this.elemType = elemType;
        this.arrayLength = arrayLength;
        this.json = node;
    }

    async evaluate(environment) {
        // type checking
        if (!can_assign(this.varType, this.elemType, this.json.line)) {
            throw new PraxlyError(`Array element did not match declared type ` +
                `(Expected: ${this.varType}, Actual: ${this.elemType})`, this.json.line);
        }
        let length = await this.arrayLength.evaluate(environment);
        if (length.realType != NODETYPES.INT) {
            throw new PraxlyError(`Array length must be an integer ` +
                `(Actual: ${length.realType})`, this.json.line);
        }
        length = length.value;
        if (length < 0) {
            throw new PraxlyError(`Array length must be nonnegative ` +
                `(Actual: ${length})`, this.json.line);
        }
        // default value for new array of n elements
        let value;
        switch (this.elemType) {
            case TYPES.BOOLEAN:
                value = false;
                break;
            case TYPES.CHAR:
                value = "0";  // null character not in language
                break;
            case TYPES.STRING:
                value = "";   // null reference not implemented
                break;
            default:
                value = 0;
                break;
        }
        // construct the array of n default values
        let elements = [];
        for (let i = 0; i < length; i++) {
            elements.push(litNode_new(this.elemType, value, this.json));
        }
        // array is being declared and initialized
        let array = new Praxly_array_literal(elements, this.json, this.elemType);
        environment.variableList[this.varName] = array;
    }
}

export function valueToString(child, quotes, line) {
    if (child === "Exit_Success") {
        throw new PraxlyError("no value returned from void procedure", line);
    }
    var result;
    if (child instanceof Praxly_array_literal) {
        // always show curly braces for arrays
        let values = child.elements.map((element) => valueToString(element, true, line));
        result = '{' + values.join(", ") + '}';
    } else {
        result = child.value.toString();
        if (child.realType === TYPES.DOUBLE || child.realType === TYPES.FLOAT) {
            if (result.indexOf('.') === -1) {
                result += '.0';
            }
        }
        if (quotes) {
            if (child.realType === TYPES.CHAR) {
                result = "'" + result + "'";
            }
            if (child.realType === TYPES.STRING) {
                result = '"' + result + '"';
            }
        }
    }
    return result;
}

class Praxly_print {

    constructor(value, node) {
        this.json = node;
        this.expression = value;
    }

    async evaluate(environment) {
        var child = await (this.expression.evaluate(environment));
        var result = valueToString(child, false, this.json.line);

        let suffix;
        if (this.json.comment) {
            if (this.json.comment.includes('space')) {
                suffix = ' ';
            } else if (this.json.comment.includes('no')) {
                suffix = '';
            } else {
                suffix = '<br>';
            }
        } else {
            suffix = '<br>';
        }

        consoleOutput(result + suffix);
        return null;
    }
}

class Praxly_input {

    constructor(node) {
        this.json = node;
    }

    async evaluate(environment) {
        try {
            const result = await consoleInput();
            return new Praxly_String(result, this.json);
        }
        catch (error) {
            throw new PraxlyError("input canceled", this.json.line);
        }
    }
}

class Praxly_random {

    constructor(node) {
        this.json = node;
    }

    async evaluate(environment) {
        // Pure-rand only generates integers. That's strange. We'll generate an
        // integer in a range and normalize it.
        const max = 2e9;
        const x = prand.unsafeUniformIntDistribution(0, max - 1, environment.global.random.generator) / max;
        return new Praxly_double(x, this.json);
    }
}

class Praxly_random_int {
    constructor(max, node) {
        this.json = node;
        this.max = max;
    }

    async evaluate(environment) {
        const maxNode = (await this.max.evaluate(environment));
        if (maxNode.realType !== TYPES.INT) {
            throw new PraxlyError(`randomInt's maximum parameter must be of type int, not ${maxNode.realType}.`, this.json.line);
        }
        const maxValue = maxNode.value;
        if (maxValue < 1) {
            throw new PraxlyError(`randomInt's maximum parameter must be at least 1`, this.json.line);
        }
        const x = prand.unsafeUniformIntDistribution(0, maxValue - 1, environment.global.random.generator);
        return new Praxly_int(x, this.json);
    }
}

class Praxly_random_seed {
    constructor(seed, node) {
        this.json = node;
        this.seed = seed;
    }

    async evaluate(environment) {
        const seedNode = (await this.seed.evaluate(environment));
        if (seedNode.realType === TYPES.INT) {
            const seedValue = seedNode.value;
            environment.global.random.seed = seedValue;
            environment.global.random.generator = prand.xoroshiro128plus(seedValue);
            return null;
        } else {
            throw new PraxlyError(`randomSeed's seed parameter must be of type int, not ${seedNode.realType}.`, this.json.line);
        }
    }
}

class Praxly_int_conversion {
    constructor(value, node) {
        this.json = node;
        this.value = value;
    }

    async evaluate(environment) {
        let node = await this.value.evaluate(environment);
        if (node.realType === TYPES.INT) {
          const convert = new Praxly_int(node.value);
          return convert;
        } else if (node.realType === TYPES.DOUBLE || node.realType === TYPES.FLOAT) {
          const convert = new Praxly_int(Math.trunc(node.value));
          return convert;
        } else if (node.realType === TYPES.STRING) {
          const number = Number(node.value);
          if (isNaN(number)) {
            throw new PraxlyError(`"${node.value}" cannot be converted to an int.`, this.json.line);
          } else {
            const convert = new Praxly_int(number);
            return convert;
          }
        } else {
          throw new PraxlyError(`Function int doesn't accept a parameter of type ${node.realType}.`, this.json.line);
        }
    }
}

class Praxly_float_conversion {
    constructor(value, node) {
        this.json = node;
        this.value = value;
    }

    async evaluate(environment) {
        let node = await this.value.evaluate(environment);
        if (node.realType === TYPES.DOUBLE || node.realType === TYPES.FLOAT) {
          const convert = new Praxly_float(node.value);
          return convert;
        } else if (node.realType === TYPES.INT) {
          const convert = new Praxly_float(node.value);
          return convert;
        } else if (node.realType === TYPES.STRING) {
          const number = Number(node.value);
          if (isNaN(number)) {
            throw new PraxlyError(`"${node.value}" cannot be converted to a float.`, this.json.line);
          } else {
            const convert = new Praxly_float(number);
            return convert;
          }
        } else {
          throw new PraxlyError(`Function float doesn't accept a parameter of type ${node.realType}.`, this.json.line);
        }
    }
}

class Praxly_min {
    a_value;
    b_value;

    constructor(a, b, node) {
        this.json = node;
        this.a_value = a;
        this.b_value = b;
    }

    async evaluate(environment) {
        this.a_value = await this.a_value.evaluate(environment);
        this.b_value = await this.b_value.evaluate(environment);

        let minimum = this.a_value.value < this.b_value.value ? this.a_value : this.b_value;
        return new litNode_new(minimum.realType, minimum.value, this.json);
    }
}

class Praxly_max {
    a_value;
    b_value;

    constructor(a, b, node) {
        this.json = node;
        this.a_value = a;
        this.b_value = b;
    }

    async evaluate(environment) {
        this.a_value = await this.a_value.evaluate(environment);
        this.b_value = await this.b_value.evaluate(environment);

        let maximum = this.a_value.value > this.b_value.value ? this.a_value : this.b_value;
        return new litNode_new(maximum.realType, maximum.value, this.json);
    }
}

class Praxly_abs {
    constructor(value, node) {
        this.json = node;
        this.value = value;
    }

    async evaluate(environment) {
        let evaluated = await this.value.evaluate(environment);
        if (evaluated.realType === NODETYPES.BOOLEAN || evaluated.realType === NODETYPES.STRING || evaluated.realType === NODETYPES.CHAR) {
            throw new PraxlyError("Cannot take the absolute value of type " + evaluated.realType, this.json.line);
        }
        let newValue = Math.abs(evaluated.value);
        return new litNode_new(evaluated.realType, newValue, this.json);
    }
}

class Praxly_log {
    constructor(value, node) {
        this.json = node;
        this.value = value;
    }

    async evaluate(environment) {
        let evaluated = await this.value.evaluate(environment);
        if (evaluated.realType === NODETYPES.BOOLEAN || evaluated.realType === NODETYPES.STRING || evaluated.realType === NODETYPES.CHAR) {
            throw new PraxlyError("Cannot take the natural logarithm of type " + evaluated.realType, this.json.line);
        }
        let newValue = Math.log(evaluated.value);
        return new litNode_new(evaluated.realType, newValue, this.json);
    }
}

class Praxly_sqrt {
    constructor(value, node) {
        this.json = node;
        this.value = value;
    }

    async evaluate(environment){
        let evaluated = await this.value.evaluate(environment);
        if (evaluated.realType === NODETYPES.BOOLEAN || evaluated.realType === NODETYPES.STRING || evaluated.realType === NODETYPES.CHAR) {
            throw new PraxlyError("Cannot take the square root of type " + evaluated.realType, this.json.line);
        }
        let newValue = Math.sqrt(evaluated.value);
        return new litNode_new(evaluated.realType, newValue, this.json);
    }
}

class Praxly_return {

    constructor(value, node) {
        this.json = node;
        this.expression = value;
        // this.isreturn = true;
    }

    async evaluate(environment) {
        throw new ReturnException(await this.expression.evaluate(environment));
    }
}

class Praxly_association {
    constructor(expression, node) {
        this.json = node;
        this.expression = expression;
    }

    async evaluate(environment) {
        return await this.expression.evaluate(environment);
    }
}

class Praxly_addition {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        let b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        if (a.realType === TYPES.STRING || b.realType === TYPES.STRING) {
            // Special case: string concatenation
            return litNode_new(TYPES.STRING,
                valueToString(a, false, this.json.line) + valueToString(b, false, this.json.line));
        }
        return litNode_new(binop_typecheck(OP.ADDITION, a.realType, b.realType, this.json), a.value + b.value);
    }
}

class Praxly_subtraction {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        let b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.SUBTRACTION, a.realType, b.realType, this.json), a.value - b.value);
    }
}

class Praxly_multiplication {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        let b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.MULTIPLICATION, a.realType, b.realType, this.json), a.value * b.value);
    }
}

class Praxly_division {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        let b = await this.b_operand.evaluate(environment);
        if (b.value === 0) {
            throw new PraxlyError("division by zero", this.json.line);
        }
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.DIVISION, a.realType, b.realType, this.json), a.value / b.value);
    }
}

class Praxly_modulo {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        let b = await this.b_operand.evaluate(environment);
        if (b.value === 0) {
            throw new PraxlyError("division by zero", this.json.line);
        }
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.MODULUS, a.realType, b.realType, this.json), a.value % b.value);
    }
}

class Praxly_exponent {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        let b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.EXPONENTIATION, a.realType, b.realType, this.json), a.value ** b.value);
    }
}

class Praxly_and {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        if (a.realType != TYPES.BOOLEAN) {
            throw new PraxlyError(`bad operand type for ${OP.AND} left side: ${a.realType}`, this.json.line);
        }
        // short-circuit evaluation
        if (a.value === false) {
            return litNode_new(TYPES.BOOLEAN, false);
        }
        let b = await this.b_operand.evaluate(environment);
        if (b.realType != TYPES.BOOLEAN) {
            throw new PraxlyError(`bad operand type for ${OP.AND} right side: ${b.realType}`, this.json.line);
        }
        await stepInto(environment, this.json);
        return litNode_new(TYPES.BOOLEAN, a.value && b.value);
    }
}

class Praxly_or {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        let a = await this.a_operand.evaluate(environment);
        if (a.realType != TYPES.BOOLEAN) {
            throw new PraxlyError(`bad operand type for ${OP.OR} left side: ${a.realType}`, this.json.line);
        }
        // short-circuit evaluation
        if (a.value === true) {
            return litNode_new(TYPES.BOOLEAN, true);
        }
        let b = await this.b_operand.evaluate(environment);
        if (b.realType != TYPES.BOOLEAN) {
            throw new PraxlyError(`bad operand type for ${OP.OR} right side: ${b.realType}`, this.json.line);
        }
        await stepInto(environment, this.json);
        return litNode_new(TYPES.BOOLEAN, a.value || b.value);
    }
}

class Praxly_equals {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        var a = await this.a_operand.evaluate(environment);
        var b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.EQUALITY, a.realType, b.realType, this.json), a.value === b.value);
    }
}

class Praxly_not_equals {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        var a = await this.a_operand.evaluate(environment);
        var b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.INEQUALITY, a.realType, b.realType, this.json), a.value !== b.value);
    }
}

class Praxly_greater_than {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        var a = await this.a_operand.evaluate(environment);
        var b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.GREATER_THAN, a.realType, b.realType, this.json), a.value > b.value);
    }
}

class Praxly_less_than {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        var a = await this.a_operand.evaluate(environment);
        var b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.LESS_THAN, a.realType, b.realType, this.json), a.value < b.value);
    }
}

class Praxly_greater_than_equal {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        var a = await this.a_operand.evaluate(environment);
        var b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.GREATER_THAN_OR_EQUAL, a.realType, b.realType, this.json), a.value >= b.value);
    }
}

class Praxly_less_than_equal {
    a_operand;
    b_operand;

    constructor(a, b, node) {
        this.json = node;
        this.a_operand = a;
        this.b_operand = b;
    }

    async evaluate(environment) {
        var a = await this.a_operand.evaluate(environment);
        var b = await this.b_operand.evaluate(environment);
        await stepInto(environment, this.json);
        return litNode_new(binop_typecheck(OP.LESS_THAN_OR_EQUAL, a.realType, b.realType, this.json), a.value <= b.value);
    }
}

/**
 * Extend the environment before entering a codeblock.
 * @param {object} environment The current environment.
 * @param {string} name Optional name for new environment.
 * @returns {object} New environment for the codeblock.
 */
function new_env(environment, name) {
    if (!name) {
        name = environment.name;
    }
    return {
        parent: environment,
        name: name,
        functionList: {},
        variableList: {},
        global: environment.global,
    };
}

class Praxly_if {

    constructor(condition, codeblock, node) {
        this.json = node;
        this.condition = condition;
        this.codeblock = codeblock;
    }

    async evaluate(environment) {
        await stepOver(environment, this.condition.json);
        var cond = await this.condition.evaluate(environment);
        if (cond.realType != TYPES.BOOLEAN) {
            throw new PraxlyError("Invalid condition (must be boolean)", this.json.line);
        }
        if (cond.value) {
            let blockScope = new_env(environment, 'if block');
            await this.codeblock.evaluate(blockScope);
        }
        return 'success';
    }
}

class Praxly_if_else {

    constructor(condition, codeblock, alternative, node) {
        this.json = node;
        this.condition = condition;
        this.codeblock = codeblock;
        this.alternative = alternative;
    }

    async evaluate(environment) {
        await stepOver(environment, this.condition.json);
        var cond = await this.condition.evaluate(environment);
        if (cond.realType != TYPES.BOOLEAN) {
            throw new PraxlyError("Invalid condition (must be boolean)", this.json.line);
        }
        if (cond.value) {
            let blockScope = new_env(environment, 'if block');
            await this.codeblock.evaluate(blockScope);
        } else {
            let blockScope = new_env(environment, 'else block');
            await this.alternative.evaluate(blockScope);
        }
        return 'success';
    }
}

class Praxly_statement {

    constructor(contents, node) {
        this.contents = contents;
        this.json = node;
    }

    async evaluate(environment) {
        var result = this.contents.evaluate(environment);
        return result;
    }
}

// this is a wrapper for the whole program
class Praxly_program {

    constructor(codeblock) {
        this.codeblock = codeblock;
    }

    async evaluate(environment) {
        let result = await this.codeblock.evaluate(environment);

        // update variable list at the end of the program
        await generateVariableTable(environment, 1);
        return result;
    }
}

class Praxly_codeBlock {

    constructor(praxly_blocks) {
        this.praxly_blocks = praxly_blocks;
    }

    async evaluate(environment) {
        // for each statement in the block
        for (let i = 0; i < this.praxly_blocks.length; i++) {
            const element = this.praxly_blocks[i];
            if (element.json === undefined) {
                throw new PraxlyError("Incomplete code (undefined)", 0);  // no line number
            }
            // skip elements that have no effect
            if (element.json.type == NODETYPES.NEWLINE || element.json.type === NODETYPES.COMMENT || element.json.type === NODETYPES.SINGLE_LINE_COMMENT) {
                continue;
            }
            // debug step if not function or loop
            if (!('codeblock' in element)) {
                await stepOver(environment, element.json);
                if (getStopClicked()) {
                    throw new Error("Stop_Debug");
                }
            }
            // evaluate the current statement
            await element.evaluate(environment);
            setStepInto(false);
        }
        return "Exit_Success";
    }
}

// searches through the linked list to find the nearest match to enable shadowing.
function accessLocation(name, environment, decl) {
    if (environment.variableList.hasOwnProperty(name)) {
        return environment.variableList;
    } else if (environment.parent === "root") {
        return null;
    } else if (environment.name.endsWith('()')) {
        if (decl) {
            return null;  // allow shadowing in current function
        }
        // skip over previous function calls on the stack
        return accessLocation(name, environment.global, decl);
    } else {
        return accessLocation(name, environment.parent, decl);
    }
}

// converts the evaluated value to the variable's type when assigned.
function typeCoercion(varType, praxlyObj, line) {
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
            throw new Error(`unhandled var type ${varType} (line ${line})`);
    }
}

class Praxly_assignment {

    constructor(location, expression, node) {
        this.json = node;
        this.location = location;
        this.value = expression;
    }

    async evaluate(environment) {
        // the variable must be in the environment and have a matching type
        var storage = accessLocation(this.location.name, environment);
        if (!storage) {
            throw new PraxlyError(`Variable ${this.location.name} does not exist in this scope.`, this.json.line);
        }
        if (this.location.isArray) {
            var index = await this.location.index.evaluate(environment);
            var length = storage[this.location.name].elements.length;
            if (index.value < 0 || index.value >= length) {
                throw new PraxlyError(`Array index ${index.value} out of bounds for length ${length}`, this.json.line);
            }
        }

        let valueEvaluated = await this.value.evaluate(environment);
        let currentStoredVariableEvaluated = await this.location.evaluate(environment);
        if (!can_assign(currentStoredVariableEvaluated.realType, valueEvaluated.realType, this.json.line)) {
            throw new PraxlyError(`Variable reassignment does not match declared type (Expected: `
                + `${currentStoredVariableEvaluated.realType}, Actual: ${valueEvaluated.realType})`, this.json.line);
        }

        valueEvaluated = typeCoercion(currentStoredVariableEvaluated.realType, valueEvaluated, this.json.line);
        if (this.location.isArray) {
            storage[this.location.name].elements[index.value] = valueEvaluated;
        } else {
            storage[this.location.name] = valueEvaluated;
        }
        await stepInto(environment, this.json);
        return valueEvaluated;
    }
}

class Praxly_vardecl {

    constructor(json, location, expression) {
        this.json = json;
        this.location = location;
        this.value = expression;
        this.name = location.name;
    }

    async evaluate(environment) {
        let valueEvaluated;
        if (this.value !== undefined) {
            valueEvaluated = await this.value.evaluate(environment);
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
                    throw new Error(`unhandled var type ${this.json.varType} (line ${this.json.line})`);
            }
        }
        if (accessLocation(this.name, environment, true)) {
            throw new PraxlyError(`variable ${this.name} has already been declared in this scope.`, this.json.line);
        }

        if (!can_assign(this.json.varType, valueEvaluated.realType, this.json.line)) {
            throw new PraxlyError(`incompatible types: ${valueEvaluated.realType} cannot be converted to ${this.json.varType}`, this.json.line);
        }
        valueEvaluated = typeCoercion(this.json.varType, valueEvaluated, this.json.line);
        environment.variableList[this.name] = valueEvaluated;

        return;
    }
}

class Praxly_array_assignment {

    constructor(location, expression, json) {
        this.json = json;
        this.location = location;
        this.value = expression;
        this.name = location.name;
    }

    async evaluate(environment) {
        // if it is a reassignment, the variable must be in the list and have a matching type.
        let valueEvaluated = await this.value.evaluate(environment);
        for (var k = 0; k < valueEvaluated.elements.length; k++) {
            if (!can_assign(this.json.varType, valueEvaluated.elements[k].realType, this.json.line)) {
                throw new PraxlyError(`Array element did not match declared type ` +
                    `(Expected: ${this.json.varType}, Actual: ${valueEvaluated.elements[k].realType})`, this.json.line);
            }
            valueEvaluated.elements[k] = typeCoercion(this.json.varType, valueEvaluated.elements[k], this.json.line);
        }
        // store in current environment, because the array is being declared and initialized
        environment.variableList[this.name] = valueEvaluated;
    }
}

class Praxly_Location {

    constructor(json, index) {
        this.json = json;
        this.name = json.name;
        this.isArray = json.isArray;
        this.index = index;
    }

    async evaluate(environment) {
        var storage = accessLocation(this.json.name, environment);
        if (!storage) {
            throw new PraxlyError(`Variable ${this.name} does not exist in this scope.`, this.json.line);
        }

        if (this.isArray) {
            var index = await this.index.evaluate(environment);
            var length = storage[this.name].elements.length;
            if (index.value < 0 || index.value >= length) {
                throw new PraxlyError(`Array index ${index.value} out of bounds for length ${length}`, this.json.line);
            }
            return await storage[this.name].elements[index.value].evaluate(environment);
        } else {
            return await storage[this.name].evaluate(environment);
        }
    }
}

class Praxly_for {

    constructor(initialization, condition, incrementation, codeblock, node) {
        this.json = node;
        this.initialization = initialization;
        this.condition = condition;
        this.incrementation = incrementation;
        this.codeblock = codeblock;
    }

    async evaluate(environment) {
        let newScope = new_env(environment, 'for loop');

        // highlight loop init
        await stepOver(newScope, this.initialization.json);
        await this.initialization.evaluate(newScope);

        var loopCount = 0;
        while (true) {
            // check for infinite loop
            loopCount += 1;
            if (loopCount > FOR_LOOP_LIMIT) {
                throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
            }

            // evaluate loop condition
            await stepOver(newScope, this.condition.json);
            var cond = await this.condition.evaluate(newScope);
            if (cond.realType != TYPES.BOOLEAN) {
                throw new PraxlyError("Invalid condition (must be boolean)", this.json.line);
            }
            if (!cond.value) {
                break;
            }

            // evaluate loop body (in a second environment)
            let blockScope = new_env(newScope, 'for body');
            await this.codeblock.evaluate(blockScope);

            // highlight loop update
            await stepOver(newScope, this.incrementation.json);
            await this.incrementation.evaluate(newScope);
        }
    }
}

class Praxly_while {

    constructor(condition, codeblock, node) {
        this.json = node;
        this.condition = condition;
        this.codeblock = codeblock;
    }

    async evaluate(environment) {
        var loopCount = 0;
        while (true) {
            // check for infinite loop
            loopCount += 1;
            if (loopCount > WHILE_LOOP_LIMIT) {
                throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
            }

            // evaluate loop condition
            await stepOver(environment, this.condition.json);
            var cond = await this.condition.evaluate(environment);
            if (cond.realType != TYPES.BOOLEAN) {
                throw new PraxlyError("Invalid condition (must be boolean)", this.json.line);
            }
            if (!cond.value) {
                break;
            }

            // evaluate loop body
            let newScope = new_env(environment, 'while loop');
            await this.codeblock.evaluate(newScope);
        }
    }
}

class Praxly_do_while {

    constructor(condition, codeblock, node) {
        this.json = node;
        this.condition = condition;
        this.codeblock = codeblock;
    }

    async evaluate(environment) {
        var loopCount = 0;
        while (true) {
            // check for infinite loop
            loopCount += 1;
            if (loopCount > WHILE_LOOP_LIMIT) {
                throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
            }

            // evaluate loop body
            let newScope = new_env(environment, 'do-while loop');
            await this.codeblock.evaluate(newScope);

            // evaluate loop condition
            await stepOver(environment, this.condition.json);
            var cond = await this.condition.evaluate(environment);
            if (cond.realType != TYPES.BOOLEAN) {
                throw new PraxlyError("Invalid condition (must be boolean)", this.json.line);
            }
            if (!cond.value) {
                break;
            }
        }
    }
}

class Praxly_repeat_until {

    constructor(condition, codeblock, node) {
        this.json = node;
        this.condition = condition;
        this.codeblock = codeblock;
    }

    async evaluate(environment) {
        var loopCount = 0;
        while (true) {
            // check for infinite loop
            loopCount += 1;
            if (loopCount > WHILE_LOOP_LIMIT) {
                throw new PraxlyError(`This is probably an infinite loop.`, this.json.line);
            }

            // evaluate loop body
            let newScope = new_env(environment, 'repeat loop');
            await this.codeblock.evaluate(newScope);

            // evaluate loop condition
            await stepOver(environment, this.condition.json);
            var cond = await this.condition.evaluate(environment);
            if (cond.realType != TYPES.BOOLEAN) {
                throw new PraxlyError("Invalid condition (must be boolean)", this.json.line);
            }
            if (cond.value) {
                break;
            }
        }
    }
}

class Praxly_not {

    constructor(value, node) {
        this.json = node;
        this.expression = value;
    }

    async evaluate(environment) {
        var a = await this.expression.evaluate(environment);
        return new litNode_new(binop_typecheck(OP.NOT, a.realType, null, this.json), !a.value, this.json);
    }
}

class Praxly_negate {

    constructor(value, node) {
        this.json = node;
        this.expression = value;
    }

    async evaluate(environment) {
        var a = await this.expression.evaluate(environment);
        return new litNode_new(binop_typecheck(OP.NEGATE, a.realType, null, this.json), -1 * a.value, this.json);
    }
}

class Praxly_invalid {

    constructor() {
        this.value = 'INVALID';
    }

    async evaluate(environment) {
        throw new PraxlyError("attempting to evaluate invalid tree node");
    }
}

class Praxly_function_declaration {

    constructor(returnType, name, params, codeblock, node) {
        this.returnType = returnType;
        this.name = name;
        this.params = params;
        this.codeblock = codeblock;
        this.json = node;
    }

    async evaluate(environment) {
        environment.functionList[this.name] = {
            returnType: this.returnType,
            params: this.params,
            codeblock: this.codeblock,
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

    constructor(name, args, node) {
        this.args = args;
        this.name = name;
        this.json = node;
    }

    //this one was tricky
    async evaluate(environment) {
        var func = findFunction(this.name, environment, this.json);
        var functionArgs = func.params;
        var functionBody = func.codeblock;
        var returnType = func.returnType;
        if (functionArgs.length !== this.args.length) {
            throw new PraxlyError(`incorrect amount of arguments passed, expected ${functionArgs.length}, was ${this.args.length}`, this.json.line);
        }

        //NEW: parameter list is now a linkedList. expect some errors till I fix it.
        let newScope = new_env(environment, `${this.name}()`);
        for (let i = 0; i < this.args.length; i++) {
            let parameterName = functionArgs[i][1];
            let parameterType = functionArgs[i][0];
            let argument = await this.args[i].evaluate(environment);

            if (can_assign(parameterType, argument.realType, this.json.line)) {
                newScope.variableList[parameterName] = argument;
            } else {
                throw new PraxlyError(`Argument ${parameterName} does not match parameter type (Expected: ${parameterType}, Actual: ${argument.realType})`, this.json.line);
            }
        }

        // call the user's function
        let result = null;
        try {
            result = await functionBody.evaluate(newScope);
        }
        catch (error) {
            if (error instanceof ReturnException) {
                result = error.returnValue;
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
            throw new PraxlyError(`Function ${this.name} returned the wrong type (Expected: ${returnType}, Actual: ${result.realType})`, this.json.line);
        }

        // extra debugger step to highlight the function call after returning
        await stepOver(environment, this.json, "return-step");
        return result;
    }
}

class Praxly_String_funccall {
    constructor(node, receiver, name, args) {
        this.args = args;
        this.json = node;
        this.name = name;
        this.receiver = receiver;
    }

    typecheckhelper(argument, expected_types) {
        if (!expected_types.includes(argument.realType)) {
            const argStr = valueToString(argument, true, this.json.line);
            throw new PraxlyError(`Argument ${argStr} does not match parameter type (Expected: ${expected_types}, Actual: ${argument.realType})`, this.json.line);
        }
    }

    check_bounds(str_value, index_value, inclusive) {
        if (index_value < 0 || index_value > str_value.length || inclusive && index_value == str_value.length) {
            throw new PraxlyError(`String index ${index_value} out of bounds for length ${str_value.length}`, this.json.line);
        }
    }

    async evaluate(environment) {
        var str = await this.receiver.evaluate(environment);
        var result;
        switch (this.name) {
            case StringFuncs.CHARAT:
                var index = await this.args[0].evaluate(environment);
                this.typecheckhelper(index, [TYPES.INT, TYPES.SHORT]);
                this.check_bounds(str.value, index.value, true);
                result = str.value[index.value];
                return new Praxly_char(result);
            case StringFuncs.CONTAINS:
                var char = await this.args[0].evaluate(environment);
                this.typecheckhelper(char, [TYPES.STRING, TYPES.CHAR]);
                result = str.value.includes(char.value);
                return new Praxly_boolean(result);
            case StringFuncs.INDEXOF:
                var substr = await this.args[0].evaluate(environment);
                this.typecheckhelper(substr, [TYPES.STRING, TYPES.CHAR]);
                result = str.value.indexOf(substr.value);
                return new Praxly_int(result);
            case StringFuncs.LENGTH:
                return new Praxly_int(str.value.length);
            case StringFuncs.TOLOWERCSE:
                return new Praxly_String(str.value.toLowerCase());
            case StringFuncs.TOUPPERCASE:
                return new Praxly_String(str.value.toUpperCase());
            case StringFuncs.SUBSTRING:
                var beg = await this.args[0].evaluate(environment);
                var end = await this.args[1].evaluate(environment);
                this.typecheckhelper(beg, [TYPES.INT, TYPES.SHORT]);
                this.typecheckhelper(end, [TYPES.INT, TYPES.SHORT]);
                this.check_bounds(str.value, beg.value, false);
                this.check_bounds(str.value, end.value, false);
                result = str.value.substring(beg.value, end.value);
                return new Praxly_String(result);
            default:
                throw new Error(`unhandled string method ${this.name} (line ${this.json.line})`);
        }
    }

}

// The only reason this is a part of the tree is so that I can preserve the empty lines when I transfer between blocks and text
class Praxly_emptyLine {

    constructor(node) {
        this.json = node;
    }

    async evaluate(environment) {
        //do nothing
    }
}

function is_integer(varType) {
    return varType === TYPES.INT || varType === TYPES.SHORT;
}

function is_numeric(varType) {
    return varType === TYPES.DOUBLE || varType === TYPES.FLOAT
        || varType === TYPES.INT || varType === TYPES.SHORT;
}

/**
 * This function is used to determine if something can be assigned.
 * @param {*} varType
 * @param {*} expressionType
 * @param {*} line
 * @returns
 */
function can_assign(varType, expressionType, line) {
    if (varType === expressionType) {
        return true;
    }
    // if assigning arrays, remove the []'s from the type names
    if (varType.endsWith("[]") && expressionType.endsWith("[]")) {
        varType = varType.slice(0, -2);
        expressionType = expressionType.slice(0, -2);
    }

    if (is_integer(varType)) {
        if (expressionType === TYPES.DOUBLE || expressionType === TYPES.FLOAT) {
            throw new PraxlyError(`incompatible types: possible lossy conversion from ${expressionType} to ${varType}`, line);
        }
        return is_integer(expressionType);
    } else if (varType === TYPES.DOUBLE || varType === TYPES.FLOAT) {
        return is_numeric(expressionType);
    } else if (varType === TYPES.STRING) {
        return expressionType === TYPES.STRING || expressionType === TYPES.NULL;
    } else if (varType === TYPES.BOOLEAN) {
        return expressionType === TYPES.BOOLEAN;
    } else if (varType === TYPES.CHAR) {
        return expressionType === TYPES.CHAR;
    } else {
        throw new Error(`unknown variable type ${varType} (line ${line})`);
    }
}

function can_numeric(operation, type1, type2, json) {
    if (is_numeric(type1) && is_numeric(type2)) {
        if (type1 === type2) {
            return type1;
        }
        // Different numeric types; promote to integer or double
        if (is_integer(type1) && is_integer(type2)) {
            return TYPES.INT;
        } else {
            return TYPES.DOUBLE;
        }
    }
    throw new PraxlyError(`bad operand types for ${operation}, left: ${type1}, right: ${type2}`, json.line);
}

function can_add(operation, type1, type2, json) {
    if (type1 === TYPES.BOOLEAN && type2 === TYPES.BOOLEAN) {
        throw new PraxlyError(`bad operand types for ${operation} (left: ${type1}, right: ${type2})`, json.line);
    }
    if (type1 === TYPES.CHAR && type2 === TYPES.CHAR) {
        return TYPES.STRING;  // TODO should this be INT like in Java? (would have to do more work to make INT and CHAR interchangeable)
    }
    if (type1 === TYPES.STRING || type2 === TYPES.STRING) {
        return TYPES.STRING;  // Promote to String if either operand is a String
    }
    return can_numeric(operation, type1, type2, json);
}

function can_boolean(operation, type1, type2, json) {
    if (type1 === TYPES.BOOLEAN && type2 === TYPES.BOOLEAN) {
        return TYPES.BOOLEAN;
    }
    throw new PraxlyError(`bad operand types for ${operation} (left: ${type1}, right: ${type2})`, json.line);
}

function can_compare(operation, type1, type2, json) {
    if (type1 === type2 || is_numeric(type1) && is_numeric(type2)) {
        return TYPES.BOOLEAN;
    }
    throw new PraxlyError(`bad operand types for ${operation} (left: ${type1}, right: ${type2})`, json.line);
}

// yea I know this is sloppy but I am getting tired and I'm running outta time
function can_negate(operation, type1, json) {
    if (operation === OP.NEGATE) {
        if (is_numeric(type1)) {
            return type1;
        }
    }
    if (operation === OP.NOT) {
        if (type1 === TYPES.BOOLEAN) {
            return type1;
        }
    }
    throw new PraxlyError(`bad operand type for ${operation} (${type1})`, json.line);
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
            return can_numeric(operation, type1, type2, json);

        case OP.MULTIPLICATION:
        case OP.EXPONENTIATION:
            return can_numeric(operation, type1, type2, json);

        case OP.DIVISION:
        case OP.MODULUS:
            return can_numeric(operation, type1, type2, json);

        case OP.AND:
        case OP.OR:
            return can_boolean(operation, type1, type2, json);

        case OP.EQUALITY:
        case OP.INEQUALITY:
        case OP.GREATER_THAN:
        case OP.LESS_THAN:
        case OP.GREATER_THAN_OR_EQUAL:
        case OP.LESS_THAN_OR_EQUAL:
            return can_compare(operation, type1, type2, json);

        default:
            throw new Error(`unhandled operation ${operation} (line ${json.line})`);
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
            return new Praxly_invalid();
        default:
            throw new Error(`unhandled literal type ${type} (line ${json.line})`);
    }
}
