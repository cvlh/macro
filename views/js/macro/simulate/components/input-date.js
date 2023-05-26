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
            btn_month: null,
            txt_year: null,

            days: null,
            month: null,
            footer: null
        },

    _pad = (number) => number < 10 ? '0' + number : number,
    _date = (date) => _pad(date.getDate()) + '/' + _pad((date.getMonth() + 1)) + '/' + _pad(date.getFullYear()),

    _render = () => {      
        DOMElement.header.style.removeProperty('visibility');
        DOMElement.days.style.removeProperty('visibility');
        DOMElement.month.style.removeProperty('visibility');

        currentMonth = currentDate.getMonth();
        currentYear = currentDate.getFullYear();

        const first_day = new Date(currentYear, currentMonth, 1).getDay();
        // const days_in_month = new Date(currentYear, currentMonth + 1, 0).getDate();
        // const total_rows = Math.ceil((first_day + days_in_month) / 7);

        DOMElement.btn_month.textContent = _I18N_.month_names[currentMonth];
        DOMElement.txt_year.textContent = currentYear;

        let iterate_date = new Date(currentYear, currentMonth, 1);
        iterate_date.setDate(iterate_date.getDate() - first_day);

        let child = DOMElement.days.firstChild;
        for (let row = 0; row < 6; row++) {
            // const current_row = DOMElement.days[row];

            // current_row.style.removeProperty('display');
            // if ((row + 1) > total_rows) {
            //     current_row.style.display = 'none';
            //     break;
            // }

            for (var weekDay = 0; weekDay < 7; weekDay++) {
                const text = child.firstChild;
                
                text.style.removeProperty('color');
                text.style.removeProperty('font-size');
                if (iterate_date.getMonth() !== currentMonth) {
                    text.style.color = 'var(--neutral-700)';
                    text.style.fontSize = '9px';
                }

                text.style.removeProperty('background-color');
                if (iterate_date.getFullYear() === today.getFullYear() &&
                    iterate_date.getMonth() === today.getMonth() &&
                    iterate_date.getDate() === today.getDate()) {
                    text.style.backgroundColor = 'var(--neutral-400)';
                }

                text.classList.remove('selected');
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
    _month = (evnt) => {
        if (evnt.target.hasOwnProperty('_date_')) {
            const month = evnt.target['_date_'];
            currentDate.setMonth(month);

            _render();
        }
    },
    _day = (evnt) => {
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

        // HEADER //////////////////////////////////////////////////////////////
        const header = addElement(DOMElement.calendar, 'div', 'header');

        const btn_prev = addElement(header, 'div', 'font-awesome', '\uf053');
        btn_prev.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            _render();
        }, { capture: false });

        DOMElement.btn_month = addElement(header, 'div');
        DOMElement.btn_month.addEventListener('click', () => {
            if (DOMElement.days.style.visibility !== '') {
                _render();
                return;
            }

            DOMElement.header.style.visibility = 'hidden';
            DOMElement.days.style.visibility = 'hidden';
            DOMElement.month.style.visibility = 'visible';
        }, { capture: false });

        DOMElement.txt_year = addElement(header, 'span');

        const btn_next = addElement(header, 'div', 'font-awesome', '\uf054');
        btn_next.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            _render();
        }, { capture: false });

        // MONTHS //////////////////////////////////////////////////////////////
        DOMElement.month = addElement(DOMElement.calendar, 'div', 'month'); 
        for (let row = 0; row < 4; row++) {
            for (let month = 0; month < 3; month++) {
                const index = (row * 3) + month;
                const cell = addElement(DOMElement.month, 'div', '', _I18N_.month_names[index]);
                cell['_date_'] = index;
            }
        }
        DOMElement.month.addEventListener('click', _month, { capture: false });

        // ROWS ////////////////////////////////////////////////////////////////
        DOMElement.header = addElement(DOMElement.calendar, 'div', 'week-header');
        for (const day of _I18N_.short_days_of_week)
            addElement(DOMElement.header, 'div', '', day);

        DOMElement.days = addElement(DOMElement.calendar, 'div', 'week');
        for (let row = 0; row < 6; row++) {
            for (let day = 0; day < 7; day++) {
                const cell = addElement(DOMElement.days, 'div');
                addElement(cell, 'span');
            }
        }
        DOMElement.days.addEventListener('click', _day, { capture: false });

        // FOOTER //////////////////////////////////////////////////////////////
        const footer = addElement(DOMElement.calendar, 'div', 'footer');

        const btn_today = addElement(footer, 'div', '', _I18N_.calendar_today);
        btn_today.addEventListener('click', () => {
            currentDate = new Date(today);
            selectedDate = new Date(currentDate);
            _render();
        }, { capture: false });

        const txt_selected = addElement(footer, 'span', '', _I18N_.calendar_selected_date);
        txt_selected.style.display = 'block';
        txt_selected.style.fontSize = '8px';
        txt_selected.style.color = 'var(--neutral-700)';
        txt_selected.style.textAlign = 'center';

        DOMElement.footer = addElement(txt_selected, 'span');
        DOMElement.footer.style.display = 'block';
        DOMElement.footer.style.fontSize = '10px';
        DOMElement.footer.style.color = 'var(--neutral-base)';
        DOMElement.footer.style.paddingTop = '1px';

        _render();
    })();
}

