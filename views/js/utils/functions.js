'use strict';

export function addElement (parent, type, className = null) {
    let new_element;

    new_element = parent.appendChild(document.createElement(type));
    if (className !== null) new_element.className = className;

    return new_element;
}