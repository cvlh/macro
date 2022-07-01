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
        currentVisibilityIds, stackVisibility,
        lastRootExecuted,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              parent = target.parentElement;

        if (target.classList.contains('item')) {
            const [id, color] = target['_props_'];
            currentVisibilityIds = macro[id]['visibility']['fields'];
            
            const slide = _create_view(id, color);

            setTimeout(() => {
                parent.style.left = '-100%';
                slide.style.left = 0;
            }, 50);
        }
    },
    _create_view = function (parentId = null, color = null) {
        let item, label, icon, type, div, shortcut;
        
        const slide = addElement(simulateMain, 'div', 'simulate-content-slide');
        if (parentId === null) {
            slide.style.left = '0';
        } else {
            const visibilitySize = currentVisibilityIds.filter( element => {
                return element.startsWith(parentId);
            });

            if (visibilitySize.length === 0)
                parentId = null;
        }

        for (const visibleId of currentVisibilityIds) {
            if (visibleId === parentId)
                continue;

            if (parentId !== null && !visibleId.startsWith(parentId))
                continue;

            shortcut = macro[visibleId];

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

        // if (filtered.length === 1) {
        //     _create_view(filtered[0]);
        // }

        return slide;
    },
    _create_hash = function (fields, hashs = { }) {
        let id;

        for (const field of fields) {
            id = field['properties']['id'];

            delete field['properties']['id'];
            delete field['properties']['expanded'];
            delete field['properties']['tail'];
            delete field['properties']['line'];
            delete field['properties']['order'];

            hashs[id] = field['properties'];
             
            if (field.hasOwnProperty('output')) 
                _create_hash(field['output']['fields'], hashs);
        }
        return hashs;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.start = function() {
        const serialize = parent.serialize();

        macro = _create_hash(serialize['root']['fields']);
        console.log(macro);

        currentVisibilityIds = serialize['root']['properties']['visibility']['fields'];
        stackVisibility = [];
        lastRootExecuted = null;

        while (simulateMain.hasChildNodes()) {
            simulateMain.removeChild(simulateMain.firstChild);
        }

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