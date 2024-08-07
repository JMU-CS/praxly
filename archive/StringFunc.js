/* blocks2tree.js */

praxlyGenerator['praxly_StringFunc_block'] = (block) => {
    const expression = block.getInputTargetBlock('EXPRESSION');
    var procedureName = block.getFieldValue('FUNCTYPE');
    var args = block.getInputTargetBlock('PARAMS');
    var argschildren = args.getChildren(true);
    var argsList = [];
    argschildren.forEach(element => {
        argsList.push(praxlyGenerator[element.type](element));
    });
    return customizeMaybe(block, {
        blockID: block.id,
        type: NODETYPES.SPECIAL_STRING_FUNCCALL,
        left: praxlyGenerator[expression.type](expression),
        right: {
            name: procedureName,
            args: argsList,
            type: NODETYPES.FUNCCALL
        }
    });
}

/* newBlocks.js */

a = [
  { // text 1
    "type": "praxly_StringFunc_block",
    "message0": "%1.%2(%3)",
    "args0": [
      {
        "type": "input_value",
        "name": "EXPRESSION"
      },
      {
        "type": "field_dropdown",
        "name": "FUNCTYPE",
        "options": [
          ["charAt", StringFuncs.CHARAT],
          ["contains", StringFuncs.CONTAINS],
          ['indexOf', StringFuncs.INDEXOF],
          ["length", StringFuncs.LENGTH],
          ["substring", StringFuncs.SUBSTRING],
          ["toLowerCase", StringFuncs.TOLOWERCSE],
          ["toUpperCase", StringFuncs.TOUPPERCASE],
        ]
      },
      {
        "type": "input_value",
        "name": "PARAMS",
        "text": "params"
      },
    ],
    "inputsInline": true,
    "output": null,
    "style": 'other_blocks',
    "tooltip": "String methods:\ncharAt(i) - Returns the character at index i\ncontains(s) - Returns true if s is a substring\nindexOf(s) - Returns the first index of substring s, or -1 if not found\nlength() - Returns the length of the string\nsubstring(i, j) - Extracts characters from index i up to but not including index j\ntoLowerCase() - Converts the string to all lowercase\ntoUpperCase() - Converts the string to all uppercase",
    "helpUrl": ""
  },
]

/* toolbox.js */

b = [
  {
    'kind': 'block',
    'type': 'praxly_StringFunc_block',
    'inputs': {
      'EXPRESSION': {
        'shadow': {
          'type': 'praxly_literal_block',
          'fields': {
            'LITERAL': '\"hello, world\"',
          }
        },
      },
      'PARAMS': {
        'block': {
          'type': 'praxly_parameter_block',
        }
      }
    }
  },
]
