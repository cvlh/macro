'use strict';

import { _DRAG_, _MOV_, _COLORS_, _TYPES_, _VISIBILITY_, _ICON_CHAR_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

export default function Field(ctx, append) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const main = ctx.getMain(), parent = ctx, context = this, 
          rootField = ctx.isRoot();

    // VARIABLES ///////////////////////////////////////////////////////////////
    let item, index, description, output, type,
        treeviewRow = null, treeviewDeep,
        visibilityReferenceCounter = 0,
        position = { top: 0, left: 0 },

        props = {
            prefix: { id: null },
            //info: '',
            //help: '',

            type: { type: _TYPES_.LIST },
            visibility: {
                flags: _VISIBILITY_.FRESH | _VISIBILITY_.INSTANT,
                fields: []
            },

            expanded: true
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

            output['_PATH_'].style.stroke = color;
        } else {
            output.style.removeProperty('background-color');
            output.style.removeProperty('color');

            output['_PATH_'].style.removeProperty('stroke');
        }
    },
    _drag = function (evnt) { 
        if (main.getVisibilityMode()) return;

        evnt.preventDefault();
        main.dragStart(evnt, context); 
    },
    //_remove = function () { output.removeEventListener('mousedown', _drag, { capture: false }); },
    _render = function (endLeft, endTop, mov) {
        const OFFSET = 25;

        const startX = position.left+17,
              startY = position.top+11;

        const endX = (endLeft) - OFFSET;

        let endY = endTop;
        if (mov === _MOV_.END) endY += 14;

        output['_PATH_'].setAttribute('d', 'M' +startX+ ' ' +startY+ ' h ' +OFFSET+ ' L ' +endX+ ' ' +endY+ ' h ' +OFFSET) ;
        
        /*if (startX === (endX - OFFSET) || startY === endY) {
            console.log(startX +' '+ endX);
            console.log(startY +' '+ endY);
        }*/
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
    _setVisibility = function() {
        if (main.getVisibilityMode()) {
            const color = context.getColor();

            description.style.backgroundColor = color;
            description.style.color = '#ffffff';
            description.style.boxShadow = '#E0E0E0 0 0 2px 2px';

            item.style.color = color;
            item.style.opacity = '1';
        } else {
            description.style.removeProperty('background-color');
            description.style.removeProperty('color');
            description.style.removeProperty('box-shadow');

            item.style.removeProperty('color');
            item.style.removeProperty('opacity');
        }
    };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.getDragType = function() { return _DRAG_.OUTPUT };
    this.hasConnection = function() { 
        if (output['_CONNECTION_'] !== null) {
            return true;
        }
        return false;
    };
    this.makeConnection = function(card) {
        output.classList.remove('connected');
        //output.classList.add('linked');

        output['_PATH_'].setAttribute('class', 'main-app-svg-path linked');
        output['_CONNECTION_'] = card;

        card.makeConnection(context);
        _refresh();

        //expanded = true;

        const color = context.getColor();
        context.setColor(color);
    };
    this.clearConnection = function() {
        output.classList.remove('linked', 'error');

        output['_PATH_'].setAttribute('class', 'main-app-svg-path');
        output['_PATH_'].setAttribute('d', '');

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
        if (mov === _MOV_.START) {
            if (context.hasConnection()) {
                context.clearConnection();
                main.serialize();
            }
            const color = context.getColor();
            _color(true, color);
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
            hasChild, isExpand, deepSize, lightColor, text;

        //let response = { ctx: context };
        
        treeviewDeep = properties.tab.length;

        if (rootField) properties.color = props.color;
        lightColor = properties.color + '30';

        hasChild = context.hasConnection();

        deepSize = properties.tab.length;
        if (hasChild || rootField) deepSize++;

        //fragment.appendChild(treeviewRow);
        //treeviewRow.classList = deep+ ' main-app-treeview-row';
        props['prefix']['id'] = _deep(properties.tab);

        treeviewRow = addElement(fragment, 'div', 'main-app-treeview-row');
        treeviewRow.style.gridTemplateColumns = 'repeat(' +deepSize+ ', 12px) auto 15px 15px';
        if (!properties.expand) treeviewRow.style.height = '0';

        treeviewRow['_ADDLOG_'] = { 
            ctx: context, 
            color: [ lightColor, properties.color ]
        };

        isExpand = true;
        if (hasChild && !props.expanded && properties.expand) {
            properties.expand = false;
            isExpand = false;
        }

        for (counterOffset=0; counterOffset<properties.tab.length; counterOffset++) {
            fieldOffset = addElement(treeviewRow, 'div', 'main-app-treeview-item');
            if (counterOffset > 0) fieldOffset.style.borderLeftColor = lightColor;
        }
        if (hasChild || rootField) {
            if (hasChild) {
                fieldOffset.classList.add('expand');
                fieldOffset = addElement(fieldOffset, 'div', 'icon', _ICON_CHAR_.ARROW);
                if (properties.expand) fieldOffset.style.transform = 'rotate(90deg)';
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
        if ( hasChild ||  rootField) fieldDiv.style.fontWeight = '600';
        if (!hasChild && !rootField) fieldDiv.style.fontSize = '10px';

        fieldPath = addElement(fieldDiv, 'div', 'main-app-treeview-item-path', props['prefix']['id']);
        fieldPath.style.color = properties.color;

        //addElement(treeviewRow, 'div', 'icon main-app-treeview-item type', type.textContent);
        addElement(treeviewRow, 'div', 'icon main-app-treeview-item type', (props['type']['type'] ? props['type']['type'] : _ICON_CHAR_.NONE));
        addElement(treeviewRow, 'div', 'main-app-treeview-item');

        addElement(treeviewRow, 'div');

        if (hasChild) output['_CONNECTION_'].serialize(fragment, properties);

        if (!isExpand) properties.expand = true;

        return context;
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
            color = (light ? context.getColor() + '30' : context.getColor());
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
    this.setVisibilityMode = function() {
        
        if (main.getVisibilityMode()) {
            item.classList.add('visibility');
            description.setAttribute('disabled', true);
            item.addEventListener('click', _setVisibility, { capture: false });
        } else {
            _setVisibility();

            item.classList.remove('visibility');
            description.removeAttribute('disabled');
            item.removeEventListener('click', _setVisibility, { capture: false });
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.setVisibilitySelected = function(status) { 
        main.setVisibilityMode(status);

        if (status) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    };
    this.setText = function(text) { 
        //props['prefix']['text'] = text;
        description.value = text; 
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

    this.setType = function(fieldType) { 
        const numFieldType = parseInt(fieldType);

        if (numFieldType !== _TYPES_.LIST) {
            if (context.hasConnection) context.clearConnection();

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
    this.setIndex = function(idx) { index.textContent = idx; };
    this.check = function(target) {
        if (target.classList.contains('app-cards-content-input')) {
            if (target['_CONNECTION_'] !== null) {
                output['_PATH_'].setAttribute('class', 'main-app-svg-path error');
                //target.style.cursor = 'no-drop'; //'not-allowed';
            } else {
                output['_PATH_'].setAttribute('class', 'main-app-svg-path connected');
                //target.style.removeProperty('cursor');
            }
        } else {
            output['_PATH_'].setAttribute('class', 'main-app-svg-path');
            //target.style.removeProperty('cursor');
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

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        const fragment = document.createDocumentFragment();

        item = addElement(fragment, 'div', 'app-cards-content-item');
        //item.setAttribute('draggable', true);

        index = addElement(item, 'div', 'app-cards-content-item-index');

        //description = addElement(item, 'input', 'app-cards-content-item-description');
        description = addElement(item, 'input');
        description.setAttribute('type', 'text');
        description.setAttribute('maxlength', '64');
        description.addEventListener('keyup', _refresh, { capture: false });
        description.addEventListener('focus', _showProperties, { capture: false });

        type = addElement(item, 'div', 'icon app-cards-content-item-type');
        //type.addEventListener('click', _remove, { once: true, capture: false });
        
        output = addElement(item, 'div', 'icon app-cards-content-item-output', _ICON_CHAR_.OUTPUT);
        output['_PATH_'] = main.newSVGPath();
        output['_CONNECTION_'] = null;
        //output.addEventListener('mousedown', _drag, { capture: false });

        append.appendChild(fragment);

        if (rootField) context.setColor(_COLORS_.BLACK);
    })();
}