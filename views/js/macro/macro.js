'use strict';

import { _DRAG_, _MOV_, _ZOOM_, _ICON_CHAR_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Card from './cards.js';
import Properties from './properties.js';

////////////////////////////////////////////////////////////////////////////////
export default function Macro(props) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let mainApp,
        mainTreeView, mainTreeViewItems,
        mainBuilder, mainAppWrapper, mainAppSVG, 
        mainProperties, properties,

        rootCard, 
        currentDrag = null,
        currentSelectedObject = null, // Field
        visibilityMode = false,       // Boolean

        cardsArray = [],
        transform = { scale: 1, left: 0, top: 0, index: 0 },
        position = { offsetLeft: 0, offsetTop: 0 },
        size = { width: 4096, height: 3072 },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        /*if (evnt.type === 'resize') {
            console.log(evnt.type);
        }*/

        const target = evnt.target,
              targetClass = target.classList,
              parent = target.parentElement,
              field = parent['field_ctx'];

        if (targetClass.contains('main-app-treeview-item')) {
            if (targetClass.contains('expand')) {
 
                const status = field.getProps('expanded');
                switch (evnt.type) {
                    case 'click':
                        const icon = target.firstChild;
                        field.toggleExpand(icon);
                        break;

                    case 'mouseenter':
                        if (status) field.setBorderColor(false);
                        break;

                    case 'mouseleave':
                        if (status) field.setBorderColor(true);
                        break;
                }
            } else if (targetClass.contains('field')) {
                const path = target.querySelector('.main-app-treeview-item-path');
                switch (evnt.type) {
                    case 'mouseenter':
                        path.style.display = 'block';
                        break;

                    case 'mouseleave':
                        path.style.display = 'none';
                        break;

                    case 'click':
                        if (visibilityMode) {
                            field.toggleVisibility();
                        } else {
                            const rect = field.getRect();
                            _center(rect);
                            field.setFocus();
                        }
                        break;
                }
            } /*else {
                switch (evnt.type) {
                    case 'click':
                        //const properties = field.getProps();
                        //mainTreeView = addElement(mainApp, 'div', 'main-app-treeview');
                        break;
                }
            }*/
        }
    },
    _control_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              targetClass = target.classList;

        if (evnt.type === 'click') {
            if (targetClass.contains('zoom-in'))        _zoom(0.1);
            else if (targetClass.contains('zoom-out'))  _zoom(-0.1);
            else if (targetClass.contains('zoom-reset')) _pan();
            else if (targetClass.contains('zoom-fit'))   _fit();
        }
    },
    _pan = function() {
        const builderRect = mainBuilder.getBoundingClientRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2),
              builderTopCenter = builderRect.top + (builderRect.height / 2);

        const DELTA = 1 - transform.scale;

        const builderLeftCenterScale = builderLeftCenter * DELTA,
              builderTopCenterScale = builderTopCenter * DELTA;
        
        transform.left = (transform.left-builderLeftCenterScale) / transform.scale;
        transform.top = (transform.top-builderTopCenterScale) / transform.scale;
        transform.scale = 1;

        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';
    },
    _fit = function() {
        const builderRect = mainBuilder.getBoundingClientRect(),
              wrapperRect = mainAppWrapper.getBoundingClientRect();
  
        const builderLeftCenter = builderRect.width / 2,
              builderTopCenter = builderRect.height / 2;

        const wrapperLeftCenter = (wrapperRect.width / transform.scale) / 2,
              wrapperTopCenter = (wrapperRect.height / transform.scale) / 2;

        const widthFactor = wrapperRect.width / builderRect.width,
              heightFactor = wrapperRect.height / builderRect.height;

        let scale = transform.scale / (widthFactor > heightFactor ? widthFactor : heightFactor);

        if (scale > _ZOOM_.MAX) {
            scale = _ZOOM_.MAX; 
        } else if (scale < _ZOOM_.MIN) {
            scale = _ZOOM_.MIN;
        }

        transform.scale = scale;
        transform.left = builderRect.left + builderLeftCenter - (wrapperLeftCenter * transform.scale);
        transform.top = builderRect.top + builderTopCenter - (wrapperTopCenter * transform.scale);

        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';
        //if (scale < 1) mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
    },
    _zoom = function(zoom) {
        const builderRect = mainBuilder.getBoundingClientRect(),
              wrapperRect = mainAppWrapper.getBoundingClientRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2),
              builderTopCenter = builderRect.top + (builderRect.height / 2);

        const DELTA = zoom;

        let scale = transform.scale * (1 + DELTA);
        if (scale > _ZOOM_.MAX || scale < _ZOOM_.MIN) return;
        
        transform.scale = scale;
        transform.left += (wrapperRect.left - builderLeftCenter) * DELTA;
        transform.top +=  (wrapperRect.top - builderTopCenter) * DELTA;
        
        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';
        
        //if (scale < 1) mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
    },
    _center = function(rect) {
        const builderRect = mainBuilder.getBoundingClientRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2),
              builderTopCenter = builderRect.top + (builderRect.height / 2);

        const rectLeftCenter = rect.left + (rect.width / 2),
              rectTopCenter = rect.top + (rect.height / 2);

        const left = (transform.left - rectLeftCenter) + builderLeftCenter,
              top  = (transform.top - rectTopCenter) + builderTopCenter;
        
        transform.left = left;
        transform.top = top;
        //transform.scale = 1;

        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';
    },
    _wheel_zoom = function(evnt) {
        const delta = (evnt.wheelDelta ? evnt.wheelDelta / 120 : - evnt.deltaY / 3) * 0.05;

        const scale = transform.scale * (1 + delta);
        if (scale > _ZOOM_.MAX || scale < _ZOOM_.MIN) return;
        
        const rect = mainAppWrapper.getBoundingClientRect();

        transform.scale = scale;
        transform.left += (rect.left - evnt.clientX) * delta;
        transform.top +=  (rect.top - evnt.clientY) * delta;

        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';

        if (currentDrag != null) {
            currentDrag.setPosition(evnt.clientX, evnt.clientY, transform, _MOV_.START);
        }
        //if (scale < 1) mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
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
    this.getDragType = function() { return _DRAG_.AREA; };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.newCard = function(left, top, connect = null) {
        const isRoot = (cardsArray.length ? false : true);

        let new_card = new Card(context, mainAppWrapper, isRoot);
        cardsArray.push(new_card); 

        if (isRoot) rootCard = new_card;
        new_card.setPosition(left, top, transform, _MOV_.NEW);

        if (connect !== null) connect.makeConnection(new_card);

        return new_card;
    };
    this.newSVGPath = function() {
        let new_path = mainAppSVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        new_path.setAttribute('class', 'main-app-svg-path');

        return new_path;
    };
    this.connect = function(fromOutput, toInput) {
        const viewportInput = toInput.getInputBounding();
        fromOutput.setPosition(viewportInput.left, viewportInput.top, transform, _MOV_.END);
        fromOutput.makeConnection(toInput);
    };
    this.serialize = function() {

        while (mainTreeViewItems.hasChildNodes()) {
            mainTreeViewItems.removeChild(mainTreeViewItems.firstChild);
        }

        const fragment = document.createDocumentFragment();

        let response = {
            status:  true,
            name:    'Macro',
            version: 1,
            
            transform:  [ transform.left, transform.top, transform.scale ],
            size:       [ size.width, size.height ],
            visibility: [ ],

            root: rootCard.serialize(fragment)
        };

        /*while (mainTreeViewItems.hasChildNodes()) {
            mainTreeViewItems.removeChild(mainTreeViewItems.firstChild);
        }

        
        if (response['root'].hasOwnProperty('fields')) {
            _update(response['root']['fields'], fragment);
        }*/
        mainTreeViewItems.appendChild(fragment);

        return response;
    };
    this.redraw = function(cardInput = null) {
        if (cardInput === null) {
            const size = cardsArray.length;

            for (let counter=0; counter<size; counter++) {
                cardsArray[counter].redraw(transform);
            }
        } else {
            const viewport = cardInput.getBoundingClientRect();
            cardInput['_CONNECTION_'].setPosition(viewport.left, viewport.top, transform, _MOV_.END);
        }

        context.serialize();
    };
    this.showProperties = function(object) {
        if (currentSelectedObject !== null) {
            currentSelectedObject.setSelected(false);
        }
        currentSelectedObject = object;
        currentSelectedObject.setSelected(true);

        properties.refresh();
    };

    this.getVisibilityMode = function() { return visibilityMode; };
    this.setVisibilityMode = function() {
        const size = cardsArray.length,
              visibility = currentSelectedObject.getProps('visibility');

        visibilityMode = !visibilityMode;

        if (visibility['fields'].length) {
            for (var counter=0; counter<visibility['fields'].length; counter++) {
                visibility['fields'][counter].setForVisibility();
            }
        }

        for (let counter=0; counter<size; counter++) {
            cardsArray[counter].setVisibilityMode();
        }
    };
    this.clearVisibility = function() {
        const visibility = currentSelectedObject.getProps('visibility');

        while (visibility['fields'].length) {
            currentSelectedObject.removeFromVisibility(visibility['fields'][0]);
        }
    };

    this.getSelectedObject = function () { return currentSelectedObject; }

    // DRAG LISTENER ///////////////////////////////////////////////////////////
    this.dragStart = function(evnt, ctx) { 
        evnt.stopPropagation();
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

        document.addEventListener('mousemove', context.drag, { capture: true });
        document.addEventListener('mouseup',   context.dragEnd, { capture: true });
    };
    this.drag = function(evnt) {
        evnt.stopPropagation();
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
        evnt.stopPropagation();
        currentDrag.setPosition(evnt.clientX, evnt.clientY, transform, _MOV_.END);

        switch (currentDrag.getDragType()) {
            case _DRAG_.AREA:
                break;

            case _DRAG_.HEADER:
                //console.log(currentDrag.getPosition());
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

                            var x = context.serialize();
                            console.log(JSON.stringify(x));
                        }
                    }
                } 

                if (!use) {
                    currentDrag.clearConnection();
                }
                
                break;

        }

        document.removeEventListener('mousemove', context.drag, { capture: true });
        document.removeEventListener('mouseup',   context.dragEnd, { capture: true });

        currentDrag = null;
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {

        const fragment = document.createDocumentFragment();

        mainApp = addElement(fragment, 'div', 'main-app remove-focus-select');

        mainTreeView = addElement(mainApp, 'div', 'main-app-treeview');
        const colResize = addElement(mainApp, 'div', 'main-app-treeview-col-resize');

        mainBuilder = addElement(mainApp, 'div', 'main-app-builder');
        mainProperties = addElement(mainApp, 'div', 'main-app-properties');

        mainTreeViewItems = addElement(mainTreeView, 'div', 'main-app-treeview-items');
        
        mainAppWrapper = addElement(mainBuilder, 'div', 'main-app-wrapper');
        mainAppWrapper.setAttribute('tabindex',  0);

        if (props.hasOwnProperty('size')) {
            size.width = props.size[0];
            size.height = props.size[1];
        }

        mainAppSVG = mainAppWrapper.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        mainAppSVG.setAttribute('class', 'main-app-svg');
        mainAppSVG.setAttribute('width',  size.width);
        mainAppSVG.setAttribute('height', size.height);

        const bottomBar = addElement(mainBuilder, 'div', 'main-app-builder-bottom-bar');
        bottomBar['buttons'] = [];
        bottomBar['buttons']['in'] = addElement(bottomBar, 'div', 'icon main-app-builder-bottom-bar-button zoom-in', _ICON_CHAR_.ZOOM_IN);
        bottomBar['buttons']['out'] = addElement(bottomBar, 'div', 'icon main-app-builder-bottom-bar-button zoom-out', _ICON_CHAR_.ZOOM_OUT);
        bottomBar['buttons']['reset'] = addElement(bottomBar, 'div', 'icon main-app-builder-bottom-bar-button zoom-reset', _ICON_CHAR_.ZOOM);
        addElement(bottomBar, 'div', 'main-app-builder-bottom-bar-divider');
        bottomBar['buttons']['fit'] = addElement(bottomBar, 'div', 'icon main-app-builder-bottom-bar-button zoom-fit', _ICON_CHAR_.FIT);

        document.body.appendChild(fragment);
        
        // EVNTS
        mainTreeViewItems.addEventListener('click', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseenter', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseleave', _receive_events, { capture: true });

        bottomBar.addEventListener('click', _control_events, { capture: true });
        //mainTreeViewItems.addEventListener('resize', _receive_events, { capture: true });
        //window.addEventListener('resize', _resize, { capture: true });

        mainAppWrapper.addEventListener('wheel', _wheel_zoom, { capture: false, passive: true });
        mainAppWrapper.addEventListener('mousedown', function (evnt) {
            if (currentDrag !== null) {
                if (currentDrag.getDragType() !== _DRAG_.HEADER) context.dragEnd(evnt);
                return;
            }

            if (evnt.target.classList.contains('main-app-wrapper')) {
                context.dragStart(evnt, context)
            }
        }, { capture: true });

        //mainAppWrapper.addEventListener('touchstart', (evnt) => console.log(evnt) , false);
        //mainAppWrapper.addEventListener('touchmove', (evnt) => console.log(evnt) , false);
        //mainAppWrapper.addEventListener('touchcancel', (evnt) => console.log(evnt) , false);
        //mainAppWrapper.addEventListener('touchend', (evnt) => console.log(evnt) , false);

        properties = new Properties(context);
        mainProperties.appendChild(properties.getFragment());

        if (props.hasOwnProperty('transform')) {
            transform.scale = props.transform[2];
            context.setPosition(props.transform[0], props.transform[1], transform, _MOV_.END);
        }
        

        const builderRect = mainBuilder.getBoundingClientRect();
  
        const builderLeftCenter = builderRect.width / 2,
              builderTopCenter = builderRect.height / 2;

        let builderCenterDiv = addElement(mainBuilder, 'div');
            builderCenterDiv.style.position = 'absolute';
            builderCenterDiv.style.width = '10px';
            builderCenterDiv.style.height = '1px';
            builderCenterDiv.style.backgroundColor = 'red';
            builderCenterDiv.style.left = builderLeftCenter + 'px';
            builderCenterDiv.style.top = builderTopCenter + 'px';
            builderCenterDiv.style.transform = 'translate(-50%, -50%)';
            builderCenterDiv.style.pointerEvents = 'none';

            builderCenterDiv = addElement(mainBuilder, 'div');
            builderCenterDiv.style.position = 'absolute';
            builderCenterDiv.style.width = '1px';
            builderCenterDiv.style.height = '10px';
            builderCenterDiv.style.backgroundColor = 'red';
            builderCenterDiv.style.left = builderLeftCenter + 'px';
            builderCenterDiv.style.top = builderTopCenter + 'px';
            builderCenterDiv.style.transform = 'translate(-50%, -50%)';
            builderCenterDiv.style.pointerEvents = 'none';
    })(props);
}