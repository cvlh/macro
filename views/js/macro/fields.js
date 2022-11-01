'use strict';

import { _QUADRATIC_CURVE_OFFSET_, _DRAG_, _MOV_, _COLORS_, _TYPES_, _STATUS_, _VISIBILITY_, _ICON_CHAR_, _ORDER_, _KEY_CODE_ } from '../utils/constants.js';
import { _I18N_ } from './../i18n/pt-br.js';
import { addElement } from '../utils/functions.js';

export default function Field(__context, __append, __properties) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const MacroContext = __context.getMacro(), 
          CardContext = __context, 
          Context = this,

          RootField = __context.isRoot();

    // VARIABLES ///////////////////////////////////////////////////////////////
    let item, container, index, description, visibility, output, 
        dragType,
        treeviewRow = null, treeviewDeep,

        isCurrentSelectObject = false,

        position = { top: 0, left: 0 },
        props = {
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
        },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _deep = function(tab) {
        let counter, result = '';
        for (counter = 0; counter < tab.length; counter++) {
            result += tab[counter];
            if (counter < tab.length-1) result += '.';
        }

        return result;
    },
    _color = function(drag, color = null) {
        if (color !== null) {
            if (!drag) {
                if (Context.hasConnection()) {
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

            if (output['_PATH_'] !== null) 
                output['_PATH_'].style.stroke = color;
        } else {
            output.style.removeProperty('background-color');
            output.style.removeProperty('color');

            if (output['_PATH_'] !== null)
                output['_PATH_'].style.removeProperty('stroke');
        }
    },
    _drag = function (evnt) {
        evnt.preventDefault();

        if (evnt.button !== 0) 
            return;

        if (MacroContext.getVisibilityMode())
            return;

        if (Context.hasConnection()) {
            Context.clearConnection();
            MacroContext.serialize();
        }

        if (output['_PATH_'] === null) 
            output['_PATH_'] = MacroContext.newSVG(Context);
        
        output['_PATH_'].setAttribute('visibility', 'visible');

        Context.setDragType(_DRAG_.OUTPUT);
        MacroContext.dragStart(evnt, Context); 
    },
    //_remove = function () { output.removeEventListener('mousedown', _drag, { capture: false }); },
    _render = function (left, top, action) {
        let offsetLine, offset = _QUADRATIC_CURVE_OFFSET_;

        const elements = output['_PATH_'].children,
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
    _keypress = function(evnt) {
        let key = evnt.keyCode || evnt.which;

        switch (key) {
            case _KEY_CODE_.ENTER:
                evnt.preventDefault();

                const value = description.value;
                if (value !== '') {
                    const next = item.nextElementSibling;
                    if (next === null) 
                        CardContext.addField();
                    else {
                        const el = next.querySelector('input');
                        if (el !== null)
                            el.focus();
                    }
                }
                break;
        }
        _refresh();
    },
    _refresh = function() {
        const value = description.value;

        if (Context.hasConnection())
            output['_CONNECTION_'].setHeader(value);

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
    _showProperties = function() { MacroContext.showProperties(Context); },
    _showVisibilityTools = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              tool = MacroContext.getVisibilityTool();

        switch (evnt.type) {
            case 'mouseenter':
                tool.show(Context);
                break;

            case 'mouseleave':
                tool.hide(Context);
                break;
        }
    },
    _previewVisibility = function(evnt) { MacroContext.previewVisibility(props['visibility']['fields'], evnt.type); },
    // _toggleVisibility = function() {
    //     const object = MacroContext.getSelectedObject();

    //     _selectedForVisibility();
    //     object.addToVisibility(Context);

    //     _unselectForVisibility();
    //     object.removeFromVisibility(Context);

    // },
    _selectedForVisibility = function(status) {
        let color = Context.getColor();
        if (color !== null)
            color += 'BB';
        else
            color = '#7A7A7A';

        // _unselectForVisibility();

        treeviewRow.style.outline = 'none';
        treeviewRow.style.backgroundColor = color;
        treeviewRow.style.color = 'var(--white)';

        const path = treeviewRow.querySelector('.field');

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
        
        item.style.color = color;
    },
    _unselectForVisibility = function() {
        treeviewRow.style.removeProperty('outline');
        treeviewRow.style.removeProperty('background-color');

        if (!RootField)
            treeviewRow.style.removeProperty('color');
        else 
            treeviewRow.style.color = Context.getColor();

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

        item.style.removeProperty('color');
    },
    _updateVisibilityCounter = function() {
        const visibilityFields = props['visibility']['fields'],
              visibilitySize   = visibilityFields['visible'].length + visibilityFields['hidden'].length;

        if (visibilitySize) 
            visibility.style.visibility = 'visible';
        else 
            visibility.style.removeProperty('visibility');
        
        visibility.textContent = visibilitySize;
    };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.setDragType = function(type) { dragType = type; };
    this.getDragType = function() { return dragType; };
    this.hasConnection = function() { 
        if (output['_CONNECTION_'] !== null)
            return true;
    
        return false;
    };
    this.makeConnection = function(card) {
        output.classList.remove('connected');
        //output.classList.add('linked');

        //output['_PATH_'].setAttribute('class', 'linked');
        if (output['_PATH_'] === null) output['_PATH_'] = MacroContext.newSVG(Context);

        output['_PATH_'].setAttribute('class', 'main-app-svg-path linked');
        output['_CONNECTION_'] = card;

        card.makeConnection(Context);
        _refresh();

        //expanded = true;

        const color = Context.getColor();
        Context.setColor(color);
    };
    this.clearConnection = function() {
        const elements = output['_PATH_'].children;

        output.classList.remove('linked', 'error');
        output['_PATH_'].setAttribute('class', 'main-app-svg-path');
        output['_PATH_'].setAttribute('visibility', 'hidden');
        output['_PATH_'].removeAttribute('style');
        
        elements[0].removeAttribute('d');

        elements[1].removeAttribute('x1');
        elements[1].removeAttribute('y1');
        elements[1].removeAttribute('x2'); 
        elements[1].removeAttribute('y2');

        delete props.line;

        props.tail.x = 0;
        props.tail.y = 0;

        if (Context.hasConnection()) {
            output['_CONNECTION_'].clearConnection();
            output['_CONNECTION_'] = null;
        }

        Context.setColor(null);
    };
    this.redraw = function(transform) {
        if (Context.hasConnection()) {
            const rect = output['_CONNECTION_'].getInputBounding();
            Context.setPosition(rect.left, rect.top, transform, _MOV_.END);
        }
    };
    this.setPosition = function(left, top, transform, action) {
        if (dragType === _DRAG_.OUTPUT) {
            if (action === _MOV_.START) {
                /*if (Context.hasConnection()) {
                    Context.clearConnection();
                    MacroContext.serialize();
                }*/
                const color = Context.getColor();
                _color(true, color);
            }
        }

        if (action === _MOV_.START || action === _MOV_.END) {
            const rect = output.getBoundingClientRect();
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

            item.style.outlineColor = color;
        }

        _color(false, color);

        if (Context.hasConnection())
            output['_CONNECTION_'].setColor(color);
    };
    this.getColor = function() {
        if (RootField /*&& props.color != null*/) {
            return _COLORS_[props.color];
        } else {
            return CardContext.getColor();
        }
    };
    this.infiniteLoop = function(target) {
        if (RootField) {
            return false;
        } else {
            return CardContext.infiniteLoop(target);
        }
    };
    this.serialize = function (fragment, properties) {
        let counterOffset, counterVisibility,
            fieldOffset, fieldDiv, fieldPath, 
            hasChild, isExpand, deepSize, text, 
            response = {  };

        let visibilityFields = {
            visibility: {
                fields: {
                    visible: [],
                    hidden:  []
                }, 
                flags: props['visibility']['flags']
            }
        };

        for (const status in props['visibility']['fields']) {
            for (counterVisibility = 0; counterVisibility < props['visibility']['fields'][status].length; counterVisibility++)
                visibilityFields['visibility']['fields'][status].push(props['visibility']['fields'][status][counterVisibility].getProps('id'));
        }

        props.text = description.value;
        response['properties'] = { ...props, ...visibilityFields };

        if (RootField) properties.color = props.color;
        treeviewDeep = properties.tab.length;

        hasChild = Context.hasConnection();

        deepSize = properties.tab.length;
        if (hasChild || RootField) deepSize++;

        //fragment.appendChild(treeviewRow);
        //treeviewRow.classList = deep+ ' main-app-treeview-row';
        //props['prefix']['id'] = _deep(properties.tab);
        props['id'] = _deep(properties.tab);

        treeviewRow = addElement(fragment, 'div', 'main-app-treeview-row');
        treeviewRow.style.gridTemplateColumns = 'repeat(' +deepSize+ ', 12px) auto 15px 15px';
        if (!properties.expand) treeviewRow.style.height = '0';
        
        treeviewRow['_CONTEXT_'] = new WeakRef(Context);

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

        text = description.value;
        fieldDiv = addElement(treeviewRow, 'div', 'main-app-treeview-item field', text);
        if (text === '') {
            fieldDiv.textContent =  _I18N_.field_empty;
            fieldDiv.classList.add('empty');
        }

        //fieldDiv.textContent = description.value;
        //if (RootField) fieldDiv.style.color = properties.color;

        if (RootField) treeviewRow.style.color = properties.color;
        if (hasChild || RootField) fieldDiv.style.fontWeight = '600';
        /*if ( hasChild ||  RootField) {
            fieldDiv.style.fontWeight = '600';
            treeviewRow.style.color = properties.color;
        }*/
        if (!hasChild && !RootField) fieldDiv.style.fontSize = '10px';

        //fieldPath = addElement(fieldDiv, 'div', 'main-app-treeview-item-path', props['prefix']['id']);
        fieldPath = addElement(fieldDiv, 'div', 'main-app-treeview-item-path', props['id']);
        fieldPath.style.color = properties.color;

        //addElement(treeviewRow, 'div', 'icon main-app-treeview-item type', type.textContent);
        addElement(treeviewRow, 'div', 'icon main-app-treeview-item type', (props['type']['type'] ? props['type']['type'] : _ICON_CHAR_.NONE));
        addElement(treeviewRow, 'div', 'main-app-treeview-item');

        //addElement(treeviewRow, 'div');

        if (hasChild) response['output'] = output['_CONNECTION_'].serialize(fragment, properties);

        if (!isExpand) properties.expand = true;

        return response;
    };
    this.setExpand = function(status) {
        const hasChild = Context.hasConnection();

        if (!status) {
            treeviewRow.style.height = 0;
            if (hasChild)
                output['_CONNECTION_'].setExpand(status);
        } else {
            treeviewRow.style.removeProperty('height');
            if (hasChild)
                output['_CONNECTION_'].setExpand(Context.getProps('expanded'));
        }
    };
    this.setBorderColor = function(light, index = null, color = null) {
        if (color === null && index === null) {
            color = (light ? Context.getColor() + '40' : Context.getColor());
            //if (currentVisibilityStatus && !light) color = 'white';
            index = treeviewDeep;
        } else {
            const child = treeviewRow.childNodes.item(index);
            child.style.borderLeftColor = color;
        }

        if (Context.hasConnection())
            output['_CONNECTION_'].setBorderColor(light, index, color);

        //return color;
    };
    this.swap = function() {
        let sibling = item.previousElementSibling,
            parentNode = item.parentNode;

        if (sibling !== null) { 
            parentNode.insertBefore(item, sibling);

            CardContext.swap(props.order-1, _ORDER_.UP);
            MacroContext.redraw(parent);
        }
    };
    this.setSelected = function(status) { 
        if (status) {
            isCurrentSelectObject = true;

            item.classList.add('selected');

            if (!RootField) 
                item.classList.add('border-radius');

            if (Context.hasConnection()) 
                output['_PATH_'].style.strokeWidth = '7px';
        } else {
            isCurrentSelectObject = false;

            item.classList.remove('selected', 'border-radius');

            if (Context.hasConnection())
                output['_PATH_'].style.removeProperty('stroke-width');
        }
    };
    this.getProps = function(prop = null) {
        if (prop === null) {
            return props;
        } else if (props.hasOwnProperty(prop)) {
            return props[prop];
        }

        return null;
    };
    this.remove = function (remove = true) {
        description.removeEventListener('keyup', _keypress, { capture: false });
        description.removeEventListener('focus', _showProperties, { capture: false });

        visibility.removeEventListener('mouseenter', _previewVisibility, { capture: false });
        visibility.removeEventListener('mouseleave',  _previewVisibility, { capture: false });

        if (props.type.type === _TYPES_.LIST)
            output.removeEventListener('mousedown', _drag, { capture: false });

        if (MacroContext.getVisibilityMode()) {
            item.removeEventListener('mouseenter', _showVisibilityTools, { capture: false });
            item.removeEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        }

        if (Context.hasConnection())
            Context.clearConnection();

        output['_PATH_'] = null;

        treeviewRow['_CONTEXT_'] = null;
        treeviewRow.parentNode.removeChild(treeviewRow);

        if (remove)
            CardContext.removeFieldFromArray(props.order);

        item.parentNode.removeChild(item);
    }

    this.initVisibility = function(fields) {        
        for (const status in props['visibility']['fields']) {
            const clone = [...props['visibility']['fields'][status]];

            props['visibility']['fields'][status] = [];
            for (const id of clone) 
                props['visibility']['fields'][status].push(fields[id]);
        }

        if (Context.hasConnection())
            output['_CONNECTION_'].initVisibility(fields);

        _updateVisibilityCounter();
    };
    this.setVisibilityMode = function() {
        if (MacroContext.getVisibilityMode()) {
            item.classList.add('visibility');
            description.setAttribute('readonly', true);
            // container.style.pointerEvents = 'none';

            if (!isCurrentSelectObject)
                visibility.style.visibility = 'hidden';
            else
                item.appendChild(MacroContext.getSelectedArrow());

            // item.addEventListener('click', _toggleVisibility, { capture: false });

            item.addEventListener('mouseenter', _showVisibilityTools, { capture: false });
            item.addEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        } else {            
            item.classList.remove('visibility');
            description.removeAttribute('readonly');
            // container.style.removeProperty('pointer-events');

            if (isCurrentSelectObject)
                item.removeChild(MacroContext.getSelectedArrow());

            _updateVisibilityCounter();
            _unselectForVisibility();

            // item.removeEventListener('click', _toggleVisibility, { capture: false });

            item.removeEventListener('mouseenter', _showVisibilityTools, { capture: false });
            item.removeEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        }
    };
    this.addToVisibility = function(field, status) {
        //props['visibility']['fields'][status].push(field);
        props['visibility']['fields'][status].add(field);
        _updateVisibilityCounter();
    };
    this.removeFromVisibility = function(field) {
        // const removeId = field.getProps('id');
        // for (const status in props['visibility']['fields']) {
        //     let result = props['visibility']['fields'][status].findIndex( element => element.getProps('id') === removeId);
        //     if (result !== -1)
        //         props['visibility']['fields'][status].splice(result, 1);
        // }
        for (const status in props['visibility']['fields']) {
            if (props['visibility']['fields'][status].has(field))
                props['visibility']['fields'][status].delete(field);
        }
        _updateVisibilityCounter();
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.setOrder = function(order) {
        props.order = order;
        index.textContent = order;
    };
    this.setFocus = function() { description.focus(); };
    this.toggleExpand = function(icon) { 
        props.expanded = !props.expanded;

        if (props.expanded) {
            icon.style.transform = 'rotate(90deg)';
        } else {
            icon.style.removeProperty('transform');
        }

        if (Context.hasConnection())
            output['_CONNECTION_'].setExpand(props.expanded);
    };
    this.setType = function(fieldType = props.type.type) { 
        const numFieldType = parseInt(fieldType);

        if (numFieldType !== _TYPES_.LIST) {
            if (Context.hasConnection())
                Context.clearConnection();

            output.classList.remove('app-cards-content-item-output');
            output.textContent = fieldType;
            //output.style.display = 'none';
            output.removeEventListener('mousedown', _drag, { capture: false });
        } else {
            output.classList.add('app-cards-content-item-output');
            output.textContent = _ICON_CHAR_.OUTPUT;
            //output.style.display = 'block';
            output.addEventListener('mousedown', _drag, { capture: false });
        }
        
        props['type']['type'] = numFieldType;
        //type.textContent = fieldType;

        return props['type'];
    };
    this.check = function(target) {
        if (target.classList.contains('app-cards-content-input')) {
            if (target['_CONNECTION_'] !== null) {
                output['_PATH_'].setAttribute('class', 'main-app-svg-path error');
            } else {
                output['_PATH_'].setAttribute('class', 'main-app-svg-path connected');
            }
        } else if (target.classList.contains('main-app-wrapper')) {
            output['_PATH_'].setAttribute('class', 'main-app-svg-path');
        } else {
            output['_PATH_'].setAttribute('class', 'main-app-svg-path error');
        }
    };
    this.getRect = function() { return item.getBoundingClientRect(); };
    this.getDiv = function() { return item; };

    // this.toggleVisibility = function() { _toggleVisibility(); };
    this.selectedForVisibility = function(status) { _selectedForVisibility(status); };
    this.unselectForVisibility = function() { _unselectForVisibility(); };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        const fragment = document.createDocumentFragment();

        if (__properties !== null)
            props = {...props, ...__properties};

        item = addElement(fragment, 'div', 'app-cards-content-item');

        container = addElement(item, 'div', 'app-cards-content-item-container');

        index = addElement(container, 'div', 'app-cards-content-item-index', props.order);

        description = addElement(container, 'input');
        description.setAttribute('type', 'text');
        description.setAttribute('maxlength', '64');
        description.setAttribute('value', props.text);
        description.setAttribute('tabindex', props.tab);
        
        description.addEventListener('keyup', _keypress, { capture: false });
        description.addEventListener('focus', _showProperties, { capture: false });

        delete props.tab;

        visibility = addElement(container, 'div', 'app-cards-content-item-visibility');

        visibility.addEventListener('mouseenter', _previewVisibility, { capture: false });
        visibility.addEventListener('mouseleave',  _previewVisibility, { capture: false });
        
        output = addElement(item, 'div', 'icon app-cards-content-item-output', _ICON_CHAR_.OUTPUT);
        output['_PATH_'] = null;
        output['_CONNECTION_'] = null;

        __append.appendChild(fragment);
        
        Context.setType();

        if (RootField)
            Context.setColor(props.color ?? _COLORS_.BLACK);
    })();
}