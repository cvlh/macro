'use strict';

import { _DRAG_, _MOV_, _TYPES_, _ICON_CHAR_, _VISIBILITY_ } from '../utils/constants.js';
import { addElement, UUIDv4 } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Field from './fields.js';

export default function Card(__context, __properties, __tab) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const MacroContext = __context,
          Context = this,

          RootField = (__tab === 0 ? true : false),
          TabIndex = __tab + 1,

          FieldsMap = new Map();

    // VARIABLES ///////////////////////////////////////////////////////////////
    let card, header, title, items, input,
        add, visibility, close,

        isCurrentSelectObject = false,
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
        card.removeEventListener('focus', _showProperties, { capture: false });
        header.removeEventListener('mousedown', _drag, { capture: false });
        visibility.removeEventListener('mouseenter', _previewVisibility, { capture: false });
        visibility.removeEventListener('mouseleave',  _previewVisibility, { capture: false });
        add.removeEventListener('click', Context.addField, { capture: false });
        close.removeEventListener('click', _remove, { capture: false });

        if (Context.hasConnection())
            inputConnection.clearConnection();

        // for (const field of FieldsMap.values()) {
        for (const [uuid, field] of FieldsMap.entries()) {
            field.remove(false);
            FieldsMap.delete(uuid);
        }
        // FieldsMap.clear();

        card.parentNode.removeChild(card);

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
            visibility.style.visibility = 'visible';
        else 
            visibility.style.removeProperty('visibility');
        
        visibility.textContent = visibilitySize;
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
            const viewport = input.getBoundingClientRect();
            inputConnection.setPosition(viewport.left, viewport.top, transform, _MOV_.END);
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
        if (!RootField) {   
            for (const field of FieldsMap.values())
                field.setColor(color);

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
        if (!RootField && Context.hasConnection())
            return inputConnection.getColor();
        
        return null;
    };
    this.infiniteLoop = function(target) {
        if (!RootField) {
            if (target.isSameNode(input))
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
            card.classList.add('selected');
        } else {
            isCurrentSelectObject = false;
            card.classList.remove('selected');
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
            card.removeAttribute('tabindex');

            if (!isCurrentSelectObject)
                visibility.style.visibility = 'hidden';
            else
                card.appendChild(MacroContext.getSelectedArrow());

            add.style.visibility = 'hidden';

            if (!RootField) 
                close.style.visibility = 'hidden';
        } else {
            card.setAttribute('tabindex',  TabIndex);

            if (isCurrentSelectObject)
            card.removeChild(MacroContext.getSelectedArrow());
            
            add.style.removeProperty('visibility');
            
            if (!RootField) 
                close.style.removeProperty('visibility');
            
            _updateVisibilityCounter();
        }

        for (const field of FieldsMap.values())
            field.setVisibilityMode();
    };
    this.addToVisibility = function(field, status) {        
        props['visibility']['fields'][status].set(field.getProps('uuid'), field);
        _updateVisibilityCounter();
    };
    this.deleteFromVisibility = function(uuid, recursive = false) {
        const visibilityFields = props['visibility']['fields'];
        for (const status in visibilityFields) 
            visibilityFields[status].delete(uuid);
    
        if (recursive) {
            for (const field of FieldsMap.values())
                field.deleteFromVisibility(uuid, recursive);
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

        let new_field = new Field(Context, items, properties);
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
        this.setHeader = function(text) { title.textContent = text; };
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
        const fragment = document.createDocumentFragment();

        card = addElement(fragment, 'div', 'app-cards');
        card.setAttribute('tabindex', TabIndex);
        if (RootField)
            card.classList.add('root');

        props = {...props, ...__properties};

        if (props.uuid === null) {
            props.uuid = UUIDv4();
        
            const visibilityFields = props['visibility']['fields'];
            for (const status in visibilityFields) 
                visibilityFields[status] = new Map();
        }

        card.addEventListener('focus', _showProperties, { capture: false });

        header = addElement(card, 'div', 'app-cards-header');
        header.addEventListener('mousedown', _drag, { capture: false });
        
        if (RootField) {
            header.style.gridTemplateColumns = '25px 225px 25px 25px';
            addElement(header, 'div', 'icon app-cards-header-dot root', _ICON_CHAR_.HOME);
            title = addElement(header, 'div', 'app-cards-header-title root', _I18N_.root_header);
        } else {
            title = addElement(header, 'div', 'app-cards-header-title');
        }
        
        visibility = addElement(header, 'div', 'app-cards-header-visibility');
        visibility.addEventListener('mouseenter', _previewVisibility, { capture: false });
        visibility.addEventListener('mouseleave',  _previewVisibility, { capture: false });

        add = addElement(header, 'div', 'app-cards-header-button new icon', _ICON_CHAR_.PLUS);
        add.addEventListener('click', Context.addField, { capture: false });

        if (!RootField) {
            close = addElement(header, 'div', 'app-cards-header-button close icon', _ICON_CHAR_.CLOSE);
            close.addEventListener('click', _remove, { capture: false });
        }

        if (RootField) {
            items = addElement(card, 'div', 'app-cards-content-items root');
        } else {
            let content = addElement(card, 'div', 'app-cards-content');

            input = addElement(content, 'div', 'app-cards-content-input icon', _ICON_CHAR_.INPUT);
            input['_UUID_'] = props.uuid;
            // input['_CONTEXT_'] = new WeakRef(Context);

            items = addElement(content, 'div', 'app-cards-content-items');
        }

        MacroContext.getBuilderDiv().appendChild(fragment);
    })();
}