'use strict';

import { _COLORS_, _TYPES_ } from '../../utils/constants.js';
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
        executedStack,
        currentVisibleIds, stackVisibility,
        lastRootExecuted,

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
    _wildcard = function(id) {
        let wildcard = '';
        const size = macro[id]['level'].length - 1;

        for (let counter = 0; counter < size; counter++) 
            wildcard += macro[id]['level'][counter] + '.';
        wildcard += 'x';

        return wildcard;
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
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              parent = target.parentElement;

        if (target.classList.contains('item-list')) {
            const [id, color] = target['_props_'];
            let slide, visibilitySize,
                applyVisibility = false,
                level = macro[id]['level'].length + 1;

            executedStack.push(id);

            // if (macro[id]['exec'].hasOwnProperty('now')) {
            //     currentVisibleIds = macro[id]['exec']['now']['fields'];
            //     applyVisibility = true;
            // }
            if (macro[id].hasOwnProperty('visibility')) {
                currentVisibleIds = macro[id]['visibility']['fields']['visible'];
                applyVisibility = true;
            }

            visibilitySize = currentVisibleIds.filter( element => {
                return macro[element]['level'].length === level;
            }).length;

            if (!visibilitySize) {
                if (!applyVisibility) {
                    currentVisibleIds = currentVisibleIds.filter( element => {
                        return element !== id;
                    });
                }

                let txt = '';
                for (const id of executedStack) txt += id + '  >  ';
                console.log(txt);

                const wildcard = _wildcard(id);
                if (macro.hasOwnProperty(wildcard))
                    currentVisibleIds = macro[wildcard]['visibility']['fields'];

                level--;
                visibilitySize = currentVisibleIds.filter( element => {
                    return macro[element]['level'].length === level;
                }).length;
            }

            if (!visibilitySize) {
                let lastExecId = executedStack.pop();
                while (lastExecId !== undefined) {

                    const wildcard = _wildcard(id);
                    if (macro.hasOwnProperty(wildcard))
                        currentVisibleIds = macro[wildcard]['visibility']['fields'];

                    level = macro[lastExecId]['level'].length;

                    visibilitySize = currentVisibleIds.filter( element => {
                        return macro[element]['level'].length === level;
                    }).length;

                    if (visibilitySize)
                        break;
                    
                    lastExecId = executedStack.pop();
                }
            }

            slide = _create_view(level, color);

            setTimeout(() => {
                parent.style.left = '-100%';
                slide.style.left = 0;

                if (__showKeyboard)
                    _show_keyboard();
            }, 50);
        }
    },
    _create_view = function (level = null, color = null) {
        let navbar, item, label, icon, type, div, shortcut, content;

        _hide_keyboard();

        const slide = addElement(simulateMain, 'div', 'container-main-slide');
        if (level === null) {
            slide.style.left = '0';
            level = 1;
        }

        //for (var counter = 0; counter < executedStack.length; counter++) {
            //id = executedStack[counter];
        for (const id of executedStack) {
            shortcut = macro[id];

            navbar = addElement(slide, 'div', 'navbar');
            navbar.style.color = color;

            addElement(navbar, 'div', 'font-awesome navbar-icon', shortcut['icon']);
            addElement(navbar, 'div', 'navbar-text', shortcut['text']);
        }

        if (executedStack.length) {
            content = addElement(slide, 'div', 'item-space');
            content.style.backgroundColor = color;
        }

        for (const visibleId of currentVisibleIds) {
            shortcut = macro[visibleId];

            if (shortcut['level'].length != level)
                continue;

            // if (visibleId === parentId)
            //     continue;

            //if (!visibleId.startsWith(parent_id))
            //    continue;            

            if (shortcut.hasOwnProperty('color'))
                color = shortcut['color'];
            
            label = shortcut['text'];
            icon  = shortcut['icon'];
            type  = shortcut['type']['type'];

            item = addElement(slide, 'div'); 
            item['_props_'] = [ visibleId, color ]; 

            switch (type) {
                case _TYPES_.LIST:
                    item.classList.add('item-list');

                    div = addElement(item, 'div', 'font-awesome item-list-icon', icon);
                    div.style.color = color;

                    content = addElement(item, 'div', 'item-list-block');
                    div = addElement(content, 'div', 'item-list-header', label);
                    div.style.color = color;
        
                    if (Math.floor(Math.random() * 10) < 6)
                        div = addElement(content, 'div', 'item-list-subheader', label +' '+ label);

                    addElement(slide, 'div', 'item-divider');
                    break;

                case _TYPES_.NUMBER:
                case _TYPES_.TEXT:
                    //_show_keyboard();
                    __showKeyboard = true;

                    item.classList.add('item-input');

                    content = addElement(item, 'div', 'item-input-block');
                    content.style.color = color;

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
        }

        return slide;
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

            // if (!field['properties']['visibility']['fields'].length) 
            //     delete field['properties']['visibility'];

            hashs[id] = field['properties'];

            if (field.hasOwnProperty('output')) {
                for (const status in field['output']['properties']['visibility']['fields']) 
                    visibilitySize += field['output']['properties']['visibility']['fields'][status].length;

                if (visibilitySize)
                    hashs[id + '.x'] = field['output']['properties'];

                _create_hash(field['output']['fields'], hashs);
            }
        }
        return hashs;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.start = function() {
        const serialize = parent.serialize();

        macro = _create_hash(serialize['root']['fields']);
        console.log(macro);

        currentVisibleIds = serialize['root']['properties']['visibility']['fields']['visible'];
        stackVisibility = [];
        executedStack = [];
        lastRootExecuted = null;

        while (simulateMain.hasChildNodes())
            simulateMain.removeChild(simulateMain.firstChild);

        _create_view();

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