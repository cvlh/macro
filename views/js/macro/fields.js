'use strict';

import { _DRAG_, _MOV_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

export default function Field(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const main = ctx.getMain(), parent = ctx, context = this, rootField = ctx.isRoot();

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment, 
        item, index, description, output, remove,
        position = { top: 0, left: 0 },
        props = { color: null },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _color = function(drag) {
        const color = context.getColor();

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
    _drag = function (evnt) { main.dragStart(evnt, context); },
    _remove = function () { output.removeEventListener('mousedown', _drag, true); },
    _render = function (endLeft, endTop) {
        //const hx1 = position.left + Math.abs(endLeft - position.left) * 0.05,
        //      hx2 = endLeft - Math.abs(endTop - position.left) * 0.05;

        //output['_PATH_'].setAttribute('d', 'M' + position.left +' '+ position.top +' C '+ hx1 +' '+ position.top +' '+ hx2 +' '+ endTop +' '+ endLeft +' '+ endTop);
        const OFFSET = 25;

        const startX = position.left+16,
              startY = position.top+12;

        const endX = (endLeft) - OFFSET,
              endY = endTop+13;

        output['_PATH_'].setAttribute('d', 'M' +startX+ ' ' +startY+ ' h ' +OFFSET+ ' L ' +endX+ ' ' +endY+ ' h ' +OFFSET) ;
    },
    _refresh = function() {
        if (context.hasConnection()) {
            output['_CONNECTION_'].setHeader(description.value);
        }
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
            if (context.hasConnection()) context.clearConnection();
            _color(true);
        }

        if (mov === _MOV_.START || mov === _MOV_.END) {
            const rect = output.getBoundingClientRect();
            position.left = (rect.left - transform.left) / transform.scale;
            position.top = (rect.top - transform.top) / transform.scale;
        }

        const endLeft = (left - transform.left) / transform.scale,
              endTop = (top - transform.top) / transform.scale;

        _render(endLeft, endTop);
    };
    this.setColor = function(color) { 
        if (rootField && color !== null) {
            props.color = color;
        }

        _color(false);

        if (context.hasConnection()) {
            output['_CONNECTION_'].setColor(color);
        }
    };
    this.getColor = function() {
        if (rootField && props.color != null) {
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
    this.serialize = function () {
        let response = {
            //id: 0,
            name: description.value,
            type: 'text',
            visibility: []
        };
        
        if (rootField) {
            response['color'] = props.color;
        }

        if (context.hasConnection()) {
            response['card'] = output['_CONNECTION_'].serialize();
        }

        return response;
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.setText = function(text) { description.value = text; };
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

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        fragment = document.createDocumentFragment();

        item = addElement(fragment, 'div', 'app-cards-content-item');

        index = addElement(item, 'div', 'app-cards-content-item-index');

        description = addElement(item, 'input', 'app-cards-content-item-description');
        description.setAttribute('maxlength', '64');
        description.addEventListener('keyup', _refresh, true);

        remove = addElement(item, 'div', 'app-cards-content-item-remove');
        remove.addEventListener('click', _remove, {once: true, capture: true});
        
        output = addElement(item, 'div', 'app-cards-content-item-output');
        output['_CONNECTION_'] = null;
        output['_PATH_'] = main.newSVGPath();
        output.addEventListener('mousedown', _drag, true);
    })();
}