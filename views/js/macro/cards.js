'use strict';

import { _DRAG_, _MOV_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Field from './fields.js';

export default function Card(ctx, root = false) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this, rootCard = root;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment, card, header, title, items, input,
        fieldsArray = [],
        position = { top: 0, left: 0, offsetLeft: 0, offsetTop: 0 },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _remove = function () {

    };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.getDragType = function() { return _DRAG_.HEADER };
    this.getFragment = function() { return fragment; };
    this.hasConnection = function() { 
        if (rootCard) return false;
        
        if (input['_CONNECTION_'] !== null) {
            return true;
        }
        return false;
    };
    this.makeConnection = function(output) {
        input.classList.add('linked');
        input['_CONNECTION_'] = output;
    };
    this.clearConnection =  function() { 
        //input.classList.remove('linked');
        input['_CONNECTION_'] = null; 

        context.setHeader('');
        context.setColor(null);
    };
    this.redraw = function(transform) {
        let counter;

        for (counter=0; counter<fieldsArray.length; counter++) {
            fieldsArray[counter].redraw(transform);
        }

        if (context.hasConnection()) {
            const viewport = input.getBoundingClientRect();
            input['_CONNECTION_'].setPosition(viewport.left, viewport.top, transform, _MOV_.END);
        }
    };
    this.setPosition = function(left, top, transform, mov) {
        switch (mov) {
            case _MOV_.START:
                const rect = card.getBoundingClientRect();

                card.style.zIndex = transform.index;
                header.style.cursor = 'grabbing';

                position.left = (rect.left - transform.left);
                position.top = (rect.top - transform.top);

                position.offsetLeft = (left - transform.left) - position.left;
                position.offsetTop = (top - transform.top) - position.top;
                break;

            case _MOV_.END:
                header.style.cursor = 'grab';
                break;
        }

        position.left = (left - transform.left) - position.offsetLeft;
        position.top = (top - transform.top) - position.offsetTop;

        if (position.left < 0) position.left = 0;
        if (position.top < 0) position.top = 0;

        position.left /= transform.scale;
        position.top /= transform.scale;

        card.style.transform = 'translate(' +position.left+ 'px, ' +position.top+ 'px)';
    };
    this.setColor = function(color) {    
        if (!rootCard) {   
            const size = fieldsArray.length;
            for (let counter=0; counter<size; counter++) {
                fieldsArray[counter].setColor(color);
            }
            if (color == null) {
                input.style.removeProperty('background-color');
                card.style.removeProperty('border-color');
                title.style.removeProperty('color');
            } else {
                input.style.backgroundColor = color;
                card.style.borderColor = color;
                title.style.color = color;
            }
        }
    };
    this.getColor = function() {
        if (!rootCard && context.hasConnection()) {
            return input['_CONNECTION_'].getColor();
        }
        return null;
    };
    this.infiniteLoop = function(target) {
        if (!rootCard) {
            if (target.isSameNode(input)) {
                return true;
            }
            if (context.hasConnection()) {
                return input['_CONNECTION_'].infiniteLoop(target);
            }
        }
        return false;
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.getMain = function() { return parent; };
    this.addField = function(text) {
        let new_field = new Field(this);
        fieldsArray.push(new_field); 

        if (text) new_field.setText(text);
        new_field.setIndex(fieldsArray.length);

        //context.redraw();
        
        items.appendChild(new_field.getFragment());
        return new_field;
    };
    this.isRoot = function() { return rootCard; };
    this.getPosition = function() { return { left: position.left, top:position.top }; };
    this.removeField = function() { };

    // PUBLIC NO ROOT  /////////////////////////////////////////////////////////
    if (!rootCard) {
        this.setHeader = function(text) {     
            title.textContent = text;
        };
        this.getInputBounding = function() {     
            const rect = input.getBoundingClientRect();
            return { left: rect.left, top: rect.top }; 
        };
    }

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        fragment = document.createDocumentFragment();

        let bottom, add, close;

        card = addElement(fragment, 'div', 'app-cards');
        if (rootCard) card.classList.add('root');

        header = addElement(card, 'div', 'app-cards-header');
        header.addEventListener('mousedown', (evnt) => parent.dragStart(evnt, context), true);

            title = addElement(header, 'div', 'app-cards-header-title');
            if (rootCard) {
                title.classList.add('root');
                title.textContent = 'INÍCIO DA MACRO';
            }

            close = addElement(header, 'div', 'app-cards-header-close');
            close.addEventListener('click', () => _remove());

        if (rootCard) {
            items = addElement(card, 'div', 'app-cards-content-items root');
        } else {
            let content = addElement(card, 'div', 'app-cards-content');

            input = addElement(content, 'div', 'app-cards-content-input');
            input['_CONNECTION_'] = null;
            input['_CONTEXT_'] = context;

            items = addElement(content, 'div', 'app-cards-content-items');
        } 

        bottom = addElement(card, 'div', 'app-cards-bottom');

            add = addElement(bottom, 'div', 'app-cards-bottom-add');
            add.textContent = 'Atividade';
            add.addEventListener('click', () => context.addField());
    })();
}