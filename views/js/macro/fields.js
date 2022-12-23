'use strict';

import { _QUADRATIC_CURVE_OFFSET_, _DRAG_, _MOV_, _COLORS_, _TYPES_, _STATUS_, _VISIBILITY_, _ICON_CHAR_, _ORDER_, _KEY_CODE_ } from '../utils/constants.js';
import { _I18N_ } from './../i18n/pt-br.js';
import { addElement, UUIDv4 } from '../utils/functions.js';

export default function Field(__context, __append, __properties) {

    if (!new.target) 
        throw new Error('Field() must be called with new');

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const
        MacroContext = __context.getMacro(), 
        CardContext = __context.getProps('uuid'),

        RootField = __context.isRoot(),

        DOMElement = {
            item:        null,
            container:   null,
            index:       null,
            description: null,
            visibility:  null,
            output:      null,
        };

    // VARIABLES ///////////////////////////////////////////////////////////////
    let dragType,
        treeviewRow = null, treeviewDeep,

        isCurrentSelectObject = false,
    
        outputConnection = null,
        outputPath = null,

        position = { top: 0, left: 0 },

        props = {
            uuid: null,

            id: null,
            text: '',
            type: { type: _TYPES_.LIST },
            order: 0,
            visibility: {
                flags: _VISIBILITY_.FRESH,
                fields: {
                    visible: null,
                    hidden:  null
                }
            },
            expanded: true,

            tail: { x: 0, y: 0 }
        };

    // PRIVATE /////////////////////////////////////////////////////////////////
    const

    _deep = (tab) => {
        let counter, result = '';
        for (counter = 0; counter < tab.length; counter++) {
            result += tab[counter];
            if (counter < tab.length-1) result += '.';
        }

        return result;
    },
    _color = (drag, color = null) => {
        const output = DOMElement.output;

        if (color !== null) {
            if (!drag) {
                //if (Context.hasConnection()) {
                if (this.hasConnection()) {
                    output.style.backgroundColor = color;
                    output.style.color = 'var(--gray-100)';
                } else {
                    output.style.removeProperty('background-color');
                    output.style.removeProperty('color');
                }
            } else {
                output.style.backgroundColor = color;
                output.style.color = 'var(--gray-100)';
            }

            // if (output['_PATH_'] !== null) 
            //     output['_PATH_'].style.stroke = color;
            if (outputPath !== null) 
                outputPath.style.stroke = color;
        } else {
            output.style.removeProperty('background-color');
            output.style.removeProperty('color');

            // if (output['_PATH_'] !== null)
            //     output['_PATH_'].style.removeProperty('stroke');
            if (outputPath !== null)
                outputPath.style.removeProperty('stroke');
        }
    },
    _drag = (evnt) => {
        evnt.preventDefault();

        if (evnt.button !== 0) 
            return;

        if (MacroContext.getVisibilityMode())
            return;

        // if (Context.hasConnection()) {
        if (this.hasConnection()) {
            // Context.clearConnection();
            this.clearConnection();
            MacroContext.serialize();
        }

        // const output = DOMElement.output;
        // if (output['_PATH_'] === null) 
        //     output['_PATH_'] = MacroContext.newSVG(this);
            // output['_PATH_'] = MacroContext.newSVG(Context);
        if (outputPath === null) 
            outputPath = MacroContext.newSVG(this);

        outputPath.setAttribute('visibility', 'visible');
        // output['_PATH_'].setAttribute('visibility', 'visible');

        // Context.setDragType(_DRAG_.OUTPUT);
        this.setDragType(_DRAG_.OUTPUT);
        // MacroContext.dragStart(evnt, Context); 
        MacroContext.dragStart(evnt, this); 
    },
    _render = (left, top, action) => {
        let offsetLine, offset = _QUADRATIC_CURVE_OFFSET_;

        // const elements = DOMElement.output['_PATH_'].children,
        const elements = outputPath.children,
              startX   = position.left + 17,
              startY   = position.top  + 11;
        
        if (dragType !== _DRAG_.LINE) {
            if (props.line === undefined) {
                offsetLine = ((left - position.left) / 2) - 17/2;
            } else {
                offsetLine = props.line;
            }

            if (action === _MOV_.END)
                top += 15;
        } else {
            offsetLine = left - startX;
            left = props.tail.x;
            top  = props.tail.y;

            if (action === _MOV_.END)
                props.line = offsetLine;
        }

        const startXEnd = startX + offsetLine,
                  diffY = Math.abs(startY - top),
                  diffX = Math.abs(startXEnd - left),
                  diffZ = Math.abs(startX - startXEnd);

        if (diffY < (_QUADRATIC_CURVE_OFFSET_ * 2) || 
            diffX < (_QUADRATIC_CURVE_OFFSET_ * 2) || 
            diffZ < (_QUADRATIC_CURVE_OFFSET_ * 2)) {

            offset = Math.min(diffY, diffX, diffZ);
            offset /= 2;
        }

        const y1 = (startY > top) ? startY - offset : startY + offset,
              y2 = (startY > top) ? top + offset : top - offset;

        const d = {
            M0: { x: startX, y: startY },                                        //  MOVE TO - M x y
            H0: { x: startXEnd - (startX > startXEnd ? offset * -1 : offset) },  //  HORIZONTAL LINE - H x
            Q0: { x1: startXEnd, y1: startY, x: startXEnd, y: y1 },              //  QUADRATIC CURVE - Q x1 y1, x y

            M1: { x: startXEnd, y: y2 },
            Q1: { x1: startXEnd, y1: top, x: startXEnd + (startXEnd > left ? offset * -1 : offset), y: top },
            H1: { x: left }
        };

        elements[0].setAttribute('d', 'M ' +d.M0.x+ ' ' +d.M0.y+ ' H ' +d.H0.x+ ' Q ' +d.Q0.x1+ ' ' +d.Q0.y1+ ', ' +d.Q0.x+ ' ' +d.Q0.y+ 
                                     ' M ' +d.M1.x+ ' ' +d.M1.y+ ' Q ' +d.Q1.x1+ ' ' +d.Q1.y1+ ', ' +d.Q1.x+ ' ' +d.Q1.y+ ' H ' +d.H1.x);

        elements[1].setAttribute('x1', startXEnd);
        elements[1].setAttribute('y1', y1);
        elements[1].setAttribute('x2', startXEnd);
        elements[1].setAttribute('y2', y2);

        if (action === _MOV_.END) {
            props.tail.x = left;
            props.tail.y = top;
        }
    },
    _keypress = (evnt) => {
        let key = evnt.keyCode || evnt.which;

        switch (key) {
            case _KEY_CODE_.ENTER.code:
                evnt.preventDefault();

                const value = DOMElement.description.value;
                if (value !== '') {
                    const next = DOMElement.item.nextElementSibling;
                    if (next === null) {
                        // CardContext.addField();
                        // const card = MacroContext.getFromCardsMap(CardContext);
                        // if (card !== undefined)
                        //     card.addField();
                        MacroContext.getFromCardsMap(CardContext)?.addField();
                    } else {
                        const el = next.querySelector('input');
                        if (el !== null)
                            el.focus();
                    }
                }
                break;
        }
        _refresh();
    },
    _refresh = () => {
        const value = DOMElement.description.value;

        // if (Context.hasConnection())
        if (this.hasConnection())
            outputConnection.setHeader(value);
            // output['_CONNECTION_'].setHeader(value);

        if (treeviewRow !== null) {
            const path = treeviewRow.querySelector('.field');
            if (path.firstChild instanceof Text) {
                if (value !== '') {
                    path.classList.remove('empty');
                    path.firstChild.textContent = value;
                } else {
                    path.classList.add('empty');
                    path.firstChild.textContent = _I18N_.field_empty;
                }
            }
        }

        //props['prefix']['text'] = value;
    },
    _showProperties = () => {
        if (!isCurrentSelectObject)
            MacroContext.showProperties(this); 
    },
    _showVisibilityTools = (evnt) => {
        evnt.stopPropagation();

        const tool = MacroContext.getVisibilityTool();
        //const target = evnt.target,

        switch (evnt.type) {
            case 'mouseenter':
                tool.show(this);
                break;

            case 'mouseleave':
                tool.hide(this);
                break;
        }
    },
    _previewVisibility = (evnt) => { 
        MacroContext.previewVisibility(props['visibility']['fields'], evnt.type); 
    },
    _toggleVisibility = () => {
        const selectedObject = MacroContext.getSelectedObject();
        const visibilityFields = selectedObject.getProps('visibility', 'fields');

        for (const status in visibilityFields) {
            if (visibilityFields[status].has(props.uuid)) {
                selectedObject.deleteFromVisibility(props.uuid);
                _removeVisibilityStyle();
                return;
            }
        }

        selectedObject.addToVisibility(this, _STATUS_.VISIBLE);
        _addVisibilityStyle(_STATUS_.VISIBLE);
    },
    _addVisibilityStyle = (status) => {
        let color = this.getColor();
        if (color !== null)
            color += 'BB';
        else
            color = '#7A7A7A';

        // _removeVisibilityStyle();

        // treeviewRow.style.outline = 'none';
        treeviewRow.style.backgroundColor = color;
        treeviewRow.style.color = 'var(--white)';

        const path = treeviewRow.querySelector('.field');
        const description = DOMElement.description;
        description.style.borderColor = color;
        switch (status) {
            case _STATUS_.VISIBLE:
                description.style.backgroundColor = color;
                description.style.color = 'var(--white)';
                break;
        
            case _STATUS_.HIDDEN:
                description.style.backgroundColor = 'transparent';
                // description.style.color = color;
                // description.style.borderWidth = '1px';
                description.style.borderStyle = 'solid';
                description.style.fontStyle = 'italic';
                description.style.textDecoration = 'line-through';
                
                if (path !== null) {
                    path.style.fontStyle = 'italic';
                    path.style.textDecoration = 'line-through';
                }
                break;
        }
        
        DOMElement.item.style.color = color;
    },
    _removeVisibilityStyle = () => {
        // treeviewRow.style.removeProperty('outline');
        treeviewRow.style.removeProperty('background-color');

        if (!RootField)
            treeviewRow.style.removeProperty('color');
        else 
            treeviewRow.style.color = this.getColor();

        const description = DOMElement.description;
        description.style.removeProperty('border-color');
        description.style.removeProperty('background-color');
        description.style.removeProperty('color');
        description.style.removeProperty('border-width');
        description.style.removeProperty('border-style');
        description.style.removeProperty('font-style');
        description.style.removeProperty('text-decoration');

        const path = treeviewRow.querySelector('.field');
        if (path !== null) {
            path.style.removeProperty('font-style');
            path.style.removeProperty('text-decoration');
        }

        DOMElement.item.style.removeProperty('color');
    },
    _updateVisibilityCounter = () => {
        let visibilitySize = 0;

        const visibilityFields = props['visibility']['fields'];
        for (const status in visibilityFields)
            visibilitySize += visibilityFields[status].size;

        if (visibilitySize) 
            DOMElement.visibility.style.visibility = 'visible';
        else 
            DOMElement.visibility.style.removeProperty('visibility');
        
        DOMElement.visibility.textContent = visibilitySize;
    };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.setDragType = function(type) { dragType = type; };
    this.getDragType = function() { return dragType; };
    this.hasConnection = function() {
        // if (output['_CONNECTION_'] !== null)
        if (outputConnection !== null)
            return true;
    
        return false;
    };
    this.makeConnection = function(card) {
        // const output = DOMElement.output;

        DOMElement.output.classList.remove('connected');
        //output.classList.add('linked');

        //output['_PATH_'].setAttribute('class', 'linked');
        // if (output['_PATH_'] === null)
        //     output['_PATH_'] = MacroContext.newSVG(this);
            // output['_PATH_'] = MacroContext.newSVG(Context);

        if (outputPath === null)
            outputPath = MacroContext.newSVG(this);

        // output['_PATH_'].setAttribute('class', 'main-app-svg-path linked');
        outputPath.setAttribute('class', 'main-app-svg-path linked');
        outputConnection = card;
        // output['_CONNECTION_'] = card;

        // card.makeConnection(Context);
        card.makeConnection(this);
        _refresh();

        //expanded = true;

        // const color = Context.getColor();
        const color = this.getColor();
        // Context.setColor(color);
        this.setColor(color);
    };
    this.clearConnection = function() {
        // const output = DOMElement.output;
        // const elements = output['_PATH_'].children;
        const elements = outputPath.children;

        DOMElement.output.classList.remove('linked', 'error');
        // output['_PATH_'].setAttribute('class', 'main-app-svg-path');
        // output['_PATH_'].setAttribute('visibility', 'hidden');
        // output['_PATH_'].removeAttribute('style');
        outputPath.setAttribute('class', 'main-app-svg-path');
        outputPath.setAttribute('visibility', 'hidden');
        outputPath.removeAttribute('style');

        elements[0].removeAttribute('d');

        elements[1].removeAttribute('x1');
        elements[1].removeAttribute('y1');
        elements[1].removeAttribute('x2'); 
        elements[1].removeAttribute('y2');

        delete props.line;

        props.tail.x = 0;
        props.tail.y = 0;

        // if (Context.hasConnection()) {
        if (this.hasConnection()) {
            // output['_CONNECTION_'].clearConnection();
            outputConnection.clearConnection();
            // output['_CONNECTION_'] = null;
            outputConnection = null;
        }

        // Context.setColor(null);
        this.setColor(null);
    };
    this.redraw = function(transform) {
        // if (Context.hasConnection()) {
        if (this.hasConnection()) {
            // const rect = output['_CONNECTION_'].getInputBounding();
            const rect = outputConnection.getInputBounding();
            // Context.setPosition(rect.left, rect.top, transform, _MOV_.END);
            this.setPosition(rect.left, rect.top, transform, _MOV_.END);
        }
    };
    this.setPosition = function(left, top, transform, action) {
        if (dragType === _DRAG_.OUTPUT) {
            if (action === _MOV_.START) {
                /*if (Context.hasConnection()) {
                    Context.clearConnection();
                    MacroContext.serialize();
                }*/
                // const color = Context.getColor();
                const color = this.getColor();
                _color(true, color);
            }
        }

        if (action === _MOV_.START || action === _MOV_.END) {
            const rect = DOMElement.output.getBoundingClientRect();
            position.left = (rect.left - transform.left) / transform.scale;
            position.top = (rect.top - transform.top) / transform.scale;
        }
        
        const endLeft = (left - transform.left) / transform.scale,
              endTop = (top - transform.top) / transform.scale;

        _render(endLeft, endTop, action);
    };
    this.setColor = function(color) { 
        if (RootField && color !== null) {
            for (const color_idx in _COLORS_) {
                if (_COLORS_[color_idx] === color) {
                    props.color = color_idx;
                    break;
                }
            }

            DOMElement.item.style.outlineColor = color;
        }

        // _color(false, color);
        _color(false, color);
        
        // if (Context.hasConnection())
        if (this.hasConnection())
            outputConnection.setColor(color);
            // output['_CONNECTION_'].setColor(color);
    };
    this.getColor = function() {
        if (RootField)
            return _COLORS_[props.color];

        const card = MacroContext.getFromCardsMap(CardContext);
        return card.getColor();

        // if (RootField /*&& props.color != null*/) {
        //     return _COLORS_[props.color];
        // } else {
        //     const card = MacroContext.getFromCardsMap(CardContext);
        //     if (card !== undefined)
        //         return card.getColor();

        //     // return CardContext.getColor();
        // }
    };
    this.infiniteLoop = function(target) {
        if (RootField) 
            return false;

        const card = MacroContext.getFromCardsMap(CardContext);
        return card.infiniteLoop(target);
    };
    this.serialize = function (fragment, properties) {
        let counterOffset, fieldOffset, 
            isExpand, deepSize, 
            response = {  };

        // const hasChild = Context.hasConnection();
        const hasChild = this.hasConnection();
        const responseVisibility = {
            visibility: {
                fields: {
                    visible: [],
                    hidden:  []
                }, 
                flags: props['visibility']['flags']
            }
        };

        const visibilityFields = props['visibility']['fields'];
        for (const status in visibilityFields) {
            const keysUUID = visibilityFields[status].keys();
            responseVisibility['visibility']['fields'][status] = [...keysUUID];
        }

        props.text = DOMElement.description.value;
        response['properties'] = { ...props, ...responseVisibility };

        if (RootField)
            properties.color = props.color;

        treeviewDeep = properties.tab.length;

        deepSize = properties.tab.length;
        if (hasChild || RootField)
            deepSize++;

        props['id'] = _deep(properties.tab);

        treeviewRow = addElement(fragment, 'div', 'main-app-treeview-row');
        treeviewRow.style.gridTemplateColumns = 'repeat(' +deepSize+ ', 12px) auto 15px 15px';
        if (!properties.expand)
            treeviewRow.style.height = '0';
        
        // treeviewRow['_CONTEXT_'] = new WeakRef(Context);
        treeviewRow['_CONTEXT_'] = new WeakRef(this);

        isExpand = true;
        if (hasChild && !props.expanded && properties.expand) {
            properties.expand = false;
            isExpand = false;
        }

        for (counterOffset = 0; counterOffset < properties.tab.length; counterOffset++) {
            fieldOffset = addElement(treeviewRow, 'div', 'main-app-treeview-item');
            if (counterOffset > 0) 
                fieldOffset.style.borderLeftColor = _COLORS_[properties.color] + '40';
        }
        if (hasChild || RootField) {
            if (hasChild) {
                fieldOffset.classList.add('expand');
                fieldOffset = addElement(fieldOffset, 'div', 'icon', _ICON_CHAR_.ARROW);
                if (properties.expand || props.expanded)
                    fieldOffset.style.transform = 'rotate(90deg)';
            } else {
                fieldOffset.classList.add('none');
                fieldOffset = addElement(fieldOffset, 'div', 'icon', _ICON_CHAR_.EMPTY);
            }
        }

        // const text = description.value;
        const text = props.text;
        const fieldDiv = addElement(treeviewRow, 'div', 'main-app-treeview-item field', text);
        if (text === '') {
            fieldDiv.textContent =  _I18N_.field_empty;
            fieldDiv.classList.add('empty');
        }

        if (RootField)
            treeviewRow.style.color = properties.color;

        if (hasChild || RootField)
            fieldDiv.style.fontWeight = '600';

        if (!hasChild && !RootField)
            fieldDiv.style.fontSize = '10px';

        const fieldPath = addElement(fieldDiv, 'div', 'main-app-treeview-item-path', props['id']);
        fieldPath.style.color = properties.color;

        addElement(treeviewRow, 'div', 'icon main-app-treeview-item type', (props['type']['type'] ? props['type']['type'] : _ICON_CHAR_.NONE));
        addElement(treeviewRow, 'div', 'main-app-treeview-item');

        if (hasChild)
            response['output'] = outputConnection.serialize(fragment, properties);
            // response['output'] = output['_CONNECTION_'].serialize(fragment, properties);

        if (!isExpand)
            properties.expand = true;

        return response;
    };
    this.setExpand = function(status) {
        // const hasChild = Context.hasConnection();
        const hasChild = this.hasConnection();

        if (!status) {
            treeviewRow.style.height = 0;
            if (hasChild)
                outputConnection.setExpand(status);
                // output['_CONNECTION_'].setExpand(status);
        } else {
            treeviewRow.style.removeProperty('height');
            if (hasChild)
                outputConnection.setExpand(this.getProps('expanded'));
                // outputConnection.setExpand(Context.getProps('expanded'));
                // output['_CONNECTION_'].setExpand(Context.getProps('expanded'));
        }
    };
    this.setBorderColor = function(light, index = null, color = null) {
        if (color === null && index === null) {
            // color = (light ? Context.getColor() + '40' : Context.getColor());
            color = (light ? this.getColor() + '40' : this.getColor());
            //if (currentVisibilityStatus && !light) color = 'white';
            index = treeviewDeep;
        } else {
            const child = treeviewRow.childNodes.item(index);
            child.style.borderLeftColor = color;
        }

        // if (Context.hasConnection())
        if (this.hasConnection())
            outputConnection.setBorderColor(light, index, color);
            // output['_CONNECTION_'].setBorderColor(light, index, color);

        //return color;
    };
    this.swap = function() {
        // TODO
        // let sibling = item.previousElementSibling,
        //     parentNode = item.parentNode;

        // if (sibling !== null) { 
        //     parentNode.insertBefore(item, sibling);

        //     CardContext.swap(props.order-1, _ORDER_.UP);
        //     MacroContext.redraw(parent);
        // }
    };
    this.setSelected = function(status) {
        const item = DOMElement.item;
        // const output = DOMElement.output;

        if (status) {
            isCurrentSelectObject = true;

            item.classList.add('selected');

            if (!RootField) 
                item.classList.add('border-radius');

            // if (Context.hasConnection()) 
            if (this.hasConnection()) 
                outputPath.style.strokeWidth = '7px';
                // output['_PATH_'].style.strokeWidth = '7px';
        } else {
            isCurrentSelectObject = false;

            item.classList.remove('selected', 'border-radius');

            // if (Context.hasConnection())
            if (this.hasConnection())
                outputPath.style.removeProperty('stroke-width');
                // output['_PATH_'].style.removeProperty('stroke-width');
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
    this.remove = function (remove = true) {
        MacroContext.getBuilderDiv().focus();

        DOMElement.description.removeEventListener('keyup', _keypress, { capture: false });
        DOMElement.description.removeEventListener('focus', _showProperties, { capture: false });

        DOMElement.visibility.removeEventListener('mouseenter', _previewVisibility, { capture: false });
        DOMElement.visibility.removeEventListener('mouseleave',  _previewVisibility, { capture: false });

        if (props.type.type === _TYPES_.LIST)
            DOMElement.output.removeEventListener('mousedown', _drag, { capture: false });

        if (MacroContext.getVisibilityMode()) {
            DOMElement.item.removeEventListener('mouseenter', _showVisibilityTools, { capture: false });
            DOMElement.item.removeEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        }

        // if (Context.hasConnection())
        if (this.hasConnection())
            this.clearConnection();
            // Context.clearConnection();

        // DOMElement.output['_PATH_'] = null;
        outputPath = null;

        if (treeviewRow !== null) {
            if (treeviewRow.hasOwnProperty('_CONTEXT_')) {
                treeviewRow['_CONTEXT_'] = null;
                delete treeviewRow['_CONTEXT_'];
            }
            treeviewRow = null;
        }
        //treeviewRow.parentNode.removeChild(treeviewRow);

        const card = MacroContext.getFromCardsMap(CardContext);
        if (remove)
            card.removeFromFieldMap(props.uuid);
            // CardContext.removeFromFieldMap(props.uuid);

        const visibilityFields = props['visibility']['fields'];
        for (const status in visibilityFields) 
            visibilityFields[status].clear();

        // MacroContext.deleteFromVisibility(Context);
        MacroContext.deleteFromVisibility(this);

        for (const element in DOMElement) {
            DOMElement[element].parentNode.removeChild(DOMElement[element]);
            DOMElement[element] = null;

            delete DOMElement[element];
        }
        // DOMElement.item.parentNode.removeChild(DOMElement.item);

        if (remove)
            MacroContext.redraw(card);
            // MacroContext.redraw(CardContext);

    }

    this.initVisibility = function(fields_map) {
        for (const status in props['visibility']['fields']) {
            const clone = [...props['visibility']['fields'][status]];

            props['visibility']['fields'][status] = new Map();
            for (const id of clone) {
                if (fields_map.has(id))
                    props['visibility']['fields'][status].set(id, fields_map.get(id));
                else 
                    console.log(`Field initVisibility error: not found id: ${id}`);
            }   
        }

        // if (Context.hasConnection())
        if (this.hasConnection())
            outputConnection.initVisibility(fields_map);
            // output['_CONNECTION_'].initVisibility(fields_map);

        _updateVisibilityCounter();
    };
    this.setVisibilityMode = function() {
        const description = DOMElement.description,
              item = DOMElement.item;

        if (MacroContext.getVisibilityMode()) {
            item.classList.add('visibility');
            description.setAttribute('readonly', true);
            // container.style.pointerEvents = 'none';

            if (!isCurrentSelectObject)
                DOMElement.visibility.style.visibility = 'hidden';
            else
                item.appendChild(MacroContext.getSelectedArrow());

            item.addEventListener('click', _toggleVisibility, { capture: false });

            item.addEventListener('mouseenter', _showVisibilityTools, { capture: false });
            item.addEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        } else {            
            item.classList.remove('visibility');
            description.removeAttribute('readonly');
            // container.style.removeProperty('pointer-events');

            if (isCurrentSelectObject)
                item.removeChild(MacroContext.getSelectedArrow());

            _updateVisibilityCounter();
            _removeVisibilityStyle();

            item.removeEventListener('click', _toggleVisibility, { capture: false });

            item.removeEventListener('mouseenter', _showVisibilityTools, { capture: false });
            item.removeEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        }
    };
    this.addToVisibility = function(field, status) {
        props['visibility']['fields'][status].set(field.getProps('uuid'), field);
        _updateVisibilityCounter();
    };
    this.deleteFromVisibility = function(uuid) {
        const visibilityFields = props['visibility']['fields'];
        for (const status in visibilityFields) 
            visibilityFields[status].delete(uuid);

        _updateVisibilityCounter();
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.setOrder = function(order) {
        props.order = order;
        DOMElement.index.textContent = order;
    };
    this.setFocus = function() { DOMElement.description.focus(); };
    this.toggleExpand = function(icon) {
        props.expanded = !props.expanded;

        if (props.expanded) {
            icon.style.transform = 'rotate(90deg)';
        } else {
            icon.style.removeProperty('transform');
        }

        // if (Context.hasConnection())
        if (this.hasConnection())
            outputConnection.setExpand(props.expanded);
            // output['_CONNECTION_'].setExpand(props.expanded);
    };
    this.setType = function(field_type = props.type.type) {
        const numFieldType = parseInt(field_type);
        const output = DOMElement.output;

        if (numFieldType !== _TYPES_.LIST) {
            // if (Context.hasConnection())
            if (this.hasConnection())
                this.clearConnection();
                // Context.clearConnection();

            output.classList.remove('app-cards-content-item-output');
            output.textContent = field_type;
            //output.style.display = 'none';
            output.removeEventListener('mousedown', _drag, { capture: false });
        } else {
            output.classList.add('app-cards-content-item-output');
            output.textContent = _ICON_CHAR_.OUTPUT;
            //output.style.display = 'block';
            output.addEventListener('mousedown', _drag, { capture: false });
        }
        
        props['type']['type'] = numFieldType;
        //type.textContent = field_type;

        return props['type'];
    };
    this.check = function(target, connection) {
        if (target.classList.contains('app-cards-content-input')) {
            if (connection) {
                outputPath.setAttribute('class', 'main-app-svg-path error');
            } else {
                outputPath.setAttribute('class', 'main-app-svg-path connected');
            }
        } else if (target.classList.contains('main-app-wrapper')) {
            outputPath.setAttribute('class', 'main-app-svg-path');
        } else {
            outputPath.setAttribute('class', 'main-app-svg-path error');
        }
    };
    this.getRect = function() { return DOMElement.item.getBoundingClientRect(); };
    this.getDiv = function() { return DOMElement.item; };

    this.toggleVisibility = function() { _toggleVisibility(); };
    this.selectedForVisibility = function(status) { _addVisibilityStyle(status); };
    this.unselectForVisibility = function() { _removeVisibilityStyle(); };

    this.evictTreeviewRow = function() { treeviewRow = null; };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function init () {
        const fragment = document.createDocumentFragment();

        if (__properties !== null)
            props = {...props, ...__properties};

        if (props.uuid === null) {
            props.uuid = UUIDv4();

            const visibilityFields = props['visibility']['fields'];
            for (const status in visibilityFields) 
                visibilityFields[status] = new Map();
        }

        DOMElement.item = addElement(fragment, 'div', 'app-cards-content-item');
        DOMElement.container = addElement(DOMElement.item, 'div', 'app-cards-content-item-container');
        DOMElement.index = addElement(DOMElement.container, 'div', 'app-cards-content-item-index', props.order);

        DOMElement.description = addElement(DOMElement.container, 'input');
        DOMElement.description.setAttribute('type', 'text');
        DOMElement.description.setAttribute('maxlength', '64');
        DOMElement.description.setAttribute('value', props.text);
        DOMElement.description.setAttribute('tabindex', props.tab);
        
        DOMElement.description.addEventListener('keyup', _keypress, { capture: false });
        DOMElement.description.addEventListener('focus', _showProperties, { capture: false });

        delete props.tab;

        DOMElement.visibility = addElement(DOMElement.container, 'div', 'app-cards-content-item-visibility');

        DOMElement.visibility.addEventListener('mouseenter', _previewVisibility, { capture: false });
        DOMElement.visibility.addEventListener('mouseleave',  _previewVisibility, { capture: false });
        
        DOMElement.output = addElement(DOMElement.item, 'div', 'icon app-cards-content-item-output', _ICON_CHAR_.OUTPUT);
        // DOMElement.output['_PATH_'] = null;
        // output['_CONNECTION_'] = null;

        __append.appendChild(fragment);
        
        // Context.setType();
        this.setType();

        if (RootField)
            this.setColor(props.color ?? _COLORS_.BLACK);
            // Context.setColor(props.color ?? _COLORS_.BLACK);
    }).call(this);
}