'use strict';

import { _QUADRATIC_CURVE_OFFSET_, _DRAG_, _MOV_, _COLORS_, _TYPES_, _STATUS_, _VISIBILITY_, _ICON_CHAR_, _ORDER_, _KEY_CODE_ } from '../utils/constants.js';
import { _I18N_ } from './../i18n/pt-br.js';
import { addElement } from '../utils/functions.js';

export default function Field(ctx, append, properties) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const main = ctx.getMain(), 
          parent = ctx, 
          context = this, 
          rootField = ctx.isRoot();

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
                    visible: [],
                    hidden:  []
                }
            },
            expanded: true,

            tail: { x: 0, y: 0 }
        },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _deep = function(tab) {
        let counter, result = '';
        for (counter=0; counter<tab.length; counter++) {
            result += tab[counter];
            if (counter < tab.length-1) result += '.';
        }
        return result;
    },
    _color = function(drag, color = null) {
        if (color !== null) {
            if (!drag) {
                if (context.hasConnection()) {
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

        if (main.getVisibilityMode())
            return;

        if (context.hasConnection()) {
            context.clearConnection();
            main.serialize();
        }

        if (output['_PATH_'] === null) 
            output['_PATH_'] = main.newSVG(context);
        
        output['_PATH_'].setAttribute('visibility', 'visible');

        context.setDragType(_DRAG_.OUTPUT);
        main.dragStart(evnt, context); 
    },
    //_remove = function () { output.removeEventListener('mousedown', _drag, { capture: false }); },
    _render = function (endLeft, endTop, mov) {

        let offsetLine, offset = _QUADRATIC_CURVE_OFFSET_;

        const elements = output['_PATH_'].children,
              startX   = position.left + 17,
              startY   = position.top  + 11;
        
        if (dragType !== _DRAG_.LINE) {
            if (props.line === undefined) {
                offsetLine = ((endLeft - position.left) / 2) - 17/2;
            } else {
                offsetLine = props.line;
            }

            if (mov === _MOV_.END) endTop += 15;
        } else {
            offsetLine = endLeft - startX;
            endLeft = props.tail.x;
            endTop  = props.tail.y;

            if (mov === _MOV_.END) props.line = offsetLine;
        }

        const startXEnd = startX + offsetLine,
                  diffY = Math.abs(startY - endTop),
                  diffX = Math.abs(startXEnd - endLeft),
                  diffZ = Math.abs(startX - startXEnd);

        if (diffY < (_QUADRATIC_CURVE_OFFSET_ * 2) || 
            diffX < (_QUADRATIC_CURVE_OFFSET_ * 2) || 
            diffZ < (_QUADRATIC_CURVE_OFFSET_ * 2)) {

            offset = Math.min(diffY, diffX, diffZ);
            offset /= 2;
        }

        const y1 = (startY > endTop) ? startY - offset : startY + offset,
              y2 = (startY > endTop) ? endTop + offset : endTop - offset;

        const d = {
            M0: { x: startX, y: startY },                                        //  MOVE TO - M x y
            H0: { x: startXEnd - (startX > startXEnd ? offset * -1 : offset) },  //  HORIZONTAL LINE - H x
            Q0: { x1: startXEnd, y1: startY, x: startXEnd, y: y1 },              //  QUADRATIC CURVE - Q x1 y1, x y

            M1: { x: startXEnd, y: y2 },
            Q1: { x1: startXEnd, y1: endTop, x: startXEnd + (startXEnd > endLeft ? offset * -1 : offset), y: endTop },
            H1: { x: endLeft }
        };

        elements[0].setAttribute('d', 'M ' +d.M0.x+ ' ' +d.M0.y+ ' H ' +d.H0.x+ ' Q ' +d.Q0.x1+ ' ' +d.Q0.y1+ ', ' +d.Q0.x+ ' ' +d.Q0.y+ 
                                     ' M ' +d.M1.x+ ' ' +d.M1.y+ ' Q ' +d.Q1.x1+ ' ' +d.Q1.y1+ ', ' +d.Q1.x+ ' ' +d.Q1.y+ ' H ' +d.H1.x);

        elements[1].setAttribute('x1', startXEnd);
        elements[1].setAttribute('y1', y1);
        elements[1].setAttribute('x2', startXEnd);
        elements[1].setAttribute('y2', y2);

        if (mov === _MOV_.END) {
            props.tail.x = endLeft;
            props.tail.y = endTop;
        }
    },
    _keypress = function(evnt) {
        let key = evnt.keyCode || evnt.which;

        switch (key) {
            case _KEY_CODE_.ENTER:
                const value = description.value;
                if (value !== '') {
                    const next = item.nextElementSibling;
                    if (next === null) 
                        parent.addField();
                    
                }
                break;
        }
        _refresh();
    },
    _refresh = function() {
        const value = description.value;

        if (context.hasConnection())
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
    _showProperties = function() { main.showProperties(context); },
    _showVisibilityTools = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              tool = main.getVisibilityTool();

        switch (evnt.type) {
            case 'mouseenter':
                tool.show(context);
                break;

            case 'mouseleave':
                tool.hide(context);
                break;
        }
    },
    _previewVisibility = function(evnt) { main.previewVisibility(props['visibility']['fields'], evnt.type); },
    // _toggleVisibility = function() {
    //     const object = main.getSelectedObject();

    //     _selectedForVisibility();
    //     object.addToVisibility(context);

    //     _unselectForVisibility();
    //     object.removeFromVisibility(context);

    // },
    _selectedForVisibility = function(status) {
        let color = context.getColor();
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

        if (!rootField)
            treeviewRow.style.removeProperty('color');
        else 
            treeviewRow.style.color = context.getColor();

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
        if (output['_PATH_'] === null) output['_PATH_'] = main.newSVG(context);

        output['_PATH_'].setAttribute('class', 'main-app-svg-path linked');
        output['_CONNECTION_'] = card;

        card.makeConnection(context);
        _refresh();

        //expanded = true;

        const color = context.getColor();
        context.setColor(color);
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

        if (context.hasConnection()) {
            output['_CONNECTION_'].clearConnection();
            output['_CONNECTION_'] = null;
        }
        context.setColor(null);
    };
    this.redraw = function(transform) {
        if (context.hasConnection()) {
            const rect = output['_CONNECTION_'].getInputBounding();
            context.setPosition(rect.left, rect.top, transform, _MOV_.END);
        }
    };
    this.setPosition = function(left, top, transform, mov) {
        if (dragType === _DRAG_.OUTPUT) {
            if (mov === _MOV_.START) {
                /*if (context.hasConnection()) {
                    context.clearConnection();
                    main.serialize();
                }*/
                const color = context.getColor();
                _color(true, color);
            }
        }

        if (mov === _MOV_.START || mov === _MOV_.END) {
            const rect = output.getBoundingClientRect();
            position.left = (rect.left - transform.left) / transform.scale;
            position.top = (rect.top - transform.top) / transform.scale;
        }
        
        const endLeft = (left - transform.left) / transform.scale,
              endTop = (top - transform.top) / transform.scale;

        _render(endLeft, endTop, mov);
    };
    this.setColor = function(color) { 
        if (rootField && color !== null) {
            for (const color_idx in _COLORS_) {
                if (_COLORS_[color_idx] === color) {
                    props.color = color_idx;
                    break;
                }
            }

            item.style.outlineColor = color;
        }

        _color(false, color);

        if (context.hasConnection())
            output['_CONNECTION_'].setColor(color);
    };
    this.getColor = function() {
        if (rootField /*&& props.color != null*/) {
            return _COLORS_[props.color];
        } else {
            return parent.getColor();
        }
    };
    this.infiniteLoop = function(target) {
        if (rootField) {
            return false;
        } else {
            return parent.infiniteLoop(target);
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

        if (rootField) properties.color = props.color;
        treeviewDeep = properties.tab.length;

        hasChild = context.hasConnection();

        deepSize = properties.tab.length;
        if (hasChild || rootField) deepSize++;

        //fragment.appendChild(treeviewRow);
        //treeviewRow.classList = deep+ ' main-app-treeview-row';
        //props['prefix']['id'] = _deep(properties.tab);
        props['id'] = _deep(properties.tab);

        treeviewRow = addElement(fragment, 'div', 'main-app-treeview-row');
        treeviewRow.style.gridTemplateColumns = 'repeat(' +deepSize+ ', 12px) auto 15px 15px';
        if (!properties.expand) treeviewRow.style.height = '0';
        
        treeviewRow['field_ctx'] = context;

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
        if (hasChild || rootField) {
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
        //if (rootField) fieldDiv.style.color = properties.color;

        if (rootField) treeviewRow.style.color = properties.color;
        if (hasChild || rootField) fieldDiv.style.fontWeight = '600';
        /*if ( hasChild ||  rootField) {
            fieldDiv.style.fontWeight = '600';
            treeviewRow.style.color = properties.color;
        }*/
        if (!hasChild && !rootField) fieldDiv.style.fontSize = '10px';

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
        const hasChild = context.hasConnection();

        if (!status) {
            treeviewRow.style.height = 0;
            if (hasChild)
                output['_CONNECTION_'].setExpand(status);
        } else {
            treeviewRow.style.removeProperty('height');
            if (hasChild)
                output['_CONNECTION_'].setExpand(context.getProps('expanded'));
        }
    };
    this.setBorderColor = function(light, index = null, color = null) {
        if (color === null && index === null) {
            color = (light ? context.getColor() + '40' : context.getColor());
            //if (currentVisibilityStatus && !light) color = 'white';
            index = treeviewDeep;
        } else {
            const child = treeviewRow.childNodes.item(index);
            child.style.borderLeftColor = color;
        }

        if (context.hasConnection())
            output['_CONNECTION_'].setBorderColor(light, index, color);

        //return color;
    };
    this.swap = function() {
        let sibling = item.previousElementSibling,
            parentNode = item.parentNode;

        if (sibling !== null) { 
            parentNode.insertBefore(item, sibling);

            parent.swap(props.order-1, _ORDER_.UP);
            main.redraw(parent);
        }
    };
    this.setSelected = function(isSelected) { 
        if (isSelected) {
            isCurrentSelectObject = true;

            item.classList.add('selected');

            if (!rootField) 
                item.classList.add('border-radius');

            if (context.hasConnection()) 
                output['_PATH_'].style.strokeWidth = '7px';
        } else {
            isCurrentSelectObject = false;

            item.classList.remove('selected', 'border-radius');

            if (context.hasConnection())
                output['_PATH_'].style.removeProperty('stroke-width');
        }
    };
    this.getProps = function (prop = null) {
        if (prop === null) {
            return props;
        } else if (props.hasOwnProperty(prop)) {
            return props[prop];
        }

        return null;
    };

    this.initVisibility = function(fields) {
        let sizeVisibility, counterVisibility, shortVisibility;

        for (const status in props['visibility']['fields']) {
            shortVisibility = props['visibility']['fields'][status];
            sizeVisibility = shortVisibility.length;
            for (counterVisibility = 0; counterVisibility < sizeVisibility; counterVisibility++) {
                if (typeof shortVisibility[counterVisibility] === 'string')
                shortVisibility[counterVisibility] = fields[shortVisibility[counterVisibility]];
            }
        }
        
        if (context.hasConnection())
            output['_CONNECTION_'].initVisibility(fields);

        _updateVisibilityCounter();
    };
    this.setVisibilityMode = function() {
        if (main.getVisibilityMode()) {
            item.classList.add('visibility');
            description.setAttribute('readonly', true);
            // container.style.pointerEvents = 'none';

            if (!isCurrentSelectObject)
                visibility.style.visibility = 'hidden';
            else
                item.appendChild(main.getSelectedArrow());

            // item.addEventListener('click', _toggleVisibility, { capture: false });

            item.addEventListener('mouseenter', _showVisibilityTools, { capture: false });
            item.addEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        } else {            
            item.classList.remove('visibility');
            description.removeAttribute('readonly');
            // container.style.removeProperty('pointer-events');

            if (isCurrentSelectObject)
                item.removeChild(main.getSelectedArrow());

            _updateVisibilityCounter();
            _unselectForVisibility();

            // item.removeEventListener('click', _toggleVisibility, { capture: false });

            item.removeEventListener('mouseenter', _showVisibilityTools, { capture: false });
            item.removeEventListener('mouseleave',  _showVisibilityTools, { capture: false });
        }
    };
    this.addToVisibility = function(field, status) {
        props['visibility']['fields'][status].push(field);
        _updateVisibilityCounter();
    };
    this.removeFromVisibility = function(field) {
        const removeId = field.getProps('id');
        for (const status in props['visibility']['fields']) {
            let result = props['visibility']['fields'][status].findIndex( element => element.getProps('id') === removeId);
            if (result !== -1)
                props['visibility']['fields'][status].splice(result, 1);
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

        if (context.hasConnection())
            output['_CONNECTION_'].setExpand(props.expanded);
    };
    this.setType = function(fieldType = props.type.type) { 
        const numFieldType = parseInt(fieldType);

        if (numFieldType !== _TYPES_.LIST) {
            if (context.hasConnection())
                context.clearConnection();

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
        } else {
            output['_PATH_'].setAttribute('class', 'main-app-svg-path');
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

        if (properties !== null) props = {...props, ...properties};

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

        append.appendChild(fragment);
        
        context.setType();

        if (rootField)
            context.setColor(props.color ?? _COLORS_.BLACK);
            // context.setColor((props.color !== undefined ? props.color : _COLORS_.BLACK));
    })();
}