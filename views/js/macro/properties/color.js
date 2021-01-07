'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _COLORS_, _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////
export default function Color (append) {

    let content, colors = {}, currentObject = null,
    
    _set = function(target) {        
        let selected = target.parentElement.querySelector('.selected');
        if (selected) {
            if (target.isSameNode(selected)) return;

            selected.classList.remove('selected');
            selected.style.removeProperty('border-color');
            selected.textContent = _ICON_CHAR_.NONE;
        }
        
        target.classList.add('selected');
        target.style.borderColor = target.style.backgroundColor;
        target.textContent = _ICON_CHAR_.CHECK;
    },
    _receive_events = function(evnt) {
        evnt.stopPropagation();
        
        const target = evnt.target,
              targetClass = target.classList;

        if (targetClass.contains('main-app-properties-color')) {
            _set(target);
            if (currentObject !== null) currentObject.setColor(target['_COLOR_']);
        }
    };

    this.visible = function(object) {
        const objectColor = object.getProps('color');

        if (objectColor !== null) {
            if (colors.hasOwnProperty(objectColor)) {
                _set(colors[objectColor]);
                currentObject = object;
                content.style.display = 'block';
                return;
            }
        }

        currentObject = null;
        content.style.display = 'none';
    };

    (function() {
        let row, color, count = 3;

        content = addElement(append, 'div', 'main-app-properties-content');

        row = addElement(content, 'div', 'main-app-properties-row');
              addElement(row, 'div', 'main-app-properties-label header', _I18N_.field_color_header);
              addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(content, 'div', 'main-app-properties-row');
        for (let color_idx in _COLORS_) {
            if (_COLORS_.hasOwnProperty(color_idx)) {
                color = addElement(row, 'div', 'icon main-app-properties-color');
                color.setAttribute('title', _I18N_.field_color_text[color_idx]);
                color.style.backgroundColor = _COLORS_[color_idx];
                color.style.gridColumn = count + ' / span 2';
                color['_COLOR_'] = _COLORS_[color_idx];

                count += 3;

                colors[_COLORS_[color_idx]] = color;
            }
        }
        
        row.addEventListener('click', _receive_events, { capture: false });

        content.style.display = 'none';
    })();
}