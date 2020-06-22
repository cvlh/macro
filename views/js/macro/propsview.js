'use strict';

import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';
import { _COLORS_, _TYPES_, _VISIBILITY_ } from '../utils/constants.js';

export default function PropsView(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment,
        properties = {
            id:         { content: null, id: null, text: null }, 
            color:      { content: null, color: null },
            type:       { content: null, type: null, require: null, mask: null, size: null, default: null }, 
            info:       { content: null, info: null, help: null }, 
            visibility: { content: null, fresh: null, extra: null, save: null, restore: null, instant: null, after: null },
            kanban:     { content: null, step: null }
        };

    // PRIVATE /////////////////////////////////////////////////////////////////
    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.open = function (props) {
        for (let prop in props) {
            switch(prop) {
                case 'id':
                    break;

            }
        }
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let row, label, position;

        fragment = document.createDocumentFragment();

        id['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(id['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_id']);

            id['id'] = addElement(row, 'div', 'main-app-properties-text');

            row = addElement(id['content'] , 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_value']);

            id['text'] = addElement(row, 'div', 'main-app-properties-text');

        color['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(color['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_color']);

            position = 3;
            color['color'] = addElement(color['content'], 'div', 'main-app-properties-row');
            for (let clr in _COLORS_) {
                label = addElement(color['color'], 'div', 'main-app-properties-color');
                label.style.backgroundColor = _COLORS_[clr];
                label.style.gridColumn = position +' / span 2';
                position += 3;

                if (clr === 'INDIGO') {
                    label.classList.add('selected');
                    label.style.borderColor = label.style.backgroundColor;
                }
            }

        type['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(type['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_type']);
  
            row = addElement(type['content'], 'div', 'main-app-properties-row');
                type['require'] = addElement(row, 'input');
                type['require'].setAttribute('id', 'require_checkbox');
                type['require'].setAttribute('type', 'checkbox');
                type['require'].style.gridColumn = '2 / span 2';

                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_require']);
                label.setAttribute('for', 'require_checkbox');
                label.style.gridColumn = '5 / span 23';

        info['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_info']);

            row = addElement(info['content'], 'div', 'main-app-properties-row');
                info['info'] = addElement(row, 'input');
                info['info'].setAttribute('type', 'text');

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_help']);

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            row.style.gridTemplateRows = '28px 28px';
                info['help'] = addElement(row, 'textarea');
                info['help'].setAttribute('rows', '3');
                info['help'].setAttribute('maxlength', '128');

        visibility['content'] = addElement(fragment, 'div', 'main-app-properties-content');
        
            row = addElement(visibility['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_visibility']);

            row = addElement(visibility['content'], 'div', 'main-app-properties-row');
                visibility['fresh'] = addElement(row, 'input', 'main-app-properties-checkbox');
                visibility['fresh'].setAttribute('id', 'fresh_checkbox');
                visibility['fresh'].setAttribute('type', 'radio');
                visibility['fresh'].setAttribute('name', 'visibility');
                visibility['fresh'].setAttribute('value', _VISIBILITY_.FRESH);
                visibility['fresh'].style.gridColumn = '2 / span 2';

                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_visibility_fresh']);
                label.setAttribute('for', 'fresh_checkbox');
                label.style.gridColumn = '5 / span 8';

                visibility['extra'] = addElement(row, 'input', 'main-app-properties-checkbox');
                visibility['extra'].setAttribute('id', 'extra_checkbox');
                visibility['extra'].setAttribute('type', 'radio');
                visibility['extra'].setAttribute('name', 'visibility');
                visibility['extra'].setAttribute('value', _VISIBILITY_.EXTRA);
                visibility['extra'].style.gridColumn = '14 / span 2';

                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_visibility_extra']);
                label.setAttribute('for', 'extra_checkbox');
                label.style.gridColumn = '17 / span 11';

            row = addElement(visibility['content'], 'div', 'main-app-properties-row');
                visibility['save'] = addElement(row, 'input', 'main-app-properties-checkbox');
                visibility['save'].setAttribute('id', 'save_checkbox');
                visibility['save'].setAttribute('type', 'checkbox');
                visibility['save'].setAttribute('value', _VISIBILITY_.SAVE);
                visibility['save'].style.gridColumn = '2 / span 2';

                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_visibility_Save']);
                label.setAttribute('for', 'save_checkbox');
                label.style.gridColumn = '5 / span 8';

                visibility['restore'] = addElement(row, 'input', 'main-app-properties-checkbox');
                visibility['restore'].setAttribute('id', 'restore_checkbox');
                visibility['restore'].setAttribute('type', 'checkbox');
                visibility['restore'].setAttribute('value', _VISIBILITY_.RESTORE);
                visibility['restore'].style.gridColumn = '14 / span 2';
        
                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_visibility_Restore']);
                label.setAttribute('for', 'restore_checkbox');
                label.style.gridColumn = '17 / span 11';

            row = addElement(visibility['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_execute']);

            row = addElement(visibility['content'], 'div', 'main-app-properties-row');
                visibility['instant'] = addElement(row, 'input', 'main-app-properties-checkbox');
                visibility['instant'].setAttribute('id', 'instant_radio');
                visibility['instant'].setAttribute('type', 'radio');
                visibility['instant'].setAttribute('name', 'execute');
                visibility['instant'].setAttribute('value', _VISIBILITY_.INSTANT);
                visibility['instant'].style.gridColumn = '2 / span 2';

                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_execute_instant']);
                label.setAttribute('for', 'instant_radio');
                label.style.gridColumn = '5 / span 8';

                visibility['after'] = addElement(row, 'input', 'main-app-properties-checkbox');
                visibility['after'].setAttribute('id', 'after_radio');
                visibility['after'].setAttribute('type', 'radio');
                visibility['after'].setAttribute('name', 'execute');
                visibility['after'].setAttribute('value', _VISIBILITY_.AFTER);
                visibility['after'].style.gridColumn = '14 / span 2';
        
                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_execute_after']);
                label.setAttribute('for', 'after_radio');
                label.style.gridColumn = '17 / span 11';

            const bntvisibility = addElement(fragment, 'input');
            bntvisibility.setAttribute('type', 'button');
            bntvisibility.setAttribute('value', 'Visibilidade');

            let status = true;
            bntvisibility.addEventListener('click', (evnt) => {
                parent.setVisibilityMode(status);
                status = !status;
            }, { capture: false });
    })();
}