
 'use strict';

import { _DRAG_, _MOV_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Card from './cards.js';

////////////////////////////////////////////////////////////////////////////////
export default function Macro() {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let mainApp, mainAppWrapper, mainAppSVG, mainOptions,
        currentDrag = null,
        rootCard,
        cardsArray = [],
        transform = { scale: 1, left: 0, top: 0, index: 0 },
        position = { offsetLeft: 0, offsetTop: 0 },
        size = { width: 3840, height: 2160 },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _resize = function() {
        //const widthOptions = mainOptions.offsetWidth;

        mainOptions.style.height = window.innerHeight + 'px';

        mainApp.style.width = window.innerWidth + 'px';
        mainApp.style.height = window.innerHeight + 'px';
    },
    _zoom = function(evnt) {
        const delta = (evnt.wheelDelta ? evnt.wheelDelta / 120 : - evnt.deltaY / 3) * 0.05;
        let scale = transform.scale * (1 + delta);
        if (scale > 9 || scale < 0.1) {
            return;
        }

        const rect = mainAppWrapper.getBoundingClientRect();

        transform.scale = transform.scale * (1 + delta);
        transform.left += (rect.left - evnt.clientX) * delta;
        transform.top +=  (rect.top - evnt.clientY) * delta;

        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';

        if (currentDrag != null) {
            currentDrag.setPosition(evnt.clientX, evnt.clientY, transform, _MOV_.START);
        }

        if (scale < 1) {
            mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
        }
        
    };

    // INTERFACE  //////////////////////////////////////////////////////////////
    this.setPosition = function(left, top, transform, mov) {
        switch (mov) {
            case _MOV_.START:
                const rect = mainAppWrapper.getBoundingClientRect();

                position.offsetLeft = left - rect.left;
                position.offsetTop = top - rect.top;

                break;
                
            case _MOV_.END:

                break;
        }

        // if (left > window.innerWidth || top > window.innerHeight) return;
        // if (left < 0 || top < 0) return;

        transform.left = left - position.offsetLeft,
        transform.top = top - position.offsetTop;

        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';
    }
    this.getDragType = function() { return _DRAG_.AREA };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.newCard = function(left, top) {
        const isRoot = (cardsArray.length ? false : true);

        let new_card = new Card(context, isRoot);
        cardsArray.push(new_card); 

        if (isRoot) rootCard = new_card;

        mainAppWrapper.appendChild(new_card.getFragment());
        new_card.setPosition(left, top, transform, _MOV_.END);

        return new_card;
    };
    this.newSVGPath = function() {
        let new_path = mainAppSVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        new_path.setAttribute('class', 'main-app-svg-path');

        return new_path;
    };
    this.connect = function (fromOutput, toInput) {
        const viewportInput = toInput.getInputBounding();
        fromOutput.setPosition(viewportInput.left, viewportInput.top, transform, _MOV_.END);
        fromOutput.makeConnection(toInput);
    };

    this.serialize = function () {
        let response = {
            status:  true,
            name:    'Macro',
            version: 1,
            
            position:   [ transform.left, transform.top, transform.scale ],
            size:       [ size.width, size.height ],
            visibility: [],

            root: rootCard.serialize()
        };

        return response;
    };

    // DRAG LISTENER ///////////////////////////////////////////////////////////
    this.dragStart = function(evnt, ctx) { 
        if (currentDrag !== null) return;

        currentDrag = ctx;

        switch (currentDrag.getDragType()) {
            case _DRAG_.AREA:
                break;

            case _DRAG_.HEADER:
                transform.index++;
                break;

            case _DRAG_.OUTPUT:
                break;
        }

        currentDrag.setPosition(evnt.clientX, evnt.clientY, transform, _MOV_.START);

        document.addEventListener('mousemove', context.drag, true);
        document.addEventListener('mouseup',   context.dragEnd, true);
    };
    this.drag = function(evnt) {
        currentDrag.setPosition(evnt.clientX, evnt.clientY, transform, _MOV_.MOV);

        switch (currentDrag.getDragType()) {
            case _DRAG_.AREA:
                break;

            case _DRAG_.HEADER:
                currentDrag.redraw(transform);
                break;

            case _DRAG_.OUTPUT:
                currentDrag.check(evnt.target);
                break;
        }
    };
    this.dragEnd = function(evnt) {
        currentDrag.setPosition(evnt.clientX, evnt.clientY, transform, _MOV_.END);

        switch (currentDrag.getDragType()) {
            case _DRAG_.AREA:
                break;

            case _DRAG_.HEADER:
                console.log(currentDrag.getPosition());
                break;

            case _DRAG_.OUTPUT:
                let use = false;
                const target = evnt.target;

                if (target.classList.contains('app-cards-content-input')) {
                    const targetCtx = target['_CONTEXT_'];
                    if (!currentDrag.hasConnection() && !targetCtx.hasConnection()) {
                        if (!currentDrag.infiniteLoop(target)) {
                            context.connect(currentDrag, targetCtx);
                            use = true;
                        }
                    }
                } 

                if (!use) currentDrag.clearConnection();
                break;

        }

        document.removeEventListener('mousemove', context.drag, true);
        document.removeEventListener('mouseup',   context.dragEnd, true);

        currentDrag = null;

        console.log(context.serialize());
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        const fragment = document.createDocumentFragment();

    
        mainApp = addElement(fragment, 'div', 'main-app remove-focus-select');
        
        mainAppWrapper = addElement(mainApp, 'div', 'main-app-wrapper');

        mainAppSVG = mainAppWrapper.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        mainAppSVG.setAttribute('class', 'main-app-svg');
        mainAppSVG.setAttribute('width',  size.width);
        mainAppSVG.setAttribute('height', size.height);

        mainOptions = addElement(mainApp, 'div', 'main-app-options');

        document.body.appendChild(fragment);
        _resize();
        
        // EVNTS
        window.addEventListener('resize', _resize, false);

        //document.addEventListener('wheel', _zoom, true);
        mainAppWrapper.addEventListener('wheel', _zoom, true);

        mainAppWrapper.addEventListener('mousedown', (evnt) => {
            if (currentDrag !== null) {
                if (currentDrag.getDragType() !== _DRAG_.HEADER) context.dragEnd(evnt);
                return;
            }

            if (evnt.target.classList.contains('main-app-wrapper')) {
                evnt.stopImmediatePropagation();
                context.dragStart(evnt, context)
            }
        }, true);        
    })();
}