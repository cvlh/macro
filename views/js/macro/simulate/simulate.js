'use strict';

import { _COLORS_, _KEY_CODE_, _TYPES_, _VISIBILITY_, _KEYBOARD_FLAGS_, _RUN_ENVIRONMENT_, _ICON_CHAR_} from '../../utils/constants.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { addElement } from '../../utils/functions.js';

import InputNumber from './components/input-number.js'
import InputSignature from './components/input-signature.js';

////////////////////////////////////////////////////////////////////////////////
export default function Simulate(__run_environment = _RUN_ENVIRONMENT_.WEB) {

    if (!new.target) 
        throw new Error('Simulate() must be called with new');

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const
        DOMElement = {
            popup: null,
                container:    null,
                    main:     null,
                    keyboard: null,
                        btn_back:    null,
                        btn_clear:   null,
                        btn_confirm: null
        };

    // VARIABLES ///////////////////////////////////////////////////////////////
    let // runEnvironment = __run_env,
        fragment,

        macro,
        stackExecute, stackVisibility,
        queueViews,
        structInputs, // { last: 0, list: [] }
        currentVisibleIDs = new Set(), 
        lastRootExecuted,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _create_keyboard = () => {
        const controls_buttons = addElement(DOMElement.keyboard, 'div', 'controls-buttons');

        DOMElement.btn_back = addElement(controls_buttons, 'button', 'back', _I18N_.keyboard_back);
        DOMElement.btn_back.addEventListener('click', _back_keyboard, { capture: false });

        DOMElement.btn_clear = addElement(controls_buttons, 'button', 'clear', _I18N_.keyboard_clear);
        DOMElement.btn_clear.addEventListener('click', _clear_keyboard, { capture: false });

        DOMElement.btn_confirm = addElement(controls_buttons, 'button', 'confirm', _I18N_.keyboard_confirm);
        DOMElement.btn_confirm.addEventListener('click', _confirm_keyboard, { capture: false });

        const keyboard = addElement(DOMElement.keyboard, 'div', 'keyboard');
        [_KEY_CODE_.KEY1, _KEY_CODE_.KEY2, _KEY_CODE_.KEY3, _KEY_CODE_.KEY4, 
         _KEY_CODE_.KEY5, _KEY_CODE_.KEY6, _KEY_CODE_.KEY7, _KEY_CODE_.KEY8, 
         _KEY_CODE_.KEY9, _KEY_CODE_.COMMA, _KEY_CODE_.KEY0, _KEY_CODE_.BACKSPACE].forEach( ({code, key} = element) => {
            const button = addElement(keyboard, 'button', 'font-awesome', key);
            button.setAttribute('_key', code);
        });

        keyboard.addEventListener('click', evnt => {
            const last = structInputs['last'],
                  list = structInputs['list'],
                //   target = evnt.target,
                  code = evnt.target.getAttribute('_key'), // target['_code_'],
                  input = list[last - 1]['_props_'][2];
                  
            if (input.add(code)) {
                DOMElement.btn_confirm.removeAttribute('disabled');
            } else {
                DOMElement.btn_confirm.setAttribute('disabled', '');
            }
            
        }, { capture: false });

    },
    _back_keyboard = () => {

    },
    _clear_keyboard = () => {
        const last = structInputs['last'] - 1,
              list = structInputs['list'];

        switch (macro[list[last]['_props_'][0]].type.type) {
            case _TYPES_.NUMBER:
            case _TYPES_.SIGNATURE:
                list[last]['_props_'][2].clear();
                break;
        }
    },
    _confirm_keyboard = () => {
        const last = structInputs['last'],
              list = structInputs['list'];

        if (list.length) {
            if (last < list.length) {
                list[last].style.animationPlayState = 'running';

                if (last > 0)
                    list[last - 1].style.animationName = 'shrink_item_inputs';
                
                const shortcut = macro[list[last]['_props_'][0]];
                switch (shortcut['type']['type']) {
                    case _TYPES_.NUMBER:
                        this.keyboard(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                        break;
                    
                    case _TYPES_.SIGNATURE:
                        this.keyboard(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                        break;

                    case _TYPES_.PHOTO:
                        this.keyboard();

                        list[last].addEventListener('animationend', function() {
                            
                            const wait_icon = addElement(this, 'div', 'loading-resources-icon icon', _ICON_CHAR_.CAMERA);
                            wait_icon.style.color = list[last]['_props_'][1];

                            const wait_message = addElement(this, 'div', 'loading-resources-text', _I18N_.resource_loading);
                            wait_message.style.color = list[last]['_props_'][1];

                            const video = addElement(this, 'video', 'item-drawing');
                            video.width = this.offsetWidth;
                            video.height = this.offsetHeight;
                            video.setAttribute('muted', '');
                            video.setAttribute('autoplay', '');
                            video.setAttribute('playsinline', '');

                            const canvas = addElement(this, 'canvas', 'item-drawing');
                            canvas.width = this.offsetWidth;
                            canvas.height = this.offsetHeight;
                            canvas.style.visibility = 'hidden';

                            const take_picture_btn = addElement(this, 'div', 'take-picture icon', _ICON_CHAR_.CAMERA);

                            if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
                                navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', aspectRatio: { min: 0.6, max: 1 } } }).then(function (mediaStream) {
                                    const video_track = mediaStream.getVideoTracks()[0];
                                    video.srcObject = mediaStream;

                                    video.onloadedmetadata = function() {
                                        wait_icon.style.display = 'none';
                                        wait_message.style.display = 'none';

                                        const settings = video_track.getSettings();
                                        if (settings.hasOwnProperty('width') && settings.hasOwnProperty('height')) {
                                            const aspectratio = settings['width'] / this.getAttribute('width');

                                            canvas.setAttribute('width', settings['width'] / aspectratio);
                                            canvas.setAttribute('height', settings['height'] / aspectratio);
                                        }

                                        take_picture_btn.style.visibility = 'visible';
                                        take_picture_btn.addEventListener('click', function() {
                                            this.style.visibility = 'hidden';

                                            canvas.style.visibility = 'visible';
                                            const ctx = canvas.getContext('2d');
                                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                            const image_data_url = canvas.toDataURL('image/jpeg');
                                            // console.log(image_data_url);

                                            video.style.visibility = 'hidden';
                                            video_track.stop();

                                            mediaStream.removeTrack(video_track);

                                            // _keyboard(_KEYBOARD_FLAGS_.CONTROL);
                                        }, { once: true, capture: false });
                                    };
                                }).catch(function (err) {
                                    wait_icon.textContent = _ICON_CHAR_.ALERT;
                                    wait_icon.style.color = 'var(--red)';

                                    wait_message.textContent = `${err.name}: ${err.message}`;
                                    wait_message.style.color = 'var(--red)';
                                });
                            } else {
                                wait_icon.textContent = _ICON_CHAR_.ALERT;
                                wait_icon.style.color = 'var(--red)';
                            }

                        }, { once: true, capture: false });
                        break;

                    default:
                        this.keyboard(_KEYBOARD_FLAGS_.NONE);
                }
                
                structInputs['last'] += 1;
            } else {
                const [id, color] = list[last - 1]['_props_'];
                _execute(id, color, queueViews[queueViews.length - 1]);
            }
        }
    },
    
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

        _confirm_keyboard();
    },
    _receive_events = (evnt) => {
        evnt.stopPropagation();

        const target = evnt.target,
              current_parent = target.parentElement,
              main_parent = current_parent.parentElement;

        current_parent.style.overflowY = 'hidden';

        const [id, color] = target['_props_'];

        if (target.classList.contains('input-type')) {
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
                    this.keyboard(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;
                    
                case _TYPES_.SIGNATURE:
                    new_input = new InputSignature(content, { 'env': __run_environment, 'text': shortcut['text'], 'color': color, 'callback': this.controls } );
                    this.keyboard(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                    break;

                case _TYPES_.PHOTO:
                    break;
            }

            content['_props_'] = [id, color, new_input];
            structInputs = { last: 1, list: [content] };

            content.style.animationName = 'stretch_item_inputs';
            content.style.animationPlayState = 'running';

        } else if (target.classList.contains('item-list')) {
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

        this.keyboard();

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

                        const input = new InputNumber(item, { color, ...shortcut['type'] });

                        item['_props_'] = [id, color, input];
                        structInputs['list'].push(item);
                        break;
    
                    case _TYPES_.DATE:
                        break;
    
                    case _TYPES_.SIGNATURE:
                        item = addElement(wrapper, 'div', 'item-input');
                        item.style.animationName = 'stretch_item_inputs';

                        const signature = new InputSignature(item, { 'env': __run_environment, 'color': color, 'text': shortcut['text'] } );

                        item['_props_'] = [id, color, signature];
                        structInputs['list'].push(item);
                        break;

                    case _TYPES_.PHOTO:
                        break;

                    case _TYPES_.SCAN:
                        break;
                }

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
    _order_ids = visibilityarray => {
        return visibilityarray
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
    this.keyboard = (keyboard_flags = _KEYBOARD_FLAGS_.NONE) => {
        if (keyboard_flags === _KEYBOARD_FLAGS_.NONE) {
            DOMElement.main.classList.remove('with-keyboard');
            DOMElement.keyboard.style.removeProperty('height'); 

            return;
        }

        let height = 0;
        DOMElement.main.classList.add('with-keyboard');

        DOMElement.btn_back.style.display = 'none';
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_BACK) {
            DOMElement.btn_back.style.display = 'block';
            
            DOMElement.btn_back.setAttribute('disabled', '');
            if (structInputs['last'] === 0 && structInputs['list'].length > 1)
                DOMElement.btn_back.removeAttribute('disabled');                
        }

        DOMElement.btn_clear.style.display = 'none';
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_CLEAR)
            DOMElement.btn_clear.style.display = 'block';

        DOMElement.btn_confirm.style.display = 'none';
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_OK)
            DOMElement.btn_confirm.style.display = 'block';
        
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_BACK |
            keyboard_flags & _KEYBOARD_FLAGS_.BTN_CLEAR |
            keyboard_flags & _KEYBOARD_FLAGS_.BTN_OK)
            height += 30; 

        if (keyboard_flags & _KEYBOARD_FLAGS_.TYPE_NUMPAD | 
            keyboard_flags & _KEYBOARD_FLAGS_.TYPE_QWERTY)
            height += 108; 
        
        DOMElement.keyboard.style.height = height + 'px';
    };
    this.controls = (enable = true, keyboard_flags = _KEYBOARD_FLAGS_.NONE) => {
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_OK) {
            if (enable)
                DOMElement.btn_confirm.removeAttribute('disabled');
            else
                DOMElement.btn_confirm.setAttribute('disabled', '');
        } 

        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_BACK) {
            if (enable)
                DOMElement.btn_back.removeAttribute('disabled');
            else
                DOMElement.btn_back.setAttribute('disabled', '');
        }

        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_CLEAR) {
            if (enable)
                DOMElement.btn_clear.removeAttribute('disabled');
            else
                DOMElement.btn_clear.setAttribute('disabled', '');
        }
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
        DOMElement.keyboard = addElement(DOMElement.container, 'div', 'controls');

        _create_keyboard();

        DOMElement.main.addEventListener('click', _receive_events, { capture: false });
    })();
}