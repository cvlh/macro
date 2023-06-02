'use strict';

import { _COLORS_, _KEYBOARD_FLAGS_, _KEY_CODE_, _RUN_ENVIRONMENT_ } from '../../../utils/constants.js';
import { _I18N_ } from '../../../i18n/pt-br.js';
import { addElement } from '../../../utils/functions.js';

export default function InputTime(__append, __properties) {

    if (!new.target)
        throw new Error('InputTime() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let itemHeight;

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const
        DOMElement = {
            timepicker: null
        },

        _pad = (number) => number < 10 ? '0' + number : number,

        _start = (evnt) => {
            evnt.preventDefault();

            const { target } = evnt;

            const list = target.firstElementChild;
            list.style.removeProperty('transition');
            
            target['_props_'] = {
                'last': evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY,
                'move': 0
            }

            if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
                target.addEventListener('pointermove', _spin, { capture: false });
                target.addEventListener('pointerup', _stop, { once: true, capture: false });
                target.addEventListener('pointerout', _stop, { once: true, capture: false });
            } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
                target.addEventListener('touchmove', _spin, { capture: true });
                target.addEventListener('touchend', _stop, { once: true, capture: true });
                target.addEventListener('touchend', _stop, { once: true, capture: true });
            }
        },
        _spin = (evnt) => {
            evnt.preventDefault();

            const { target } = evnt;
            const props = target['_props_'];
            const list = target.firstElementChild;

            const end_y = evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY;
            let move_y = props['move'] + (end_y - props['last']);

            const highlight = list.querySelector('.picker-picked');
            const up = move_y > 0 ? false : true;
            const mov = Math.abs(move_y);

            if (mov > itemHeight * 0.8) {
                highlight.previousSibling.style.removeProperty('font-size');
                highlight.style.removeProperty('font-size');
                highlight.nextSibling.style.removeProperty('font-size');

                const sibling = up ? highlight.nextSibling : highlight.previousSibling;
                const first = list.firstElementChild;
                if (up) {
                    const removed_child = list.removeChild(first);
                    list.appendChild(removed_child);

                    removed_child['_date_'].setHours(removed_child.previousSibling['_date_'].getHours() + 1);
                    removed_child.textContent = _pad(removed_child['_date_'].getHours());                        

                    move_y += itemHeight;
                } else {
                    const last = list.lastElementChild;
                    const removed_child = list.removeChild(last);
                    list.insertBefore(removed_child, first);

                    removed_child['_date_'].setHours(removed_child.nextSibling['_date_'].getHours() - 1);
                    removed_child.textContent = _pad(removed_child['_date_'].getHours());     

                    move_y -= itemHeight;
                }
                
                highlight.className  = 'picker-item';
                sibling.className  = 'picker-picked';
            } else {
                const offset = 7 - ((itemHeight - mov) / itemHeight) * 7;

                highlight.style.fontSize = (20 - offset) + 'px';
                let sibling = up ? highlight.nextSibling : highlight.previousSibling;
                sibling.style.fontSize = (13 + offset) + 'px';
            }

            props['last'] = end_y;
            props['move'] = move_y;

            list.style.top = move_y + 'px';
        },
        _stop = (evnt) => {
            evnt.preventDefault();

            const { target } = evnt;

            const list = target.firstElementChild;
            list.style.transition = '0.15s top ease';
            list.style.top = '0px';

            for (const child of list.children)
                child.removeAttribute('style');

            delete target['_props_']

            if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
                target.removeEventListener('pointerup', _stop, { once: true, capture: false });
                target.removeEventListener('pointerout', _stop, { once: true, capture: false });
                target.removeEventListener('pointermove', _spin, { capture: false });

                target.addEventListener('pointerdown', _start, { once: true, capture: false });
            } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
                target.removeEventListener('touchmove', _spin, { capture: true });
                target.addEventListener('touchstart', _start, { once: true, capture: true });
            }
        };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.clear = () => _clear();

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function () {
        const now = new Date();

        DOMElement.timepicker = addElement(__append, 'div', 'picker');
        addElement(DOMElement.timepicker, 'div', 'picker-mask');
        
        const hours_body = addElement(DOMElement.timepicker, 'div', 'picker-body');
        const hours_list = addElement(hours_body, 'div', 'picker-list');

        const minutes_body = addElement(DOMElement.timepicker, 'div', 'picker-body');
        const minutes_list = addElement(minutes_body, 'div', 'picker-list');

        const seconds_body = addElement(DOMElement.timepicker, 'div', 'picker-body');
        const seconds_list = addElement(seconds_body, 'div', 'picker-list');

        for (let counter = 0; counter < 9; counter++) {
            const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + (counter - 4), now.getMinutes() + (counter - 4), now.getSeconds() + (counter - 4));
            
            const hour = addElement(hours_list, 'div', current.getHours() === now.getHours() ? 'picker-picked' : 'picker-item', _pad(current.getHours()));
            hour['_date_'] = current;

            const minutes = addElement(minutes_list, 'div', current.getMinutes() === now.getMinutes() ? 'picker-picked' : 'picker-item', _pad(current.getMinutes()));
            minutes['_date_'] = current;

            const second = addElement(seconds_list, 'div', current.getSeconds() === now.getSeconds() ? 'picker-picked' : 'picker-item', _pad(current.getSeconds()));
            second['_date_'] = current;
        }

        itemHeight = seconds_list.firstElementChild.offsetHeight;

        const cells = DOMElement.timepicker.querySelectorAll('.picker-body');
        if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
            cells.forEach(element =>  element.addEventListener('pointerdown', _start, { once: true, capture: true }));
        } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
            cells.forEach(element =>  element.addEventListener('touchstart', _start, { once: true, capture: true }));
        }
    })();
}