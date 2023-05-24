'use strict';

import { _COLORS_, _KEYBOARD_FLAGS_, _KEY_CODE_ } from '../../../utils/constants.js';
import { _I18N_ } from '../../../i18n/pt-br.js';
import { addElement } from '../../../utils/functions.js';

export default function InputDate(__append, __properties) {
    
    if (!new.target) 
        throw new Error('InputDate() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let today, selectedDate, currentDate, currentYear, currentMonth;
    
    // CONSTANTS ///////////////////////////////////////////////////////////////
    const
        DOMElement = {
            calendar: null,
            header: null,
                btn_prev: null,
                btn_month: null,
                btn_year: null,
                btn_next: null,
            rows: new Array(6),
            footer: null
        },

    _pad = (number) => number < 10 ? '0' + number : number,
    _date = (date) => _pad(date.getDate()) + '/' + _pad((date.getMonth() + 1)) + '/' + _pad(date.getFullYear()),

    _render = () => {
        // if (currentMonth !== selectedDate.getMonth())
        //     currentDate.setMonth(selectedDate.getMonth());

        // if (currentYear !== selectedDate.getFullYear())
        //     currentDate.setFullYear(selectedDate.getFullYear());
        
        currentMonth = currentDate.getMonth();
        currentYear = currentDate.getFullYear();

        const days_in_month = new Date(currentYear, currentMonth + 1, 0).getDate();
        const first_day = new Date(currentYear, currentMonth, 1).getDay();
        const total_rows = Math.ceil((first_day + days_in_month) / 7);

        DOMElement.btn_month.textContent = _I18N_.month_names[currentMonth];
        DOMElement.btn_year.textContent = currentYear;

        let iterate_date = new Date(currentYear, currentMonth, 1);
        iterate_date.setDate(iterate_date.getDate() - first_day);

        for (let row = 0; row < DOMElement.rows.length; row++) {
            const current_row = DOMElement.rows[row];

            // current_row.style.removeProperty('display');
            // if ((row + 1) > total_rows) {
            //     current_row.style.display = 'none';
            //     break;
            // }

            let child = current_row.firstChild;
            for (var weekDay = 0; weekDay < 7; weekDay++) {
                const text = child.firstChild;

                text.classList.remove('selected');
                text.style.removeProperty('color');
                text.style.removeProperty('font-size');
                text.style.removeProperty('background-color');

                if (iterate_date.getMonth() !== currentMonth) {
                    text.style.color = 'var(--neutral-700)';
                    text.style.fontSize = '9px';
                }

                if (iterate_date.getFullYear() === today.getFullYear() &&
                    iterate_date.getMonth() === today.getMonth() &&
                    iterate_date.getDate() === today.getDate()) {
                    text.style.backgroundColor = 'var(--neutral-300)';
                }

                if (iterate_date.getFullYear() === selectedDate.getFullYear() &&
                    iterate_date.getMonth() === selectedDate.getMonth() &&
                    iterate_date.getDate() === selectedDate.getDate())
                    text.classList.add('selected');
                
                text.textContent = iterate_date.getDate();
                text['_date_'] = new Date(iterate_date);

                iterate_date.setDate(iterate_date.getDate() + 1);
                child = child.nextSibling;
            }
        }

        DOMElement.footer.textContent = _date(selectedDate);
    },
    _selected = (evnt) => {
        if (evnt.target.hasOwnProperty('_date_')) {
            selectedDate = new Date(evnt.target['_date_']);
            currentDate = new Date(selectedDate);
            _render();
        }
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.add = (keyCode) => {

    };
    this.clear = () => _clear();

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        today = new Date();

        currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        currentMonth = currentDate.getMonth();
        currentYear = currentDate.getFullYear();

        selectedDate = new Date(currentDate);

        DOMElement.calendar = addElement(__append, 'div', 'calendar');

        DOMElement.header = addElement(DOMElement.calendar, 'div', 'header');
        DOMElement.btn_prev = addElement(DOMElement.header, 'div', 'font-awesome', '\uf053');
        DOMElement.btn_prev.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            _render();
        }, { capture: false });

        DOMElement.btn_month = addElement(DOMElement.header, 'div');
        DOMElement.btn_year = addElement(DOMElement.header, 'div');
        DOMElement.btn_next = addElement(DOMElement.header, 'div', 'font-awesome', '\uf054');
        DOMElement.btn_next.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            _render();
        }, { capture: false });

        const headerRow = addElement(DOMElement.calendar, 'div', 'week-header');
        for (const day of _I18N_.short_days_of_week)
            addElement(headerRow, 'div', '', day);

        for (let row = 0; row < DOMElement.rows.length; row++) {
            DOMElement.rows[row] = addElement(DOMElement.calendar, 'div', 'week');
            for (let weekDay = 0; weekDay < 7; weekDay++) {
                const cell = addElement(DOMElement.rows[row], 'div');
                if (weekDay === 0 || weekDay === 6)
                    cell.style.backgroundColor = 'var(--neutral-100)';
                
                addElement(cell, 'span');
            }
        }
        DOMElement.rows.forEach( (element) => element.addEventListener('click', _selected, { capture: false }) );

        DOMElement.footer = addElement(DOMElement.calendar, 'div', 'footer');

        _render();
    })();
}

