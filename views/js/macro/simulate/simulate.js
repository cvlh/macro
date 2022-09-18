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
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '\uf55a'].forEach( value => {
            addElement(simulateKeyboard, 'div', 'font-awesome keyboard-key', value);
        });
    },
    _hide_keyboard = function() { simulateKeyboard.style.removeProperty('height'); },
    _show_keyboard = function() { 
        __showKeyboard = false;
        simulateKeyboard.style.height = '116px'; 
    },

    // _get_parent_id = function(item) {
    //     const size = item['level'].length - 1;
    //     let parend_id = '';

    //     for (let counter = 0; counter < size; counter++) {
    //         parend_id += item['level'][counter];
    //         if (counter < size)
    //             parend_id += '.';
    //     }

    //     return parend_id;
    // },
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
            for (const id in visibility_fields['visible']) 
                currentVisibleIDs.push(id);
            
            // TODO: order ids
        }
        if (visibility_fields.hasOwnProperty('hidden')) {
            for (const id in visibility_fields['hidden']) {
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
              current_slide = target.parentElement;

        if (target.classList.contains('item-list')) {
            const [id, color] = target['_props_'];

            _execute(id, color, current_slide);
        }
    },
    _create_view = function (ids, color = null) {
        let navbar, item, label, icon, type, div, shortcut, content,
            auto_execute = false;

        const is_list = ids.every( element => macro[element]['type']['type'] === _TYPES_.LIST );

        const slide = addElement(simulateMain, 'div', 'container-main-slide');

        _hide_keyboard();

        if (!is_list && ids.length === 1)
            auto_execute = true;

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

            if (shortcut.hasOwnProperty('color'))
                color = shortcut['color'];
            
            label = shortcut['text'];
            icon  = shortcut['icon'];
            type  = shortcut['type']['type'];

            item = addElement(slide, 'div'); 
            item['_props_'] = [id, color]; 

            if (type === _TYPES_.LIST) {
                item.classList.add('item-list');
                item.style.color = color;

                div = addElement(item, 'div', 'font-awesome item-list-icon', icon);

                content = addElement(item, 'div', 'item-list-block');
                div = addElement(content, 'div', 'item-list-header', label);
    
                if (Math.floor(Math.random() * 10) < 6)
                    div = addElement(content, 'div', 'item-list-subheader', label +' '+ label);

                addElement(slide, 'div', 'item-divider');
            } else {
                if (auto_execute) {
                    switch(type) {
                        case _TYPES_.NUMBER:
                        case _TYPES_.TEXT:
                            __showKeyboard = true;

                            item.classList.add('item-input');
                            item.style.color = color;

                            content = addElement(item, 'div', 'item-input-block');
        
                            div = addElement(content, 'div', 'font-awesome item-input-icon', icon);
                            div = addElement(content, 'div', 'item-input-header', label);
        
                            div = addElement(item, 'input', 'item-input-box');
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
                    item.classList.add('item-list', 'input-type');
                    item.style.color = color;

                    div = addElement(item, 'div', 'font-awesome item-list-icon', icon);
    
                    content = addElement(item, 'div', 'item-list-block');
                    div = addElement(content, 'div', 'item-list-header', label);
        
                    if (Math.floor(Math.random() * 10) < 6)
                        div = addElement(content, 'div', 'item-list-subheader', label +' '+ label);
    
                    addElement(item, 'div', 'icon item-list-icon small', type);

                    addElement(slide, 'div', 'item-divider');
                }

            }
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
        simulateKeyboard = addElement(simulateContainer, 'div', 'keyboard');
        _create_keyboard();

        addElement(simulateContent, 'div', 'footer');

        simulateMain.addEventListener('click', _receive_events, { capture: false });
    })();
}