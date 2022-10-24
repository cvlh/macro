'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function Remove (ctx) {
    
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
        content.style.display = 'block';
        // const objectOrder = parent.getMain().getSelectedObject().getProps('order');
        
        // if (objectOrder !== null) {
        //     _set(objectOrder);
        //     content.style.display = 'block';
        //     return;
        // }
        // content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');
        content.style.paddingTop = '10px';

        const row = addElement(content, 'div', 'main-app-properties-row');

        const remove = addElement(row, 'div', 'delete-button', _I18N_.delete_item);
        remove.addEventListener('click', function() {  }, { capture: false });
        
        row.addEventListener('click', _receive_events, { capture: false });
    })();
}