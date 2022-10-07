'use strict';

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
    MAX: 5,
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
export const _COLORS_ = {
    RED:    '#ff0000',
    PURPLE: '#aa00ff',
    BLUE:   '#304ffe',
    TEAL:   '#008080',
    GREEN:  '#43a047',
    ORANGE: '#ff6d00',
    BROWN:  '#795548',
    BLACK:  '#000000'
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
    HIDDEN:    ']'
};

export const _ORDER_ = {
    NONE : 0,
    
    UP   : 1,
    DOWN : 2
};

export const _QUADRATIC_CURVE_OFFSET_ = 30;