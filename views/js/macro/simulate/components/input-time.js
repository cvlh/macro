'use strict';

import { _COLORS_, _KEYBOARD_FLAGS_, _KEY_CODE_ } from '../../../utils/constants.js';
import { _I18N_ } from '../../../i18n/pt-br.js';
import { addElement } from '../../../utils/functions.js';

export default function InputTime(__append, __properties) {
    
    if (!new.target) 
        throw new Error('InputTime() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let today, selectedDate, currentDate, currentYear, currentMonth;
    
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
    (function() {
        DOMElement.timepicker = addElement(__append, 'div', 'picker');

        DOMElement.timepicker.innerHTML = "\
            <div class='picker-cell'> \
                <div class='picker-control picker-control-prev'></div> \
                <div class='picker-body'> \
                    <div class='picker-item'>05</div> \
                    <div class='picker-item'>06</div> \
                    <div class='picker-item'>07</div> \
                    <div class='picker-picked'>08</div> \
                    <div class='picker-item'>09</div> \
                    <div class='picker-item'>10</div> \
                    <div class='picker-item'>11</div> \
                </div> \
                <div class='picker-control picker-control-next'></div> \
            </div> \
            <div class='picker-cell'> \
                <div class='picker-control picker-control-prev'></div> \
                <div class='picker-body'> \
                    <div class='picker-item'>05</div> \
                    <div class='picker-item'>06</div> \
                    <div class='picker-item'>07</div> \
                    <div class='picker-picked'>08</div> \
                    <div class='picker-item'>09</div> \
                    <div class='picker-item'>10</div> \
                    <div class='picker-item'>11</div> \
                </div> \
                <div class='picker-control picker-control-next' data-picker-action='next'></div> \
            </div>";
    })();
}

