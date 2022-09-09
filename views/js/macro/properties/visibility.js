'use strict';

import { addElement } from '../../utils/functions.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { _VISIBILITY_, _ICON_CHAR_ } from '../../utils/constants.js';

export default function Visibility (ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let content, 
        title,
        status, btnAdd,
        actionGroup, btnEdit, btnCancel, btnDelete,
        optionsGroup, fresh, extra, save, restore, 
        // executionGroup, instant, after,

        backup,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _backup  = function() { backup = parent.getMain().getSelectedObject().getProps('visibility'); },
    _restore = function() { 
        let objectProp = parent.getMain().getSelectedObject().getProps('visibility');
        objectProp = backup; 

        return objectProp;
    },

    _add = function() {
        _backup();

        // const object = parent.getMain().getSelectedObject();
              //props = object.getProps('visibility');

        // if (object instanceof Card) {
        //     if (object.isRoot()) {
                
        //     }
        // }

        status.textContent = _I18N_.create_visibility;
        status.style.removeProperty('grid-column');
        status.style.removeProperty('color');

        btnAdd.style.display  = 'none';

        actionGroup.style.display = 'block';

        btnEdit.style.visibility = 'visible';
        btnEdit.setAttribute('value', _I18N_.button_visibility_save);
        btnEdit.style.color = 'var(--main-green-selected)'; 

        btnCancel.style.visibility = 'visible';
        btnDelete.style.visibility = 'hidden';

        // optionsGroup.style.display = 'block';
        // executionGroup.style.display = 'block'; 
        // _set_flags(props);

        parent.getMain().setVisibilityMode();
    },
    _edit = function() {

        if (parent.getMain().getVisibilityMode()) {
            const objectProp = parent.getMain().getSelectedObject().getProps('visibility');
            //const fieldsSize = objectProp['fields'].length;

            btnEdit.setAttribute('value', _I18N_.button_visibility_edit);
            btnEdit.style.removeProperty('color');

            btnCancel.style.visibility = 'hidden';
            btnDelete.style.visibility = 'hidden';

            //status.textContent = fieldsSize +' '+ (fieldsSize === 1 ? _I18N_.item_selected[0] : _I18N_.item_selected[1]);
            //status.style.color = 'var(--main-blue-selected)'; 
            _set_flags(objectProp);

        } else {
            _backup();

            btnEdit.setAttribute('value', _I18N_.button_visibility_save);
            btnEdit.style.color = 'var(--main-green-selected)'; 
            
            btnCancel.style.visibility = 'visible';
            btnDelete.style.visibility = 'visible';
        }

        parent.getMain().setVisibilityMode();
    },
    _cancel = function() {
        const objectFields = _restore(),
              fieldsSize = objectFields.length;

        if (!fieldsSize) {
            status.textContent = _I18N_.without_visibility;
            status.style.gridColumn = '2 / span 17';
            status.style.color = 'var(--main-red-selected)'; 

            btnAdd.style.display = 'block';

            actionGroup.style.display = 'none';
            optionsGroup.style.display = 'none';
            // executionGroup.style.display = 'none';
        } else {
            btnEdit.setAttribute('value', _I18N_.button_visibility_edit);
            btnEdit.style.removeProperty('color');

            btnCancel.style.visibility = 'hidden';
            btnDelete.style.visibility = 'hidden';
        }

        parent.getMain().setVisibilityMode();
    },
    _delete = function() {
        const objectProp = parent.getMain().getSelectedObject().getProps('visibility');

        status.textContent = _I18N_.without_visibility;
        status.style.removeProperty('color');

        parent.getMain().deleteVisibility();

        _set_status(objectProp);
    },

    _update_flags = function() {
        const objectProp = parent.getMain().getSelectedObject().getProps('visibility');

        objectProp['flags'] = (fresh.checked   ? fresh.value   : _VISIBILITY_.NONE) | 
                              (extra.checked   ? extra.value   : _VISIBILITY_.NONE) | 
                              (save.checked    ? save.value    : _VISIBILITY_.NONE) | 
                              (restore.checked ? restore.value : _VISIBILITY_.NONE) ; 
                              // (instant.checked ? instant.value : _VISIBILITY_.NONE) | 
                              // (after.checked   ? after.value   : _VISIBILITY_.NONE) ;
    },
    _set_flags = function(prop) {
        // const fieldsSize = prop['fields'].length;
        // const visibilitySize = prop['fields']['visible'].length + prop['fields']['hidden'].length;

        // if (visibilitySize && prop.hasOwnProperty('flags')) {
        if (prop.hasOwnProperty('flags')) {
            if (prop['flags'] & fresh.value)   fresh.checked   = true; else fresh.checked   = false;
            if (prop['flags'] & extra.value)   extra.checked   = true; else extra.checked   = false;
            if (prop['flags'] & save.value)    save.checked    = true; else save.checked    = false;
            if (prop['flags'] & restore.value) restore.checked = true; else restore.checked = false;
            // if (prop['flags'] & instant.value) instant.checked = true; else instant.checked = false;
            // if (prop['flags'] & after.value)   after.checked   = true; else after.checked   = false;
            
            optionsGroup.style.display   = 'block';
            // executionGroup.style.display = 'block';

            return;
        }

        optionsGroup.style.display   = 'none';
        // executionGroup.style.display = 'none';
    },
    _set_status = function(prop) {
        let visibilitySize = 0;
        
        for (const status in prop['fields']) 
            visibilitySize += prop['fields'][status].length;

        if (!visibilitySize) {
            status.textContent = _I18N_.without_visibility;
            status.style.gridColumn = '2 / span 17';
            status.style.color = 'var(--main-red-selected)'; 
            
            btnAdd.style.display = 'block';

            actionGroup.style.display = 'none';
        } else {
            status.textContent = visibilitySize +' '+ (visibilitySize === 1 ? _I18N_.item_selected[0] : _I18N_.item_selected[1]);
            status.style.color = 'var(--main-blue-selected)'; 
            
            btnAdd.style.display = 'none';

            btnEdit.setAttribute('value', _I18N_.button_visibility_edit);
            btnEdit.style.removeProperty('color');

            btnDelete.style.visibility = 'hidden';
            btnCancel.style.visibility = 'hidden';

            actionGroup.style.display = 'block';
        }
    }

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.visible = function(object) {
        //const objectType = parent.getMain().getSelectedObject().getProps(this.constructor.name.toLocaleLowerCase());
        const objectVisibility = parent.getMain().getSelectedObject().getProps('visibility');

        if (objectVisibility !== null) {
            _set_flags(objectVisibility);
            _set_status(objectVisibility);

            content.style.display = 'block';
        } else {
            content.style.removeProperty('display');
        }
    };
    this.update = function() {
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let row, label;

        content = addElement(parent.getFragment(), 'div', 'main-app-properties-content');

        row = addElement(content, 'div', 'main-app-properties-row header bold');
        title = addElement(row, 'div', 'main-app-properties-label header bold', _I18N_.field_visibility);
            addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        // row = addElement(content, 'div', 'main-app-properties-row spacer');
        row = addElement(content, 'div', 'main-app-properties-row');
        // status = addElement(row, 'div', 'main-app-properties-label status bold');
        status = addElement(row, 'div', 'main-app-properties-label status');

            btnAdd = addElement(row, 'input');
            btnAdd.setAttribute('type', 'button');
            btnAdd.setAttribute('value', _I18N_.button_visibility_add);
            btnAdd.style.gridColumn = '20 / span 8';
            btnAdd.addEventListener('click', _add, { capture: false });

        actionGroup = addElement(content, 'div');
        row = addElement(actionGroup, 'div', 'main-app-properties-row');
            // count = addElement(row, 'div', 'main-app-properties-label counter bold');

            btnDelete = addElement(row, 'input');
            btnDelete.setAttribute('type', 'button');
            btnDelete.setAttribute('value', _I18N_.button_visibility_clear);
            btnDelete.style.gridColumn = '2 / span 8';
            btnDelete.style.color = 'var(--main-red-selected)';
            btnDelete.style.visibility = 'hidden';
            btnDelete.addEventListener('click', _delete, { capture: false });

            btnCancel = addElement(row, 'input');
            btnCancel.setAttribute('type', 'button');
            btnCancel.setAttribute('value', _I18N_.button_visibility_cancel);
            btnCancel.style.gridColumn = '11 / span 8';
            btnCancel.addEventListener('click', _cancel, { capture: false });

            btnEdit = addElement(row, 'input');
            btnEdit.setAttribute('type', 'button');
            btnEdit.setAttribute('value', _I18N_.button_visibility_edit);
            btnEdit.style.gridColumn = '20 / span 8';
            btnEdit.addEventListener('click', _edit, { capture: false });

        optionsGroup = addElement(content, 'div');
        row = addElement(optionsGroup, 'div', 'main-app-properties-row');
              addElement(row, 'div', 'main-app-properties-label sub-header', _I18N_.field_options);
              // addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

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

        // executionGroup = addElement(content, 'div');
        // row = addElement(executionGroup, 'div', 'main-app-properties-row');
        //       addElement(row, 'div', 'main-app-properties-label sub-header', _I18N_.field_execute);
        //       // addElement(row, 'div', 'icon main-app-properties-label help', _ICON_CHAR_.HELP);

        // row = addElement(executionGroup, 'div', 'main-app-properties-row');
        //     instant = addElement(row, 'input', 'main-app-properties-checkbox');
        //     instant.setAttribute('id', 'instant_radio');
        //     instant.setAttribute('type', 'radio');
        //     instant.setAttribute('name', 'execute');
        //     instant.setAttribute('value', _VISIBILITY_.INSTANT);
        //     instant.style.gridColumn = '2 / span 2';
        //     instant.addEventListener('change', _update_flags, { capture: false });

        //     label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_execute_instant);
        //     label.setAttribute('for', 'instant_radio');
        //     label.style.gridColumn = '4 / span 24';

        // row = addElement(executionGroup, 'div', 'main-app-properties-row');
        //     after = addElement(row, 'input', 'main-app-properties-checkbox');
        //     after.setAttribute('id', 'after_radio');
        //     after.setAttribute('type', 'radio');
        //     after.setAttribute('name', 'execute');
        //     after.setAttribute('value', _VISIBILITY_.AFTER);
        //     after.style.gridColumn = '2 / span 2';
        //     after.addEventListener('change', _update_flags, { capture: false });

        //     label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_.field_execute_after);
        //     label.setAttribute('for', 'after_radio');
        //     label.style.gridColumn = '4 / span 24';

    })();
}