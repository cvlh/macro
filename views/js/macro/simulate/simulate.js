'use strict';

import { _COLORS_, _TYPES_, _VISIBILITY_, _KEYBOARD_FLAGS_, _RUN_ENVIRONMENT_, _ICON_CHAR_} from '../../utils/constants.js';
import { addElement } from '../../utils/functions.js';

import InputNumber from './components/input-number.js'
import InputPhoto from './components/input-photo.js';
import InputSignature from './components/input-signature.js';
import InputState from './components/input-state.js';
import Keyboard from './keyboard.js';

////////////////////////////////////////////////////////////////////////////////
export default function Simulate(__run_environment = _RUN_ENVIRONMENT_.WEB) {

    if (!new.target) 
        throw new Error('Simulate() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment,

        macro, keyboard, inputListState,
        stackExecute, stackVisibility,
        queueViews,
        currentVisibleIDs = new Set(), 
        currentSelectedItem,
        lastRootExecuted;

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        DOMElement = {
            popup:     null,
            container: null,
            main:      null
        },

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
            inputListState.clear();

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

        _dispatch();
    },
    _dispatch = () => { 
        if (currentSelectedItem !== null) {
            const [id, color] = currentSelectedItem['_props_'],
                current_parent = currentSelectedItem.parentElement,
                main_parent = current_parent.parentElement;

            current_parent.style.overflowY = 'hidden';
            currentSelectedItem = null;
            
            _execute(id, color, main_parent); 
            return;
        }

        const current_input = inputListState.getElement();
        const previous_input = inputListState.getPrevElement();

        if (current_input && inputListState.hasMore()) {
            current_input.style.animationPlayState = 'running';

            if (previous_input)
                previous_input.style.animationName = 'shrink_item_inputs';

            const props = macro[current_input['_props_'][0]];
            switch (props['type']['type']) {
                case _TYPES_.NUMBER:
                    keyboard.update(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;
                
                case _TYPES_.SIGNATURE:
                    // keyboard.update(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;

                case _TYPES_.PHOTO:
                    // keyboard.update(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;

                // default:
                    // keyboard.update(_KEYBOARD_FLAGS_.NONE);
            }
            
            inputListState.incCurrent();
        } else {
            if (previous_input) {
                const [id, color] = previous_input['_props_'];
                _execute(id, color, queueViews[queueViews.length - 1]); 
            }
        }
    },
    _rewind = () => {
        const current_input = inputListState.getPrevElement(),
              current_parent = current_input.parentElement;

        const [id, color] = current_input['_props_'];
        const shortcut = macro[id];

        current_parent.style.removeProperty('overflow-y');
        
        const type = shortcut['type']['type'];
        switch(type) {
            case _TYPES_.TEXT:
                break;

            case _TYPES_.NUMBER:
                const input_field = current_input.querySelector('.item-input-box');
                current_input.removeChild(input_field);
                break;
                
            case _TYPES_.SIGNATURE:
            case _TYPES_.PHOTO:
                const input_text = current_input.querySelector('.item-input-type');
                input_text.style.removeProperty('visibility');

                const input_drawing = current_input.querySelector('.item-drawing');
                current_input.removeChild(input_drawing);
                break;
        }

        const listItems = current_parent.querySelectorAll('.item-list');
        for (const listItem of listItems)
            listItem.style.animationName = 'stretch_item_list';

        const dividers = current_parent.querySelectorAll('.item-divider');
        for (const divider of dividers)
            divider.style.flexBasis = '1px';

        current_input.style.animationName = 'rewind_item_inputs';
        current_input.addEventListener('animationend', function() {
            this.className = 'item-list';
            this.style.removeProperty('animation-name');
            this.style.removeProperty('animation-play-state');
        }, { once: true, capture: false });

        inputListState.clear();
        keyboard.update(_KEYBOARD_FLAGS_.NONE);

        current_input['_props_'] = [id, color];
    },
    _clear = () => {

    },
    _receive_events = (evnt) => {
        evnt.stopPropagation();

        const target = evnt.target,
              current_parent = target.parentElement;

        if (!target.classList.contains('item-list'))
            return;

        const attribute = target.getAttribute('data-input') === 'true' ? true : false;
        if (attribute) {
            current_parent.style.overflowY = 'hidden';

            const [id, color] = target['_props_'];
            const shortcut = macro[id];

            const params = {
                'env': __run_environment, 
                'color': color, 
                'text': shortcut['text'],
                ...shortcut['type'],
                'keyboard': keyboard.controls
            };
            target['_input_'] = _create_input(target, params);

            target.className = 'item-input';

            const listItems = current_parent.querySelectorAll('.item-list, .item-input');
            for (const listItem of listItems) {
                listItem.style.removeProperty('animation-name');
                listItem.style.animationPlayState = 'running';
            }

            const dividers = current_parent.querySelectorAll('.item-divider');
            for (const divider of dividers)
                divider.style.flexBasis = '0';

            const type = shortcut['type']['type'];
            switch(type) {
                case _TYPES_.TEXT:
                    break;

                case _TYPES_.NUMBER:
                    keyboard.update(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;
                    
                case _TYPES_.SIGNATURE:
                case _TYPES_.PHOTO:
                    keyboard.update(_KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    target.firstChild.style.visibility = 'hidden';
                    break;
            }

            inputListState.push(target);
            inputListState.setCurrent(1);

        } else {
            let is_current_select = false;

            if (target.classList.contains('selected-item'))
                is_current_select = true;

            if (currentSelectedItem !== null) {

                keyboard.update(_KEYBOARD_FLAGS_.NONE);
                keyboard.controls(false, _KEYBOARD_FLAGS_.BTN_OK);

                currentSelectedItem.classList.remove('selected-item');
                currentSelectedItem = null;

                if (is_current_select)
                    return;
            } 

            target.classList.add('selected-item');
            currentSelectedItem = target;

            keyboard.update(_KEYBOARD_FLAGS_.BTN_OK);
            keyboard.controls(true, _KEYBOARD_FLAGS_.BTN_OK);
        }
    },
    _create_list_item = (id, color, input = false) => {
        const item_fragment = document.createDocumentFragment();
        const data = macro[id];

        const wrapper = addElement(item_fragment, 'div', 'item-list');
        wrapper.style.color = color;
        wrapper.setAttribute('data-input', input);
        wrapper['_props_'] = [id, color]; 

        let item;
        if (input) {
            item = addElement(wrapper, 'div', 'item-input-type'); 
        } else {
            item = wrapper;
            item.style.gridTemplateColumns = '34px auto';
        }

        addElement(item, 'div', 'font-awesome item-list-icon', data['icon']);

        const content = addElement(item, 'div', 'item-list-block');
        addElement(content, 'div', 'item-list-header', data['text']);
        addElement(content, 'div', 'item-list-subheader', data['id']);

        if (input) 
            addElement(item, 'div', 'icon item-list-icon small', data['type']['type']);

        return item_fragment;
    },
    _create_input = (append, params) => {
        switch(params['type']) {
            case _TYPES_.TEXT:
                break;

            case _TYPES_.NUMBER:
                // keyboard.update(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                return new InputNumber(append, params);

            case _TYPES_.SIGNATURE:
                // keyboard.update(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                return new InputSignature(append, params);

            case _TYPES_.DATE:
                return null;

            case _TYPES_.PHOTO:
                // keyboard.update(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                return new InputPhoto(append, params);

            case _TYPES_.SCAN:
                return null;

            default:
                return null;
        }
    },
    _create_view =  (ids, color = null) => {
        let navbar, shortcut, type,
            item, block, content,
            divider = true;

        const slide = addElement(DOMElement.main, 'div', 'container-main-slide');
        const all_inputs = ids.every( element => macro[element]['type']['type'] !== _TYPES_.LIST );

        keyboard.update(_KEYBOARD_FLAGS_.NONE);
        inputListState.clear();

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

        const wrapper = addElement(slide, 'div', 'itens-wrapper');
        for (const id of ids) {
            shortcut = macro[id];

            type = shortcut['type']['type'];
            if (shortcut.hasOwnProperty('color'))
                color = shortcut['color'];

            if (all_inputs) {
                switch(type) {
                    case _TYPES_.TEXT:
                        break;

                    case _TYPES_.NUMBER:
                        item = addElement(wrapper, 'div', 'item-input');
                        item.style.animationName = 'stretch_item_inputs';

                        block = addElement(item, 'div', 'item-input-type'); 
                        block.style.color = color;
                
                        // if (!shortcut.hasOwnProperty('icon'))
                        //     block.style.gridTemplateColumns = 'auto';
                        // else
                            addElement(block, 'div', 'font-awesome item-list-icon', shortcut['icon']);
                        
                        content = addElement(block, 'div', 'item-list-block');
                        addElement(content, 'div', 'item-list-header', shortcut['text']);
                        addElement(content, 'div', 'item-list-subheader', shortcut['id']);

                        addElement(block, 'div', 'icon item-list-icon small', shortcut['type']['type']);
                        break;
    
                    case _TYPES_.SIGNATURE:
                    case _TYPES_.PHOTO:
                        item = addElement(wrapper, 'div', 'item-input');
                        item.style.animationName = 'stretch_item_inputs';
                        break;

                    case _TYPES_.DATE:
                        break;

                    case _TYPES_.SCAN:
                        break;
                }

                const params = {
                    'env': __run_environment, 
                    'color': color, 
                    'text': shortcut['text'],
                    ...shortcut['type'],
                    'keyboard': keyboard.controls
                };

                item['_props_'] = [id, color];
                item['_input_'] = _create_input(item, params);

                inputListState.push(item);

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
        currentSelectedItem = null;
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

        inputListState = new InputState();
        keyboard = new Keyboard(DOMElement.container, inputListState, _dispatch, _rewind);

        DOMElement.main.addEventListener('click', _receive_events, { capture: false });
    })();
}