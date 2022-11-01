'use strict';

import { _DRAG_, _MOV_, _ZOOM_, _ICON_CHAR_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Card from './cards.js';
import Properties from './properties.js';
import Simulate from './simulate/simulate.js';
import VisibilityTool from './tools/visibility.js';

////////////////////////////////////////////////////////////////////////////////
export default function Macro(_properties) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let mainApp,
        mainTreeView, mainTreeViewItems,
        mainBuilder, mainAppWrapper, mainAppSVG, 
            mainBuilderToolbar,

        properties, simulate,

        rootCard, 
        currentDrag = null,
        isCurrentSelectObject = false,
        currentSelectedObject = null, // Field | Card | Workspace
        visibilityMode = false,       // Boolean
        selectedArrow = null,
        visibilityTool = null,

        currentZoomText,

        cardsArray = [],
        position = { offsetLeft: 0, offsetTop: 0 },

        props = { 
            size: { width: 4096, height: 3072 },
            transform: { scale: 1, left: 0, top: 0, index: 0 }
        },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              targetClass = target.classList,
              parent = target.parentElement;

        if (targetClass.contains('main-app-treeview-item')) {
            const field = parent['_CONTEXT_'].deref();
            if (field === undefined)
                return;
            
            if (targetClass.contains('expand')) {
 
                const status = field.getProps('expanded');
                switch (evnt.type) {
                    case 'click':
                        const icon = target.firstChild;
                        field.toggleExpand(icon);
                        field.setBorderColor(false);
                        break;

                    case 'mouseenter':
                        if (status)
                            field.setBorderColor(false);
                        break;

                    case 'mouseleave':
                        if (status)
                            field.setBorderColor(true);
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
            }
        } else if (targetClass.contains('main-app-wrapper')) {
            switch (evnt.type) {
                case 'dblclick':
                    let cardLeft = (evnt.clientX - props.transform.left) / props.transform.scale,
                        cardRight = (evnt.clientY - props.transform.top) / props.transform.scale;

                    context.createCard([cardLeft, cardRight]);

                    //var x = context.serialize();
                    //console.log(JSON.stringify(x));

                    break;
            }
        }
    },
    _control_events = function(evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              targetClass = target.classList;

        if (evnt.type === 'click') {
            if (targetClass.contains('zoom-in'))         _zoom(0.1);
            else if (targetClass.contains('zoom-out'))   _zoom(-0.1);
            else if (targetClass.contains('zoom-reset')) _pan();
            else if (targetClass.contains('zoom-fit'))   _fit();
        }

        _zoom_label();
    },
    _pan = function() {
        const builderRect = mainBuilder.getBoundingClientRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2),
              builderTopCenter = builderRect.top + (builderRect.height / 2);

        const DELTA = 1 - props.transform.scale;

        const builderLeftCenterScale = builderLeftCenter * DELTA,
              builderTopCenterScale = builderTopCenter * DELTA;
        
        props.transform.left = (props.transform.left-builderLeftCenterScale) / props.transform.scale;
        props.transform.top = (props.transform.top-builderTopCenterScale) / props.transform.scale;
        props.transform.scale = 1;

        mainAppWrapper.style.transform = 'translate(' +props.transform.left+ 'px, ' +props.transform.top+ 'px) scale(' +props.transform.scale+ ')';
    },
    _fit = function() {
        const builderRect = mainBuilder.getBoundingClientRect(),
              wrapperRect = mainAppWrapper.getBoundingClientRect();
  
        const builderLeftCenter = builderRect.width / 2,
              builderTopCenter = builderRect.height / 2;

        const wrapperLeftCenter = (wrapperRect.width / props.transform.scale) / 2,
              wrapperTopCenter = (wrapperRect.height / props.transform.scale) / 2;

        const widthFactor = wrapperRect.width / builderRect.width,
              heightFactor = wrapperRect.height / builderRect.height;

        let scale = props.transform.scale / (widthFactor > heightFactor ? widthFactor : heightFactor);

        if (scale > _ZOOM_.MAX) {
            scale = _ZOOM_.MAX; 
        } else if (scale < _ZOOM_.MIN) {
            scale = _ZOOM_.MIN;
        }

        props.transform.scale = scale;
        props.transform.left = builderRect.left + builderLeftCenter - (wrapperLeftCenter * props.transform.scale);
        props.transform.top = builderRect.top + builderTopCenter - (wrapperTopCenter * props.transform.scale);

        mainAppWrapper.style.transform = 'translate(' +props.transform.left+ 'px, ' +props.transform.top+ 'px) scale(' +props.transform.scale+ ')';
        //if (scale < 1) mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
    },
    _zoom = function(zoom) {
        const builderRect = mainBuilder.getBoundingClientRect(),
              wrapperRect = mainAppWrapper.getBoundingClientRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2),
              builderTopCenter = builderRect.top + (builderRect.height / 2);

        const DELTA = zoom;

        let scale = props.transform.scale * (1 + DELTA);
        if (scale > _ZOOM_.MAX || scale < _ZOOM_.MIN)
            return;
        
        props.transform.scale = scale;
        props.transform.left += (wrapperRect.left - builderLeftCenter) * DELTA;
        props.transform.top +=  (wrapperRect.top - builderTopCenter) * DELTA;
        
        mainAppWrapper.style.transform = 'translate(' +props.transform.left+ 'px, ' +props.transform.top+ 'px) scale(' +props.transform.scale+ ')';
        
        //if (scale < 1) mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
    },
    _center = function(rect) {
        const builderRect = mainBuilder.getBoundingClientRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2),
              builderTopCenter = builderRect.top + (builderRect.height / 2);

        const rectLeftCenter = rect.left + (rect.width / 2),
              rectTopCenter = rect.top + (rect.height / 2);

        const left = (props.transform.left - rectLeftCenter) + builderLeftCenter,
              top  = (props.transform.top - rectTopCenter) + builderTopCenter;
        
        props.transform.left = left;
        props.transform.top = top;
        //props.transform.scale = 1;

        mainAppWrapper.style.transform = 'translate(' +props.transform.left+ 'px, ' +props.transform.top+ 'px) scale(' +props.transform.scale+ ')';
    },
    _wheel_zoom = function(evnt) {
        const delta = (evnt.wheelDelta ? evnt.wheelDelta / 120 : - evnt.deltaY / 3) * 0.05;

        const scale = props.transform.scale * (1 + delta);
        if (scale > _ZOOM_.MAX || scale < _ZOOM_.MIN)
            return;
        
        const rect = mainAppWrapper.getBoundingClientRect();

        props.transform.scale = scale;
        props.transform.left += (rect.left - evnt.clientX) * delta;
        props.transform.top +=  (rect.top - evnt.clientY) * delta;

        mainAppWrapper.style.transform = 'translate(' +props.transform.left+ 'px, ' +props.transform.top+ 'px) scale(' +props.transform.scale+ ')';

        if (currentDrag != null)
            currentDrag.setPosition(evnt.clientX, evnt.clientY, props.transform, _MOV_.START);

        //if (scale < 1) mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
        _zoom_label();
    },
    _zoom_label = function() {
        const zoom_scale = (props.transform.scale * 100);
        currentZoomText.textContent = `${zoom_scale.toFixed(0)}%`;
    };

    // INTERFACE  //////////////////////////////////////////////////////////////
    this.setPosition = function(left, top, transform, mov) {
        switch (mov) {
            case _MOV_.START:
                const rect = mainAppWrapper.getBoundingClientRect();

                position.offsetLeft = left - rect.left;
                position.offsetTop = top - rect.top;

                mainAppWrapper.style.cursor = 'grabbing';
                break;
                
            case _MOV_.END:
                mainAppWrapper.style.removeProperty('cursor');
                break;
        }

        // if (left > window.innerWidth || top > window.innerHeight) return;
        // if (left < 0 || top < 0) return;

        transform.left = left - position.offsetLeft,
        transform.top = top - position.offsetTop;

        mainAppWrapper.style.transform = 'translate(' +transform.left+ 'px, ' +transform.top+ 'px) scale(' +transform.scale+ ')';
    };
    this.getDragType = function() { return _DRAG_.AREA; };
    this.serialize = function() {

        while (mainTreeViewItems.hasChildNodes()) 
            mainTreeViewItems.removeChild(mainTreeViewItems.firstChild);

        const fragment = document.createDocumentFragment();

        let response = {
            status:  true,
            name:    'Macro',
            version: 1,
            
            properties: props,

            root: rootCard.serialize(fragment)
        };
        
        mainTreeViewItems.appendChild(fragment);

        return response;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.appendAt = function () { return mainAppWrapper; }

    this.createCard = function(cardPosition, cardProperties, connect = null) {
        const isRoot = (cardsArray.length === 0 ? true : false),
              left = cardPosition[0], 
              top = cardPosition[1];

        const new_card = new Card(context, cardProperties, cardsArray.length);
        cardsArray.push(new_card); 

        if (isRoot)
            rootCard = new_card;

        new_card.setPosition(left, top, props.transform, _MOV_.NEW);

        if (connect !== null)
            connect.makeConnection(new_card);

        return new_card;
    };
    this.newSVG = function(field) {
        const svgGroup = mainAppSVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        svgGroup.setAttribute('class', 'main-app-svg-path');

        svgGroup.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        
        const moveableLine = svgGroup.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        moveableLine.setAttribute('class', 'moveable');
        moveableLine['_OWNER_'] = new WeakRef(field);

        return svgGroup;
    };
    this.connect = function(fromOutput, toInput) {
        const viewportInput = toInput.getInputBounding();
        fromOutput.setPosition(viewportInput.left, viewportInput.top, props.transform, _MOV_.END);
        fromOutput.makeConnection(toInput);
    };

    this.redraw = function(element = null) {
        if (element === null) {
            const size = cardsArray.length;
            for (let counter = 0; counter < size; counter++) {
                cardsArray[counter].redraw(props.transform);
            }
        } else {
            element.redraw(props.transform);
        }

        context.serialize();
    };
    this.showProperties = function(object) {
        if (visibilityMode) return;
        
        if (currentSelectedObject !== null)
            currentSelectedObject.setSelected(false);
        
        currentSelectedObject = object;
        currentSelectedObject.setSelected(true);

        if (currentSelectedObject.hasOwnProperty('getProps'))
            properties.refresh();
    };
    this.setSelected = function(status) { 
        if (status) {
            isCurrentSelectObject = true;
            mainAppWrapper.classList.add('selected');
        } else {
            isCurrentSelectObject = false;
            mainAppWrapper.classList.remove('selected');
        }
    };
    this.getProps = function (prop = null) {
        if (prop === null) {
            return props;
        } else {
            if (props.hasOwnProperty(prop))
                return props[prop];
        }
        return null;
    };

    this.initVisibility = function(fields) { 
        rootCard.initVisibility(fields);

        context.redraw();
    };
    this.getVisibilityMode = function() { return visibilityMode; };
    this.setVisibilityMode = function() {
        const visibility = currentSelectedObject.getProps('visibility');

        if (selectedArrow === null) {
            selectedArrow = document.createElement('div');
            selectedArrow.className = 'app-cards-item-highlight';
            selectedArrow.appendChild(document.createTextNode(_I18N_.selected_visibility));
        }

        if (visibilityTool === null)
            visibilityTool = new VisibilityTool(context);

        visibilityMode = !visibilityMode;

        for (const status in visibility['fields']) {
            for (const field_status of visibility['fields'][status]) 
                field_status.selectedForVisibility(status);
        }

        for (const current_card of cardsArray)
            current_card.setVisibilityMode();
    };
    this.previewVisibility = function (fields, evntType) {
        if (visibilityMode) return;

        for (const status in fields) {
            for (const field_status of fields[status]) {
                if (evntType === 'mouseenter')
                    field_status.selectedForVisibility(status);
                else
                    field_status.unselectForVisibility();
            }
        }
    };
    this.deleteVisibility = function() {
        if (visibilityMode) {
            const visibility = currentSelectedObject.getProps('visibility');

            while (visibility['fields'].length)
                currentSelectedObject.removeFromVisibility(visibility['fields'][0]);

            context.setVisibilityMode();
        }
    };

    this.getSelectedArrow = function () { return selectedArrow; }
    this.getVisibilityTool = function () { return visibilityTool; }
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
                props.transform.index++;
                break;

            case _DRAG_.OUTPUT:
                break;

            case _DRAG_.LINE:
                break;
        }

        currentDrag.setPosition(evnt.clientX, evnt.clientY, props.transform, _MOV_.START);

        document.addEventListener('mousemove', context.drag,    { capture: true });
        document.addEventListener('mouseup',   context.dragEnd, { capture: true });
    };
    this.drag = function(evnt) {
        evnt.stopPropagation();
        currentDrag.setPosition(evnt.clientX, evnt.clientY, props.transform, _MOV_.MOV);

        switch (currentDrag.getDragType()) {
            case _DRAG_.AREA:
                break;

            case _DRAG_.HEADER:
                currentDrag.redraw(props.transform);
                break;

            case _DRAG_.OUTPUT:
                currentDrag.check(evnt.target);
                break;
        }
    };
    this.dragEnd = function(evnt) {
        evnt.stopPropagation();
        currentDrag.setPosition(evnt.clientX, evnt.clientY, props.transform, _MOV_.END);

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
                    const targetCtx = target['_CONTEXT_'].deref();
                    if (targetCtx !== undefined) {
                        if (!currentDrag.hasConnection() && !targetCtx.hasConnection()) {
                            if (!currentDrag.infiniteLoop(target)) {
                                context.connect(currentDrag, targetCtx);
                                use = true;
                            }
                        }
                    }
                } else if (target.classList.contains('main-app-wrapper')) {
                    const offset = 49 * props.transform.scale;

                    const card_left = (evnt.clientX - props.transform.left) / props.transform.scale,
                          card_top = ((evnt.clientY - offset) - props.transform.top) / props.transform.scale;

                    const new_card = context.createCard([card_left, card_top]);
                    context.connect(currentDrag, new_card);
                    use = true;
                }

                if (!use)
                    currentDrag.clearConnection();
                else
                    context.serialize();

                break;

            case _DRAG_.LINE:
                currentDrag.setDragType(_DRAG_.OUTPUT);
                break;
        }

        document.removeEventListener('mousemove', context.drag, { capture: true });
        document.removeEventListener('mouseup',   context.dragEnd, { capture: true });

        currentDrag = null;
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        props = {...props, ..._properties};

        const fragment = document.createDocumentFragment();

        mainApp = addElement(fragment, 'div', 'main-app remove-focus-select');

        mainTreeView = addElement(mainApp, 'div', 'main-app-treeview');
        const colResize = addElement(mainApp, 'div', 'main-app-treeview-col-resize');

        mainBuilder = addElement(mainApp, 'div', 'main-app-builder');
        const mainProperties = addElement(mainApp, 'div', 'main-app-properties');

        mainTreeViewItems = addElement(mainTreeView, 'div', 'main-app-treeview-items');
        
        mainBuilderToolbar = addElement(mainBuilder, 'div', 'main-app-builder-toolbar');
        const serializeBtn = addElement(mainBuilderToolbar, 'div', 'icon', _ICON_CHAR_.OUTPUT);
        serializeBtn.addEventListener('click', () => {
            var x = context.serialize();
            console.log(JSON.stringify(x));
        }, { capture: false });
        
        addElement(mainBuilderToolbar, 'div', 'button');
        addElement(mainBuilderToolbar, 'div');

        const simulateDiv = addElement(mainBuilderToolbar, 'div', 'holder');
        const simulateBtn = addElement(simulateDiv, 'div', 'button', _I18N_.simulate);
        // simulateBtn.addEventListener('click', function(evnt) { simulate.start(); }, { capture: false });
        simulateBtn.addEventListener('click', () => simulate.start(), { capture: false });


        mainAppWrapper = addElement(mainBuilder, 'div', 'main-app-wrapper');
        mainAppWrapper.setAttribute('tabindex',  0);

        mainAppWrapper.addEventListener('focus', () => context.showProperties(context), { capture: false });

        // if (props.hasOwnProperty('size')) {
        //     size.width = props.size[0];
        //     size.height = props.size[1];
        // }

        mainAppSVG = mainAppWrapper.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        mainAppSVG.setAttribute('class', 'main-app-svg');
        mainAppSVG.setAttribute('width',  props.size.width);
        mainAppSVG.setAttribute('height', props.size.height);

        const widget_holder = addElement(mainBuilder, 'div', 'main-app-builder-widget-holder');
        addElement(widget_holder, 'div', 'icon button zoom-in', _ICON_CHAR_.PLUS);
        addElement(widget_holder, 'div', 'icon button zoom-out', _ICON_CHAR_.EMPTY);
        addElement(widget_holder, 'div', 'icon button zoom-reset', _ICON_CHAR_.ZOOM);
        addElement(widget_holder, 'div', 'divider');
        currentZoomText = addElement(widget_holder, 'div', 'zoom-text');
        addElement(widget_holder, 'div', 'divider');
        addElement(widget_holder, 'div', 'icon button zoom-fit', _ICON_CHAR_.FIT);

        widget_holder.addEventListener('click', _control_events, { capture: true });
        _zoom_label();

        document.body.appendChild(fragment);
        
        // EVNTS
        mainTreeViewItems.addEventListener('click', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseenter', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseleave', _receive_events, { capture: true });

        
        //mainTreeViewItems.addEventListener('resize', _receive_events, { capture: true });
        //window.addEventListener('resize', _resize, { capture: true });

        mainAppWrapper.addEventListener('wheel', _wheel_zoom, { capture: false, passive: true });
        mainAppWrapper.addEventListener('mousedown', function (evnt) {
            if (evnt.button === 0) {
                if (currentDrag !== null) {
                    if (currentDrag.getDragType() !== _DRAG_.HEADER) 
                        context.dragEnd(evnt);
                    return;
                }

                if (evnt.target.classList.contains('main-app-wrapper')) {
                    context.dragStart(evnt, context);

                } else if (evnt.target.classList.contains('moveable')) {
                    evnt.preventDefault();

                    const field = evnt.target['_OWNER_'].deref();
                    if (field !== undefined) {
                        field.setDragType(_DRAG_.LINE);
                        context.dragStart(evnt, field);
                    }
                }
            }
        }, { capture: false });
        mainAppWrapper.addEventListener('dblclick', _receive_events, { capture: false });
        
        // mainAppWrapper.addEventListener('click', (evnt) => console.log(`${evnt.clientX} - ${evnt.clientY}`), { capture: false });

        //mainAppWrapper.addEventListener('touchstart', (evnt) => console.log(evnt) , false);
        //mainAppWrapper.addEventListener('touchmove', (evnt) => console.log(evnt) , false);
        //mainAppWrapper.addEventListener('touchcancel', (evnt) => console.log(evnt) , false);
        //mainAppWrapper.addEventListener('touchend', (evnt) => console.log(evnt) , false);

        properties = new Properties(context);
        mainProperties.appendChild(properties.getFragment());

        simulate = new Simulate(context);
        simulateDiv.appendChild(simulate.getFragment());

        // if (props.hasOwnProperty('transform')) {
        //     transform.scale = props.transform[2];
        //     context.setPosition(props.transform[0], props.transform[1], transform, _MOV_.END);
        // }
        context.setPosition(props.transform.left, props.transform.top, props.transform, _MOV_.END);

        const builderRect = mainBuilder.getBoundingClientRect();
  
        const builderLeftCenter = builderRect.width / 2,
              builderTopCenter = builderRect.height / 2;

        let builderCenterDiv = addElement(mainBuilder, 'div', 'crosshair');
        builderCenterDiv.style.left = builderLeftCenter + 'px';
        builderCenterDiv.style.top = builderTopCenter + 'px';
    })();
}