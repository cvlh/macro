'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _ICON_CHAR_, _STATUS_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function VisibilityTool () {
    
    // CONSTANTS ///////////////////////////////////////////////////////////////
    // const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content,
        btnVisible, btnHidden,
        currentField = null,
    
    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        if (!currentField)
            return;

        const target = evnt.target,
              targetClass = target.classList;

        // console.log(targetClass);
        if (targetClass.contains('button')) {
            const status = target['_action'];
            currentField.selectedForVisibility(status);
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.show = function(field) {
        const div = field.getDiv();
        div.appendChild(content);

        currentField = field;
    };
    this.hide = function(field) {
        const div = field.getDiv();
        //div.removeChild(content);

        currentField = null;
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        content = document.createElement('div');
        content.className = 'app-cards-item-visibility-toolbar';
    
        btnVisible = addElement(content, 'div', 'button');
            addElement(btnVisible, 'div', 'icon', _ICON_CHAR_.VISIBLE);
            addElement(btnVisible, 'div', null, _I18N_.visible);
        btnVisible['_action'] = _STATUS_.VISIBLE;
        // btnVisible.setAttribute('action', _STATUS_.VISIBLE);

        btnHidden = addElement(content, 'div', 'button');
            addElement(btnHidden, 'div', 'icon', _ICON_CHAR_.HIDDEN);
            addElement(btnHidden, 'div', null, _I18N_.hidden);
        btnHidden['_action'] = _STATUS_.HIDDEN;
        // btnHidden.setAttribute('action', _STATUS_.HIDDEN);

        content.addEventListener('click', _receive_events, { capture: true });
    })();
}