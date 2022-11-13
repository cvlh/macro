'use strict';

import { _DRAG_, _MOV_, _TYPES_, _ICON_CHAR_, _VISIBILITY_ } from '../utils/constants.js';
import { addElement, UUIDv4 } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Field from './fields.js';

export default function Card(__context, __properties, __tab) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        MacroContext = __context,
        Context = this,

        RootField = (__tab === 0 ? true : false),
        TabIndex = __tab + 1,

        FieldsMap = new Map(),

        DOMElement = {
            card:       null,
            header:     null,
            title:      null,
            items:      null,
            input:      null,
            visibility: null,
            add:        null,
            close:      null
        };

    // VARIABLES ///////////////////////////////////////////////////////////////
    let isCurrentSelectObject = false,
        inputConnection = null,

        position = { left: 0, top: 0, offsetLeft: 0, offsetTop: 0 },
        props = {
            uuid: null,

            visibility: { 
                flags: _VISIBILITY_.FRESH,
                fields: {
                    visible: null,
                    hidden:  null
                }
            }
        },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _drag = function(evnt) { 
        //evnt.preventDefault();
        const target = evnt.target,
              targetClass = target.classList;
              
        if (targetClass.contains('app-cards-header-button') ||
            targetClass.contains('app-cards-header-visibility')) {
            evnt.preventDefault();
            return;
        }

        if (evnt.button === 0)
            MacroContext.dragStart(evnt, Context)
    },
    _remove = function(evnt) {
        DOMElement.card.removeEventListener('focus', _showProperties, { capture: false });
        
        DOMElement.header.removeEventListener('mousedown', _drag, { capture: false });
        
        DOMElement.visibility.removeEventListener('mouseenter', _previewVisibility, { capture: false });
        DOMElement.visibility.removeEventListener('mouseleave',  _previewVisibility, { capture: false });
        
        DOMElement.add.removeEventListener('click', Context.addField, { capture: false });
        
        DOMElement.close.removeEventListener('click', _remove, { capture: false });

        if (Context.hasConnection())
            inputConnection.clearConnection();

        for (const [uuid, field] of FieldsMap.entries()) {
            field.remove(false);
            FieldsMap.delete(uuid);
        }

        for (const element in DOMElement) {
            DOMElement[element].parentNode.removeChild(DOMElement[element]);
            DOMElement[element] = null;

            delete DOMElement[element];
        }

        MacroContext.removeFromCardsMap(props.uuid);
        MacroContext.serialize();
    },
    _order = function() {
        let counter = 1;

        for (const field of FieldsMap.values()) {
            field.setOrder(counter);
            counter++;
        }
    },
    _showProperties = function() { MacroContext.showProperties(Context); },
    _previewVisibility = function(evnt) { MacroContext.previewVisibility(props['visibility']['fields'], evnt.type); },
    _updateVisibilityCounter = function() {
        const visibilityFields = props['visibility']['fields'];
        
        let visibilitySize = 0;
        for (const status in visibilityFields)
            visibilitySize += visibilityFields[status].size;

        if (visibilitySize) 
            DOMElement.visibility.style.visibility = 'visible';
        else 
            DOMElement.visibility.style.removeProperty('visibility');
        
        DOMElement.visibility.textContent = visibilitySize;
    };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.getDragType = function() { return _DRAG_.HEADER; };
    this.hasConnection = function() { 
        if (RootField)
            return false;
        
        if (inputConnection !== null)
            return true;
        
        return false;
    };
    this.makeConnection = function(output) { inputConnection = output; };
    this.clearConnection = function() {
        inputConnection = null;

        Context.setHeader('');
        Context.setColor(null);

        if (FieldsMap.size === 0)
            _remove();
    };
    this.redraw = function(transform) {
        for (const field of FieldsMap.values())
            field.redraw(transform);

        if (Context.hasConnection()) {
            const viewport = DOMElement.input.getBoundingClientRect();
            inputConnection.setPosition(viewport.left, viewport.top, transform, _MOV_.END);
        }
    };
    this.setPosition = function(left, top, transform, mov) {
        switch (mov) {
            case _MOV_.NEW:
                position.left = left;
                position.top  = top;
                DOMElement.card.style.transform = 'translate(' +position.left+ 'px, ' +position.top+ 'px)';
                return;
                
            case _MOV_.START:
                const rect = DOMElement.card.getBoundingClientRect();

                DOMElement.card.style.zIndex = transform.index;
                DOMElement.header.style.cursor = 'grabbing';

                position.left = (rect.left - transform.left);
                position.top = (rect.top - transform.top);

                position.offsetLeft = (left - transform.left) - position.left;
                position.offsetTop = (top - transform.top) - position.top;
                break;

            case _MOV_.END:
                DOMElement.header.style.removeProperty('cursor');
                break;
        }

        position.left = (left - transform.left) - position.offsetLeft;
        position.top = (top - transform.top) - position.offsetTop;

        if (position.left < 0) position.left = 0;
        if (position.top < 0) position.top = 0;

        position.left /= transform.scale;
        position.top /= transform.scale;

        DOMElement.card.style.transform = 'translate(' +position.left+ 'px, ' +position.top+ 'px)';
    };
    this.setColor = function(color) {
        if (!RootField) {
            for (const field of FieldsMap.values())
                field.setColor(color);

            if (color == null) {
                DOMElement.input.style.removeProperty('background-color');

                DOMElement.card.style.removeProperty('border-color');
                DOMElement.card.style.removeProperty('outline-color');

                DOMElement.header.style.removeProperty('color');
            } else {
                DOMElement.input.style.backgroundColor = color;

                DOMElement.card.style.borderColor = color;
                DOMElement.card.style.outlineColor = color;

                DOMElement.header.style.color = color;
            }
        }
    };
    this.getColor = function() {
        if (!RootField && Context.hasConnection())
            return inputConnection.getColor();
        
        return null;
    };
    this.infiniteLoop = function(target) {
        if (!RootField) {
            if (target.isSameNode(DOMElement.input))
                return true;
            
            if (Context.hasConnection())
                inputConnection.infiniteLoop(target);
        }
        return false;
    };
    // this.serialize = function (fragment, properties = {tab: [], expand: true, color: null}) {
    this.serialize = function (fragment, properties) {
        const response = { 
            position: [ position.left, position.top ],
            fields: [],
            properties : {
                uuid : props['uuid'],

                visibility: {
                    fields: { }, 
                    flags: props['visibility']['flags']
                }
            }
        };

        const visibilityFields = props['visibility']['fields'];
        for (const status in visibilityFields) {
            const keysUUID = visibilityFields[status].keys();
            response['properties']['visibility']['fields'][status] = [...keysUUID];
        }

        let counterFields = 0
        for (const field of FieldsMap.values()) {
            counterFields++;

            properties.tab.push(counterFields);
            response['fields'].push(field.serialize(fragment, properties));
            properties.tab.pop();
        }
    
        return response;
    };
    this.setExpand = function(status) {
        for (const field of FieldsMap.values())
            field.setExpand(status);
    };
    this.setBorderColor = function(light, index, color) {
        for (const field of FieldsMap.values())
            field.setBorderColor(light, index, color);
    };
    this.swap = function(position, order) { 
        //FieldsMap.swap(position, order); 
        _order();
    };
    this.setSelected = function(status) { 
        if (status) {
            isCurrentSelectObject = true;
            DOMElement.card.classList.add('selected');
        } else {
            isCurrentSelectObject = false;
            DOMElement.card.classList.remove('selected');
        }
    };
    this.getProps = function(...prop) {
        if (prop === undefined)
            return props;

        let shortcut = props;
        for (const arg of prop) {
            if (!shortcut.hasOwnProperty(arg))
                return null;

            shortcut = shortcut[arg];
        }

        return shortcut;
    };

    this.initVisibility = function(fields_map) {
        for (const status in props['visibility']['fields']) {
            const clone = [...props['visibility']['fields'][status]];

            props['visibility']['fields'][status] = new Map();
            for (const id of clone) {
                if (fields_map.has(id))
                    props['visibility']['fields'][status].set(id, fields_map.get(id));
                else
                    console.log(`Card initVisibility error: not found id: ${id}`);
            }   
        }

        for (const field of FieldsMap.values())
            field.initVisibility(fields_map);

        _updateVisibilityCounter();
    };      
    this.setVisibilityMode = function() {
        if (MacroContext.getVisibilityMode()) {
            DOMElement.card.removeAttribute('tabindex');

            if (!isCurrentSelectObject)
                DOMElement.visibility.style.visibility = 'hidden';
            else
                DOMElement.card.appendChild(MacroContext.getSelectedArrow());

            DOMElement.add.style.visibility = 'hidden';

            if (!RootField) 
                DOMElement.close.style.visibility = 'hidden';
        } else {
            DOMElement.card.setAttribute('tabindex',  TabIndex);

            if (isCurrentSelectObject)
                DOMElement.card.removeChild(MacroContext.getSelectedArrow());
            
            DOMElement.add.style.removeProperty('visibility');
            
            if (!RootField) 
                DOMElement.close.style.removeProperty('visibility');
            
            _updateVisibilityCounter();
        }

        for (const field of FieldsMap.values())
            field.setVisibilityMode();
    };
    this.addToVisibility = function(field, status) {        
        props['visibility']['fields'][status].set(field.getProps('uuid'), field);
        _updateVisibilityCounter();
    };
    this.deleteFromVisibility = function(uuid, forward = false) {
        const visibilityFields = props['visibility']['fields'];
        for (const status in visibilityFields) 
            visibilityFields[status].delete(uuid);
    
        if (forward) {
            for (const field of FieldsMap.values())
                field.deleteFromVisibility(uuid);
        }

        _updateVisibilityCounter();
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.getMacro = function() { return MacroContext; };
    this.addField  = function() {
        const field = Context.newField();
        MacroContext.redraw(Context);
        field.setFocus();
    },
    this.newField = function(properties) {
        properties = { ...properties, 'tab': TabIndex };

        let new_field = new Field(Context, DOMElement.items, properties);
        FieldsMap.set(new_field.getProps('uuid'), new_field); 
        _order();
        
        return new_field;
    };
    this.removeFromFieldMap = function(uuid) {
        FieldsMap.delete(uuid);
        _order();
    };
    this.isRoot = function() { return RootField; };

    // PUBLIC NO ROOT  /////////////////////////////////////////////////////////
    if (!RootField) {
        this.setHeader = function(text) { DOMElement.title.textContent = text; };
        this.getInputBounding = function() {
            const rect = DOMElement.input.getBoundingClientRect();
            return { left: rect.left, top: rect.top }; 
        };
    }

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        const fragment = document.createDocumentFragment();

        DOMElement.card = addElement(fragment, 'div', 'app-cards');
        DOMElement.card.setAttribute('tabindex', TabIndex);
        if (RootField)
            DOMElement.card.classList.add('root');

        props = {...props, ...__properties};

        if (props.uuid === null) {
            props.uuid = UUIDv4();
        
            const visibilityFields = props['visibility']['fields'];
            for (const status in visibilityFields) 
                visibilityFields[status] = new Map();
        }

        DOMElement.card.addEventListener('focus', _showProperties, { capture: false });

        DOMElement.header = addElement(DOMElement.card, 'div', 'app-cards-header');
        DOMElement.header.addEventListener('mousedown', _drag, { capture: false });
        
        if (RootField) {
            DOMElement.header.style.gridTemplateColumns = '25px 225px 25px 25px';
            addElement(DOMElement.header, 'div', 'icon app-cards-header-dot root', _ICON_CHAR_.HOME);
            DOMElement.title = addElement(DOMElement.header, 'div', 'app-cards-header-title root', _I18N_.root_header);
        } else {
            DOMElement.title = addElement(DOMElement.header, 'div', 'app-cards-header-title');
        }
        
        DOMElement.visibility = addElement(DOMElement.header, 'div', 'app-cards-header-visibility');
        DOMElement.visibility.addEventListener('mouseenter', _previewVisibility, { capture: false });
        DOMElement.visibility.addEventListener('mouseleave',  _previewVisibility, { capture: false });

        DOMElement.add = addElement(DOMElement.header, 'div', 'app-cards-header-button new icon', _ICON_CHAR_.PLUS);
        DOMElement.add.addEventListener('click', Context.addField, { capture: false });

        if (!RootField) {
            DOMElement.close = addElement(DOMElement.header, 'div', 'app-cards-header-button close icon', _ICON_CHAR_.CLOSE);
            DOMElement.close.addEventListener('click', _remove, { capture: false });
        }

        if (RootField) {
            DOMElement.items = addElement(DOMElement.card, 'div', 'app-cards-content-items root');
        } else {
            let content = addElement(DOMElement.card, 'div', 'app-cards-content');

            DOMElement.input = addElement(content, 'div', 'app-cards-content-input icon', _ICON_CHAR_.INPUT);
            DOMElement.input['_UUID_'] = props.uuid;

            DOMElement.items = addElement(content, 'div', 'app-cards-content-items');
        }

        MacroContext.getBuilderDiv().appendChild(fragment);
    })();
}