'use strict';

import { _DRAG_, _MOV_, _ZOOM_, _ICON_CHAR_, _RUN_ENVIRONMENT_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Card from './cards.js';
import Properties from './properties.js';
import Simulate from './simulate/simulate.js';
import createViewport from './viewport.js';
import VisibilityTool from './tools/visibility.js';
import createLibrarySidebar from './library.js';

////////////////////////////////////////////////////////////////////////////////
export default function Macro(__properties) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const Context = this,
          CardsMap = new Map();

    // VARIABLES ///////////////////////////////////////////////////////////////
    let mainApp,
        mainTreeView, mainTreeViewItems,
        library,
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
        viewport,

        props = { 
            size: { width: 4096, height: 3072 },
            index: 0
        },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _receive_events = evnt => {
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
                            viewport.center(rect);
                            field.setFocus();
                        }
                        break;
                }
            }
        } else if (targetClass.contains('main-app-wrapper')) {
            switch (evnt.type) {
                case 'dblclick':
                    const { scale, left, top } = viewport.state;

                    let cardLeft = (evnt.clientX - left) / scale,
                        cardRight = (evnt.clientY - top) / scale;

                    Context.createCard([cardLeft, cardRight]);

                    //var x = Context.serialize();
                    //console.log(JSON.stringify(x));

                    break;
            }
        }
    },
    _control_events = evnt => {
        evnt.stopPropagation();

        const target = evnt.target,
              targetClass = target.classList;

        if (evnt.type === 'click') {
            if (targetClass.contains('zoom-in'))         viewport.zoom(0.1);
            else if (targetClass.contains('zoom-out'))   viewport.zoom(-0.1);
            else if (targetClass.contains('zoom-reset')) viewport.pan();
            else if (targetClass.contains('zoom-fit'))   viewport.fit();
        }

        _zoom_label();
    },
    _wheel_zoom = evnt => {
        const delta = (evnt.wheelDelta ? evnt.wheelDelta / 120 : - evnt.deltaY / 3) * 0.05;

        if (!viewport.wheel(evnt.clientX, evnt.clientY, delta))
            return;

        if (currentDrag != null)
            currentDrag.setPosition(evnt.clientX, evnt.clientY, viewport.state, _MOV_.START);

        //if (scale < 1) mainAppSVG.style.borderWidth = parseInt(1/scale) + 'px';
        _zoom_label();
    },
    _zoom_label = () => {
        const zoom_scale = (viewport.state.scale * 100);
        currentZoomText.textContent = `${zoom_scale.toFixed(0)}%`;
    };

    // INTERFACE  //////////////////////////////////////////////////////////////
    this.setPosition = (left, top, _, action) => {
        if (action === _MOV_.START)
            mainAppWrapper.style.cursor = 'grabbing';
        else if (action === _MOV_.END)
            mainAppWrapper.style.removeProperty('cursor');

        viewport.drag(left, top, action);
    };
    this.getDragType = () => _DRAG_.AREA;
    this.serialize = () => {

        // REMOVE EVNTS
        mainTreeViewItems.removeEventListener('click', _receive_events, { capture: true });
        mainTreeViewItems.removeEventListener('mouseenter', _receive_events, { capture: true });
        mainTreeViewItems.removeEventListener('mouseleave', _receive_events, { capture: true });
        
        while (mainTreeViewItems.hasChildNodes()) {
            const child = mainTreeViewItems.firstChild;
            if (child.hasOwnProperty('_CONTEXT_')) {
                const field = child['_CONTEXT_'].deref();
                if (field !== undefined)
                    field.evictTreeviewRow();

                child['_CONTEXT_'] = null;
                delete child['_CONTEXT_'];
            }
            
            mainTreeViewItems.removeChild(child);
        }

        const initial_properties = { 
            expand: true, 
            color: null,
            tab: []
        };

        const fragment = document.createDocumentFragment();
        const response = {
            status:  true,
            name:    'Macro',
            version: 1,
            
            properties: props,

            root: rootCard.serialize(fragment, initial_properties)
        };

        mainTreeViewItems.appendChild(fragment);

        // ADD EVNTS
        mainTreeViewItems.addEventListener('click', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseenter', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseleave', _receive_events, { capture: true });

        return response;
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.createCard = (card_position, card_properties, connect = null) => {
        const isRoot = (CardsMap.size === 0 ? true : false),
              left = card_position[0], 
              top = card_position[1];

        const new_card = new Card(Context, card_properties, CardsMap.size);
        CardsMap.set(new_card.getProps('uuid'), new_card); 

        if (isRoot)
            rootCard = new_card;

        new_card.setPosition(left, top, viewport.state, _MOV_.NEW);

        if (connect !== null)
            connect.makeConnection(new_card);

        return new_card;
    };
    this.newSVG = (field) => {
        const svgGroup = mainAppSVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        svgGroup.setAttribute('class', 'main-app-svg-path');

        svgGroup.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        
        const moveableLine = svgGroup.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        moveableLine.setAttribute('class', 'moveable');
        moveableLine['_OWNER_'] = new WeakRef(field);

        return svgGroup;
    };
    this.connect = (from_output, to_input) => {
        const viewportInput = to_input.getInputBounding();
        from_output.setPosition(viewportInput.left, viewportInput.top, viewport.state, _MOV_.END);
        from_output.makeConnection(to_input);
    };

    this.redraw = (element = null) => {
        const transform = viewport.state;

        if (element === null) {
            for (const card of CardsMap.values())
                card.redraw(transform);
        } else {
            element.redraw(transform);
        }

        Context.serialize();
    };
    this.showProperties = object => {
        if (visibilityMode)
            return;
        
        if (currentSelectedObject !== null)
            currentSelectedObject.setSelected(false);

        currentSelectedObject = object;
        currentSelectedObject.setSelected(true);

        // if (currentSelectedObject.hasOwnProperty('getProps'))
            properties.refresh();
    };
    this.setSelected = status => {
        isCurrentSelectObject = status;

        if (status) 
            mainAppWrapper.classList.add('selected');
        else 
            mainAppWrapper.classList.remove('selected');
        
    };
    this.getProps = (prop = null) => {
        if (prop === null) {
            return props;
        } else {
            if (props.hasOwnProperty(prop))
                return props[prop];
        }
        return null;
    };

    this.initVisibility = (fields_map) => {
        rootCard.initVisibility(fields_map);
        Context.redraw();
    };
    this.getVisibilityMode = () => visibilityMode;
    this.setVisibilityMode = () => {
        const visibility = currentSelectedObject.getProps('visibility');

        if (selectedArrow === null) {
            selectedArrow = document.createElement('div');
            selectedArrow.className = 'app-cards-item-highlight';
            selectedArrow.appendChild(document.createTextNode(_I18N_.selected_visibility));
        }

        if (visibilityTool === null)
            visibilityTool = new VisibilityTool(Context);

        visibilityMode = !visibilityMode;

        for (const status in visibility['fields']) {
            for (const field of visibility['fields'][status].values()) 
                field.selectedForVisibility(status);
        }

        for (const card of CardsMap.values())
            card.setVisibilityMode();
    };
    this.previewVisibility = (fields, evnt_type) => {
        if (visibilityMode) return;

        for (const status in fields) {
            for (const field of fields[status].values()) {
                if (evnt_type === 'mouseenter')
                    field.selectedForVisibility(status);
                else
                    field.unselectForVisibility();
            }
        }
    };
    this.deleteFromVisibility = (field, forward = true) => {
        const uuid = field.getProps('uuid');

        for (const card of CardsMap.values())
            card.deleteFromVisibility(uuid, forward);
    };
    this.clearVisibilityMap = () => {
        if (visibilityMode) {
            const visibilityFields = currentSelectedObject.getProps('visibility');

            for (const status in visibilityFields)
                visibilityFields[status].clear();

            Context.setVisibilityMode();
        }
    };

    this.removeFromCardsMap = uuid => CardsMap.delete(uuid);
    this.getFromCardsMap = uuid => CardsMap.get(uuid);

    this.getSelectedArrow  = () => selectedArrow;
    this.getVisibilityTool = () => visibilityTool;
    this.getSelectedObject = () => currentSelectedObject;
    this.getBuilderDiv = () => mainAppWrapper;

    // DRAG LISTENER ///////////////////////////////////////////////////////////
    this.dragStart = (evnt, ctx) => {
        evnt.stopPropagation();
        
        if (currentDrag !== null) 
            return;

        currentDrag = ctx;

        switch (currentDrag.getDragType()) {
            case _DRAG_.AREA:
                break;

            case _DRAG_.HEADER:
                props.index++;
                break;

            case _DRAG_.OUTPUT:
                break;

            case _DRAG_.LINE:
                break;

            case _DRAG_.BLOCK:
                if (library !== null)
                    library.onDragStart(evnt, currentDrag);
                break;
        }

        currentDrag.setPosition(evnt.clientX, evnt.clientY, viewport.state, _MOV_.START);

        document.addEventListener('mousemove', Context.drag,    { capture: true });
        document.addEventListener('mouseup',   Context.dragEnd, { capture: true });
    };
    this.drag = evnt => {
        evnt.stopPropagation();

        const transform = viewport.state;
        currentDrag.setPosition(evnt.clientX, evnt.clientY, transform, _MOV_.MOV);

        switch (currentDrag.getDragType()) {
            case _DRAG_.AREA:
                break;

            case _DRAG_.HEADER:
                currentDrag.redraw(transform);
                break;

            case _DRAG_.OUTPUT:
                let connection = false;
                const target = evnt.target;

                if (target.hasOwnProperty('_UUID_')) {
                    if (CardsMap.has(target['_UUID_'])) {
                        const targetCtx = CardsMap.get(target['_UUID_']);
                        connection = targetCtx.hasConnection();
                    }
                }
                currentDrag.check(target, connection);
                break;

            case _DRAG_.BLOCK:
                if (library !== null)
                    library.onDragMove(evnt, currentDrag);
                break;
        }
    };
    this.dragEnd = evnt => {
        evnt.stopPropagation();

        const transform = viewport.state;
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
                    // const targetCtx = target['_CONTEXT_'].deref();
                    // const uuid = target['_UUID_'];
                    if (CardsMap.has(target['_UUID_'])) {
                        const targetCtx = CardsMap.get(target['_UUID_']);
                    // if (targetCtx !== undefined) {
                        if (!currentDrag.hasConnection() && !targetCtx.hasConnection()) {
                            if (!currentDrag.infiniteLoop(target)) {
                                Context.connect(currentDrag, targetCtx);
                                use = true;
                            }
                        }
                    }
                    // }
                } else if (target.classList.contains('main-app-wrapper')) {
                    const offset = 49 * transform.scale;

                    const card_left = (evnt.clientX - transform.left) / transform.scale,
                          card_top = ((evnt.clientY - offset) - transform.top) / transform.scale;

                    const new_card = Context.createCard([card_left, card_top]);
                    Context.connect(currentDrag, new_card);
                    use = true;
                }

                if (!use)
                    currentDrag.clearConnection();
                else
                    Context.serialize();

                break;

            case _DRAG_.LINE:
                currentDrag.setDragType(_DRAG_.OUTPUT);
                break;

            case _DRAG_.BLOCK:
                if (library !== null)
                    library.onDragEnd(evnt, currentDrag);
                break;
        }

        document.removeEventListener('mousemove', Context.drag, { capture: true });
        document.removeEventListener('mouseup',   Context.dragEnd, { capture: true });

        currentDrag = null;
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (() => {
        props = {...props, ...__properties};

        const fragment = document.createDocumentFragment();

        mainApp = addElement(fragment, 'div', 'main-app remove-focus-select');

        mainTreeView = addElement(mainApp, 'div', 'main-app-treeview');
        const colResize = addElement(mainApp, 'div', 'main-app-treeview-col-resize');

        mainBuilder = addElement(mainApp, 'div', 'main-app-builder');
        const mainProperties = addElement(mainApp, 'div', 'main-app-properties');

        const mainLibrary = addElement(mainTreeView, 'div', 'main-app-library-root');
        mainTreeViewItems = addElement(mainTreeView, 'div', 'main-app-treeview-items');
        
        mainBuilderToolbar = addElement(mainBuilder, 'div', 'main-app-builder-toolbar');
        const serializeBtn = addElement(mainBuilderToolbar, 'div', 'icon', _ICON_CHAR_.OUTPUT);
        serializeBtn.addEventListener('click', () => {
            var x = Context.serialize();
            console.log(JSON.stringify(x));
        }, { capture: false });
        
        addElement(mainBuilderToolbar, 'div', 'button');
        addElement(mainBuilderToolbar, 'div');

        const simulateDiv = addElement(mainBuilderToolbar, 'div', 'holder');
        const simulateBtn = addElement(simulateDiv, 'div', 'button', _I18N_.simulate);
        // simulateBtn.addEventListener('click', function(evnt) { simulate.start(); }, { capture: false });
        simulateBtn.addEventListener('click', () => {
            const serialize = Context.serialize();
            simulate.start(serialize);
         }, { capture: false });


        mainAppWrapper = addElement(mainBuilder, 'div', 'main-app-wrapper');
        mainAppWrapper.setAttribute('tabindex',  0);

        mainAppWrapper.addEventListener('focus', () => Context.showProperties(Context), { capture: false });

        // if (props.hasOwnProperty('size')) {
        //     size.width = props.size[0];
        //     size.height = props.size[1];
        // }

        mainAppSVG = mainAppWrapper.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        mainAppSVG.setAttribute('class', 'main-app-svg');
        mainAppSVG.setAttribute('width',  props.size.width);
        mainAppSVG.setAttribute('height', props.size.height);

        viewport = createViewport({
            builderElement: mainBuilder,
            wrapperElement: mainAppWrapper
        });

        library = createLibrarySidebar({
            mountTarget: mainLibrary,
            startDrag: Context.dragStart,
            macroContext: Context,
            getViewportState: () => viewport.state
        });
        library.mount();

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
        
        //mainTreeViewItems.addEventListener('resize', _receive_events, { capture: true });
        //window.addEventListener('resize', _resize, { capture: true });
        //window.addEventListener('resize', _on_resize, { capture: false });

        mainAppWrapper.addEventListener('wheel', _wheel_zoom, { capture: false, passive: true });
        mainAppWrapper.addEventListener('mousedown', (evnt) => {
            if (evnt.button !== 0)
                return;

            if (currentDrag !== null) {
                if (currentDrag.getDragType() !== _DRAG_.HEADER) 
                    Context.dragEnd(evnt);
                
                return;
            }

            if (evnt.target.classList.contains('main-app-wrapper')) {
                Context.dragStart(evnt, Context);
            } else if (evnt.target.classList.contains('moveable')) {
                evnt.preventDefault();

                const field = evnt.target['_OWNER_'].deref();
                if (field !== undefined) {
                    field.setDragType(_DRAG_.LINE);
                    Context.dragStart(evnt, field);
                }
            }
        }, { capture: false });

        mainAppWrapper.addEventListener('dblclick', _receive_events, { capture: false });

        properties = new Properties(Context);
        mainProperties.appendChild(properties.getFragment());

        simulate = new Simulate(_RUN_ENVIRONMENT_.WEB);
        simulateDiv.appendChild(simulate.getFragment());
    })();
}