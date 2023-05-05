'use strict';

import { _KEY_CODE_, _KEYBOARD_FLAGS_ } from '../../utils/constants.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { addElement } from '../../utils/functions.js';

export default function Keyboard(__append, __states, __execute) {

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
    _back = () => {

    },
    _clear = () => {
        const current_input = __states.get_input();
        if (current_input)
            current_input.clear();
    },
    _confirm = () => {
        const current_input = __states.getElement();
        const previous_input = __states.getPrevElement();

        if (current_input && __states.hasMore()) {
            current_input.style.animationPlayState = 'running';

            if (previous_input)
                previous_input.style.animationName = 'shrink_item_inputs';

            const shortcut = macro[list[last]['_props_'][0]];
            switch (shortcut['type']['type']) {
                case _TYPES_.NUMBER:
                    this.update(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;
                
                case _TYPES_.SIGNATURE:
                    this.update(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;

                case _TYPES_.PHOTO:
                    break;

                default:
                    this.update(_KEYBOARD_FLAGS_.NONE);
            }
            
            __states.incCurrent();
        } else {
            if (previous_input) {
                const [id, color] = previous_input['_props_'];
                __execute(id, color);
            }
        }
    };

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
        if (flags & _KEYBOARD_FLAGS_.BTN_BACK) {
            DOMElement.btn_back.style.display = 'block';
            
            DOMElement.btn_back.setAttribute('disabled', '');
            if (__states.isFirst())
                DOMElement.btn_back.removeAttribute('disabled');             
        }

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
            const current_input = __states.getPrevInput(),
                  target = evnt.target,
                  code = evnt.target.getAttribute('_key');

            // const last = structInputs['last'],
            //       list = structInputs['list'],
            //     //   target = evnt.target,
            //       code = evnt.target.getAttribute('_key'), // target['_code_'],
            //       input = list[last - 1]['_props_'][2];
                  
            if (current_input)
                current_input.add(code);
            
        }, { capture: false });
    })();
}