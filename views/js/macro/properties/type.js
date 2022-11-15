'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _TYPES_, _ICON_CHAR_ } from '../../utils/constants.js';

// FUNCTIONS ///////////////////////////////////////////////////////////////////
export default function Type (__context) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        MacroContext = __context,
        DOMElement = {
            content:         null,

            rowTypeHeader:   null, 
            rowType:         null,
            typeIcon:        null,
            typeSelect:      null,

            rowLengthHeader: null,
            rowLength:       null, 
            lengthMaximum:   null, 
            lengthMinimum:   null,

            rowFloatHeader:  null,
            rowFloat:        null, 
            floatPrecision:  null, 

            rowOptional:    null,
            optional:       null
        }

    // VARIABLES ///////////////////////////////////////////////////////////////
    let
        
        rowMaskLabel, rowMask, mask, 
        
    
    // PRIVATE /////////////////////////////////////////////////////////////////
    _clear = function() {
        //rowTypeLabel.style.display = 'none';
        //rowType.style.display = 'none';

        DOMElement.rowLengthHeader.style.display = 'none';
        DOMElement.rowLength.style.display = 'none';
        DOMElement.lengthMaximum.value = '';
        DOMElement.lengthMinimum.value = '';

        rowMaskLabel.style.display = 'none';
        rowMask.style.display = 'none';
        mask.value = '';

        DOMElement.rowOptional.style.display = 'none';
        DOMElement.optional.checked = false;
    },
    _set = function(properties) {        
        if (properties.hasOwnProperty('type')) {
            
            DOMElement.typeIcon.textContent = properties['type'];
            DOMElement.typeSelect.value = properties['type'];

            _clear();

            switch (properties['type']) {
                case _TYPES_.LIST:
                    break;

                case _TYPES_.TEXT:
                    rowMask.style.display = 'grid';

                    mask.value = '';
                    if (properties.hasOwnProperty('mask')) mask.value = properties['mask'];
                    
                case _TYPES_.NUMBER:
                    DOMElement.rowLengthHeader.style.display = 'grid';
                    DOMElement.rowLength.style.display = 'grid';

                    if (properties.hasOwnProperty('minimum')) 
                        DOMElement.lengthMinimum.value = properties['minimum'];

                    if (properties.hasOwnProperty('maximum')) 
                        DOMElement.lengthMaximum.value = properties['maximum'];

                    DOMElement.rowOptional.style.display = 'grid';
                    if (properties.hasOwnProperty('optional')) 
                        DOMElement.optional.checked = properties['optional'];

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
        const object = MacroContext.getMacro().getSelectedObject(),
              value = evnt.target.value;

        _set(object.setType(value));
    },
    _mask = function(evnt) {
        const objectType = MacroContext.getMacro().getSelectedObject().getProps('type');
        objectType['mask'] = evnt.target.value;
    },
    _optional = function(evnt) {
        const objectType = MacroContext.getMacro().getSelectedObject().getProps('type');
        objectType['optional'] = evnt.target.checked;
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function() {
        //const objectType = MacroContext.getMacro().getSelectedObject().getProps(this.constructor.name.toLocaleLowerCase());
        const objectType = MacroContext.getMacro().getSelectedObject().getProps('type');

        if (objectType !== null) {
            _set(objectType);
            DOMElement.content.style.display = 'block';
            return;
        }

        DOMElement.content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let option, checkbox, label, subHeader;
        
        DOMElement.content = addElement(MacroContext.getFragment(), 'div', 'main-app-properties-content');

        // TYPE SELECT
        DOMElement.rowTypeHeader = addElement(DOMElement.content, 'div', 'main-app-properties-row header');
        addElement(DOMElement.rowTypeHeader, 'div', 'main-app-properties-label header bold', _I18N_.field_type);
        addElement(DOMElement.rowTypeHeader, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

            DOMElement.rowType = addElement(DOMElement.content, 'div', 'main-app-properties-row');
                DOMElement.typeIcon = addElement(DOMElement.rowType, 'div', 'icon main-app-properties-type-icon');
                
                DOMElement.typeSelect = addElement(DOMElement.rowType, 'select');
                DOMElement.typeSelect.style.gridColumn = '7 / span 21';
                for (const type_idx in _TYPES_) {
                    option = addElement(DOMElement.typeSelect, 'option', null, _I18N_.field_type_text[type_idx]);
                    option.setAttribute('value', _TYPES_[type_idx]);
                }
                DOMElement.typeSelect.addEventListener('change', _type, { capture: false });

        // LENGHT
        DOMElement.rowLengthHeader = addElement(DOMElement.content, 'div', 'main-app-properties-row');
        subHeader = addElement(DOMElement.rowLengthHeader, 'div', 'main-app-properties-label sub-header');
        checkbox = addElement(subHeader, 'input', 'checkbox');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', 'length_checkbox');

        label = addElement(subHeader, 'label', 'label', _I18N_.field_length);
        label.setAttribute('for', 'length_checkbox');

        checkbox.addEventListener('change', function () {
            if (this.checked)
                DOMElement.rowLength.style.removeProperty('height');
            else
                DOMElement.rowLength.style.height = '0';
        });

            DOMElement.rowLength = addElement(DOMElement.content, 'div', 'main-app-properties-row');
            DOMElement.rowLength.style.height = '0';

            label = addElement(DOMElement.rowLength, 'label', 'main-app-properties-label', _I18N_.field_length_min);
            label.style.gridColumn = '3 / span 6';
            label.style.fontWeight = '300';

            DOMElement.lengthMinimum = addElement(DOMElement.rowLength, 'input', 'number');
            DOMElement.lengthMinimum .setAttribute('type', 'text');
            DOMElement.lengthMinimum .style.gridColumn = '9 / span 5';
            //minimum.addEventListener('change', () => console.log('mudou minimum'), { capture: false });

            label = addElement(DOMElement.rowLength, 'label', 'main-app-properties-label', _I18N_.field_length_max);
            label.style.gridColumn = '16 / span 6';
            label.style.fontWeight = '300';
            
            DOMElement.lengthMaximum  = addElement(DOMElement.rowLength, 'input', 'number');
            DOMElement.lengthMaximum.setAttribute('type', 'text');
            DOMElement.lengthMaximum.style.gridColumn = '22 / span 5';
            //maximum.addEventListener('change', () => console.log('mudou maximum'), { capture: false });

        // FLOAT
        DOMElement.rowFloatHeader = addElement(DOMElement.content, 'div', 'main-app-properties-row');
        subHeader = addElement(DOMElement.rowFloatHeader, 'div', 'main-app-properties-label sub-header');
        checkbox = addElement(subHeader, 'input', 'checkbox');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', 'float_checkbox');

        label = addElement(subHeader, 'label', 'label', _I18N_.field_float);
        label.setAttribute('for', 'float_checkbox');

        checkbox.addEventListener('change', function () {
            if (this.checked)
                DOMElement.rowFloat.style.removeProperty('height');
            else
                DOMElement.rowFloat.style.height = '0';
        });

            DOMElement.rowFloat = addElement(DOMElement.content, 'div', 'main-app-properties-row');
            DOMElement.rowFloat.style.height = '0';

            label = addElement(DOMElement.rowFloat, 'label', 'main-app-properties-label', _I18N_.field_float_precision);
            label.style.gridColumn = '2 / span 7';
            label.style.fontWeight = '300';

            DOMElement.lengthMinimum = addElement(DOMElement.rowFloat, 'input', 'number');
            DOMElement.lengthMinimum .setAttribute('type', 'text');
            DOMElement.lengthMinimum .style.gridColumn = '9 / span 5';

        // MASK        
        rowMaskLabel = addElement(DOMElement.content, 'div', 'main-app-properties-row');
        addElement(rowMaskLabel, 'div', 'main-app-properties-label header bold', _I18N_.field_mask);
        addElement(rowMaskLabel, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

            rowMask = addElement(DOMElement.content, 'div', 'main-app-properties-row');

            mask = addElement(rowMask, 'input');
            mask.setAttribute('type', 'text');
            mask.style.gridColumn = '2 / span 26';
            mask.style.textTransform = 'uppercase';
            mask.addEventListener('keyup', _mask, { capture: false });

        // REQUIRE
        DOMElement.rowOptional = addElement(DOMElement.content, 'div', 'main-app-properties-row');
        subHeader = addElement(DOMElement.rowOptional, 'div', 'main-app-properties-label sub-header');
        DOMElement.optional = addElement(subHeader, 'input', 'checkbox');
        DOMElement.optional.setAttribute('type', 'checkbox');
        DOMElement.optional.setAttribute('id', 'optional_checkbox');

        label = addElement(subHeader, 'label', 'label', _I18N_.field_optional);
        label.setAttribute('for', 'optional_checkbox');
        checkbox.addEventListener('change', _optional, { capture: false });


    })();
}