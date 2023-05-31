'use strict';

import { _KEY_CODE_, _KEYBOARD_FLAGS_ } from '../../utils/constants.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { addElement } from '../../utils/functions.js';

export default function Keyboard(__append, __states, __confirm, __back) {

    if (!new.target) 
        throw new Error('Keyboard() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const DOMElement = {
        main:     null,
        keyboard: null,
            btn_back:    null,
            btn_clear:   null,
            btn_confirm: null
    },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _back = () => { __back(); },
    _clear = () => {
        const current_input = __states.getElement();
        if (current_input)
            current_input['_input_'].clear();
    },
    _confirm = () => { __confirm(); };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.update = (flags = _KEYBOARD_FLAGS_.NONE) => {
        const parent = DOMElement.keyboard.parentNode;
        const main = parent.querySelector('.main');

        if (flags === _KEYBOARD_FLAGS_.NONE) {
            main.classList.remove('with-keyboard');
            DOMElement.keyboard.style.removeProperty('height'); 
            return;
        }

        let height = 0;
        main.classList.add('with-keyboard');

        DOMElement.btn_back.style.display = 'none';
        if (flags & _KEYBOARD_FLAGS_.BTN_BACK)
            DOMElement.btn_back.style.display = 'block';

        DOMElement.btn_clear.style.display = 'none';
        if (flags & _KEYBOARD_FLAGS_.BTN_CLEAR)
            DOMElement.btn_clear.style.display = 'block';

        DOMElement.btn_confirm.style.display = 'none';
        if (flags & _KEYBOARD_FLAGS_.BTN_OK)
            DOMElement.btn_confirm.style.display = 'block';
        
        if (flags & _KEYBOARD_FLAGS_.BTN_BACK |
            flags & _KEYBOARD_FLAGS_.BTN_CLEAR |
            flags & _KEYBOARD_FLAGS_.BTN_OK)
            height += 30; 

        if (flags & _KEYBOARD_FLAGS_.TYPE_NUMPAD | 
            flags & _KEYBOARD_FLAGS_.TYPE_QWERTY)
            height += 108; 
        
        DOMElement.keyboard.style.height = height + 'px';
    };
    this.controls = (enable = true, flags = _KEYBOARD_FLAGS_.NONE) => {
        if (flags & _KEYBOARD_FLAGS_.BTN_OK) {
            if (enable)
                DOMElement.btn_confirm.removeAttribute('disabled');
            else
                DOMElement.btn_confirm.setAttribute('disabled', '');
        }

        if (flags & _KEYBOARD_FLAGS_.BTN_BACK) {
            if (enable)
                DOMElement.btn_back.removeAttribute('disabled');
            else
                DOMElement.btn_back.setAttribute('disabled', '');
        }

        if (flags & _KEYBOARD_FLAGS_.BTN_CLEAR) {
            if (enable)
                DOMElement.btn_clear.removeAttribute('disabled');
            else
                DOMElement.btn_clear.setAttribute('disabled', '');
        }
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        DOMElement.keyboard = addElement(__append, 'div', 'controls');

        const controls_buttons = addElement(DOMElement.keyboard, 'div', 'controls-buttons');

        DOMElement.btn_back = addElement(controls_buttons, 'button', 'back', _I18N_.keyboard_back);
        DOMElement.btn_back.addEventListener('click', _back, { capture: false });

        DOMElement.btn_clear = addElement(controls_buttons, 'button', 'clear', _I18N_.keyboard_clear);
        DOMElement.btn_clear.addEventListener('click', _clear, { capture: false });

        DOMElement.btn_confirm = addElement(controls_buttons, 'button', 'confirm', _I18N_.keyboard_confirm);
        DOMElement.btn_confirm.addEventListener('click', _confirm, { capture: false });

        const keyboard = addElement(DOMElement.keyboard, 'div', 'keyboard');
        [_KEY_CODE_.KEY1, _KEY_CODE_.KEY2, _KEY_CODE_.KEY3, _KEY_CODE_.KEY4, 
         _KEY_CODE_.KEY5, _KEY_CODE_.KEY6, _KEY_CODE_.KEY7, _KEY_CODE_.KEY8, 
         _KEY_CODE_.KEY9, _KEY_CODE_.COMMA, _KEY_CODE_.KEY0, _KEY_CODE_.BACKSPACE].forEach( ({code, key} = element) => {
            const button = addElement(keyboard, 'button', 'font-awesome', key);
            button.setAttribute('_key', code);
        });

        keyboard.addEventListener('click', evnt => {
            const current_input = __states.getElement(),
                  code = evnt.target.getAttribute('_key');
                  
            if (current_input)
                current_input['_input_'].add(code);
    
        }, { capture: false });
    })();
}