import { NODETYPES } from "./common";

export const toolbox = {
  'kind': 'categoryToolbox',
  'contents': [

    {
      "kind": "category",
      "name": "common",
      "categorystyle": "comment_blocks",
      "contents": [
        {
          'kind': 'block',
          'type': 'praxly_print_block',
          'inputs': {
            'EXPRESSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '\"hello, world\"',
                }
              },
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_input_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_single_line_comment_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_comment_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_emptyline_block'
        },
      ]
    },
    {
      "kind": "category",
      "name": "variables",
      "categorystyle": "variable_blocks",
      "contents": [
        {
          'kind': 'block',
          'type': 'praxly_variable_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_vardecl_block',
        },
        {
          'kind': 'block',
          'type': 'praxly_assignment_block',
          'inputs': {
            'EXPRESSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 0,
                }
              },
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_reassignment_block',
          'inputs': {
            'EXPRESSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 0,
                }
              },
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_array_assignment_block',
          'inputs': {
            'EXPRESSION': {
              'block': {
                'type': 'praxly_parameter_block',
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_array_reference_reassignment_block',
          'inputs': {
            'INDEX': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '0',
                }
              },
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_array_reference_block',
          'inputs': {
            'INDEX': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '0',
                }
              },
            },
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "math",
      "categorystyle": "expression_blocks",
      "contents": [
        {
          'kind': 'block',
          'type': 'praxly_literal_block'
        },
        // {
        //   'kind': 'block',
        //   'type': 'praxly_String_block'
        // },
        {
          'kind': 'block',
          'type': 'praxly_arithmetic_block',
          'inputs': {
            'A_OPERAND': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1,
                }
              },
            },
            'B_OPERAND': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1,
                }
              },
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_negate_block',
          'inputs': {
            'EXPRESSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '\expression',
                }
              },
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_random_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_random_int_block',
          'inputs': {
            'MAX': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '10',
                }
              },
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_random_seed_block',
          'inputs': {
            'SEED': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '0',
                }
              },
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_int_conversion_block',
          'inputs': {
            'CONVERSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '"10"'
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_float_conversion_block',
          'inputs': {
            'CONVERSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '"10.0"'
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_min_block',
          'inputs': {
            'A_MIN': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1
                }
              }
            },
            'B_MIN': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 2
                }
              }
            },
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_max_block',
          'inputs': {
            'A_MAX': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1
                }
              }
            },
            'B_MAX': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 2
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_abs_block',
          'inputs': {
            'VALUE': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_log_block',
          'inputs': {
            'VALUE': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_sqrt_block',
          'inputs': {
            'VALUE': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1
                }
              }
            }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "text",
      "categorystyle": "class_blocks",
      "contents": [
        // {
        //   'kind': 'block',
        //   'type': 'praxly_StringFunc_block',
        //   'inputs': {
        //     'EXPRESSION': {
        //       'shadow': {
        //         'type': 'praxly_literal_block',
        //         'fields': {
        //           'LITERAL': '\"hello, world\"',
        //         }
        //       },
        //     },
        //     'PARAMS': {
        //       'block': {
        //         'type': 'praxly_parameter_block',
        //       }
        //     }
        //   }
        // },
        {
          'kind': 'block',
          'type': 'praxly_charAt_block',
          'inputs': {
            'EXPRESSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '\"hello, world\"',
                }
              },
            },
            'INDEX': {
              'block': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 0
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_contains_block',
          'inputs': {
            'EXPRESSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': '\"hello, world\"',
                }
              },
            },
            'PARAM': {
              'block': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 'value'
                }
              }
            }
          }
          }
      ]
    },
    {
      "kind": "category",
      "name": "logic",
      "categorystyle": "logic_blocks",
      "contents": [
        {
          'kind': 'block',
          'type': 'praxly_true_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_false_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_if_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_if_else_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_boolean_operators_block',
          'inputs': {
            'A_OPERAND': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': true,
                }
              },
            },
            'B_OPERAND': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': false,
                }
              },
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_not_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_compare_block',
          'inputs': {
            'A_OPERAND': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1,
                }
              },
            },
            'B_OPERAND': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 1,
                }
              },
            }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "loops",
      "categorystyle": "loop_blocks",
      "contents": [
        {
          'kind': 'block',
          'type': 'praxly_for_loop_block',
          'inputs': {
            'INITIALIZATION': {
              'block': {
                'type': 'praxly_assignment_expression_block',
                'fields': {
                  'VARTYPE': NODETYPES.INT,
                },
                'inputs': {
                  'EXPRESSION': {
                    'shadow': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': '0',
                      }
                    },
                  }
                }
              }
            },
            'CONDITION': {
              'block': {
                'type': 'praxly_compare_block',
                'inputs': {
                  'A_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': "i",
                      }
                    },
                  },
                  'B_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': 10,
                      }
                    },
                  },
                },
                'fields': {
                  'OPERATOR': 'LESS THAN'
                }
              }
            },
            'REASSIGNMENT': {
              'block': {
                'type': 'praxly_reassignment_expression_block',
                'inputs': {
                  'LOCATION': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': 'i',
                      }
                    },
                  },
                  'EXPRESSION': {
                    'block': {
                      'type': 'praxly_arithmetic_block',
                      'inputs': {
                        'A_OPERAND': {
                          'shadow': {
                            'type': 'praxly_variable_block',
                            'fields': {
                              'LITERAL': "i",
                            }
                          },
                        },
                        'B_OPERAND': {
                          'shadow': {
                            'type': 'praxly_literal_block',
                            'fields': {
                              'LITERAL': 1,
                            }
                          },
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_while_loop_block',
          'inputs' : {
            'CONDITION': {
              'block': {
                'type': 'praxly_compare_block',
                'inputs': {
                  'A_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': "i",
                      }
                    },
                  },
                  'B_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': 10,
                      }
                    },
                  },
                },
                'fields': {
                  'OPERATOR': 'LESS THAN'
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_do_while_loop_block',
          'inputs' : {
            'CONDITION': {
              'block': {
                'type': 'praxly_compare_block',
                'inputs': {
                  'A_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': "i",
                      }
                    },
                  },
                  'B_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': 10,
                      }
                    },
                  },
                },
                'fields': {
                  'OPERATOR': 'LESS THAN'
                }
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_repeat_until_loop_block',
          'inputs' : {
            'CONDITION': {
              'block': {
                'type': 'praxly_compare_block',
                'inputs': {
                  'A_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': "i",
                      }
                    },
                  },
                  'B_OPERAND': {
                    'block': {
                      'type': 'praxly_literal_block',
                      'fields': {
                        'LITERAL': 10,
                      }
                    },
                  },
                },
                'fields': {
                  'OPERATOR': 'LESS THAN'
                }
              }
            }
          }
        }
      ]
    },

    // {
    //   "kind": "category",
    //   "name": "statements",
    //   "categorystyle": "array_blocks",
    //   "contents": [
    //     {
    //       'kind': 'block',
    //       'type': 'custom_operation_block'
    //     },
    //   ]
    // },
    // {
    //   "kind": "category",
    //   "name": "experimental",
    //   "categorystyle" : "class_blocks",
    //   // "categorystyle": "class_blocks",
    //   "contents": [
    //         {
    //           'kind': 'block',
    //           'type': 'praxly_parameter_block',
    //           'extraState': {
    //             'arity': 3,
    //           }
    //         },
    //         {
    //           'kind': 'block',
    //           'type': 'praxly_singular_param_block'
    //         },
    //   ]
    // },

    {
      "kind": "category",
      "name": "procedures",
      "categorystyle": "procedure_blocks",
      "contents": [
        {
          'kind': 'block',
          'type': 'praxly_procedure_block',
          'inputs': {
            'PARAMS': {
              'block': {
                'type': 'praxly_parameter_block',
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_singular_param_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_return_block'
        },
        {
          'kind': 'block',
          'type': 'praxly_function_call_block',
          'inputs': {
            'PARAMS': {
              'block': {
                'type': 'praxly_parameter_block',
              }
            }
          }
        },
        {
          'kind': 'block',
          'type': 'praxly_statement_block',
          'inputs': {
            'EXPRESSION': {
              'shadow': {
                'type': 'praxly_literal_block',
                'fields': {
                  'LITERAL': 'expression',
                }
              },
            },
          }
        }
      ]
    }
  ]
};
