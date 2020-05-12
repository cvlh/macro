'use strict';

export function addElement (parent, type, className) {
    let new_element;

    new_element = parent.appendChild(document.createElement(type));
    new_element.className = className;

    return new_element;
}