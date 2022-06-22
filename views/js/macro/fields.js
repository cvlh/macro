'use strict';

import { _DRAG_, _MOV_, _COLORS_, _TYPES_, _VISIBILITY_, _ICON_CHAR_, _ORDER_, _QUADRATIC_CURVE_OFFSET_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

export default function Field(ctx, append, properties) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const main = ctx.getMain(), 
          parent = ctx, 
          context = this, 
          rootField = ctx.isRoot();

    // VARIABLES ///////////////////////////////////////////////////////////////
    let item, index, description, output, visibility,
        dragType,
        treeviewRow = null, treeviewDeep,
        isSelectedForvisibility = false,
        position = { top: 0, left: 0 },

        props = {
            id: null,
            text: '',
            type: { type: _TYPES_.LIST },
            order: 0,
            visibility: {
                flags: _VISIBILITY_.FRESH | _VISIBILITY_.INSTANT,
                fields: []
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
                    output.style.color = 'var(--main-background)';
                } else {
                    output.style.removeProperty('background-color');
                    output.style.removeProperty('color');
                }
            } else {
                output.style.backgroundColor = color;
                output.style.color = 'var(--main-background)';
            }

            if (output['_PATH_'] !== null) output['_PATH_'].style.stroke = color;
        } else {
            output.style.removeProperty('background-color');
            output.style.removeProperty('color');

            if (output['_PATH_'] !== null) output['_PATH_'].style.removeProperty('stroke');
        }
    },
    _drag = function (evnt) { 
        evnt.preventDefault();

        if (main.getVisibilityMode()) return;

        if (context.hasConnection()) {
            context.clearConnection();

            main.serialize();
        }

        if (output['_PATH_'] === null) output['_PATH_'] = main.newSVG(context);
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
    _refresh = function() {
        const value = description.value;
        if (context.hasConnection()) output['_CONNECTION_'].setHeader(value);

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
    _previewVisibility = function(evnt) { main.previewVisibility(props['visibility']['fields'], evnt.type); },
    _toggleVisibility = function() {
        const object = main.getSelectedObject();

        if (!isSelectedForvisibility) {
            object.addToVisibility(context);
        } else {
            object.removeFromVisibility(context);
        }
    },
    _selectedForVisibility = function() {
        const color = context.getColor() + 'CC';

        treeviewRow.style.outline = 'none';
        treeviewRow.style.backgroundColor = color;
        treeviewRow.style.color = '#ffffff';

        description.style.backgroundColor = color;
        description.style.borderColor = color;
        description.style.color = '#ffffff';
        description.style.boxShadow = '#E0E0E0 0 0 2px 2px';

        item.style.color = color;
        item.style.opacity = '1';

        isSelectedForvisibility = true;
    },
    _unselectForVisibility = function() {
        treeviewRow.style.removeProperty('outline');
        treeviewRow.style.removeProperty('background-color');
        if (!rootField) {
            treeviewRow.style.removeProperty('color');
        } else {
            treeviewRow.style.color = context.getColor();
        }

        description.style.removeProperty('background-color');
        description.style.removeProperty('border-color');
        description.style.removeProperty('color');
        description.style.removeProperty('box-shadow');

        item.style.removeProperty('color');
        item.style.removeProperty('opacity');

        isSelectedForvisibility = false;
    },
    _updateVisibilityCounter = function() {
        const size = props['visibility']['fields'].length;

        if (size) {
            visibility.style.display = 'block';
        } else {
            visibility.style.removeProperty('display');
        }
        
        visibility.textContent = size;
    };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.setDragType = function(type) { dragType = type; };
    this.getDragType = function() { return dragType; };
    this.hasConnection = function() { 
        if (output['_CONNECTION_'] !== null) {
            return true;
        }
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
            props.color = color;
            description.style.outlineColor = color;
        }

        _color(false, color);

        if (context.hasConnection()) {
            output['_CONNECTION_'].setColor(color);
        }
    };
    this.getColor = function() {
        if (rootField /*&& props.color != null*/) {
            return props.color;
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
        let counterOffset, 
            fieldOffset, fieldDiv, fieldPath, 
            hasChild, isExpand, deepSize, text, 
            counterVisibility, visibilityFields,
            response = {  };

        visibilityFields = { 'visibility' : { 'fields': [], 'flags': props['visibility']['flags']}};
        for (counterVisibility=0; counterVisibility<props['visibility']['fields'].length; counterVisibility++) {
            //if (typeof props['visibility']['fields'][counterVisibility] === Field) {
            visibilityFields['visibility']['fields'].push(props['visibility']['fields'][counterVisibility].getProps('id'));
            //}
        }
        visibilityFields['visibility']['fields'].sort();
        props.text = description.value;
        response['properties'] = { ...props, ...visibilityFields };

        if (rootField) properties.color = props.color;
        treeviewDeep = properties.tab.length;

        //lightColor = properties.color + '40';

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

        for (counterOffset=0; counterOffset<properties.tab.length; counterOffset++) {
            fieldOffset = addElement(treeviewRow, 'div', 'main-app-treeview-item');
            if (counterOffset > 0) fieldOffset.style.borderLeftColor = properties.color + '40';
        }
        if (hasChild || rootField) {
            if (hasChild) {
                fieldOffset.classList.add('expand');
                fieldOffset = addElement(fieldOffset, 'div', 'icon', _ICON_CHAR_.ARROW);
                if (properties.expand || props.expanded) fieldOffset.style.transform = 'rotate(90deg)';
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

        addElement(treeviewRow, 'div');

        if (hasChild) response['output'] = output['_CONNECTION_'].serialize(fragment, properties);

        if (!isExpand) properties.expand = true;

        return response;
    };
    this.setExpand = function(status) {
        const hasChild = context.hasConnection();

        if (!status) {
            treeviewRow.style.height = 0;
            if (hasChild) output['_CONNECTION_'].setExpand(status);
        } else {
            treeviewRow.style.removeProperty('height');
            if (hasChild) output['_CONNECTION_'].setExpand(context.getProps('expanded'));
        }
    };
    this.setBorderColor = function(light, index = null, color = null) {
        if (color === null && index === null) {
            color = (light ? context.getColor() + '40' : context.getColor());
            //if (isSelectedForvisibility && !light) color = 'white';
            index = treeviewDeep;
        } else {
            const child = treeviewRow.childNodes.item(index);
            child.style.borderLeftColor = color;
        }

        if (context.hasConnection()) {
            output['_CONNECTION_'].setBorderColor(light, index, color);
        }
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
    this.setSelected = function(selected) { 
        if (selected) {
            item.classList.add('selected');
            if (context.hasConnection()) output['_PATH_'].style.strokeWidth = '7px';
        } else {
            item.classList.remove('selected');
            if (context.hasConnection()) output['_PATH_'].style.removeProperty('stroke-width');
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
        const sizeVisibility = props['visibility']['fields'].length;

        for (let counterVisibility = 0; counterVisibility < sizeVisibility; counterVisibility++) {
            if (typeof props['visibility']['fields'][counterVisibility] === 'string')
                props['visibility']['fields'][counterVisibility] = fields[props['visibility']['fields'][counterVisibility]];
        }
        
        if (context.hasConnection())
            output['_CONNECTION_'].initVisibility(fields);

        _updateVisibilityCounter();
    };
    this.setVisibilityMode = function() {
        if (main.getVisibilityMode()) {
            item.classList.add('visibility');
            description.setAttribute('disabled', true);
            item.addEventListener('click', _toggleVisibility, { capture: false });
        } else {            
            item.classList.remove('visibility');
            description.removeAttribute('disabled');
            item.removeEventListener('click', _toggleVisibility, { capture: false });

            _unselectForVisibility();
        }
    };
    this.addToVisibility = function(field) {
        props['visibility']['fields'].push(field);
        field.selectedForVisibility();

         _updateVisibilityCounter();
    };
    this.removeFromVisibility = function(field) {
        const removeId = field.getProps('id');
        let counter, currentId;

        for (counter = 0; counter < props['visibility']['fields'].length; counter++) {
            currentId = props['visibility']['fields'][counter].getProps('id');
            if (removeId === currentId) {
                props['visibility']['fields'].splice(counter, 1); 
                field.unselectForVisibility();

                _updateVisibilityCounter();
                return;
            }
        }

        console.log('FATAL ERROR - REMOVE FAILED! ' +removeId);
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

        if (context.hasConnection()) {
            output['_CONNECTION_'].setExpand(props.expanded);
        }
    };
    this.setType = function(fieldType = props.type.type) { 
        const numFieldType = parseInt(fieldType);

        if (numFieldType !== _TYPES_.LIST) {
            if (context.hasConnection()) context.clearConnection();

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
                //output['_PATH_'].setAttribute('class', 'error');
                //target.style.cursor = 'no-drop'; //'not-allowed';
            } else {
                output['_PATH_'].setAttribute('class', 'main-app-svg-path connected');
                //output['_PATH_'].setAttribute('class', 'connected');
                //target.style.removeProperty('cursor');
            }
        } else {
            output['_PATH_'].setAttribute('class', 'main-app-svg-path');
            //output['_PATH_'].removeAttribute('class');
            //target.style.removeProperty('cursor');
        }
    };
    this.getRect = function () { return item.getBoundingClientRect(); };

    this.toggleVisibility = function() { _toggleVisibility(); };
    this.selectedForVisibility = function() { _selectedForVisibility(); };
    this.unselectForVisibility = function() { _unselectForVisibility(); };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        const fragment = document.createDocumentFragment();

        if (properties !== null) props = {...props, ...properties};

        item = addElement(fragment, 'div', 'app-cards-content-item');
        //item.setAttribute('draggable', true);

        index = addElement(item, 'div', 'app-cards-content-item-index', props.order);

        const div = addElement(item, 'div');
        div.style.position = 'relative';

        //description = addElement(item, 'input', 'app-cards-content-item-description');
        description = addElement(div, 'input');
        description.setAttribute('type', 'text');
        description.setAttribute('maxlength', '64');
        description.setAttribute('value', props.text);
        description.setAttribute('tabindex', props.tab);
        
        description.addEventListener('keyup', _refresh, { capture: false });
        description.addEventListener('focus', _showProperties, { capture: false });

        delete props.tab;

        visibility = addElement(div, 'div', 'app-cards-content-item-visibility');

        visibility.addEventListener('mouseover', _previewVisibility, { capture: false });
        visibility.addEventListener('mouseout',  _previewVisibility, { capture: false });

        //addElement(visibility, 'div', 'icon', 'V');
        //addElement(visibility, 'span');
        //type.addEventListener('click', _remove, { once: true, capture: false });
        
        output = addElement(item, 'div', 'icon app-cards-content-item-output', _ICON_CHAR_.OUTPUT);
        //output['_PATH_'] = main.newSVG(context);
        output['_PATH_'] = null;
        output['_CONNECTION_'] = null;
        //output.addEventListener('mousedown', _drag, { capture: false });

        append.appendChild(fragment);
        
        //description.value = props.text;
        //index.textContent = props.id;
        context.setType();

        if (rootField) context.setColor((props.color !== undefined ? props.color : _COLORS_.BLACK));
    })();
}