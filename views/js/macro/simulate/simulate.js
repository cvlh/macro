'use strict';

import { _COLORS_, _TYPES_, _VISIBILITY_ } from '../../utils/constants.js';
import { addElement } from '../../utils/functions.js';

////////////////////////////////////////////////////////////////////////////////
export default function Simulate(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment, 
        simulatePopup, simulateContainer, simulateMain, simulateKeyboard,
        __showKeyboard = false,
        macro,
        stackExecute, stackVisibility,
        queueViews,
        currentVisibleIDs,lastRootExecuted,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _create_keyboard = function() {
        const controls_buttons = addElement(simulateKeyboard, 'div', 'controls-buttons');

        const back = addElement(controls_buttons, 'div', null, 'Voltar');
        back.style.backgroundColor = 'var(--main-font-color-med)';

        const confirm = addElement(controls_buttons, 'div', null, 'Confirmar');
        confirm.style.backgroundColor = 'var(--main-green-bold)';

        const keyboard = addElement(simulateKeyboard, 'div', 'keyboard');
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '\uf55a'].forEach( value => {
            addElement(keyboard, 'div', 'font-awesome keyboard-key', value);
        });
    },
    _hide_keyboard = function() { simulateKeyboard.style.removeProperty('height'); },
    _show_keyboard = function() { 
        __showKeyboard = false;
        simulateKeyboard.style.height = '130px'; 
    },

    _wildcard = function(id) {
        let wildcard = '';
        const size = macro[id]['level'].length - 1;

        for (let counter = 0; counter < size; counter++) 
            wildcard += macro[id]['level'][counter] + '.';
        wildcard += 'x';

        return wildcard;
    },   
    _apply_visibility = function(visibility) {
        const visibility_flags  = visibility['flags'],
              visibility_fields = visibility['fields'];

        if (visibility_flags & _VISIBILITY_.SAVE)
            stackVisibility.push(currentVisibleIDs);

        if (visibility_flags & _VISIBILITY_.RESTORE)
            currentVisibleIDs = stackVisibility.pop();

        if (visibility_flags & _VISIBILITY_.EXTRA)
            _additional_visibility(visibility_fields);

        if (visibility_flags & _VISIBILITY_.FRESH && visibility_fields.hasOwnProperty('visible'))
            currentVisibleIDs = visibility_fields['visible'];
    },
    _additional_visibility = function(visibility_fields) {
        if (visibility_fields.hasOwnProperty('visible')) {
            for (const id of visibility_fields['visible']) 
                currentVisibleIDs.push(id);
            
            // TODO: order ids
        }
        
        if (visibility_fields.hasOwnProperty('hidden')) {
            for (const id of visibility_fields['hidden']) {
                let result = currentVisibleIDs.findIndex( element => element === id);

                if (result !== -1)
                    currentVisibleIDs.splice(result, 1);
            }
        }
    },
    _filter_ids = function(visibility, level, origin_level = null) {
        return visibility.filter( element => {
            const current_level = macro[element]['level'];
            
            if (current_level.length !== level) 
                return false;

            if (origin_level !== null) {
                for (let counter = 0; counter < (level - 1); counter++) {
                    if (current_level[counter] !== origin_level[counter] )
                        return false;
                }
            }

            return true;
        });
    },
    _clear_stack_view = function() {
        while (queueViews.length > 1) {
            let view = queueViews.shift();
            simulateMain.removeChild(view);
        }
    },
    _execute = function(id, color, current_slide) {
        const origin_level = macro[id]['level'];

        let slide, visiblesIDs,
            level = origin_level.length + 1;

        stackExecute.push(id);

        if (lastRootExecuted !== id)
            _apply_visibility(macro[id]['visibility']);

        visiblesIDs = _filter_ids(currentVisibleIDs, level, origin_level);
        if (!visiblesIDs.length) {
            console.log(stackExecute);
            _clear_stack_view();

            let lastExecId = stackExecute.pop();
            while (lastExecId !== undefined) {
                const wildcard = _wildcard(lastExecId);
                if (macro.hasOwnProperty(wildcard))
                    _apply_visibility(macro[wildcard]['visibility']);

                lastExecId = stackExecute.pop();
                level--;
            }
            visiblesIDs = _filter_ids(currentVisibleIDs, level, origin_level);
        }

        slide = _create_view(visiblesIDs, color);

        if (visiblesIDs.length === 1 && lastRootExecuted === visiblesIDs[0]) {
            simulateMain.removeChild(slide);
            queueViews.pop();
            //slide.style.left = '0';
            
            _execute(lastRootExecuted, color, current_slide);
        } else {
            setTimeout(() => {
                current_slide.style.left = '-100%';
                slide.style.left = 0;
    
                if (__showKeyboard)
                    _show_keyboard();
            }, 50);
        }

        if (origin_level.length === 1)
            lastRootExecuted = id;
    },
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              current_parent = target.parentElement;

        if (target.classList.contains('input-type')) {
            const [_, color] = target['_props_'];

            _show_keyboard();

            target.className = 'item-input-block';
            target.removeChild(target.lastChild);

            const content = addElement(current_parent, 'div', 'item-input');
            current_parent.replaceChild(content, target);
            content.appendChild(target);

            const listItems = current_parent.querySelectorAll('.item-list, .item-divider');
            for (const listItem of listItems)
                listItem.style.animationPlayState = 'running';

            const dividers = current_parent.querySelectorAll('.item-divider');
            for (const divider of dividers)
                divider.style.height = '0px';
            
            const input = addElement(content, 'input', 'item-input-box');
            input.style.borderColor = color;

            content.style.animationPlayState = 'running';
            
        } else if (target.classList.contains('item-list')) {
            const [id, color] = target['_props_'];
            _execute(id, color, current_parent);
        }
    },
    _create_list_item = function(id, color, input = false) {
        const item_fragment = document.createDocumentFragment();
        const data = macro[id];

        const item = addElement(item_fragment, 'div', 'item-list'); 
        item.style.color = color;
        item['_props_'] = [id, color]; 

        if (input) 
            item.classList.add('input-type');

        addElement(item, 'div', 'font-awesome item-list-icon', data['icon']);

        const content = addElement(item, 'div', 'item-list-block');
        addElement(content, 'div', 'item-list-header', data['text']);

        addElement(content, 'div', 'item-list-subheader', data['text']);

        if (input) 
            addElement(item, 'div', 'icon item-list-icon small', data['type']['type']);

        return item_fragment;
    },
    _create_view = function (ids, color = null) {
        let navbar, item, shortcut, type, content,
            auto_execute = false;

        const slide = addElement(simulateMain, 'div', 'container-main-slide');

        const is_list = ids.every( element => macro[element]['type']['type'] === _TYPES_.LIST );
        if (!is_list && ids.length === 1)
            auto_execute = true;

        _hide_keyboard();

        for (const id of stackExecute) {
            shortcut = macro[id];

            navbar = addElement(slide, 'div', 'navbar');
            navbar.style.color = color;

            addElement(navbar, 'div', 'font-awesome navbar-icon', shortcut['icon']);
            addElement(navbar, 'div', 'navbar-text', shortcut['text']);
        }

        if (stackExecute.length) {
            content = addElement(slide, 'div', 'item-space');
            content.style.backgroundColor = color;
        }

        for (const id of ids) {
            shortcut = macro[id];

            type = shortcut['type']['type'];

            if (shortcut.hasOwnProperty('color'))
                color = shortcut['color'];

            if (type === _TYPES_.LIST) {
                item = _create_list_item(id, color);
            } else {
                if (auto_execute) {
                    switch(type) {
                        case _TYPES_.NUMBER:
                        case _TYPES_.TEXT:
                            __showKeyboard = true;

                            item = addElement(slide, 'div', 'item-input');

                            const block = addElement(item, 'div', 'item-input-block'); 
                            block.style.color = color;
                    
                            addElement(block, 'div', 'font-awesome item-list-icon', shortcut['icon']);
                    
                            const content = addElement(block, 'div', 'item-list-block');
                            addElement(content, 'div', 'item-list-header', shortcut['text']);
                    
                            addElement(content, 'div', 'item-list-subheader', shortcut['text']);
                    
                            const input = addElement(item, 'input', 'item-input-box');
                            input.style.borderColor = color;

                            item.style.animationPlayState = 'running';
                            break;
        
                        case _TYPES_.DATE:
                            break;
        
                        case _TYPES_.PHOTO:
                            break;
        
                        case _TYPES_.SIGNATURE:
                            break;
        
                        case _TYPES_.SCAN:
                            break;
                    }
                } else {
                    item = _create_list_item(id, color, true);
                }
            }
            
            slide.appendChild(item);
            addElement(slide, 'div', 'item-divider');
        }

        queueViews.push(slide);
        return slide;
    },
    _order_visibility = function (visibility) {
        for (const status in visibility['fields']) {
            let sort_array = visibility['fields'][status].map( element => {
                return element.split('.').map( item => { return parseInt(item, 10); });
            }).sort();

            // console.log(sort_array);

            delete visibility['fields'][status];

            if (sort_array.length) {
                visibility['fields'][status] = sort_array.map( element => {
                    return element.join('.');
                });
            }

            // console.log(visibility['fields'][status]);
        }
    },
    _create_hash = function (fields, hashs = { }) {
        let id, levels, visibilitySize = 0;

        for (const field of fields) {
            id = field['properties']['id'];

            levels = id.split('.');
            field['properties']['level'] = levels.map( element => {
                return parseInt(element, 10);
            });

            delete field['properties']['id'];
            delete field['properties']['expanded'];
            delete field['properties']['tail'];
            delete field['properties']['line'];
            delete field['properties']['order'];

            _order_visibility(field['properties']['visibility']);

            hashs[id] = field['properties'];

            if (field.hasOwnProperty('output')) {
                for (const status in field['output']['properties']['visibility']['fields']) 
                    visibilitySize += field['output']['properties']['visibility']['fields'][status].length;

                if (visibilitySize) {
                    _order_visibility(field['output']['properties']['visibility']);
                    hashs[id + '.x'] = field['output']['properties'];
                }

                _create_hash(field['output']['fields'], hashs);
            }
        }
        return hashs;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.start = function() {
        const serialize = parent.serialize();

        while (simulateMain.hasChildNodes())
            simulateMain.removeChild(simulateMain.firstChild);

        macro = _create_hash(serialize['root']['fields']);
        console.log(macro);

        _order_visibility(serialize['root']['properties']['visibility']);
        currentVisibleIDs = serialize['root']['properties']['visibility']['fields']['visible'];

        stackVisibility = [];
        queueViews = [];
        stackExecute = [];
        lastRootExecuted = null;

        const visiblesIDs = _filter_ids(currentVisibleIDs, 1);
        const new_slide = _create_view(visiblesIDs);
        new_slide.style.left = '0';

        simulatePopup.style.display = 'block';
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        fragment = document.createDocumentFragment();

        simulatePopup = addElement(fragment, 'div', 'simulate-app');
        const simulateContent = addElement(simulatePopup, 'div', 'simulate-content');

        addElement(simulateContent, 'div', 'header');

        simulateContainer = addElement(simulateContent, 'div', 'container');

        simulateMain = addElement(simulateContainer, 'div', 'main');
        simulateKeyboard = addElement(simulateContainer, 'div', 'controls');
        _create_keyboard();

        addElement(simulateContent, 'div', 'footer');

        simulateMain.addEventListener('click', _receive_events, { capture: false });
    })();
}