'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function Order (ctx) {
    
    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, index,
    
    // PRIVATE /////////////////////////////////////////////////////////////////
    _set = function(target) {        
        index.textContent = target;
    },
    _receive_events = function(evnt) {

    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function() {
        const objectOrder = parent.getMain().getSelectedObject().getProps('order');
        
        if (objectOrder !== null) {
            _set(objectOrder);
            content.style.display = 'block';
            return;
        }
        content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let row, up, down;

        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');

        row = addElement(content, 'div', 'main-app-properties-row header');
              addElement(row, 'div', 'main-app-properties-label header bold', _I18N_.field_position);
              addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        // row = addElement(content, 'div', 'main-app-properties-row spacer');
        row = addElement(content, 'div', 'main-app-properties-row');

        up = addElement(row, 'input', 'icon');
        up.setAttribute('type', 'button');
        up.setAttribute('value', _ICON_CHAR_.UP);
        up.setAttribute('title', _I18N_.field_position_up);
        up.style.gridColumn = '8 / span 4';
        up.addEventListener('click', function() {
            //const object = parent.getMain().getSelectedObject();
            parent.getMain().getSelectedObject().swap();
        }, { capture: false });

        index = addElement(row, 'div', 'main-app-properties-label');
        index.style.textAlign = 'center';
        index.style.gridColumn = '13 / span 4';

        down = addElement(row, 'input', 'icon');
        down.setAttribute('type', 'button');
        down.setAttribute('value', _ICON_CHAR_.DOWN);
        down.setAttribute('title', _I18N_.field_position_down);
        down.style.gridColumn = '18 / span 4';
        
        row.addEventListener('click', _receive_events, { capture: false });
    })();
}