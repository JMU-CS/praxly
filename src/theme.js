import Blockly from 'blockly';

export const praxlyDefaultTheme = Blockly.Theme.defineTheme('themeName', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
        'loop_blocks': {
            'colourPrimary': '#0361FF'
        },
        'array_blocks': {
            'colourPrimary': '#FA0000'
        },
        'logic_blocks': {
            'colourPrimary': '#00D084'
        },
        'class_blocks': {
            'colourPrimary': '#6381fe'
        },
        'comment_blocks': {
            'colourPrimary': '#808080'
        },
        'procedure_blocks': {
            'colourPrimary': '#FF6600'
        },
        'variable_blocks': {
            'colourPrimary': '#f80069'
        },
        'expression_blocks': {
            'colourPrimary': '#a7ca00'
        },
        'parameter_blocks': {
            'colourPrimary': '#8F48B7'
        }
    },
    'categoryStyles': {
        'loop_blocks': {
            'colour': '#395BBF'
        },
        'procedure_blocks': {
            'colour': '#FF6600'
        },
        'logic_blocks': {
            'colour': '#00D084'
        },
        'class_blocks': {
            'colour': '#6381fe'
        },
        'comment_blocks': {
            'colour': '#808080'
        },
        'array_blocks': {
            'colour': '#C200F1'
        },
        'variable_blocks': {
            'colour': '#f80069'
        },
        'expression_blocks': {
            'colour': '#a7ca00'
        }
    }
});

export const PraxlyDark = Blockly.Theme.defineTheme('PraxlyDark', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
        'loop_blocks': {
            'colourPrimary': '#0361FF'
        },
        'array_blocks': {
            'colourPrimary': '#FA0000'
        },
        'logic_blocks': {
            'colourPrimary': '#00D084'
        },
        'class_blocks': {
            'colourPrimary': '#6381fe'
        },
        'comment_blocks': {
            'colourPrimary': '#808080'
        },
        'procedure_blocks': {
            'colourPrimary': '#5300EB'
        },
        'variable_blocks': {
            'colourPrimary': '#f80069'
        },
        'expression_blocks': {
            'colourPrimary': '#a7ca00'
        },
        'parameter_blocks': {
            'colourPrimary': '#8F48B7'
        }
    },
    'categoryStyles': {
        'loop_blocks': {
            'colour': '#395BBF'
        },
        'procedure_blocks': {
            'colour': '#FF6600'
        },
        'logic_blocks': {
            'colour': '#00D084'
        },
        'class_blocks': {
            'colour': '#6381fe'
        },
        'comment_blocks': {
            'colour': '#808080'
        },
        'array_blocks': {
            'colour': '#C200F1'
        },
        'variable_blocks': {
            'colour': '#f80069'
        },
        'expression_blocks': {
            'colour': '#a7ca00'
        }
    },
    'componentStyles': {
        'workspaceBackgroundColour': '#1e1e1e',
        'toolboxBackgroundColour': 'blackBackground',
        'toolboxForegroundColour': '#fff',
        'flyoutBackgroundColour': '#252526',
        'flyoutForegroundColour': '#ccc',
        'flyoutOpacity': 1,
        'scrollbarColour': '#797979',
        'insertionMarkerColour': '#fff',
        'insertionMarkerOpacity': 0.3,
        'scrollbarOpacity': 0.4,
        'cursorColour': '#d0d0d0',
        'blackBackground': '#333',
    },
});
