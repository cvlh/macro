'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _TYPES_, _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function Type (ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, 

        rowTypeLabel, rowType, icon, type, 
        rowSizeLabel, rowSize, maximum, minimum,
        rowMaskLabel, rowMask, mask, 
        rowOptional, optional, 
    
    // PRIVATE /////////////////////////////////////////////////////////////////
    _clear = function() {
        //rowTypeLabel.style.display = 'none';
        //rowType.style.display = 'none';

        rowSizeLabel.style.display = 'none';
        rowSize.style.display = 'none';
        maximum.value = '';
        minimum.value = '';

        rowMaskLabel.style.display = 'none';
        rowMask.style.display = 'none';
        mask.value = '';

        rowOptional.style.display = 'none';
        optional.checked = false;
    },
    _set = function(properties) {        
        if (properties.hasOwnProperty('type')) {
            
            icon.textContent = properties['type'];
            type.value = properties['type'];

            _clear();

            switch (properties['type']) {
                case _TYPES_.LIST:
                    break;

                case _TYPES_.TEXT:
                    rowMask.style.display = 'grid';

                    mask.value = '';
                    if (properties.hasOwnProperty('mask')) mask.value = properties['mask'];
                    
                case _TYPES_.NUMBER:
                    rowSizeLabel.style.display = 'grid';
                    rowSize.style.display = 'grid';
                    if (properties.hasOwnProperty('minimum')) minimum.value = properties['minimum'];
                    if (properties.hasOwnProperty('maximum')) maximum.value = properties['maximum'];

                    rowOptional.style.display = 'grid';
                    if (properties.hasOwnProperty('optional')) optional.checked = properties['optional'];
                    break;

                case _TYPES_.DATE:
                case _TYPES_.PHOTO:
                case _TYPES_.SIGNATURE:
                case _TYPES_.SCAN:
                    rowOptional.style.display = 'grid';
                    break;
            }
        }
    },
    _type = function(evnt) {
        const object = parent.getMacro().getSelectedObject(),
              value = evnt.target.value;

        _set(object.setType(value));
    },
    _mask = function(evnt) {
        const objectType = parent.getMacro().getSelectedObject().getProps('type');
        objectType['mask'] = evnt.target.value;
    },
    _optional = function(evnt) {
        const objectType = parent.getMacro().getSelectedObject().getProps('type');
        objectType['optional'] = evnt.target.checked;
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function() {
        //const objectType = parent.getMacro().getSelectedObject().getProps(this.constructor.name.toLocaleLowerCase());
        const objectType = parent.getMacro().getSelectedObject().getProps('type');

        if (objectType !== null) {
            _set(objectType);
            content.style.display = 'block';
            return;
        }

        content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let option, label;
        
        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');

        // TYPE SELECT
        rowTypeLabel = addElement(content, 'div', 'main-app-properties-row header');
        addElement(rowTypeLabel, 'div', 'main-app-properties-label header bold', _I18N_.field_type);
        addElement(rowTypeLabel, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

            // rowType = addElement(content, 'div', 'main-app-properties-row spacer');
            rowType = addElement(content, 'div', 'main-app-properties-row');
            icon = addElement(rowType, 'div', 'icon main-app-properties-type-icon');

            type = addElement(rowType, 'select');
            type.style.gridColumn = '7 / span 21';
            for (const type_idx in _I18N_.field_type_text) {
                if (_TYPES_.hasOwnProperty(type_idx)) {
                    option = addElement(type, 'option', null, _I18N_.field_type_text[type_idx]);
                    option.setAttribute('value', _TYPES_[type_idx]);
                }
            }
            type.addEventListener('change', _type, { capture: false });

        // SIZE
        rowSizeLabel = addElement(content, 'div', 'main-app-properties-row ');
        addElement(rowSizeLabel, 'div', 'main-app-properties-label header', _I18N_.field_size);
        addElement(rowSizeLabel, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

            rowSize = addElement(content, 'div', 'main-app-properties-row');

            label = addElement(rowSize, 'label', 'main-app-properties-label', _I18N_.field_size_min);
            label.style.gridColumn = '2 / span 7';
            label.style.fontWeight = '300';

            minimum = addElement(rowSize, 'input', 'number');
            minimum.setAttribute('type', 'text');
            minimum.style.gridColumn = '9 / span 5';
            //minimum.addEventListener('change', () => console.log('mudou minimum'), { capture: false });

            label = addElement(rowSize, 'label', 'main-app-properties-label', _I18N_.field_size_max);
            label.style.gridColumn = '16 / span 7';
            label.style.fontWeight = '300';
            
            maximum = addElement(rowSize, 'input', 'number');
            maximum.setAttribute('type', 'text');
            maximum.style.gridColumn = '23 / span 5';
            //maximum.addEventListener('change', () => console.log('mudou maximum'), { capture: false });

        // MASK        
        rowMaskLabel = addElement(content, 'div', 'main-app-properties-row');
        addElement(rowMaskLabel, 'div', 'main-app-properties-label header bold', _I18N_.field_mask);
        addElement(rowMaskLabel, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

            rowMask = addElement(content, 'div', 'main-app-properties-row');

            mask = addElement(rowMask, 'input');
            mask.setAttribute('type', 'text');
            mask.style.gridColumn = '2 / span 26';
            mask.style.textTransform = 'uppercase';
            mask.addEventListener('keyup', _mask, { capture: false });

        // REQUIRE
        rowOptional = addElement(content, 'div', 'main-app-properties-row');
        optional = addElement(rowOptional, 'input');
        optional.setAttribute('id', 'require_checkbox');
        optional.setAttribute('type', 'checkbox');
        optional.style.gridColumn = '2 / span 2';
        optional.addEventListener('change', _optional, { capture: false });

        label = addElement(rowOptional, 'label', 'main-app-properties-checkbox-label', _I18N_.field_optional);
        label.setAttribute('for', 'require_checkbox');
        label.style.gridColumn = '4 / span 24';
    })();
}