'use strict';

import { _COLORS_, _FLEX_ALIGN_, _KEY_CODE_ } from '../../../utils/constants.js';
import { _I18N_ } from '../../../i18n/pt-br.js';
import { addElement } from '../../../utils/functions.js';

export default function InputNumber(__append, __properties) {
    
    if (!new.target) 
        throw new Error('InputNumber() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let decimal, precision,
        maximum, maximumLength, minimum, minimumLength,
        optional,
        inputArray = [];

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const
        DOMElement = {
            container: null,
            item:      null
        },

    render = () => {
        let result = true, text = '';

        if (decimal) {
            const diff = (precision + 1) - inputArray.length;
            if (diff > 0) {
                for (let counter = 0; counter < diff; counter++)
                    inputArray.unshift('0');
            }

            if (diff < 0 && inputArray[0] === '0')
                inputArray.shift();
        }

        if (inputArray.length > maximumLength)
            inputArray.pop();
        
        const diff = inputArray.length - precision;
        inputArray.forEach( (element, index) => {
            if (decimal && index  === diff)
                text += ',';

            text += element;
        } );

        const value = parseFloat(text.replace(',', '.'));
        if (value < minimum || value > maximum) {
            if (value < minimum)
                DOMElement.container.setAttribute('data-info', _I18N_.simulate_filed_underflow + minimum);

            if (value > maximum)
                DOMElement.container.setAttribute('data-info', _I18N_.simulate_filed_overflow + maximum);

            DOMElement.item.style.color = 'var(--neutral-700)';

            result = false;
        } else {
            DOMElement.container.removeAttribute('data-info');
            DOMElement.item.style.removeProperty('color');
        }

        DOMElement.item.textContent = text;
        return result;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.add = (keyCode) => {
        if (keyCode == _KEY_CODE_.BACKSPACE.code)
            inputArray.pop();

        if (keyCode >= _KEY_CODE_.KEY0.code && 
            keyCode <= _KEY_CODE_.KEY9.code) {

            if (!decimal && inputArray.length === 1 && inputArray[0] == _KEY_CODE_.KEY0.key) {
                if (keyCode == _KEY_CODE_.KEY0.code)
                    return;

                inputArray[0] = String.fromCharCode(keyCode)
            } else {          
                inputArray.push(String.fromCharCode(keyCode));
            }
        }

        return render();
    };
    this.clear = () => {
        // if (__properties.hasOwnProperty('default')) 
        //     inputArray = [__properties['default']];
        // else
            inputArray = [];

        DOMElement.item.textContent = __properties?.['default'] ?? ''; 
        render();
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        const fragment = document.createDocumentFragment();

        DOMElement.container = addElement(fragment, 'div', 'item-input-box');
        DOMElement.container.setAttribute('data-info', '');

        DOMElement.item = addElement(DOMElement.container, 'div', '');

        __append.appendChild(fragment);

        // PROPERTIES
        DOMElement.container.style.color = __properties?.['color'] ?? _COLORS_.BLACK;
        DOMElement.container.style.justifyContent = __properties?.['align'] ?? _FLEX_ALIGN_.LEFT;
        // if (__properties.hasOwnProperty('default')) 
        //     inputArray.push(__properties['default']);
        DOMElement.item.textContent = __properties?.['default'] ?? '';

        decimal   = __properties?.['decimal'] ?? false;
        precision = decimal ? (__properties?.['precision'] ?? 2) : 0;

        maximum = __properties?.['maximum'] ?? 999999;
        minimum = __properties?.['minimum'] ?? 0;

        maximumLength = maximum.toString().length;
        minimumLength = minimum.toString().length;

        if (decimal) {
            maximumLength--;
            minimumLength--;
        }

        render();
    })();
}