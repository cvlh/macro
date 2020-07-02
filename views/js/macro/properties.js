'use strict';

import { addElement } from '../utils/functions.js';
import { _I18N_ } from '../i18n/pt-br.js';
import { _TYPES_, _VISIBILITY_ } from '../utils/constants.js';

import Color from './properties/color.js';

export default function Properties(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment,
        currentObject = null,

        color,

        prefix = { content: null, id: null, text: null }, 
        //color = { content: null, color: null },
        type = { content: null, type_icon: null, type: null, require: null, mask: null, size: null, default: null }, 
        position = { content: null, up: null, down: null },
        info = { content: null, info: null, help: null }, 
        visibility = { content: null, fresh: null, extra: null, save: null, restore: null, instant: null, after: null },
        kanban = { content: null, step: null },
        foreign = { content: null, key: null },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _change_type = function(evnt) {
        const value = evnt.target.value;

        type['type_icon'].textContent = value;
        if (currentObject !== null) {
            currentObject.setType(value)
        }
    },
    _change = function(evnt) {
        if (currentObject !== null) {
            console.dir(evnt);
        }
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.open = function (object) {
        /*prefix['content'].style.display = 'none';
        color['content'].style.display = 'none';
        type['content'].style.display = 'none';
        info['content'].style.display = 'none';
        visibility['content'].style.display = 'none';*/
        //kanban['content'].style.display = 'none';

        let props = object.getProps();
        if (props == null) return;

        color.visible(false);

        currentObject = object;
        for (let prop in props) {
            switch(prop) {
                case 'color':
                    color.visible(true, props[prop]);
                    break;
                case 'prefix':
                    prefix['content'].style.display = 'block';
                    prefix['id'].textContent = props[prop]['id'];
                    prefix['text'].textContent = props[prop]['text'];
                    break;

                case 'visibility':
                    const flags = props[prop]['flags'];

                    visibility['fresh'].checked = false;
                    visibility['extra'].checked = false;
                    visibility['save'].checked = false;
                    visibility['restore'].checked = false
                    visibility['instant'].checked = false
                    visibility['after'].checked = false;

                    if (flags & _VISIBILITY_.FRESH)   visibility['fresh'].checked = true;
                    if (flags & _VISIBILITY_.EXTRA)   visibility['extra'].checked = true;
                    if (flags & _VISIBILITY_.SAVE)    visibility['save'].checked = true;
                    if (flags & _VISIBILITY_.RESTORE) visibility['restore'].checked = true;
                    if (flags & _VISIBILITY_.INSTANT) visibility['instant'].checked = true;
                    if (flags & _VISIBILITY_.AFTER)   visibility['after'].checked = true;
                    
                    visibility['content'].style.display = 'block';
                    break;
            }
        }
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let row, label, count;

        fragment = document.createDocumentFragment();

        prefix['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(prefix['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_id']);
            prefix['id'] = addElement(row, 'div', 'main-app-properties-text');
            prefix['id'].style.gridColumn = '13 / span 15';

            row = addElement(prefix['content'] , 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_value']);

            row = addElement(prefix['content'] , 'div', 'main-app-properties-row');
            prefix['text'] = addElement(row, 'div', 'main-app-properties-text');
            prefix['text'].style.gridColumn = '3 / span 24';

        color = new Color(fragment);
        /*color['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(color['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_color']);

            count = 3;
            color['color'] = addElement(color['content'], 'div', 'main-app-properties-row');
            for (let color_idx in _COLORS_) {
                if (_COLORS_.hasOwnProperty(color_idx)) {
                    label = addElement(color['color'], 'div', 'main-app-properties-color');
                    label.setAttribute('title', _I18N_['field_color_text'][color_idx]);
                    label.style.backgroundColor = _COLORS_[color_idx];
                    label.style.gridColumn = count +' / span 2';
                    count += 3;

                    if (color_idx === 'BLUE') {
                        label.classList.add('selected');
                        label.style.borderColor = label.style.backgroundColor;
                    }
                }
            }*/

        type['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(type['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_type']);
            
            type['type_icon'] = addElement(row, 'div', 'icon main-app-properties-type-color', '0');

            type['type'] = addElement(row, 'select');
            type['type'].style.gridColumn = '15 / span 13';
            for (let type_idx in _I18N_['field_type_text']) {
                if (_TYPES_.hasOwnProperty(type_idx)) {
                    label = addElement(type['type'], 'option', null, _I18N_['field_type_text'][type_idx]);
                    label.setAttribute('value', _TYPES_[type_idx]);
                }
            }
            type['type'].addEventListener('change', _change_type, { capture: false });

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
                info['info'].style.gridColumn = '2 / span 26';

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_help']);

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            row.style.gridTemplateRows = '28px 28px';
                info['help'] = addElement(row, 'textarea');
                info['help'].setAttribute('rows', '3');
                info['help'].setAttribute('maxlength', '128');


        position['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(position['content'], 'div', 'main-app-properties-row');
            label = addElement(row, 'div', 'main-app-properties-label', _I18N_['field_position']);
            label.style.gridColumn = '2 / span 13';

            position['up'] = addElement(row, 'input', 'icon');
            position['up'].setAttribute('type', 'button');
            position['up'].setAttribute('value', 'U');
            position['up'].setAttribute('title', _I18N_['field_position_up']);
            position['up'].style.gridColumn = '18 / span 3';

            label = addElement(row, 'div', 'main-app-properties-label', '2');
            label.style.textAlign = 'center';
            label.style.gridColumn = '22 / span 2';

            position['down'] = addElement(row, 'input', 'icon');
            position['down'].setAttribute('type', 'button');
            position['down'].setAttribute('value', 'D');
            position['down'].setAttribute('title', _I18N_['field_position_down']);
            position['down'].style.gridColumn = '25 / span 3';

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
                visibility['fresh'].addEventListener('change', _change, { capture: false });

                label = addElement(row, 'label', 'main-app-properties-checkbox-label', _I18N_['field_visibility_fresh']);
                label.setAttribute('for', 'fresh_checkbox');
                label.style.gridColumn = '5 / span 8';

                visibility['extra'] = addElement(row, 'input', 'main-app-properties-checkbox');
                visibility['extra'].setAttribute('id', 'extra_checkbox');
                visibility['extra'].setAttribute('type', 'radio');
                visibility['extra'].setAttribute('name', 'visibility');
                visibility['extra'].setAttribute('value', _VISIBILITY_.EXTRA);
                visibility['extra'].style.gridColumn = '14 / span 2';
                visibility['extra'].addEventListener('change', _change, { capture: false });

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

            row = addElement(visibility['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_['field_no_visibility']);

            const bntvisibility = addElement(row, 'input');
            bntvisibility.setAttribute('type', 'button');
            bntvisibility.setAttribute('value', _I18N_['field_visibility_add']);
            bntvisibility.style.gridColumn = '13 / span 15';

            let status = true;
            bntvisibility.addEventListener('click', (evnt) => {
                currentObject.setVisibilitySelected(true);
                parent.setVisibilityMode(status);
                status = !status;
            }, { capture: false });

        foreign['content'] = addElement(fragment, 'div', 'main-app-properties-content');
        
            row = addElement(foreign['content'], 'div', 'main-app-properties-row');
            label = addElement(row, 'div', 'main-app-properties-label', _I18N_['field_foreign_key']);
            label.style.gridColumn = '2 / span 13';

            info['key'] = addElement(row, 'input');
            info['key'].setAttribute('type', 'text');
            info['key'].style.gridColumn = '16 / span 12';

    })();
}