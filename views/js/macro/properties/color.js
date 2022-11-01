'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _COLORS_, _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function Color (ctx) {
    
    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, colors = {},
    
    // PRIVATE /////////////////////////////////////////////////////////////////
    _set = function(target) {
        const selected = content.querySelector('.selected');

        if (selected) {
            if (target.isSameNode(selected))
                return;

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

            const newColor = _COLORS_[target['_COLOR_']];
            parent.getMacro().getSelectedObject().setColor(newColor);
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function() {
        //const objectColor = parent.getMacro().getSelectedObject().getProps(this.constructor.name.toLocaleLowerCase());
        const objectColor = parent.getMacro().getSelectedObject().getProps('color');

        if (objectColor !== null) {
            if (colors.hasOwnProperty(objectColor)) {
                _set(colors[objectColor]);
                content.style.display = 'block';
                return;
            }
        }
        content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let row, color, count = 3;

        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');

        row = addElement(content, 'div', 'main-app-properties-row header');
              addElement(row, 'div', 'main-app-properties-label header bold', _I18N_.field_color_header);
              addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(content, 'div', 'main-app-properties-row');
        for (const color_idx in _COLORS_) {

            color = addElement(row, 'div', 'icon main-app-properties-color');
            color.setAttribute('title', _I18N_.field_color_text[color_idx]);
            color.style.backgroundColor = _COLORS_[color_idx];
            color.style.gridColumn = count + ' / span 2';
            color['_COLOR_'] = color_idx;

            count += 3;
            // if (count % 27 == 0) {
            //     row = addElement(content, 'div', 'main-app-properties-row');
            //     count = 3;
            // }

            colors[color_idx] = color;
        }
        
        content.addEventListener('click', _receive_events, { capture: false });
    })();
}