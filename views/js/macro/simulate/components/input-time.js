'use strict';

import { _COLORS_, _KEYBOARD_FLAGS_, _KEY_CODE_, _RUN_ENVIRONMENT_ } from '../../../utils/constants.js';
import { _I18N_ } from '../../../i18n/pt-br.js';
import { addElement } from '../../../utils/functions.js';

export default function InputTime(__append, __properties) {

    if (!new.target)
        throw new Error('InputTime() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let startY, moveY, itemHeight;

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const
        DOMElement = {
            timepicker: null
        },

        _pad = (number) => number < 10 ? '0' + number : number,
        _time = (date) => _pad(date.getDate()) + '/' + _pad((date.getMonth() + 1)) + '/' + _pad(date.getFullYear()),

        _start = (evnt) => {
            evnt.preventDefault();

            const target = evnt.target;
            const list = target.querySelector('.picker-list');
            if (list) {
                list.style.removeProperty('transition');
                
                startY = evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY;
                moveY = 0;
            }

            if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
                target.addEventListener('pointermove', _spin, { capture: false });
                target.addEventListener('pointerup', _stop, { once: true, capture: false });
            } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
                target.addEventListener('touchmove', _spin, { capture: true });
                target.addEventListener('touchend', _stop, { once: true, capture: true });
            }
        },
        _spin = (evnt) => {
            evnt.preventDefault();

            const target = evnt.target;
            const list = target.querySelector('.picker-list');
            if (list) {
                const end_y = evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY;
                let move_y = moveY + (end_y - startY);

                const highlight = list.querySelector('.picker-picked');
                const up = move_y > 0 ? false : true;
                
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

                startY = end_y;
                moveY = move_y ;

                list.style.top = moveY + 'px';
            }
        },
        _stop = (evnt) => {
            evnt.preventDefault();

            const target = evnt.target;
            const list = target.querySelector('.picker-list');
            if (list) {
                list.style.transition = '0.15s top ease';
                list.style.top = '0px';

                for (const child of list.children)
                    child.removeAttribute('style');
            }

            if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
                target.removeEventListener('pointermove', _spin, { capture: false });
                target.addEventListener('pointerdown', _start, { once: true, capture: false });
            } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
                target.removeEventListener('touchmove', _spin, { capture: true });
                target.addEventListener('touchstart', _start, { once: true, capture: true });
            }
        };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.add = (keyCode) => {

    };
    this.clear = () => _clear();

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function () {
        const now = new Date();

        const current_hour = now.getHours();
        const current_minute = now.getMinutes();
        const current_seconds = now.getSeconds();

        DOMElement.timepicker = addElement(__append, 'div', 'picker');
        addElement(DOMElement.timepicker, 'div', 'picker-mask');
        
        const hours = addElement(DOMElement.timepicker, 'div', 'picker-cell');
        const hours_body = addElement(hours, 'div', 'picker-body');
        const hours_list = addElement(hours_body, 'div', 'picker-list');
        for (let hour = 0; hour < 9; hour++) {
            const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + (hour - 4), now.getMinutes(), now.getSeconds());
            const element_class = current.getHours() === current_hour ? 'picker-picked' : 'picker-item';
            
            const element = addElement(hours_list, 'div', element_class, _pad(current.getHours()));
            element['_date_'] = current;
        }

        const minutes = addElement(DOMElement.timepicker, 'div', 'picker-cell');
        const minutes_body = addElement(minutes, 'div', 'picker-body');
        const minutes_list = addElement(minutes_body, 'div', 'picker-list');
        for (let minute = 0; minute < 9; minute++) {
            const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + (minute - 4), now.getSeconds());
            const element_class = current.getMinutes() === current_minute ? 'picker-picked' : 'picker-item';
            
            const element = addElement(minutes_list, 'div', element_class, _pad(current.getMinutes()));
            element['_date_'] = current;
        }

        const seconds = addElement(DOMElement.timepicker, 'div', 'picker-cell');
        const seconds_body = addElement(seconds, 'div', 'picker-body');
        const seconds_list = addElement(seconds_body, 'div', 'picker-list');
        for (let second = 0; second < 9; second++) {
            const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds() + (second - 4));
            const element_class = current.getSeconds() === current_seconds ? 'picker-picked' : 'picker-item';
            
            const element = addElement(seconds_list, 'div', element_class, _pad(current.getSeconds()));
            element['_date_'] = current;
        }

        itemHeight = seconds_list.firstElementChild.offsetHeight;

        const cells = DOMElement.timepicker.querySelectorAll('.picker-cell');
        if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
            cells.forEach(element =>  element.addEventListener('pointerdown', _start, { once: true, capture: false }));
        } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
            cells.forEach(element =>  element.addEventListener('touchstart', _start, { once: true, capture: false }));
        }

    })();
}

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

        // hour.addEventListener('touchstart', (evnt) => {
        //     // evnt.preventDefault();
        //     // const target = evnt.target;
        //     // const list = target.querySelector('.picker-list');
        //     // if (list) {
        //     //     list.style.removeProperty('transition');
        //     //     itemHeight = list.firstElementChild.offsetHeight;
        //     //     startY = evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY;
        //     //     moveY = 0;
        //     // }
        // }, { capture: false });
        // hour.addEventListener('touchmove', (evnt) => {
        //     // evnt.preventDefault();
        //     // const target = evnt.target;
        //     // const list = target.querySelector('.picker-list');
        //     // if (list) {
        //     //     const end_y = evnt.changedTouches ? evnt.changedTouches[0].pageY : evnt.pageY;
        //     //     let move_y = moveY + (end_y - startY);

        //     //     let highlight = list.querySelector('.picker-picked');
        //     //     let up = move_y > 0 ? false : true;
                
        //     //     const mov = Math.abs(move_y);
        //     //     if (mov > itemHeight * 0.8) {

        //     //         highlight.nextSibling.style.removeProperty('font-size');
        //     //         highlight.previousSibling.style.removeProperty('font-size');
        //     //         highlight.style.removeProperty('font-size');

        //     //         const sibling = up ? highlight.nextSibling : highlight.previousSibling;
        //     //         const first = list.firstElementChild;
        //     //         if (up) {
        //     //             const removed_child = list.removeChild(first);
        //     //             list.appendChild(removed_child);

        //     //             move_y += itemHeight;
        //     //         } else {
        //     //             const last = list.lastElementChild;
        //     //             const removed_child = list.removeChild(last);
        //     //             list.insertBefore(removed_child, first);

        //     //             move_y -= itemHeight;
        //     //         }
                    
        //     //         highlight.className  = 'picker-item';
        //     //         sibling.className  = 'picker-picked';
        //     //     } else {
        //     //         const offset = 7 - ((itemHeight - mov) / itemHeight) * 7;

        //     //         highlight.style.fontSize = (20 - offset) + 'px';
        //     //         let sibling = up ? highlight.nextSibling : highlight.previousSibling;
        //     //         sibling.style.fontSize = (13 + offset) + 'px';
        //     //     }

        //     //     startY = end_y;
        //     //     moveY = move_y ;

        //     //     list.style.top = `${moveY}px`;
        //     // }

        // }, { capture: false });
        // hour.addEventListener('touchend', (evnt) => {
        //     // evnt.preventDefault();
        //     // const target = evnt.target;
        //     // const list = target.querySelector('.picker-list');
        //     // if (list) {
        //     //     list.style.transition = '0.15s top ease';
        //     //     list.style.top = '0px';

        //     //     for (const child of list.children)
        //     //         child.style.removeProperty('font-size');
        //     // }
        // }, { capture: false });