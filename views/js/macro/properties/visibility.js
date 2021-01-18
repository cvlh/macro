'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _VISIBILITY_, _ICON_CHAR_ } from '../../utils/constants.js';

export default function Visibility (ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, 
        fresh, extra, save, restore, instant, after,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _get_flags = function() {
        const objectType = parent.getMain().getSelectedObject().getProps('visibility');
        
        objectType['flags'] = (fresh.checked   ? fresh.value   : _VISIBILITY_.NONE) | 
                              (extra.checked   ? extra.value   : _VISIBILITY_.NONE) | 
                              (save.checked    ? save.value    : _VISIBILITY_.NONE) | 
                              (restore.checked ? restore.value : _VISIBILITY_.NONE) | 
                              (instant.checked ? instant.value : _VISIBILITY_.NONE) | 
                              (after.checked   ? after.value   : _VISIBILITY_.NONE); 
    },
    _set_flags = function() {
        const objectType = parent.getMain().getSelectedObject().getProps('visibility');

        if (objectType['flags'] & fresh.value)   fresh.checked   = true; else fresh.checked   = false;
        if (objectType['flags'] & extra.value)   extra.checked   = true; else extra.checked   = false;
        if (objectType['flags'] & save.value)    save.checked    = true; else save.checked    = false;
        if (objectType['flags'] & restore.value) restore.checked = true; else restore.checked = false;
        if (objectType['flags'] & instant.value) instant.checked = true; else instant.checked = false;
        if (objectType['flags'] & after.value)   after.checked   = true; else after.checked   = false;
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function() {
        //const objectType = parent.getMain().getSelectedObject().getProps(this.constructor.name.toLocaleLowerCase());
        const objectType = parent.getMain().getSelectedObject().getProps('visibility');

        if (objectType !== null) {
            if (objectType['flags'] !== null) _set_flags();
            content.style.display = 'block';
            return;
        }

        content.style.removeProperty('display');
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let row, label;

        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');

        row = addElement(content, 'div', 'main-app-properties-row header');
        addElement(row, 'div', 'main-app-properties-label header', _I18N_.field_visibility);
        addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(content, 'div', 'main-app-properties-row');
        addElement(row, 'div', 'main-app-properties-label row', _I18N_.field_execute);

        row = addElement(content, 'div', 'main-app-properties-row');
            const bntClear = addElement(row, 'input');
            bntClear.setAttribute('type', 'button');
            bntClear.setAttribute('value', _I18N_.field_visibility_clear);
            bntClear.style.gridColumn = '2 / span 8';
            bntClear.addEventListener('click', parent.getMain().clearVisibility, { capture: false });

            const bntAdd = addElement(row, 'input');
            bntAdd.setAttribute('type', 'button');
            bntAdd.setAttribute('value', _I18N_.field_visibility_edit);
            bntAdd.style.gridColumn = '11 / span 8';
            bntAdd.addEventListener('click', parent.getMain().setVisibilityMode, { capture: false });

            /*const bntAux = addElement(row, 'input');
            bntAux.setAttribute('type', 'button');
            bntAux.setAttribute('value', _I18N_.field_visibility_add);
            bntAux.style.gridColumn = '20 / span 8';*/

        row = addElement(content, 'div', 'main-app-properties-row');
        addElement(row, 'div', 'main-app-properties-label header', _I18N_.field_options);
        addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(content, 'div', 'main-app-properties-row');

            fresh = addElement(row, 'input');
            fresh.setAttribute('id', 'fresh_checkbox');
            fresh.setAttribute('type', 'radio');
            fresh.setAttribute('name', 'visibility');
            fresh.setAttribute('value', _VISIBILITY_.FRESH);
            fresh.style.gridColumn = '2 / span 2';
            fresh.addEventListener('change', _get_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_fresh);
            label.setAttribute('for', 'fresh_checkbox');
            label.style.gridColumn = '4 / span 12';

            //
            save = addElement(row, 'input');
            save.setAttribute('id', 'save_checkbox');
            save.setAttribute('type', 'checkbox');
            save.setAttribute('value', _VISIBILITY_.SAVE);
            save.style.gridColumn = '17 / span 2';
            save.addEventListener('change', _get_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_Save);
            label.setAttribute('for', 'save_checkbox');
            label.style.gridColumn = '19 / span 9';

        row = addElement(content, 'div', 'main-app-properties-row');

            extra = addElement(row, 'input');
            extra.setAttribute('id', 'extra_checkbox');
            extra.setAttribute('type', 'radio');
            extra.setAttribute('name', 'visibility');
            extra.setAttribute('value', _VISIBILITY_.EXTRA);
            extra.style.gridColumn = '2 / span 2';
            extra.addEventListener('change', _get_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_extra);
            label.setAttribute('for', 'extra_checkbox');
            label.style.gridColumn = '4 / span 12';

            restore = addElement(row, 'input');
            restore.setAttribute('id', 'restore_checkbox');
            restore.setAttribute('type', 'checkbox');
            restore.setAttribute('value', _VISIBILITY_.RESTORE);
            restore.style.gridColumn = '17 / span 2';
            restore.addEventListener('change', _get_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_visibility_Restore);
            label.setAttribute('for', 'restore_checkbox');
            label.style.gridColumn = '19 / span 9';

        //
        row = addElement(content, 'div', 'main-app-properties-row');
        addElement(row, 'div', 'main-app-properties-label header', _I18N_.field_execute);
        addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        row = addElement(content, 'div', 'main-app-properties-row');

            instant = addElement(row, 'input', 'main-app-properties-checkbox');
            instant.setAttribute('id', 'instant_radio');
            instant.setAttribute('type', 'radio');
            instant.setAttribute('name', 'execute');
            instant.setAttribute('value', _VISIBILITY_.INSTANT);
            instant.style.gridColumn = '2 / span 2';
            instant.addEventListener('change', _get_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_execute_instant);
            label.setAttribute('for', 'instant_radio');
            label.style.gridColumn = '4 / span 24';

        row = addElement(content, 'div', 'main-app-properties-row');

            after = addElement(row, 'input', 'main-app-properties-checkbox');
            after.setAttribute('id', 'after_radio');
            after.setAttribute('type', 'radio');
            after.setAttribute('name', 'execute');
            after.setAttribute('value', _VISIBILITY_.AFTER);
            after.style.gridColumn = '2 / span 2';
            after.addEventListener('change', _get_flags, { capture: false });

            label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_execute_after);
            label.setAttribute('for', 'after_radio');
            label.style.gridColumn = '4 / span 24';

    })();
}