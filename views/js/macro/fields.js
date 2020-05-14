'use strict';

import { _DRAG_, _MOV_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

export default function Field(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const main = ctx.getMain(), /*parent = ctx,*/ context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment, 
        item, index, description, output, remove,
        position = { top: 0, left: 0 },

    // PRIVATE /////////////////////////////////////////////////////////////////
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

    // INTERFACE  //////////////////////////////////////////////////////////////
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
    };
    this.clearConnection = function() {
        output.classList.remove('linked', 'error');
        output['_PATH_'].setAttribute('class', 'main-app-svg-path');
        output['_PATH_'].setAttribute('d', '');

        if (context.hasConnection()) {
            output['_CONNECTION_'].clearConnection();
            output['_CONNECTION_'] = null;
        }
    };
    this.redraw = function(transform) {
        if (context.hasConnection()) {
            const rect = output['_CONNECTION_'].getInputBounding();
            context.setPosition(rect.left, rect.top, transform, _MOV_.END);
        }
    };
    this.setPosition = function(left, top, transform, mov) {
        switch (mov) {
            case _MOV_.START:
                if (context.hasConnection()) {
                    context.clearConnection();
                }

            case _MOV_.END:
                const rect = output.getBoundingClientRect();

                position.left = (rect.left - transform.left) / transform.scale;
                position.top = (rect.top - transform.top) / transform.scale;

                break;
        }

        const endLeft = (left - transform.left) / transform.scale,
              endTop = (top - transform.top) / transform.scale;

        _render(endLeft, endTop);
    };
    this.setColor = function(color) {
        if (context.hasConnection()) {
            output.style.backgroundColor = color;
            output['_CONNECTION_'].setColor(color);
            output['_PATH_'].style.stroke = color;
        }
        //card.style.borderColor = color;
        //title.style.color = color;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.setText = function(text) { description.value = text; };
    this.setIndex = function(idx) { index.textContent = idx; };
    this.check = function(target) {
        if (target.classList.contains('app-cards-content-input')) {
            if (target['_CONNECTION_'] !== null) {
                output['_PATH_'].setAttribute('class', 'main-app-svg-path error');
                output.classList.add('error');
            } else {
                output['_PATH_'].setAttribute('class', 'main-app-svg-path connected');
                output.classList.add('connected');
            }
        } else {
            output['_PATH_'].setAttribute('class', 'main-app-svg-path');
            output.classList.remove('connected', 'error');
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