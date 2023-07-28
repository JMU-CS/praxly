import Blockly, { Block } from 'blockly';

export function definePraxlyBlocks(workspace) {



  let callbacks = {
    saveExtraState: function() {
      return {
        params: this.params,
      };
    },
    loadExtraState: function(state) {
      // Restore the state of the mutator
      this.params = state.params || [];
      for (let i = 0; i < this.params.length; i++) {
        this.appendValueInput(`PARAM_${i}`);
 
      }
    }
  };

  //this doesnt work
  // function appendparameter(str){
  //   // const oldblock = workspace.getBlockById(id);
  //   var newblock = workspace.newBlock('praxly_literal_block');
  //   this.getInput(str).connection.connect(newblock.outputConnection);
  //   newblock.initSvg();

  // }
  
  Blockly.Extensions.registerMutator('praxly_arity', callbacks);
  
  Blockly.Extensions.register('addParams', function() {
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
        {
            "type": "praxly_if_block",
            "style":"logic_blocks",
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
            "tooltip": "place a condition inside the parintheses. This condition must evaluate to either true or false. \n\n If the condition is true, then the code below will be ran. Otherwise, it is skipped.",
            "helpUrl": ""
          }, 
          {
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
            "tooltip": "place a condition inside the parintheses. This condition must evaluate to either true or false. \n\n If the condition is true, then only the blocks underneach the first line will be ran. If the condition is false, then oonly the blocks in the else statement will be ran.",
            "helpUrl": ""
          }, 
    
          {
            "type": "praxly_while_loop_block",
            "message0": "while ( %1 ) %2 %3 end while",
            "args0": [
              {
                "type": "input_value",
                "name": "CONDITION"
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
            "tooltip": "place a condition inside the parintheses. This condition must evaluate to either true or false. the blocks inside this block will be ran over and over again until the condition is no longer true",
            "helpUrl": ""
          },
          
          {
            "type": "praxly_do_while_loop_block",
            "message0": "do  %1  while (%2 )%3 ",
            "args0": [
              {
                "type": "input_statement",
                "name": "STATEMENT"
              },
              {
                "type": "input_value",
                "name": "CONDITION"
              },
              {
                "type": "input_dummy"
              }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "style": 'loop_blocks',
            "tooltip": "",
            "helpUrl": ""
          },
          {
            "type": "praxly_repeat_until_loop_block",
            "message0": "repeat  %1  until (%2 )%3 ",
            "args0": [
              {
                "type": "input_statement",
                "name": "STATEMENT"
              },
              {
                "type": "input_value",
                "name": "CONDITION"
              },
              {
                "type": "input_dummy"
              }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "style": 'loop_blocks',
            "tooltip": "",
            "helpUrl": ""
          },
          {
            "type": "praxly_for_loop_block",
            "message0": "for (%1 ; %2 ; %3 )%4 %5 end for",
            "args0": [
              {
                "type": "input_value",
                "name": "INITIALIZATION"
              },
              {
                "type": "input_value",
                "name": "CONDITION"
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
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
            "type": "praxly_null_block",
            "message0": "null",
            "inputsInline": true,
            "output": null,
            "style": 'expression_blocks',
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
            "type": "praxly_true_block",
            "message0": "true",
            "inputsInline": true,
            "output": "Boolean",
            "style": 'expression_blocks',
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
            "type": "praxly_false_block",
            "message0": "false",
            "inputsInline": true,
            "output": "Boolean",
            "style": 'expression_blocks',
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
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
                    "EQUALS"
                  ],
                  [
                    "<=",
                    "LESS_THAN_EQUAL"
                  ],
                  [
                    ">=",
                    "GREATER_THAN_EQUAL"
                  ],
                  [
                    "≠",
                    "NOT_EQUAL"
                  ],
                  [
                    "<",
                    "LESS_THAN"
                  ],
                  [
                    ">",
                    "GREATER_THAN"
                  ]
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
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
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
                    "ADD"
                  ],
                  [
                    "-",
                    "SUBTRACT"
                  ],
                  [
                    "*",
                    "MULTIPLY"
                  ],
                  [
                    "/",
                    "DIVIDE"
                  ],
                  [
                    "%",
                    "MOD"
                  ],
                  [
                    "^",
                    "EXPONENT"
                  ]
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
            "style": 'expression_blocks',
            "tooltip": "",
            "helpUrl": "", 
            // 'childBLocks_' : [
            //   {
            //     'kind': 'block',
            //     'type': 'praxly_literal_block'
            //   },
            //   {
            //     'kind': 'block',
            //     'type': 'praxly_literal_block'
            //   },
            // ],
          }, 
          {
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
                    "AND"
                  ],
                  [
                    "or",
                    "OR"
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
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
            "type": "praxly_comment_block",
            "message0": "/* %1 %2 */",
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
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
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
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
            "type": "praxly_class_block",
            "message0": "class %1 %2 end class",
            "args0": [
              {
                "type": "input_dummy"
              },
              {
                "type": "input_statement",
                "name": "class"
              }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "style": "class_blocks",
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
            "type": "praxly_procedure_block",
            "message0": "%1 %2 %3 ( %4 ) %5 %6 end %7",
            "args0": [
              {
                "type": "field_dropdown",
                "name": "RETURNTYPE",
                "options": [
                  ["int", "int"],
                  ["boolean", "boolean"],
                  ["double", "double"],
                  ["char", "char"],
                  ["String", "String"],
                  ["float", "float"]
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
                "name": "CONTENTS"
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
            "tooltip": "test",
            "helpUrl": "",
            "onchange": "updateProcedureName"
          },
          {
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
            "tooltip": "test",
            "helpUrl": "",
            "onchange": "updateProcedureName"
          },
    {
"type": "praxly_assignment_block",
"message0": "%1%2 ⬅ %3 %4",
"args0": [
  {
    "type": "field_dropdown",
    "name": "VARTYPE",
    "options": [
      [
        "int",
        "int"
      ],
      [
        "boolean",
        "boolean"
      ],
      [
        "double",
        "double"
      ],
      [
        "char",
        "char"
      ],
      [
        "String",
        "String"
      ],
      [
        "float",
        "float"
      ]
    ]
  },

  {
    "type": "field_input",
    "name": "VARIABLENAME",
    "text": "VariableName"
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
      "tooltip": "",
      "helpUrl": ""
    }, 
    
    {
      "type": "praxly_reassignment_block",
      "message0": "%1⬅%2 %3",
      "args0": [
      
        {
          "type": "field_input",
          "name": "VARIABLENAME",
          "text": "VariableName"
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
            "tooltip": "",
            "helpUrl": ""
          }, 
    {
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
      "tooltip": "",
      "helpUrl": ""
    }, 
    {
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
      "tooltip": "",
      "helpUrl": ""
    }, 
    {
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
      "tooltip": "",
      "helpUrl": ""
    }, 
  
    
    {
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
      "style": 'expression_blocks',
      "tooltip": "",
      "helpUrl": ""
    }, 
    {
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
      "tooltip": "",
      "helpUrl": ""
    }, 
    {
      "type": "praxly_String_block",
      "message0": "\"%1\"",
      "args0": [
        {
          "type": "field_input",
          "name": "LITERAL",
          "text": "String"
        }
      ],
      "output": null,
      "style": 'expression_blocks',
      "tooltip": "",
      "helpUrl": ""
    }, 
    
    {
      "type": "custom_operation_block",
      "message0": "Custom Operation %1 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "input1",
          "check": "Number",
          "align": "RIGHT",
          "defaultType": "math_number",
          "defaultValue": 5
        },
        {
          "type": "input_value",
          "name": "input2",
          "check": "Number",
          "align": "RIGHT",
          "defaultType": "math_number",
          "defaultValue": 10
        }
      ],
      "output": "Number",
      "colour": 230,
      "tooltip": "Perform custom operation",
      "helpUrl": ""
    }, 

    {
      "type": "praxly_assignment_expression_block",
      "message0": "%1%2 ⬅ %3 %4",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            [
              "int",
              "int"
            ],
            [
              "boolean",
              "boolean"
            ],
            [
              "double",
              "double"
            ],
            [
              "char",
              "char"
            ],
            [
              "String",
              "String"
            ],
            [
              "float",
              "float"
            ]
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
            "tooltip": "",
            "helpUrl": ""
          }, 

          {
            "type": "praxly_not_block",
            "message0": "not %1 %2",
            "args0": [
              {
                "type": "input_value",
                "name": "EXPRESSION"
              },
              {
                "type": "input_dummy"
              }
            ],
            "output": "Boolean",
            "style": 'logic_blocks',
            "tooltip": "",
            "helpUrl": ""
          }, 
          {
            "type": "praxly_reassignment_expression_block",
            "message0": "%1⬅%2 %3",
            "args0": [
            
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
                  "tooltip": "",
                  "helpUrl": ""
                }, 

                {
                  "type": "praxly_parameter_block",
                  "message0": "%1 %2",
                  "args0": [
                    {
                      'type': 'field_image', 
                      'src': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/plus-icon-18-256.png', 
                      'name': 'PLUS_BUTTON',
                      'width': 19, 
                      'height': 19, 
                      'alt': '*', 
                      
                    },
                    // {
                    //   "type": "field_input",
                    //   "name": "LITERAL",
                    //   "text": "parameterName"
                    // },
                    {
                      'type': 'field_image', 
                      'src': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/minus-icon-256.png', 
                      'name': 'MINUS_BUTTON',
                      'width': 19, 
                      'height': 19, 
                      'alt': '*', 
                      
                    },
                    ],
                  "output": null,
                  "style": 'parameter_blocks',
                  "tooltip": "",
                  "helpUrl": "", 
                  'mutator': 'praxly_arity',
                  'extensions': ['addParams'],
                  "inputsInline": true,
                },   
                {
                  "type": "praxly_singular_param_block",
              
                  "message0": "%1%2",
                  "args0": [
                    {
                      "type": "field_dropdown",
                      "name": "VARTYPE",
                      "options": [
                        [
                          "int",
                          "int"
                        ],
                        [
                          "boolean",
                          "boolean"
                        ],
                        [
                          "double",
                          "double"
                        ],
                        [
                          "char",
                          "char"
                        ],
                        [
                          "String",
                          "String"
                        ],
                        [
                          "float",
                          "float"
                        ]
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
                        "tooltip": "",
                        "helpUrl": ""
                      }, 
    ]);

 
    
    
    
}