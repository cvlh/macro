'use strict';

import { addElement } from '../../utils/functions.js';
import Macro from '../macro.js';

////////////////////////////////////////////////////////////////////////////////
export default function Simulate(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment, 
        simulatePopup, simulateMain,
        macro,

    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              parent = target.parentElement;

        var slide, item, label, icon, type, div, color, shortcut, visibility, path, counter;
        
        if (target.classList.contains('item')) {
            path = target['_props_']['path'];
            color = target['_props_']['color'];

            if (path.hasOwnProperty('output')) {
                slide = addElement(simulateMain, 'div', 'simulate-content-slide');
                for (counter=0; counter<path['output']['fields'].length; counter++) {
                    shortcut = path['output']['fields'][counter]['properties'];

                    label = shortcut['text'];
                    icon  = shortcut['icon'];
                    type  = shortcut['type']['type'];

                    item = addElement(slide, 'div', 'item');
                    item['_props_'] = {'path': path['output']['fields'][counter], 'color': color};

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
                setTimeout(() => {
                    parent.style.left = '-100%';
                    slide.style.left = 0;
                }, 50);
            } else {
                context.start();
            }
        }
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.start = function() {
        var slide, item, label, icon, type, div, color, shortcut, visibility, counter;

        macro = parent.serialize();

        visibility = macro['visibility'];

        slide = addElement(simulateMain, 'div', 'simulate-content-slide');
        slide.style.left = '0';

        for (counter=0; counter<macro['root']['fields'].length; counter++) {
            shortcut = macro['root']['fields'][counter]['properties'];

            if (visibility.indexOf(shortcut['id']) === -1) continue;

            color = shortcut['color'];
            label = shortcut['text'];
            icon  = shortcut['icon'];
            type  = shortcut['type']['type'];

            item = addElement(slide, 'div', 'item');
            item['_props_'] = {'path': macro['root']['fields'][counter], 'color': color};        
            
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