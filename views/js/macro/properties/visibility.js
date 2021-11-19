'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _VISIBILITY_, _ICON_CHAR_ } from '../../utils/constants.js';

export default function Visibility (ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, 
        title, status,
        optionsGroup, fresh, extra, save, restore, 
        executionGroup, instant, after,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _update_flags = function() {
        const objectProp = parent.getMain().getSelectedObject().getProps('visibility');
        
        objectProp['flags'] = (fresh.checked   ? fresh.value   : _VISIBILITY_.NONE) | 
                              (extra.checked   ? extra.value   : _VISIBILITY_.NONE) | 
                              (save.checked    ? save.value    : _VISIBILITY_.NONE) | 
                              (restore.checked ? restore.value : _VISIBILITY_.NONE) | 
                              (instant.checked ? instant.value : _VISIBILITY_.NONE) | 
                              (after.checked   ? after.value   : _VISIBILITY_.NONE) ; 
    },
    _set_flags = function(prop) {
        if (prop['flags'] & fresh.value)   fresh.checked   = true; else fresh.checked   = false;
        if (prop['flags'] & extra.value)   extra.checked   = true; else extra.checked   = false;
        if (prop['flags'] & save.value)    save.checked    = true; else save.checked    = false;
        if (prop['flags'] & restore.value) restore.checked = true; else restore.checked = false;
        if (prop['flags'] & instant.value) instant.checked = true; else instant.checked = false;
        if (prop['flags'] & after.value)   after.checked   = true; else after.checked   = false;
    },
    _set_status = function(prop) {
        const fieldsSize = prop['fields'].length;

        if (!fieldsSize) {
            status.style.color = 'var(--main-red-selected)';
            status.textContent = _I18N_.without_visibility;

            optionsGroup.style.display = 'none';
            executionGroup.style.display = 'none';
        } else {
            status.style.color = 'var(--main-green-selected)';
            status.textContent = _I18N_.with_visibility;

            optionsGroup.style.display = 'block';
            executionGroup.style.display = 'block'; 
        }
    }

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function(object) {
        //const objectType = parent.getMain().getSelectedObject().getProps(this.constructor.name.toLocaleLowerCase());
        const objectProp = object.getProps('visibility');

        if (objectProp !== null) {
            _set_flags(objectProp);
            _set_status(objectProp);
            content.style.display = 'block';
        } else {
            content.style.removeProperty('display');
        }
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let row, label;

        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');

        row = addElement(content, 'div', 'main-app-properties-row header bold');
            title = addElement(row, 'div', 'main-app-properties-label header bold', _I18N_.field_visibility);
            addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(content, 'div', 'main-app-properties-row');
            status = addElement(row, 'div', 'main-app-properties-label row bold');

        row = addElement(content, 'div', 'main-app-properties-row');
            const bntClear = addElement(row, 'input');
            bntClear.setAttribute('type', 'button');
            bntClear.setAttribute('value', _I18N_.button_visibility_clear);
            bntClear.style.gridColumn = '11 / span 8';
            bntClear.addEventListener('click', parent.getMain().clearVisibility, { capture: false });

            const bntAdd = addElement(row, 'input');
            bntAdd.setAttribute('type', 'button');
            bntAdd.setAttribute('value', _I18N_.button_visibility_edit);
            bntAdd.style.gridColumn = '20 / span 8';
            bntAdd.addEventListener('click', parent.getMain().setVisibilityMode, { capture: false });

        optionsGroup = addElement(content, 'div');
        row = addElement(optionsGroup, 'div', 'main-app-properties-row');
              addElement(row, 'div', 'main-app-properties-label header bold', _I18N_.field_options);
              addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(optionsGroup, 'div', 'main-app-properties-row');
            fresh = addElement(row, 'input');
            fresh.setAttribute('id', 'fresh_checkbox');
            fresh.setAttribute('type', 'radio');
            fresh.setAttribute('name', 'visibility');
            fresh.setAttribute('value', _VISIBILITY_.FRESH);
            fresh.style.gridColumn = '2 / span 2';
            fresh.addEventListener('change', _update_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_fresh);
            label.setAttribute('for', 'fresh_checkbox');
            label.style.gridColumn = '4 / span 12';

            save = addElement(row, 'input');
            save.setAttribute('id', 'save_checkbox');
            save.setAttribute('type', 'checkbox');
            save.setAttribute('value', _VISIBILITY_.SAVE);
            save.style.gridColumn = '17 / span 2';
            save.addEventListener('change', _update_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_save);
            label.setAttribute('for', 'save_checkbox');
            label.style.gridColumn = '19 / span 9';

        row = addElement(optionsGroup, 'div', 'main-app-properties-row');
            extra = addElement(row, 'input');
            extra.setAttribute('id', 'extra_checkbox');
            extra.setAttribute('type', 'radio');
            extra.setAttribute('name', 'visibility');
            extra.setAttribute('value', _VISIBILITY_.EXTRA);
            extra.style.gridColumn = '2 / span 2';
            extra.addEventListener('change', _update_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_extra);
            label.setAttribute('for', 'extra_checkbox');
            label.style.gridColumn = '4 / span 12';

            restore = addElement(row, 'input');
            restore.setAttribute('id', 'restore_checkbox');
            restore.setAttribute('type', 'checkbox');
            restore.setAttribute('value', _VISIBILITY_.RESTORE);
            restore.style.gridColumn = '17 / span 2';
            restore.addEventListener('change', _update_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_restore);
            label.setAttribute('for', 'restore_checkbox');
            label.style.gridColumn = '19 / span 9';

        executionGroup = addElement(content, 'div');
        row = addElement(executionGroup, 'div', 'main-app-properties-row');
              addElement(row, 'div', 'main-app-properties-label header bold', _I18N_.field_execute);
              addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(executionGroup, 'div', 'main-app-properties-row');
            instant = addElement(row, 'input', 'main-app-properties-checkbox');
            instant.setAttribute('id', 'instant_radio');
            instant.setAttribute('type', 'radio');
            instant.setAttribute('name', 'execute');
            instant.setAttribute('value', _VISIBILITY_.INSTANT);
            instant.style.gridColumn = '2 / span 2';
            instant.addEventListener('change', _update_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_execute_instant);
            label.setAttribute('for', 'instant_radio');
            label.style.gridColumn = '4 / span 24';

        row = addElement(executionGroup, 'div', 'main-app-properties-row');
            after = addElement(row, 'input', 'main-app-properties-checkbox');
            after.setAttribute('id', 'after_radio');
            after.setAttribute('type', 'radio');
            after.setAttribute('name', 'execute');
            after.setAttribute('value', _VISIBILITY_.AFTER);
            after.style.gridColumn = '2 / span 2';
            after.addEventListener('change', _update_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_execute_after);
            label.setAttribute('for', 'after_radio');
            label.style.gridColumn = '4 / span 24';
    })();
}