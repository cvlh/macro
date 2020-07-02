'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _COLORS_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////
export default function Color (fragment) {

    let content, colors = {},
    
    _set_color = function (target) {
        let selected = target.parentElement.querySelector('.selected');
        if (selected) {
            if (target.isSameNode(selected)) return;

            selected.classList.remove('selected');
            selected.style.removeProperty('border-color');
            selected.textContent = '';
        }
        
        target.classList.add('selected');
        target.style.borderColor = target.style.backgroundColor;
        target.textContent = 'C';
    },
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              targetClass = target.classList;

        if (targetClass.contains('main-app-properties-color')) {
            _set_color(target);
        }
    };

    this.visible = function(status, color) {
        if (status) {
            if (colors.hasOwnProperty(color)) {
                content.style.display = 'block';
                _set_color(colors[color]);
            }
        } else {
            content.style.display = 'none';
        }
    };

    (function() {
        let row, color, count = 3;

        content = addElement(fragment, 'div', 'main-app-properties-content');

        row = addElement(content, 'div', 'main-app-properties-row');
              addElement(row, 'div', 'main-app-properties-label', _I18N_['field_color']);

        row = addElement(content, 'div', 'main-app-properties-row');
        for (let color_idx in _COLORS_) {
            if (_COLORS_.hasOwnProperty(color_idx)) {

                color = addElement(row, 'div', 'icon main-app-properties-color');
                color.setAttribute('title', _I18N_['field_color_text'][color_idx]);
                color.style.backgroundColor = _COLORS_[color_idx];
                color.style.gridColumn = count + ' / span 2';

                count += 3;

                colors[_COLORS_[color_idx]] = color;
            }
        }
        row.addEventListener('click', _receive_events, { capture: false });
    })();
}