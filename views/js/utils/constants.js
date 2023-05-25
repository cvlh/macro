'use strict';

export const _QUADRATIC_CURVE_OFFSET_ = 30;

export const _DRAG_ = {
    HEADER : 0,
    OUTPUT : 1,
    AREA   : 2,
    LINE   : 3
};

export const _MOV_ = {
    START: 0,
    MOV:   1,
    END:   2,
    NEW:   3
};

export const _ZOOM_ = {
    MAX: 4,
    MIN: 0.1
};

// const root_style = getComputedStyle(document.body);
// export const _COLORS_ = {
//     RED:     root_style.getPropertyValue('--red-base'),
//     PINK:    root_style.getPropertyValue('--pink-base'),
//     PURPLE:  root_style.getPropertyValue('--purple-base'),
//     BLUE:    root_style.getPropertyValue('--blue-base'),
//     SKY:     root_style.getPropertyValue('--sky-base'),
//     INDIGO:  root_style.getPropertyValue('--indigo-base'),
//     CYAN:    root_style.getPropertyValue('--cyan-base'),
//     LIME:    root_style.getPropertyValue('--lime-base'),
//     GREEN:   root_style.getPropertyValue('--green-base'),
//     ORANGE:  root_style.getPropertyValue('--orange-base'),
//     YELLOW:  root_style.getPropertyValue('--yellow-base'),
//     NEUTRAL: root_style.getPropertyValue('--neutral-base'),
//     GRAY:    root_style.getPropertyValue('--gray-base')
// };

// export const _COLORS_ = {
//     RED:    '#ff0000', // 'red'
//     PURPLE: '#a200f2', // 'blueviolet'
//     // PURPLE: '#aa00ff',
//     BLUE:   '#304ffe', // 'blue'
//     TEAL:   '#008080', // 'teal'
//     GREEN:  '#43a047', // 'green'
//     ORANGE: '#ff6f00', // 'darkorange'
//     // ORANGE: '#ff6d00',
//     BROWN:  '#795548', // 'saddlebrown'
//     BLACK:  '#000000'  // 'black'
// };

export const _COLORS_ = {
    RED:    'red',          // 'red'
    PURPLE: 'blueviolet',   // 'blueviolet'
    BLUE:   'blue',         // 'blue'
    TEAL:   'teal',         // 'teal'
    GREEN:  'green',        // 'green'
    ORANGE: 'darkorange',   // 'darkorange'
    BROWN:  'saddlebrown',  // 'saddlebrown'
    BLACK:  'black'         // 'black'
};

export const _TYPES_ = {
    LIST:      0,
    TEXT:      1,
    NUMBER:    2,
    DATE:      3,
    PHOTO:     4,
    SIGNATURE: 5,
    SCAN:      6
};

export const _STATUS_ = {
    NONE:    0,

    VISIBLE: 'visible',
    HIDDEN:  'hidden'
}

export const _VISIBILITY_ = {
    NONE:    0,

    FRESH:   1,
    EXTRA:   2,
    SAVE:    4,
    RESTORE: 8

 // INSTANT: 16,
 // AFTER:   32
};

export const _ICON_CHAR_ = {
    NONE:      '',

    HELP:      'H',
    OUTPUT:    '^',
    INPUT:     '^',
    ARROW:     '^',
    CLOSE:     'X',
    START:     'S',
    UP:        'U',
    DOWN:      'D',
    CHECK:     'C',
    PLUS:      '+',
    EMPTY:     '_',
    HOME:      'h',
    FIT:       'F',
    ZOOM_IN:   'i',
    ZOOM_OUT:  'o',
    ZOOM:      'z',
    VISIBLE:   '[',
    HIDDEN:    ']',
    CAMERA:    '4',
    ALERT:     'a'
};

export const _ORDER_ = {
    NONE : 0,
    
    UP   : 1,
    DOWN : 2
};

export const _KEYBOARD_FLAGS_ = {
    NONE:    0,

    TYPE_NUMPAD:    0x0001,
    TYPE_QWERTY:    0x0002,
 // TYPE_RFU:       0x0004,

    BTN_OK:         0x0008,
    BTN_BACK:       0x0010,
    BTN_CLEAR:      0x0020,
 // RFU:            0x0040,
 // RFU:            0x0080,
 // RFU:            0x0100,
 // RFU:            0x0200,
 // RFU:            0x0400,
 // RFU:            0x0800,
 // RFU:            0x1000,
 // RFU:            0x2000,
 // RFU:            0x4000,
 // RFU:            0x8000
} 

export const _KEY_CODE_ = {
    BACKSPACE: { code:  8, key: '\uf55a' },
    ENTER:     { code: 13, key: '\uf2f6' },
    ESC:       { code: 27, key: '0' },

    KEY0: { code: 48, key: '0' },
    KEY1: { code: 49, key: '1' },
    KEY2: { code: 50, key: '2' },
    KEY3: { code: 51, key: '3' },
    KEY4: { code: 52, key: '4' },
    KEY5: { code: 53, key: '5' },
    KEY6: { code: 54, key: '6' },
    KEY7: { code: 55, key: '7' },
    KEY8: { code: 56, key: '8' },
    KEY9: { code: 57, key: '9' },

    COMMA: { code: 188, key: ',' },
}

export const _FLEX_ALIGN_ = {
    RIGHT  : 'flex-start',
    CENTER : 'center',
    LEFT   : 'flex-end'
};

export const _RUN_ENVIRONMENT_ = {
    WEB:    0,
    MOBILE: 1
}