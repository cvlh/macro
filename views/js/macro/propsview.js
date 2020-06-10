'use strict';

import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

export default function PropsView(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment,
        rowId, rowText, rowcolor, rowType, rowRequire, rowInfo, rowHelp, 
        rowVisibility, rowVisibilityNewExtra, rowVisibilitySaveRestore,
        rowExecute, rowExecuteNowAfter;

    // PRIVATE /////////////////////////////////////////////////////////////////
    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let content, label, text;

        fragment = document.createDocumentFragment();

        content = addElement(fragment, 'div', 'main-app-properties-content');

            rowId = addElement(content, 'div', 'main-app-properties-row');
            label = addElement(rowId, 'div', 'main-app-properties-label');
            label.textContent = _I18N_['field_id'];

            text = addElement(rowId, 'div', 'main-app-properties-text');
            text.textContent = '3.10.1.2.3.5.6';

            rowText = addElement(content, 'div', 'main-app-properties-row');
            label = addElement(rowText, 'div', 'main-app-properties-label');
            label.textContent = _I18N_['field_value'];

            text = addElement(rowText, 'div', 'main-app-properties-text');
            text.textContent = 'CD CENTRO RESUL';

        content = addElement(fragment, 'div', 'main-app-properties-content');

            rowcolor = addElement(content, 'div', 'main-app-properties-row');
            label = addElement(rowcolor, 'div', 'main-app-properties-label');
            label.textContent = _I18N_['field_color'];

        //row = addElement(fragment, 'div', 'main-app-properties-row');

        rowType = addElement(fragment, 'div', 'main-app-properties-row');
        label = addElement(rowType, 'div', 'main-app-properties-label');
        label.textContent = _I18N_['field_type'];
  
        //
        rowRequire = addElement(fragment, 'div', 'main-app-properties-row');
        label = addElement(rowRequire, 'input', 'main-app-properties-checkbox');
        label.setAttribute('id', 'require_checkbox');
        label.setAttribute('type', 'checkbox');
        label.style.gridColumnStart = '2';
        label.style.gridColumnEnd = 'span 2';

        text = addElement(rowRequire, 'label', 'main-app-properties-checkbox-label');
        text.setAttribute('for', 'require_checkbox');
        text.style.gridColumnStart = '5';
        text.style.gridColumnEnd = 'span 23';
        text.textContent = _I18N_['field_require'];

        content = addElement(fragment, 'div', 'main-app-properties-content');

            rowInfo = addElement(content, 'div', 'main-app-properties-row');
            label = addElement(rowInfo, 'div', 'main-app-properties-label');
            label.textContent = _I18N_['field_info'];

            rowHelp = addElement(content, 'div', 'main-app-properties-row');
            label = addElement(rowHelp, 'div', 'main-app-properties-label');
            label.textContent = _I18N_['field_help'];
  
        //row = addElement(fragment, 'div', 'main-app-properties-row');

        content = addElement(fragment, 'div', 'main-app-properties-content');
        
            rowVisibility = addElement(content, 'div', 'main-app-properties-row');
                label = addElement(rowVisibility, 'div', 'main-app-properties-label');
                label.textContent = _I18N_['field_visibility'];

            rowVisibilityNewExtra = addElement(content, 'div', 'main-app-properties-row');
                label = addElement(rowVisibilityNewExtra, 'input', 'main-app-properties-checkbox');
                label.setAttribute('id', 'new_checkbox');
                label.setAttribute('type', 'checkbox');
                label.style.gridColumnStart = '2';
                label.style.gridColumnEnd = 'span 2';

                text = addElement(rowVisibilityNewExtra, 'label', 'main-app-properties-checkbox-label');
                text.setAttribute('for', 'new_checkbox');
                text.style.gridColumnStart = '5';
                text.style.gridColumnEnd = 'span 8';
                text.textContent = _I18N_['field_visibility_new'];

                label = addElement(rowVisibilityNewExtra, 'input', 'main-app-properties-checkbox');
                label.setAttribute('id', 'extra_checkbox');
                label.setAttribute('type', 'checkbox');
                label.style.gridColumnStart = '14';
                label.style.gridColumnEnd = 'span 2';

                text = addElement(rowVisibilityNewExtra, 'label', 'main-app-properties-checkbox-label');
                text.setAttribute('for', 'extra_checkbox');
                text.style.gridColumnStart = '17';
                text.style.gridColumnEnd = 'span 11';
                text.textContent = _I18N_['field_visibility_extra'];

            rowVisibilitySaveRestore = addElement(content, 'div', 'main-app-properties-row');
                label = addElement(rowVisibilitySaveRestore, 'input', 'main-app-properties-checkbox');
                label.setAttribute('id', 'save_checkbox');
                label.setAttribute('type', 'checkbox');
                label.style.gridColumnStart = '2';
                label.style.gridColumnEnd = 'span 2';

                text = addElement(rowVisibilitySaveRestore, 'label', 'main-app-properties-checkbox-label');
                text.setAttribute('for', 'save_checkbox');
                text.style.gridColumnStart = '5';
                text.style.gridColumnEnd = 'span 8';
                text.textContent = _I18N_['field_visibility_Save'];

                label = addElement(rowVisibilitySaveRestore, 'input', 'main-app-properties-checkbox');
                label.setAttribute('id', 'restore_checkbox');
                label.setAttribute('type', 'checkbox');
                label.style.gridColumnStart = '14';
                label.style.gridColumnEnd = 'span 2';
        
                text = addElement(rowVisibilitySaveRestore, 'label', 'main-app-properties-checkbox-label');
                text.setAttribute('for', 'restore_checkbox');
                text.style.gridColumnStart = '17';
                text.style.gridColumnEnd = 'span 11';
                text.textContent = _I18N_['field_visibility_Restore'];

            rowExecute = addElement(content, 'div', 'main-app-properties-row');
            label = addElement(rowExecute, 'div', 'main-app-properties-label');
            label.textContent = _I18N_['field_execute'];

            rowExecuteNowAfter = addElement(content, 'div', 'main-app-properties-row');
                label = addElement(rowExecuteNowAfter, 'input', 'main-app-properties-checkbox');
                label.setAttribute('id', 'execute_now_radio');
                label.setAttribute('name', 'execute');
                label.setAttribute('type', 'radio');
                label.style.gridColumnStart = '2';
                label.style.gridColumnEnd = 'span 2';

                text = addElement(rowExecuteNowAfter, 'label', 'main-app-properties-checkbox-label');
                text.setAttribute('for', 'execute_now_radio');
                text.style.gridColumnStart = '5';
                text.style.gridColumnEnd = 'span 8';
                text.textContent = _I18N_['field_execute_now'];

                label = addElement(rowExecuteNowAfter, 'input', 'main-app-properties-checkbox');
                label.setAttribute('id', 'execute_after_radio');
                label.setAttribute('name', 'execute');
                label.setAttribute('type', 'radio');
                label.style.gridColumnStart = '14';
                label.style.gridColumnEnd = 'span 2';
        
                text = addElement(rowExecuteNowAfter, 'label', 'main-app-properties-checkbox-label');
                text.setAttribute('for', 'execute_after_radio');
                text.style.gridColumnStart = '17';
                text.style.gridColumnEnd = 'span 11';
                text.textContent = _I18N_['field_execute_after'];

    })();
}