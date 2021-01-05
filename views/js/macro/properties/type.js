'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _TYPES_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////
export default function Type (append) {

    let content, 

        rowType, icon, type, 
        rowSizeLabel, rowSize, maximum, minimum,
        rowOptional, optional, 
        rowMask, mask, 

        currentObject = null,
    
    _set = function(properties) {        
        if (properties.hasOwnProperty('type')) {
            
            icon.textContent = properties['type'];
            type.value = properties['type'];

            rowSizeLabel.style.display = 'none';
            rowSize.style.display = 'none';
            rowOptional.style.display = 'none';
            rowMask.style.display = 'none';

            //delete properties.maximum;
            //delete properties.minimum;
            //delete properties.require;
            //delete properties.mask;

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

                    minimum.value = '';
                    if (properties.hasOwnProperty('minimum'))  minimum.value = properties['minimum'];

                    maximum.value = '';
                    if (properties.hasOwnProperty('maximum')) maximum.value = properties['maximum'];

                    rowOptional.style.display = 'grid';
                    optional.checked = false;
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
        const value = evnt.target.value;
        if (currentObject !== null) {
            _set(currentObject.setType(value));
        }
    },
    _mask = function(evnt) {
        if (currentObject !== null) {
            const objectType = currentObject.getProps('type');
            objectType['mask'] = evnt.target.value;
        }
    },
    _optional = function(evnt) {
        if (currentObject !== null) {
            const objectType = currentObject.getProps('type');
            objectType['optional'] = evnt.target.checked;
        }
    };

    this.visible = function(object) {
        const objectType = object.getProps('type');

        if (objectType !== null) {
            _set(objectType);
            currentObject = object;
            content.style.display = 'block';
            return;
        }

        content.style.display = 'none';
        currentObject = null;
    };

    (function() {
        let option, label;
        
        content = addElement(append, 'div', 'main-app-properties-content');

        // TYPE SELECT
        rowType = addElement(content, 'div', 'main-app-properties-row');
        label = addElement(rowType, 'div', 'main-app-properties-label', _I18N_['field_type']);
        label.style.gridColumn = '2 / span 10';

        icon = addElement(rowType, 'div', 'icon main-app-properties-type-icon', '0');

        type = addElement(rowType, 'select');
        type.style.gridColumn = '15 / span 13';
        for (let type_idx in _I18N_['field_type_text']) {
            if (_TYPES_.hasOwnProperty(type_idx)) {
                option = addElement(type, 'option', null, _I18N_['field_type_text'][type_idx]);
                option.setAttribute('value', _TYPES_[type_idx]);
            }
        }
        type.addEventListener('change', _type, { capture: false });

        // SIZE
        rowSizeLabel = addElement(content, 'div', 'main-app-properties-row');
        addElement(rowSizeLabel, 'div', 'main-app-properties-label', _I18N_['field_size']);

        rowSize = addElement(content, 'div', 'main-app-properties-row');

        label = addElement(rowSize, 'label', 'main-app-properties-label', _I18N_['field_size_min']);
        label.style.gridColumn = '2 / span 7';
        label.style.fontWeight = '300';

        minimum = addElement(rowSize, 'input');
        minimum.setAttribute('type', 'text');
        minimum.style.gridColumn = '9 / span 5';
        minimum.addEventListener('change', () => console.log('mudou minimum'), { capture: false });

        label = addElement(rowSize, 'label', 'main-app-properties-label', _I18N_['field_size_max']);
        label.style.gridColumn = '16 / span 7';
        label.style.fontWeight = '300';
        
        maximum = addElement(rowSize, 'input');
        maximum.setAttribute('type', 'text');
        maximum.style.gridColumn = '23 / span 5';
        maximum.addEventListener('change', () => console.log('mudou maximum'), { capture: false });

        // MASK        
        rowMask = addElement(content, 'div', 'main-app-properties-row');
        label = addElement(rowMask, 'div', 'main-app-properties-label', _I18N_['field_mask']);
        label.style.gridColumn = '2 / span 8';

        mask = addElement(rowMask, 'input');
        mask.setAttribute('type', 'text');
        mask.style.gridColumn = '11 / span 17';
        mask.style.textTransform = 'uppercase';
        mask.addEventListener('keyup', _mask, { capture: false });

        // REQUIRE
        rowOptional = addElement(content, 'div', 'main-app-properties-row');
        optional = addElement(rowOptional, 'input');
        optional.setAttribute('id', 'require_checkbox');
        optional.setAttribute('type', 'checkbox');
        optional.style.gridColumn = '2 / span 2';
        optional.addEventListener('change', _optional, { capture: false });

        label = addElement(rowOptional, 'label', 'main-app-properties-label', _I18N_['field_optional']);
        label.setAttribute('for', 'require_checkbox');
        label.style.gridColumn = '5 / span 23';
    })();
}