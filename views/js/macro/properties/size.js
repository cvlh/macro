'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function Size (ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, 
        rowSizeLabel, rowSize, height, width,
    
    // PRIVATE /////////////////////////////////////////////////////////////////
    _set = function(properties) {        
        if (properties.hasOwnProperty('height')) 
            height.value = properties['height'];

        if (properties.hasOwnProperty('width')) 
            width.value = properties['width'];
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function() {
        const objectSize = parent.getMain().getSelectedObject().getProps('size');

        if (objectSize !== null) {
            _set(objectSize);
            content.style.display = 'block';
            return;
        }

        content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let label;
        
        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');

        // SIZE
        rowSizeLabel = addElement(content, 'div', 'main-app-properties-row ');
        addElement(rowSizeLabel, 'div', 'main-app-properties-label header bold', _I18N_.macro_size);
        addElement(rowSizeLabel, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

            rowSize = addElement(content, 'div', 'main-app-properties-row');

            label = addElement(rowSize, 'label', 'main-app-properties-label', _I18N_.macro_height);
            label.style.gridColumn = '2 / span 6';
            label.style.fontWeight = '300';

            height = addElement(rowSize, 'input', 'number');
            height.setAttribute('type', 'text');
            height.style.gridColumn = '8 / span 6';
            //height.addEventListener('change', () => console.log('mudou minimum'), { capture: false });

            label = addElement(rowSize, 'label', 'main-app-properties-label', _I18N_.macro_width);
            label.style.gridColumn = '16 / span 6';
            label.style.fontWeight = '300';
            
            width = addElement(rowSize, 'input', 'number');
            width.setAttribute('type', 'text');
            width.style.gridColumn = '22 / span 6';
            //width.addEventListener('change', () => console.log('mudou maximum'), { capture: false });
    })();
}