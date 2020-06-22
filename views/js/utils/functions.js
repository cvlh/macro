'use strict';

export function addElement (parent, type, className = null, content = null) {
    let new_element;

    new_element = parent.appendChild(document.createElement(type));
    if (className !== null) new_element.className = className;
    if (content !== null) new_element.appendChild(document.createTextNode(content));

    return new_element;
}