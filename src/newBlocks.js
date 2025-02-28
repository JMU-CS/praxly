import Blockly from 'blockly';
import { NODETYPES } from './common';

export function definePraxlyBlocks(workspace) {
  let callbacks = {
    saveExtraState: function () {
      return {
        params: this.params,
      };
    },
    loadExtraState: function (state) {
      // Restore the state of the mutator
      this.params = state.params || [];
      for (let i = 0; i < this.params.length; i++) {
        this.appendValueInput(`PARAM_${i}`);
      }
    }
  };

  Blockly.Extensions.registerMutator('praxly_arity', callbacks);

  Blockly.Extensions.register('addParams', function () {
    let minusButton = this.getField('MINUS_BUTTON');
    let plusButton = this.getField('PLUS_BUTTON');
    this.params = [];

    plusButton.setOnClickHandler(() => {
      const paramCount = this.params.length;
      let inputname = `PARAM_${paramCount}`;
      let blockid = this.id;
      let newinput = this.appendValueInput(inputname);

      // var newblock = workspace.newBlock('praxly_literal_block');
      // inputname.connection.connect(newblock.outputConnection);
      // newblock.initSvg();

      this.params.push(inputname);
    });

    minusButton.setOnClickHandler(() => {
      const paramCount = this.params.length;
      if (paramCount > 0) {
        const paramName = this.params.pop();
        this.removeInput(`PARAM_${paramCount - 1}`);
      }
    });
  });

  // function updateEndProcedureName(event) {
  //   var newValue = event.newValue;
  //   this.sourceBlock_.setFieldValue(newValue, 'END_PROCEDURE_NAME');
  // }
  function updateProcedureName(event) {
    var block = event.getEventWorkspace().getBlockById(event.blockId);
    var procedureNameField = block.getField("PROCEDURE_NAME");
    var endProcedureNameField = block.getField("END_PROCEDURE_NAME");

    var procedureName = procedureNameField.getText();
    endProcedureNameField.setValue(procedureName);
  }

  Blockly.common.defineBlocksWithJsonArray([
    { // common 1
      "type": "praxly_print_block",
      "message0": "print %1 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": 'procedure_blocks',
      "tooltip": "Displays output on the screen",
      "helpUrl": ""
    },
    { // common 2
      "type": "praxly_input_block",
      "message0": "input ( )",
      "inputsInline": true,
      "output": null,
      "style": 'other_blocks',
      "tooltip": "Reads input from the keyboard",
      "helpUrl": ""
    },
    { // common 3
      "type": "praxly_single_line_comment_block",
      "message0": "// %1 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "field_input",
          "name": "COMMENT",
          "text": "comment"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'comment_blocks',
      "tooltip": "Single-line comment",
      "helpUrl": ""
    },
    { // common 4
      "type": "praxly_comment_block",
      "message0": "/* %1 %2 */",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "field_input",
          "name": "COMMENT",
          "text": "missing code"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'comment_blocks',
      "tooltip": "Placeholder for missing code",
      "helpUrl": ""
    },
    { // common 5
      "type": "praxly_emptyline_block",
      "message0": "%1",
      "args0": [
        {
          "type": "input_dummy"
        },
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'comment_blocks',
      "tooltip": "Blank line in the code",
      "helpUrl": ""
    },
    { // variables 1
      "type": "praxly_vardecl_block",
      "message0": "%1%2%3",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["int", NODETYPES.INT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
          ]
        },
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "variableName"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'variable_blocks',
      "tooltip": "Declares a variable",
      "helpUrl": ""
    },
    { // variables 2
      "type": "praxly_assignment_block",
      "message0": "%1%2 ⬅ %3 %4",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["int", NODETYPES.INT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
          ]
        },
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "variableName"
        },
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'variable_blocks',
      "tooltip": "Declares and initializes a variable",
      "helpUrl": ""
    },
    { // variables 3
      "type": "praxly_reassignment_block",
      "message0": "%1⬅%2 %3",
      "args0": [
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "variableName"
        },
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'variable_blocks',
      "tooltip": "Assigns a variable",
      "helpUrl": ""
    },
    { // variables 4
      "type": "praxly_variable_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "LITERAL",
          "text": "name"
        }
      ],
      "output": null,
      "style": 'variable_blocks',
      "tooltip": "The value of a variable",
      "helpUrl": ""
    },
    { // variables 5
      "type": "praxly_array_assignment_block",
      "message0": "%1[] %2 ⬅ {%3 %4}",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["int", NODETYPES.INT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
          ]
        },
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "arrayName"
        },
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'variable_blocks',
      "tooltip": "Declares and initializes an array",
      "helpUrl": ""
    },
    {
      "type": "praxly_array_create_block",
      "message0": "%1[] %2 ⬅ %3[%4]",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            ["int", NODETYPES.INT],
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
          ]
        },
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "arrayName"
        },
        {
          "type": "field_dropdown",
          "name": "ELEMTYPE",
          "options": [
            ["int", NODETYPES.INT],
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
          ]
        },
        {
          "type": "input_value",
          "name": "LENGTH",
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'variable_blocks',
      "tooltip": "Initialize and declare an array of desired length",  // of length n?
      "helpUrl": ""
    },
    { // variables 6
      "type": "praxly_array_reference_reassignment_block",
      "message0": "%1[%2] ⬅%3 %4",
      "args0": [
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "arrayName"
        },
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'variable_blocks',
      "tooltip": "Assigns an array element",
      "helpUrl": ""
    },
    { // variables 7
      "type": "praxly_array_reference_block",
      "message0": "%1[%2] %3",
      "args0": [
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "arrayName"
        },
        {
          "type": "input_value",
          "name": "INDEX",
          "text": "0"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "style": 'variable_blocks',
      "tooltip": "The value of an array element",
      "helpUrl": "",
      "output": null
    },
    { // math 1
      "type": "praxly_arithmetic_block",
      "message0": "%1 %2 %3 %4",
      "args0": [
        {
          "type": "input_value",
          "name": "A_OPERAND",
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            [
              "+",
              NODETYPES.ADDITION
            ],
            [
              "-",
              NODETYPES.SUBTRACTION
            ],
            [
              "*",
              NODETYPES.MULTIPLICATION
            ],
            [
              "/",
              NODETYPES.DIVISION
            ],
            [
              "^",
              NODETYPES.EXPONENTIATION
            ],
            [
              "%",
              NODETYPES.MODULUS
            ],
          ]
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "B_OPERAND",
          // 'defaultType': 'praxly_literal_block',
          // 'defaultValue': 1,
        },
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Arithmetic operators:\n+ addition (and string concatenation)\n- subtraction\n* multiplication\n/ division (integer and floating-point)\n% remainder\n^ exponent",
      "helpUrl": "",
    },
    { // math 2
      "type": "praxly_negate_block",
      "message0": "- %1 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Negates a value",
      "helpUrl": ""
    },
    { // math 3
      "type": "praxly_literal_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "LITERAL",
          "text": "value"
        }
      ],
      "output": null,
      "style": 'math_blocks',
      "tooltip": "A literal value in the code",
      "helpUrl": ""
    },
    { // math 4
      "type": "praxly_random_block",
      "message0": "random ( )",
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Generates a random double greater than or equal to 0 and less than 1",
      "helpUrl": ""
    },
    { // math 5
      "type": "praxly_random_int_block",
      "message0": "randomInt ( %1 )",
      "args0": [
        {
          "type": "input_value",
          "name": "MAX"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Generates a random integer greater than or equal to 0 and less than x",
      "helpUrl": ""
    },
    { // math 6
      "type": "praxly_random_seed_block",
      "message0": "randomSeed ( %1 )",
      "args0": [
        {
          "type": "input_value",
          "name": "SEED"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Sets the seed of the random number generator",
      "helpUrl": ""
    },
    { // math 7
      "type": "praxly_int_conversion_block",
      "message0": "int ( %1 )",
      "args0": [
        {
          "type": "input_value",
          "name": "CONVERSION"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Converts a String into an int",
      "helpURL": ""
    },
    { // math 8
      "type": "praxly_float_conversion_block",
      "message0": "float ( %1 )",
      "args0": [
        {
          "type": "input_value",
          "name": "CONVERSION"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Converts a String into a float",
      "helpURL": ""
    },
    { // math 9
      "type": "praxly_min_block",
      "message0": "min ( %1 , %2 )",
      "args0": [
        {
          "type": "input_value",
          "name": "A_MIN"
        },
        {
          "type": "input_value",
          "name": "B_MIN"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Returns the lower value",
      "helpURL": ""
    },
    { // math 10
      "type": "praxly_max_block",
      "message0": "max ( %1, %2 )",
      "args0": [
        {
          "type": "input_value",
          "name": "A_MAX"
        },
        {
          "type": "input_value",
          "name": "B_MAX"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Returns the higher value",
      "helpURL": ""
    },
    { // math 11
      "type": "praxly_abs_block",
      "message0": "abs ( %1 )",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Returns the absolute value",
      "helpURL": ""
    },
    { // math 12
      "type": "praxly_log_block",
      "message0": "log ( %1 )",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Calculates the natural logarithm",
      "helpURL": ""
    },
    { // math 13
      "type": "praxly_sqrt_block",
      "message0": "sqrt ( %1 )",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'math_blocks',
      "tooltip": "Calculates the square root",
      "helpURL": ""
    },
    { // text 1
      "type": "praxly_charAt_block",
      "message0": "%1.charAt (%2)",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_value",
          "name": "INDEX",
          "text": "params"
        },
      ],
      "inputsInline": true,
      "output": null,
      "style": 'text_blocks',
      "tooltip": "Returns the character at the index",
      "helpUrl": ""
    },
    { // text 2
      "type": "praxly_contains_block",
      "message0": "%1.contains (%2)",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_value",
          "name": "PARAM",
          "text": "params"
        },
      ],
      "inputsInline": true,
      "output": null,
      "style": 'text_blocks',
      "tooltip": "Returns true if string is a substring",
      "helpUrl": ""
    },
    { // text 3
      "type": "praxly_indexOf_block",
      "message0": "%1.indexOf (%2)",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_value",
          "name": "PARAM",
          "text": "params"
        },
      ],
      "inputsInline": true,
      "output": null,
      "style": 'text_blocks',
      "tooltip": "Returns the first index of substring value, or -1 if not found",
      "helpUrl": ""
    },
    { // text 4
      "type": "praxly_length_block",
      "message0": "%1.length ( )",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
      ],
      "inputsInline": true,
      "output": null,
      "style": 'text_blocks',
      "tooltip": "Returns the length of the string",
      "helpUrl": ""
    },
    { // text 5
      "type": "praxly_substring_block",
      "message0": "%1.substring (%2 , %3)",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_value",
          "name": "PARAM1",
          "text": "params"
        },
        {
          "type": "input_value",
          "name": "PARAM2",
          "text": "params"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'text_blocks',
      "tooltip": "Extracts characters from the start index up to but not including the end index",
      "helpUrl": ""
    },
    { // text 6
      "type": "praxly_toLowerCase_block",
      "message0": "%1.toLowerCase ( )",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'text_blocks',
      "tooltip": "Converts the string to all lowercase",
      "helpUrl": ""
    },
    { // text 7
      "type": "praxly_toUpperCase_block",
      "message0": "%1.toUpperCase ( )",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'text_blocks',
      "tooltip": "Converts the string to all uppercase",
      "helpUrl": ""
    },
    { // logic 1
      "type": "praxly_if_block",
      "style": "logic_blocks",
      "message0": "if ( %1 ) %2  %3 end if",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "STATEMENT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "tooltip": "If statement",
      "helpUrl": ""
    },
    { // logic 2
      "type": "praxly_if_else_block",
      "message0": "if ( %1 ) %2 %3 else  %4  %5 end if",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "STATEMENT"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "ALTERNATIVE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": 'logic_blocks',
      "tooltip": "If-else statement",
      "helpUrl": ""
    },
    { // logic 3
      "type": "praxly_boolean_operators_block",
      "message0": "%1 %2 %3 %4",
      "args0": [
        {
          "type": "input_value",
          "name": "A_OPERAND",
          "check": "Boolean"
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            [
              "and",
              NODETYPES.AND
            ],
            [
              "or",
              NODETYPES.OR
            ]
          ]
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "B_OPERAND",
          "check": "Boolean"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "style": 'logic_blocks',
      "tooltip": "Logical operators",
      "helpUrl": ""
    },
    { // logic 4
      "type": "praxly_not_block",
      "message0": "not %1 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        }
      ],
      "output": "Boolean",
      "style": 'logic_blocks',
      "tooltip": "Negates a boolean",
      "helpUrl": ""
    },
    { // logic 5
      "type": "praxly_compare_block",
      "message0": "%1 %2 %3 %4",
      "args0": [
        {
          "type": "input_value",
          "name": "A_OPERAND"
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            [
              "==",
              NODETYPES.EQUALITY
            ],
            [
              "≠",
              NODETYPES.INEQUALITY
            ],
            [
              "<",
              NODETYPES.LESS_THAN
            ],
            [
              ">",
              NODETYPES.GREATER_THAN
            ],
            [
              "≤",
              NODETYPES.LESS_THAN_OR_EQUAL
            ],
            [
              "≥",
              NODETYPES.GREATER_THAN_OR_EQUAL
            ],
          ]
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_value",
          "name": "B_OPERAND"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "style": 'logic_blocks',
      "tooltip": "Relational operators:\n< less than\n> greater than\n≤ less than or equal to\n≥ greater than or equal to\n== equal to\n≠ not equal to",
      "helpUrl": ""
    },
    { // logic 6
      "type": "praxly_true_block",
      "message0": "true",
      "inputsInline": true,
      "output": "Boolean",
      "style": 'logic_blocks',
      "tooltip": "The literal value true",
      "helpUrl": ""
    },
    { // logic 7
      "type": "praxly_false_block",
      "message0": "false",
      "inputsInline": true,
      "output": "Boolean",
      "style": 'logic_blocks',
      "tooltip": "The literal value false",
      "helpUrl": ""
    },
    { // loops 1
      "type": "praxly_for_loop_block",
      "message0": "for (%1 ; %2 ; %3 )%4 %5 end for",
      "args0": [
        {
          "type": "input_value",
          "name": "INITIALIZATION"
        },
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "REASSIGNMENT"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "CODEBLOCK"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'loop_blocks',
      "tooltip": "For loop (repeat a specific number of times)",
      "helpUrl": ""
    },
    { // for loop initialize
      "type": "praxly_assignment_expression_block",
      "message0": "%1%2 ⬅ %3 %4",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["int", NODETYPES.INT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
          ]
        },
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "i"
        },
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'variable_blocks',
      "tooltip": "Declares and initializes the loop variable",
      "helpUrl": ""
    },
    { // for loop reassignment
      "type": "praxly_reassignment_expression_block",
      "message0": "%1⬅%2 %3",
      "args0": [

        {
          "type": "input_value",
          "name": "LOCATION"
        },
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "output": null,
      "style": 'variable_blocks',
      "tooltip": "Updates the loop variable (usually adds 1)",
      "helpUrl": ""
    },
    { // loops 2
      "type": "praxly_while_loop_block",
      "message0": "while ( %1 ) %2 %3 end while",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "STATEMENT"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'loop_blocks',
      "tooltip": "While loop (repeat until a condition is false)",
      "helpUrl": ""
    },
    { // loops 3
      "type": "praxly_do_while_loop_block",
      "message0": "do  %1  while (%2 )%3 ",
      "args0": [
        {
          "type": "input_statement",
          "name": "STATEMENT"
        },
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'loop_blocks',
      "tooltip": "Do-while loop (run once and repeat until a condition is false)",
      "helpUrl": ""
    },
    { // loops 4
      "type": "praxly_repeat_until_loop_block",
      "message0": "repeat  %1  until (%2 )%3 ",
      "args0": [
        {
          "type": "input_statement",
          "name": "STATEMENT"
        },
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        },
        {
          "type": "input_dummy"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": 'loop_blocks',
      "tooltip": "Repeat loop (repeat until a condition is true)",
      "helpUrl": ""
    },
    { // procedures 1
      "type": "praxly_procedure_block",
      "message0": "%1 %2 %3 ( %4 ) %5 %6 end %7",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "RETURNTYPE",
          "options": [
            ["void", NODETYPES.VOID],
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["int", NODETYPES.INT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
            ["boolean[]", NODETYPES.BOOLEAN_ARRAY],
            ["char[]", NODETYPES.CHAR_ARRAY],
            ["double[]", NODETYPES.DOUBLE_ARRAY],
            ["float[]", NODETYPES.FLOAT_ARRAY],
            ["int[]", NODETYPES.INT_ARRAY],
            ["short[]", NODETYPES.SHORT_ARRAY],
            ["String[]", NODETYPES.STRING_ARRAY],
          ]
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "field_input",
          "name": "PROCEDURE_NAME",
          "text": "procedureName"
        },
        {
          "type": "input_value",
          "name": "PARAMS",
          "text": "params"
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "CODEBLOCK"
        },
        {
          "type": "field_input",
          "name": "END_PROCEDURE_NAME",
          "text": "procedureName"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "style": "procedure_blocks",
      "tooltip": "Defines a new procedure",
      "helpUrl": "",
      "onchange": "updateProcedureName"
    },
    { // procedures 2
      "type": "praxly_parameter_block",
      "message0": "%1 %2",
      "args0": [
        {
          'type': 'field_image',
          'src': 'images/icons8-plus-50.png',
          'name': 'PLUS_BUTTON',
          'width': 19,
          'height': 19,
          'alt': '*',

        },
        {
          'type': 'field_image',
          'src': 'images/icons8-minus-50.png',
          'name': 'MINUS_BUTTON',
          'width': 19,
          'height': 19,
          'alt': '*',

        },
      ],
      "output": null,
      "style": 'parameter_blocks',
      "tooltip": "List of parameters or arguments",
      "helpUrl": "",
      'mutator': 'praxly_arity',
      'extensions': ['addParams'],
      "inputsInline": true,
    },
    { // procedures 3
      "type": "praxly_singular_param_block",
      "message0": "%1%2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            ["boolean", NODETYPES.BOOLEAN],
            ["char", NODETYPES.CHAR],
            ["double", NODETYPES.DOUBLE],
            ["float", NODETYPES.FLOAT],
            ["int", NODETYPES.INT],
            ["short", NODETYPES.SHORT],
            ["String", NODETYPES.STRING],
            ["boolean[]", NODETYPES.BOOLEAN_ARRAY],
            ["char[]", NODETYPES.CHAR_ARRAY],
            ["double[]", NODETYPES.DOUBLE_ARRAY],
            ["float[]", NODETYPES.FLOAT_ARRAY],
            ["int[]", NODETYPES.INT_ARRAY],
            ["short[]", NODETYPES.SHORT_ARRAY],
            ["String[]", NODETYPES.STRING_ARRAY],
          ]
        },
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "i"
        },
      ],
      "inputsInline": true,
      "output": null,
      "style": 'parameter_blocks',
      "tooltip": "Declares a parameter variable",
      "helpUrl": ""
    },
    { // procedures 4
      "type": "praxly_return_block",
      "message0": "return %1",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "style": 'procedure_blocks',
      "tooltip": "Ends the procedure and returns a value",
      "helpUrl": ""
    },
    { // procedures 5
      "type": "praxly_function_call_block",
      "message0": "%1 (%2)",
      "args0": [
        {
          "type": "field_input",
          "name": "PROCEDURE_NAME",
          "text": "procedureName"
        },
        {
          "type": "input_value",
          "name": "PARAMS",
          "text": "params"
        },
      ],
      "inputsInline": true,
      "output": null,
      "style": "procedure_blocks",
      "tooltip": "Calls a procedure (this block represents the return value)",
      "helpUrl": "",
      "onchange": "updateProcedureName"
    },
    { // procedures 6
      "type": "praxly_statement_block",
      "message0": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        },
        // {
        //   "type": "input_dummy"
        // }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": 'procedure_blocks',
      "tooltip": "Expression statement for calling a void procedure",
      "helpUrl": ""
    },
  ]);

  // The default context menu from Blockly has an item for annotating a block
  // with a comment. We use a dedicated comment block, so we should disable the
  // menu item. However, we do want builtin comments for print blocks to say
  // what text should appear after the output. We therefore disable the menu
  // item for all blocks but print.
  for (let [id, block] of Object.entries(Blockly.Blocks)) {
    if (id !== 'praxly_print_block') {
      block.customContextMenu = items => {
        let commentIndex = items.findIndex(item => item.text === 'Add Comment');
        if (commentIndex >= 0) {
          items.splice(commentIndex, 1);
        }
      };
    }
  }
}
