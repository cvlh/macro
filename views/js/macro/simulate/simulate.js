'use strict';

import { addElement } from '../../utils/functions.js';

////////////////////////////////////////////////////////////////////////////////
export default function Simulate(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment, 
        simulatePopup, simulateMain,
        macro,
        executedStack,
        currentVisibleIds, stackVisibility,
        lastRootExecuted,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _get_parent_id = function(item) {
        const size = item['level'].length - 1;
        let parend_id = '';

        for (let counter = 0; counter < size; counter) {
            parend_id += item['level'][counter];
            if (counter < size)
                parend_id += '.';
        }

        return parend_id;
    },
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              parent = target.parentElement;

        if (target.classList.contains('item')) {
            const [id, color] = target['_props_'];
            let slide, visibilitySize = 0,
                level = macro[id]['level'].length + 1;

            executedStack.push(id);

            if (macro[id]['exec'].hasOwnProperty('now'))
                currentVisibleIds = macro[id]['exec']['now']['fields'];
            
            visibilitySize = currentVisibleIds.filter( element => {
                return macro[element]['level'].length === level;
            }).length;

            if (!visibilitySize) {
                level--;
                visibilitySize = currentVisibleIds.filter( element => {
                    return macro[element]['level'].length === level;
                }).length;
            }
            
            if (!visibilitySize) {
                let lastExecId = executedStack.pop();
                while (lastExecId !== undefined) {
                    if (macro[lastExecId]['exec'].hasOwnProperty('after')) {
                        currentVisibleIds = macro[lastExecId]['exec']['after']['fields'];
                    
                        visibilitySize = currentVisibleIds.filter( element => {
                            return macro[element]['level'].length === level;
                        }).length;

                        level = macro[lastExecId]['level'].length;

                        if (visibilitySize)
                            break;
                    }
                    lastExecId = executedStack.pop();
                }
            }

            slide = _create_view(level, color);

            setTimeout(() => {
                parent.style.left = '-100%';
                slide.style.left = 0;
            }, 50);
        }
    },
    _create_view = function (level = null, color = null) {
        let item, label, icon, type, div, shortcut, counter;
        
        const slide = addElement(simulateMain, 'div', 'simulate-content-slide');
        if (level === null) {
            slide.style.left = '0';
            level = 1;
        }
        // } else {
        //     // const visibilitySize = currentVisibleIds.filter( element => {
        //     //     return element.startsWith(parentId);
        //     // });

        //     // if (visibilitySize.length === 0)
        //     //     parentId = null;
        // }


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

            item = addElement(slide, 'div', 'item'); 
            item['_props_'] = [ visibleId, color ]; 

            div = addElement(item, 'div', 'fontAwesome item-icon', icon);
            div.style.color = color;

            div = addElement(item, 'div', 'item-header');
            div.textContent = label;
            div.style.color = color;

            div = addElement(item, 'div', 'item-subheader');
            div.textContent = label +' '+ label;

            div = addElement(item, 'div', 'icon item-arrow', type);
            div.style.color = color;

        }
        // if (!counter) {
        //     executedStack.pop();
        //     level--;
        // }

        // if (!counter && level) {
        //     level--;

        //     const lastExecId = executedStack.pop();
        //     if (macro[lastExecId]['exec'].hasOwnProperty('after'))
        //         currentVisibleIds = macro[lastExecId]['exec']['after']['fields'];

        //     _create_view(level, color);
        // }

        // if (filtered.length === 1) {
        //     _create_view(filtered[0]);
        // }

        return slide;
    },
    _create_hash = function (fields, hashs = { }) {
        let id, levels;

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

            field['properties']['exec'] = {};
            if (field['properties']['visibility']['fields'].length) 
                field['properties']['exec']['now'] = field['properties']['visibility'];
            
            delete field['properties']['visibility'];

            hashs[id] = field['properties'];

            if (field.hasOwnProperty('output')) {
                if (field['output']['properties']['visibility']['fields'].length)
                    hashs[id]['exec']['after'] = field['output']['properties']['visibility'];

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

        currentVisibleIds = serialize['root']['properties']['visibility']['fields'];
        stackVisibility = [];
        executedStack = [];
        lastRootExecuted = null;

        while (simulateMain.hasChildNodes())
            simulateMain.removeChild(simulateMain.firstChild);

        // executedStack.push('');
        _create_view();

        simulatePopup.style.display = 'block';
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        fragment = document.createDocumentFragment();

        simulatePopup = addElement(fragment, 'div', 'simulate-app');
        const simulateContent = addElement(simulatePopup, 'div', 'simulate-content');

        addElement(simulateContent, 'div', 'header');
        simulateMain = addElement(simulateContent, 'div', 'main');
        addElement(simulateContent, 'div', 'footer');

        simulateMain.addEventListener('click', _receive_events, { capture: false });
    })();
}