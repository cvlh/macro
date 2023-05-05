'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function Remove (__context) {
    
    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, index;

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const

    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = function(evnt) {
        switch (evnt.type) {
            case 'click':
                const selectObject = __context.getMacro().getSelectedObject();

                selectObject.remove(true);
                break;
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function() {
        content.style.display = 'block';
        // const objectOrder = __context.getMacro().getSelectedObject().getProps('order');
        
        // if (objectOrder !== null) {
        //     _set(objectOrder);
        //     content.style.display = 'block';
        //     return;
        // }
        // content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        content = addElement(__context.getFragment(), 'div', 'main-app-properties-content');
        content.style.paddingTop = '10px';

        const row = addElement(content, 'div', 'main-app-properties-row');

        const remove = addElement(row, 'div', 'delete-button', _I18N_.delete_item);
        remove.addEventListener('click', function() {  }, { capture: false });
        
        remove.addEventListener('click', _receive_events, { capture: false });
    })();
}