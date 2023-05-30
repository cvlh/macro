'use strict';

import { _COLORS_, _KEYBOARD_FLAGS_, _KEY_CODE_ } from '../../../utils/constants.js';
import { _I18N_ } from '../../../i18n/pt-br.js';
import { addElement } from '../../../utils/functions.js';

export default function InputTime(__append, __properties) {

    if (!new.target)
        throw new Error('InputTime() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let startY, moveY, itemHeight, block = false;

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const
        DOMElement = {
            timepicker: null
        },

        _pad = (number) => number < 10 ? '0' + number : number,
        _time = (date) => _pad(date.getDate()) + '/' + _pad((date.getMonth() + 1)) + '/' + _pad(date.getFullYear()),

        _render = () => {

        };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.add = (keyCode) => {

    };
    this.clear = () => _clear();

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function () {
        DOMElement.timepicker = addElement(__append, 'div', 'picker');

        const hour = addElement(DOMElement.timepicker, 'div', 'picker-cell');
        hour.addEventListener('touchstart', (evnt) => {
            evnt.preventDefault();
            const target = evnt.target;
            const list = target.querySelector('.picker-list');
            if (list) {
                list.style.removeProperty('transition');
                itemHeight = list.firstElementChild.offsetHeight;
                startY = evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY;
                moveY = 0;
            }

        }, { capture: false });
        hour.addEventListener('touchmove', (evnt) => {
            evnt.preventDefault();
            const target = evnt.target;
            const list = target.querySelector('.picker-list');
            if (list) {
                const end_y = evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY;
                let move_y = moveY + (end_y - startY);

                let highlight = list.querySelector('.picker-picked');
                let up = move_y > 0 ? false : true;
                
                const mov = Math.abs(move_y);
                if (mov > itemHeight * 0.8) {

                    highlight.nextSibling.style.removeProperty('font-size');
                    highlight.previousSibling.style.removeProperty('font-size');
                    highlight.style.removeProperty('font-size');

                    const sibling = up ? highlight.nextSibling : highlight.previousSibling;
                    const first = list.firstElementChild;
                    if (up) {
                        const removed_child = list.removeChild(first);
                        list.appendChild(removed_child);

                        move_y += itemHeight;
                    } else {
                        const last = list.lastElementChild;
                        const removed_child = list.removeChild(last);
                        list.insertBefore(removed_child, first);

                        move_y -= itemHeight;
                    }
                    highlight.className  = 'picker-item';
                    sibling.className  = 'picker-picked';

                } else {
                    const offset = 6 - ((itemHeight - mov) / itemHeight) * 6;

                    highlight.style.fontSize = (19 - offset) + 'px';
                    let sibling = up ? highlight.nextSibling : highlight.previousSibling;
                    sibling.style.fontSize = (13 + offset) + 'px';
                }

                startY = end_y;
                moveY = move_y ;

                list.style.top = `${moveY}px`;
            }

        }, { capture: false });
        hour.addEventListener('touchend', (evnt) => {
            evnt.preventDefault();
            const target = evnt.target;
            const list = target.querySelector('.picker-list');
            if (list) {
                list.style.transition = '0.15s top ease';
                list.style.top = '0px';

                for (const child of list.children)
                    child.style.removeProperty('font-size');
            }
        }, { capture: false });

        const hour_control_prev = addElement(hour, 'div', 'picker-control picker-control-prev');
        const hour_body = addElement(hour, 'div', 'picker-body');
        addElement(hour_body, 'div', 'picker-mask');
        const hour_list = addElement(hour_body, 'div', 'picker-list');
        addElement(hour_list, 'div', 'picker-item', '05');
        addElement(hour_list, 'div', 'picker-item', '06');
        addElement(hour_list, 'div', 'picker-item', '07');
        addElement(hour_list, 'div', 'picker-item', '08');
        addElement(hour_list, 'div', 'picker-picked', '09');
        addElement(hour_list, 'div', 'picker-item', '10');
        addElement(hour_list, 'div', 'picker-item', '11');
        addElement(hour_list, 'div', 'picker-item', '12');
        addElement(hour_list, 'div', 'picker-item', '00');
        const hour_control_next = addElement(hour, 'div', 'picker-control picker-control-next');

        const minute = addElement(DOMElement.timepicker, 'div', 'picker-cell');
        const minute_control_prev = addElement(minute, 'div', 'picker-control picker-control-prev');
        const minute_body = addElement(minute, 'div', 'picker-body');
        addElement(minute_body, 'div', 'picker-mask');
        const minute_list = addElement(minute_body, 'div', 'picker-list');
        addElement(minute_list, 'div', 'picker-item', '05');
        addElement(minute_list, 'div', 'picker-item', '06');
        addElement(minute_list, 'div', 'picker-item', '07');
        addElement(minute_list, 'div', 'picker-item', '08');
        addElement(minute_list, 'div', 'picker-picked', '09');
        addElement(minute_list, 'div', 'picker-item', '10');
        addElement(minute_list, 'div', 'picker-item', '11');
        addElement(minute_list, 'div', 'picker-item', '12');
        addElement(minute_list, 'div', 'picker-item', '00');
        const minute_control_next = addElement(minute, 'div', 'picker-control picker-control-next');

        // DOMElement.timepicker.innerHTML = "\
        //     <div class='picker-cell'> \
        //         <div class='picker-control picker-control-prev'></div> \
        //         <div class='picker-body'> \
        //             <div class='picker-list'> \
        //                 <div class='picker-item'>05</div> \
        //                 <div class='picker-item'>06</div> \
        //                 <div class='picker-item'>07</div> \
        //                 <div class='picker-picked'>08</div> \
        //                 <div class='picker-item'>09</div> \
        //                 <div class='picker-item'>10</div> \
        //                 <div class='picker-item'>11</div> \
        //             </div> \
        //         </div> \
        //         <div class='picker-control picker-control-next'></div> \
        //     </div> \
        //     <div class='picker-cell'> \
        //         <div class='picker-control picker-control-prev'></div> \
        //         <div class='picker-body'> \
        //             <div class='picker-list'> \
        //                 <div class='picker-item'>05</div> \
        //                 <div class='picker-item'>06</div> \
        //                 <div class='picker-item'>07</div> \
        //                 <div class='picker-picked'>08</div> \
        //                 <div class='picker-item'>09</div> \
        //                 <div class='picker-item'>10</div> \
        //                 <div class='picker-item'>11</div> \
        //             </div> \
        //         </div> \
        //         <div class='picker-control picker-control-next' data-picker-action='next'></div> \
        //     </div>";
    })();
}

