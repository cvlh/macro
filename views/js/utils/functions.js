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
export function UUIDv4() {
    let uuid_format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
        millisecond = new Date().getTime();

    return uuid_format.replace(/[xy]/g, letter => {
        let random = Math.random() * 16 | 0;
        if (millisecond > 0) {
            random = (millisecond + random) % 16 | 0;
            millisecond = Math.floor(millisecond / 16);
        }
        return (letter === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
    });
};