'use strict';

import { _DRAG_, _MOV_, _TYPES_, _ICON_CHAR_, _VISIBILITY_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Field from './fields.js';

export default function Card(_ctx, _properties, tab) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = _ctx, 
          context = this, 
          rootCard = (tab === 0 ? true : false),
          tabindex = ++tab;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let card, header, title, items, input,
        add, close,
        fieldsArray = [],
        position = { left: 0, top: 0, offsetLeft: 0, offsetTop: 0 },

        props = {
            // visibility: { 
            //     fields: []
            // }
        },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _drag = function (evnt) { 
        //evnt.preventDefault();
        const target = evnt.target,
              targetClass = target.classList;

        if (targetClass.contains('app-cards-header-button')) return;

        parent.dragStart(evnt, context)
    },
    _add = function() {
        const field = context.addField();

        parent.redraw(context);
        field.setFocus();
    },
    _remove = function (evnt) {
        evnt.stopPropagation();
    },
    _order = function() {
        const sizeFields = fieldsArray.length;
        
        for (let counterFields=0; counterFields<sizeFields; counterFields++) {
            fieldsArray[counterFields].setOrder(counterFields+1);
        }
    },
    _showProperties = function(evnt) { parent.showProperties(context); };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.getDragType = function() { return _DRAG_.HEADER; };
    this.hasConnection = function() { 
        if (rootCard) return false;
        
        if (input['_CONNECTION_'] !== null) {
            return true;
        }
        return false;
    };
    this.makeConnection = function(output) {
        //input.classList.add('linked');
        input['_CONNECTION_'] = output;
    };
    this.clearConnection = function() {
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
            case _MOV_.NEW:
                position.left = left;
                position.top  = top;
                card.style.transform = 'translate(' +position.left+ 'px, ' +position.top+ 'px)';
                return;
                
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
                header.style.removeProperty('cursor');
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
                card.style.removeProperty('outline-color');
                header.style.removeProperty('color');
                //title.style.removeProperty('color');
                //items.style.removeProperty('outline-color');

            } else {
                input.style.backgroundColor = color;
                card.style.borderColor = color;
                header.style.color = color;
                //title.style.color = color;
                //items.style.outlineColor = color;
                card.style.outlineColor = color;
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
    this.serialize = function (fragment, properties = {tab: [], expand: true, color: null}) {
        const sizeFields = fieldsArray.length;
        let counterFields;

        let response = { 
            position: [ position.left, position.top ],
            fields: []
        };
        // if (props.hasOwnProperty('visibility')) {
        if (rootCard) {
            const visibilityFields = { 'visibility' : { 'fields': [] }};
            for (counterFields=0; counterFields<props['visibility']['fields'].length; counterFields++) {
                visibilityFields['visibility']['fields'].push(props['visibility']['fields'][counterFields].getProps('id'));
            }
            visibilityFields['visibility']['fields'].sort();
            response['properties'] = { ...props, ...visibilityFields };
        }

        for (counterFields=0; counterFields<sizeFields; counterFields++) {
            properties.tab.push(counterFields+1);
            response['fields'].push(fieldsArray[counterFields].serialize(fragment, properties));
            properties.tab.pop();
        }

        return response;
    };
    this.setExpand = function(status) {
        const sizeFields = fieldsArray.length;

        for (let counterFields=0; counterFields<sizeFields; counterFields++) {
            fieldsArray[counterFields].setExpand(status);
        }
    };
    this.setBorderColor = function(light, index, color) {
        const sizeFields = fieldsArray.length;
        let counterFields;

        for (counterFields=0; counterFields<sizeFields; counterFields++) {
            fieldsArray[counterFields].setBorderColor(light, index, color);
        }
    };
    this.swap = function(position, order) { 
        fieldsArray.swap(position, order); 
        _order();
    };
    this.setSelected = function(selected) { 
        if (selected) {
            //card.classList.add('selected');
        } else {
            //card.classList.remove('selected');
        }
    };
    this.getProps = function (prop = null) {
        if (prop === null) {
            return props;
        } else {
            if (props.hasOwnProperty(prop)) {
                return props[prop];
            }
        }
        return null;
    };

    this.initVisibility = function(fields) {
        const sizeFields = fieldsArray.length;

        if (props.hasOwnProperty('visibility')) {
            const sizeVisibility = props['visibility']['fields'].length;
            for (let counterVisibility=0; counterVisibility<sizeVisibility; counterVisibility++) {
                if (typeof props['visibility']['fields'][counterVisibility] === 'string') {
                    props['visibility']['fields'][counterVisibility] = fields[props['visibility']['fields'][counterVisibility]];
                }
            }
        }
        
        for (let counterFields=0; counterFields<sizeFields; counterFields++) {
            fieldsArray[counterFields].initVisibility(fields);
        }
    };      
    this.setVisibilityMode = function() {
        let counter;
        const size = fieldsArray.length;

        if (parent.getVisibilityMode()) {
            card.removeAttribute('tabindex');

            add.style.display = 'none';
            if (!rootCard) close.style.display = 'none';
        } else {
            card.setAttribute('tabindex',  tabindex);

            add.style.removeProperty('display');
            if (!rootCard) close.style.removeProperty('display');
        }

        for (counter=0; counter<size; counter++) {
            //if (rootCard) fieldsArray[counter].setColor(null);
            fieldsArray[counter].setVisibilityMode();
        }
    };
    this.addToVisibility = function(field) {
        props['visibility']['fields'].push(field);
        field.selectedForVisibility();
    };
    this.removeFromVisibility = function(field) {
        const removeId = field.getProps('id');
        var counter, currentId;

        for (counter=0; counter<props['visibility']['fields'].length; counter++) {
            currentId = props['visibility']['fields'][counter].getProps('id');
            if (removeId === currentId) {
                props['visibility']['fields'].splice(counter, 1); 
                field.unselectForVisibility();
                return;
            }
        }

        console.log('FATAL ERROR - REMOVE FAILED! ' +removeId);
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.getMain = function() { return parent; };
    this.addField = function(properties) {
        
        properties = { ...properties, 'tab': tabindex };

        let new_field = new Field(this, items, properties);
        fieldsArray.push(new_field); 
        _order();
        
        return new_field;
    };
    this.isRoot = function() { return rootCard; };
    this.removeField = function() { };


    // PUBLIC NO ROOT  /////////////////////////////////////////////////////////
    if (!rootCard) {
        this.setHeader = function(text) {
            title.textContent = text;
        };
        this.getInputBounding = function() {
            const rect = input.getBoundingClientRect();
            return { left: rect.left, top: rect.top }; 
            
            /*const top = position.top + header.offsetHeight + input.offsetTop;
            const left = position.left + input.offsetLeft;
            return { left: left, top: top }; */
        };
    }

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        let icon;
        const fragment = document.createDocumentFragment();

        card = addElement(fragment, 'div', 'app-cards');
        card.setAttribute('tabindex', tabindex);
        if (rootCard) { 
            card.classList.add('root'); 

            props.visibility['autoExecute'] = false;
        }

        props = {...props, ..._properties};

        card.addEventListener('focus', _showProperties, { capture: false });

        header = addElement(card, 'div', 'app-cards-header');
        header.addEventListener('mousedown', _drag, { capture: false });
        
        if (rootCard) {
            header.style.gridTemplateColumns = '24px 226px 24px';
            icon = addElement(header, 'div', 'icon app-cards-header-title root', _ICON_CHAR_.HOME);
            title = addElement(header, 'div', 'app-cards-header-title root', _I18N_.root_header);
        } else {
            title = addElement(header, 'div', 'app-cards-header-title');
        }

        add = addElement(header, 'div', 'app-cards-header-button new icon', _ICON_CHAR_.PLUS);
        add.addEventListener('click', _add, { capture: false });

        if (!rootCard) {
            close = addElement(header, 'div', 'app-cards-header-button close icon', _ICON_CHAR_.CLOSE);
            close.addEventListener('click', _remove, { capture: false });
        }

        if (rootCard) {
            items = addElement(card, 'div', 'app-cards-content-items root');
        } else {
            let content = addElement(card, 'div', 'app-cards-content');

            input = addElement(content, 'div', 'app-cards-content-input icon', _ICON_CHAR_.INPUT);
            input['_CONNECTION_'] = null;
            input['_CONTEXT_'] = context;

            items = addElement(content, 'div', 'app-cards-content-items');
        }

        parent.appendAt().appendChild(fragment);
    })();
}