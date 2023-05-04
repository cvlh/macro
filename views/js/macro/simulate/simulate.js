'use strict';

import { _COLORS_, _TYPES_, _VISIBILITY_, _KEYBOARD_FLAGS_, _RUN_ENVIRONMENT_, _ICON_CHAR_} from '../../utils/constants.js';
import { addElement } from '../../utils/functions.js';

import InputNumber from './components/input-number.js'
import InputSignature from './components/input-signature.js';
import Keyboard from './keyboard.js';

////////////////////////////////////////////////////////////////////////////////
export default function Simulate(__run_environment = _RUN_ENVIRONMENT_.WEB) {

    if (!new.target) 
        throw new Error('Simulate() must be called with new');

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        DOMElement = {
            popup:     null,
            container: null,
            main:      null
        };

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment,

        macro, keyboard,
        stackExecute, stackVisibility,
        queueViews,
        structInputs, // { last: 0, list: [] }
        currentVisibleIDs = new Set(), 
        lastRootExecuted,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _wildcard = (id) => {
        let wildcard = '';
        const size = macro[id]['level'].length - 1;

        for (let counter = 0; counter < size; counter++) 
            wildcard += macro[id]['level'][counter] + '.';
        wildcard += 'x';

        return wildcard;
    },   
    _apply_visibility = (visibility) => {
        const visibility_flags  = visibility['flags'],
              visibility_fields = visibility['fields'];

        if (visibility_flags & _VISIBILITY_.SAVE) {
            const save_array = [];
            for (const id of currentVisibleIDs.values())
                save_array.push(id);
    
            stackVisibility.push(save_array);
        }

        if (visibility_flags & _VISIBILITY_.RESTORE) {
            if (stackVisibility.length) {
                currentVisibleIDs.clear();

                const current_stack = stackVisibility.pop();
                for (const id of current_stack)
                    currentVisibleIDs.add(id);
            }
        }

        if (visibility_flags & _VISIBILITY_.EXTRA)
            _additional_visibility(visibility_fields);

        if (visibility_flags & _VISIBILITY_.FRESH) {
            currentVisibleIDs.clear();
            for (const id of visibility_fields['visible'])
                currentVisibleIDs.add(id);
        }

        // console.log(currentVisibleIDs);
        // localStorage.setItem('visibility', JSON.stringify(currentVisibleIDs));
        // localStorage.setItem('stack', JSON.stringify(stackVisibility));
    },
    _additional_visibility = (visibility_fields) => {
        if (visibility_fields.hasOwnProperty('visible')) {
            for (const id of visibility_fields['visible']) 
                currentVisibleIDs.add(id);
        }
        
        if (visibility_fields.hasOwnProperty('hidden')) {
            for (const id of visibility_fields['hidden'])
                currentVisibleIDs.delete(id);
        }
    },
    _filter_ids = (visibility, level, origin_level = null) => {
        const visibility_array = [];
        for (const id of visibility.values())
            visibility_array.push(id);

        return visibility_array.filter( element => {
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
    _clear_stack_view = () => {
        while (queueViews.length > 1) {
            let view = queueViews.shift();

            DOMElement.main.removeChild(view);
        }
    },
    _execute = (id, color, current_slide) => {
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

        if (visiblesIDs.length === 1) {
            const visiblesIDsLevel = macro[visiblesIDs[0]]['level'].length;
            if (visiblesIDsLevel === 1) {
                if (lastRootExecuted === visiblesIDs[0]) {
                    _execute(lastRootExecuted, color, current_slide);
                } else if (lastRootExecuted !== visiblesIDs[0]) {
                    const visibility_flags = macro[id]['visibility']['flags'];
                    color = macro[visiblesIDs[0]]['color'];

                    if (visibility_flags & _VISIBILITY_.RESTORE && !(visibility_flags & _VISIBILITY_.FRESH) && !(visibility_flags & _VISIBILITY_.EXTRA)) {
                        lastRootExecuted = visiblesIDs[0];
                        _execute(lastRootExecuted, color, current_slide);
                    } else {
                        _execute(visiblesIDs[0], color, current_slide);
                    }
                }
                return;
            }
        }

        if (origin_level.length === 1) 
            lastRootExecuted = id;

        slide = _create_view(visiblesIDs, color);            
        if (current_slide !== null) {
            current_slide.style.animationName = 'main_slide_hide';
            slide.style.animationName = 'main_slide_show';
        } else {
            slide.style.left = 0;
        }

        DOMElement.main.scrollTo({top: 0, left: 0, behavior: 'smooth'});

        // _confirm_keyboard();
    },
    _receive_events = (evnt) => {
        evnt.stopPropagation();

        const target = evnt.target,
              current_parent = target.parentElement,
              main_parent = current_parent.parentElement;

        current_parent.style.overflowY = 'hidden';
        if (target.classList.contains('input-type')) {
            const [id, color] = target['_props_'];

            while (target['_props_'].length)
                target['_props_'].pop();
            delete target['_props_'];

            // target.className = 'item-input-block';
            // target.removeChild(target.lastChild);

            const content = addElement(main_parent, 'div', 'item-input');
            current_parent.replaceChild(content, target);
            // current_parent.replaceChild(content, target);
            // content.appendChild(target);

            const listItems = current_parent.querySelectorAll('.item-list');
            for (const listItem of listItems)
                listItem.style.animationPlayState = 'running';
            
            const dividers = current_parent.querySelectorAll('.item-divider');
            for (const divider of dividers)
                divider.style.flexBasis = '0';

            let new_input = null;
            
            const shortcut = macro[id];
            const type = shortcut['type']['type'];
            switch(type) {
                case _TYPES_.TEXT:
                    break;

                case _TYPES_.NUMBER:
                    target.className = 'item-input-block';
                    target.removeChild(target.lastChild);
                    content.appendChild(target);
                    
                    new_input = new InputNumber(content, { color, ...shortcut['type'] });                    
                    keyboard.update(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;
                    
                case _TYPES_.SIGNATURE:
                    new_input = new InputSignature(content, { 'env': __run_environment, 'text': shortcut['text'], 'color': color, 'keyboard': keyboard.controls } );
                    keyboard.update(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;

                case _TYPES_.PHOTO:
                    break;
            }

            content['_props_'] = [id, color, new_input];
            structInputs = { last: 1, list: [content] };

            content.style.animationName = 'stretch_item_inputs';
            content.style.animationPlayState = 'running';

        } else if (target.classList.contains('item-list')) {
            const [id, color] = target['_props_'];
            _execute(id, color, main_parent);
        }
    },
    _create_list_item = (id, color, input = false) => {
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

        addElement(content, 'div', 'item-list-subheader', data['id']);

        if (input) 
            addElement(item, 'div', 'icon item-list-icon small', data['type']['type']);

        return item_fragment;
    },
    _create_view =  (ids, color = null) => {
        let navbar, shortcut, type,
            item, block, content,
            divider = true;

        const slide = addElement(DOMElement.main, 'div', 'container-main-slide');
        const all_inputs = ids.every( element => macro[element]['type']['type'] !== _TYPES_.LIST );

        keyboard.update();

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

        //if (all_inputs)
            structInputs = { last: 0, list: [] };

        const wrapper = addElement(slide, 'div', 'itens-wrapper');
        for (const id of ids) {
            shortcut = macro[id];

            type = shortcut['type']['type'];
            if (shortcut.hasOwnProperty('color'))
                color = shortcut['color'];

            if (all_inputs) {
                let new_input = null;

                switch(type) {
                    case _TYPES_.TEXT:
                        break;

                    case _TYPES_.NUMBER:
                        item = addElement(wrapper, 'div', 'item-input');
                        item.style.animationName = 'stretch_item_inputs';

                        block = addElement(item, 'div', 'item-input-block'); 
                        block.style.color = color;
                
                        if (!shortcut.hasOwnProperty('icon'))
                            block.style.gridTemplateColumns = 'auto';
                        else
                            addElement(block, 'div', 'font-awesome item-list-icon', shortcut['icon']);
                        
                        content = addElement(block, 'div', 'item-list-block');
                        addElement(content, 'div', 'item-list-header', shortcut['text']);
                        addElement(content, 'div', 'item-list-subheader', shortcut['id']);

                        new_input = new InputNumber(item, { color, ...shortcut['type'] });
                        break;
    
                    case _TYPES_.SIGNATURE:
                        item = addElement(wrapper, 'div', 'item-input');
                        item.style.animationName = 'stretch_item_inputs';

                        new_input = new InputSignature(item, { 'env': __run_environment, 'color': color, 'text': shortcut['text'], 'keyboard': keyboard.controls } );
                        break;

                    case _TYPES_.DATE:
                        break;

                    case _TYPES_.PHOTO:
                        break;

                    case _TYPES_.SCAN:
                        break;
                }

                item['_props_'] = [id, color, new_input];
                structInputs['list'].push(item);

                divider = false;
            } else {
                item = _create_list_item(id, color, type !== _TYPES_.LIST);
                wrapper.appendChild(item);
            }

            if (divider)
                addElement(wrapper, 'div', 'item-divider');

            divider = true;
        }

        queueViews.push(slide);
        return slide;
    },
    _order_ids = (visibility) => {
        return visibility
            .map(id => id.replace(/\d+/g, level => +level + 1000000))
            .sort()
            .map(id => id.replace(/\d+/g, level => +level - 1000000));
    },
    _order_visibility = (uuid_hash) => {
        let visibility_counter;
        for (const item in macro) {
            visibility_counter = 0;
            const visibilityFields = macro[item]['visibility']['fields'];
            for (const status in visibilityFields) {

                if (!visibilityFields[status].length) {
                    delete visibilityFields[status];
                    continue;
                }

                const visibilityIds = visibilityFields[status].map( element => uuid_hash.get(element));
                macro[item]['visibility']['fields'][status] = _order_ids(visibilityIds);

                visibility_counter += macro[item]['visibility']['fields'][status].length;
            }

            const visibilityFlags = macro[item]['visibility']['flags'];
            if (visibility_counter === 0) {
                if (visibilityFlags & _VISIBILITY_.FRESH)
                    macro[item]['visibility']['flags'] ^= _VISIBILITY_.FRESH;
                else if (visibilityFlags & _VISIBILITY_.EXTRA)
                    macro[item]['visibility']['flags'] ^= _VISIBILITY_.EXTRA;
            }
        }
    },
    _create_hash = (fields, macro, uuid_hash)  => {
        let id, levels, visibilitySize = 0;

        for (const field of fields) {
            uuid_hash.set(field['properties']['uuid'], field['properties']['id']);

            id = field['properties']['id'];

            levels = id.split('.');
            field['properties']['level'] = levels.map( element => {
                return parseInt(element, 10);
            });

            delete field['properties']['uuid'];
            // delete field['properties']['id'];
            delete field['properties']['expanded'];
            delete field['properties']['tail'];
            delete field['properties']['line'];
            delete field['properties']['order'];

            // _order_visibility(field['properties']['visibility']);

            macro[id] = field['properties'];

            if (field.hasOwnProperty('output')) {
                for (const status in field['output']['properties']['visibility']['fields']) 
                    visibilitySize += field['output']['properties']['visibility']['fields'][status].length;

                if (visibilitySize)
                    macro[id + '.x'] = field['output']['properties'];
                    // _order_visibility(field['output']['properties']['visibility']);

                _create_hash(field['output']['fields'], macro, uuid_hash);
            }
        }
        //return hashs;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = () => { return fragment; };
    this.start = function(serialize) {
        while (DOMElement.main.hasChildNodes())
            DOMElement.main.removeChild(DOMElement.main.firstChild);

        currentVisibleIDs.clear();

        const uuid_hash = new Map();
        macro = { };

        _create_hash(serialize['root']['fields'], macro, uuid_hash);
        _order_visibility(uuid_hash);

        const initial_visibility = serialize['root']['properties']['visibility']['fields']['visible'];
        for (let counter = 0; counter < initial_visibility.length; counter++)
            initial_visibility[counter] = uuid_hash.get(initial_visibility[counter]);
    
        const order_initial_visibility = _order_ids(initial_visibility);
        for (const id of order_initial_visibility)
            currentVisibleIDs.add(id);
        
        uuid_hash.clear();

        stackVisibility = [];
        queueViews = [];
        stackExecute = [];
        // structInputs = {};
        lastRootExecuted = null;

        const visiblesIDs = _filter_ids(currentVisibleIDs, 1);
        if (visiblesIDs.length === 1) {
            const visiblesIDsLevel = macro[visiblesIDs[0]]['level'].length;
            if (visiblesIDsLevel === 1) {
                const color_idx = macro[visiblesIDs[0]]['color'];
                const color = _COLORS_[color_idx];

                _execute(visiblesIDs[0], color, null);
            }
        }
        
        if (queueViews.length === 0)
            _create_view(visiblesIDs);

        queueViews[0].style.left = '0';

        if (__run_environment === _RUN_ENVIRONMENT_.WEB)
            DOMElement.popup.style.display = 'block';
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        fragment = document.createDocumentFragment();

        if (__run_environment === _RUN_ENVIRONMENT_.WEB) {
            DOMElement.popup = addElement(fragment, 'div', 'simulate-app');
            
            const simulateContent = addElement(DOMElement.popup, 'div', 'simulate-content');
            addElement(simulateContent, 'div', 'header');
            DOMElement.container = addElement(simulateContent, 'div', 'container');
            addElement(simulateContent, 'div', 'footer');

        } else if (__run_environment === _RUN_ENVIRONMENT_.MOBILE) {
            DOMElement.container = addElement(fragment, 'div', 'container');
        }

        DOMElement.main = addElement(DOMElement.container, 'div', 'main');
        keyboard = new Keyboard(DOMElement.container);

        DOMElement.main.addEventListener('click', _receive_events, { capture: false });
    })();
}