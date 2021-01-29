'use strict';

import { _ORDER_ } from '../utils/constants.js';

Array.prototype.swap = function (position, order) {
    var aux = this[position];
    switch (order) {
        case _ORDER_.UP:
            this[position] = this[position-1];
            this[position-1] = aux;
            break;

        case _ORDER_.DOWN:
            this[position] = this[position+1];
            this[position+1] = aux;
            break;
    }
    return this;
}

export function addElement (parent, type, className = null, content = null) {
    let new_element;

    new_element = parent.appendChild(document.createElement(type));
    if (className !== null) new_element.className = className;
    if (content !== null) new_element.appendChild(document.createTextNode(content));

    return new_element;
}