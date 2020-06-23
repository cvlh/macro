'use strict';

import { _DRAG_, _MOV_, _COLORS_, _TYPES_, _VISIBILITY_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

export default function Field(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const main = ctx.getMain(), parent = ctx, context = this, 
          rootField = ctx.isRoot();

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment, 
        item, index, description, output, remove,
        treeviewRow = null, treeviewDeep,
        visibilityMode = false, visibilityReferenceCounter = 0,
        position = { top: 0, left: 0 },

        props = {
            prefix: { id: null, text: null },
            //id: '',
            type: _TYPES_.TEXT,
            color: _COLORS_.BLACK,
            info: '',
            help: '',
            require: false,
            expanded: true,
            visibility: {
                flags: _VISIBILITY_.FRESH | _VISIBILITY_.INSTANT,
                fields: []
            }
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
       /* if (color == null) {
            color = context.getColor();
            console.log('get color ' + color);
        }*/
        //const color = context.getColor();
        //console.log('_color ' +color+ ' ' +drag);
        //if (drag) color = context.getColor();

        if (color !== null) {
            if (!drag) {
                if (context.hasConnection()) {
                    output.style.backgroundColor = color;
                } else {
                    output.style.removeProperty('background-color');
                }
            } else {
                output.style.backgroundColor = color;
            }

            output['_PATH_'].style.stroke = color;
        } else {
            output.style.removeProperty('background-color');
            output['_PATH_'].style.removeProperty('stroke');
        }
    },
    _drag = function (evnt) { 
        if (visibilityMode) return;

        evnt.preventDefault();
        main.dragStart(evnt, context); 
    },
    _remove = function () { output.removeEventListener('mousedown', _drag, { capture: false }); },
    _render = function (endLeft, endTop, mov) {
        const OFFSET = 25;

        const startX = position.left+16,
              startY = position.top+11;

        const endX = (endLeft) - OFFSET;

        let endY = endTop;
        if (mov === _MOV_.END) endY += 14;

        output['_PATH_'].setAttribute('d', 'M' +startX+ ' ' +startY+ ' h ' +OFFSET+ ' L ' +endX+ ' ' +endY+ ' h ' +OFFSET) ;
    },
    _refresh = function() {
        const value = description.value;
        if (context.hasConnection()) output['_CONNECTION_'].setHeader(value);

        if (treeviewRow !== null) {
            const path = treeviewRow.querySelector('.field');
            if (path.firstChild instanceof Text) path.firstChild.textContent = value;
        }

        props['prefix']['text'] = value;
    },
    _props = function() { main.openProperties(context); },
    _setVisibility = function() {
        description.style.backgroundColor = context.getColor();
        description.style.color = '#ffffff';
    };

    // INTERFACE ///////////////////////////////////////////////////////////////
    this.getDragType = function() { return _DRAG_.OUTPUT };
    this.getFragment = function() { return fragment; };
    this.hasConnection = function() { 
        if (output['_CONNECTION_'] !== null) {
            return true;
        }
        return false;
    };
    this.makeConnection = function(card) {
        output.classList.remove('connected');
        output.classList.add('linked');

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
            hasChild, isExpand, deepSize, deep, lightColor;

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
            fieldOffset.classList.add((hasChild ? 'expand' : 'none'));
            fieldOffset = addElement(fieldOffset, 'div');
            if (properties.expand) fieldOffset.style.transform = 'rotate(90deg)';
        }

        fieldDiv = addElement(treeviewRow, 'div', 'main-app-treeview-item field', description.value);
        //fieldDiv.textContent = description.value;
        if (rootField) fieldDiv.style.color = properties.color;
        if ( hasChild ||  rootField) fieldDiv.style.fontWeight = '600';
        if (!hasChild && !rootField) fieldDiv.style.fontSize = '10px';

        fieldPath = addElement(fieldDiv, 'div', 'main-app-treeview-item-path', props['prefix']['id']);
        fieldPath.style.color = properties.color;

        addElement(treeviewRow, 'div', 'main-app-treeview-item' + (!hasChild ? ' textbox' : ''));
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
    };
    this.setVisibilityMode = function(status) {
        visibilityMode = status;

        if (status) {
            item.classList.add('visibility');
            description.setAttribute('disabled', true);
            item.addEventListener('click', _setVisibility, { capture: false });
        } else {
            item.classList.remove('visibility');
            description.removeAttribute('disabled');
            item.removeEventListener('click', _setVisibility, { capture: false });
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.setVisibilitySelected = function(status) { 
        if (status) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    };
    this.setText = function(text) { 
        props['prefix']['text'] = text;
        description.value = text; 
    };
    //this.getText = function(text) { return description.value; };

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
    //this.getExpand = function() { return expanded; };

    this.setIndex = function(idx) { index.textContent = idx; };
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


    this.setProps = function () {

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
        fragment = document.createDocumentFragment();

        item = addElement(fragment, 'div', 'app-cards-content-item');
        //item.setAttribute('draggable', true);

        index = addElement(item, 'div', 'app-cards-content-item-index');

        //description = addElement(item, 'input', 'app-cards-content-item-description');
        description = addElement(item, 'input');
        description.setAttribute('maxlength', '64');
        description.addEventListener('keyup', _refresh, { capture: false });
        description.addEventListener('focus', _props, { capture: false });

        remove = addElement(item, 'div', 'app-cards-content-item-remove');
        //remove.addEventListener('click', _remove, { once: true, capture: false });
        
        output = addElement(item, 'div', 'app-cards-content-item-output');
        output['_CONNECTION_'] = null;
        output['_PATH_'] = main.newSVGPath();
        output.addEventListener('mousedown', _drag, { capture: false });

    })();
}