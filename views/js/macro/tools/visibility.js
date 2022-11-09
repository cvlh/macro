'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _ICON_CHAR_, _STATUS_, _VISIBILITY_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function VisibilityTool (__context) {
    
    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        MacroContext = __context,
        DOMElement = {
            content: null,

            btnVisible: null,
            btnHidden: null,
            btnNone: null
        }

    // VARIABLES ///////////////////////////////////////////////////////////////
    let currentField = null,
    
    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = evnt => {
        evnt.stopPropagation();

        if (!currentField)
            return;

        const target = evnt.target,
              targetClass = target.classList;

        if (targetClass.contains('button')) {
            const selectedObject = MacroContext.getSelectedObject(),
                  status = target['_action_'],
                  uuid = currentField.getProps('uuid');

            selectedObject.deleteFromVisibility(uuid);
            currentField.unselectForVisibility();

            if (status !== _STATUS_.NONE) {
                selectedObject.addToVisibility(currentField, status);
                currentField.selectedForVisibility(status);
            }
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.show = function(field) {
        const selectedObject = MacroContext.getSelectedObject();
        const flags = selectedObject.getProps('visibility', 'flags')
        const div = field.getDiv();

        if (flags & _VISIBILITY_.FRESH)
            DOMElement.btnHidden.style.display = 'none';
        else if (flags & _VISIBILITY_.EXTRA)
            DOMElement.btnHidden.style.display = 'flex';
        
        currentField = field;
        div.appendChild(DOMElement.content);
    };
    this.hide = function(field) {
        const div = field.getDiv();
        
        currentField = null;
        div.removeChild(DOMElement.content);
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        DOMElement.content = document.createElement('div');
        DOMElement.content.className = 'app-cards-item-visibility-toolbar';
    
        DOMElement.btnVisible = addElement(DOMElement.content, 'div', 'button');
        addElement(DOMElement.btnVisible, 'div', 'icon', _ICON_CHAR_.VISIBLE);
        addElement(DOMElement.btnVisible, 'div', null, _I18N_.visible);
        DOMElement.btnVisible['_action_'] = _STATUS_.VISIBLE;

        DOMElement.btnHidden = addElement(DOMElement.content, 'div', 'button');
        addElement(DOMElement.btnHidden, 'div', 'icon', _ICON_CHAR_.HIDDEN);
        addElement(DOMElement.btnHidden, 'div', null, _I18N_.hidden);
        DOMElement.btnHidden['_action_'] = _STATUS_.HIDDEN;

        // addElement(DOMElement.content, 'div', 'spacer');

        DOMElement.btnNone = addElement(DOMElement.content, 'div', 'button none');
        addElement(DOMElement.btnNone, 'div', 'icon', _ICON_CHAR_.EMPTY);
        addElement(DOMElement.btnNone, 'div', null, _I18N_.none);
        DOMElement.btnNone['_action_'] = _STATUS_.NONE;

        DOMElement.content.addEventListener('click', _receive_events, { capture: true });
    })();
}