 'use strict';

import { _DRAG_, _MOV_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import Card from './cards.js';
import TreeView from './treeview.js';

////////////////////////////////////////////////////////////////////////////////
export default function Macro() {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const context = this,
          css_prefix = 'idx_';

    // VARIABLES ///////////////////////////////////////////////////////////////
    let mainApp, mainAppWrapper, mainAppSVG, 
        mainTreeView, mainTreeViewItems,

        rootCard, treeView,
        currentDrag = null,
        
        cardsArray = [],
        transform = { scale: 1, left: 0, top: 0, index: 0 },
        position = { offsetLeft: 0, offsetTop: 0 },
        size = { width: 3840, height: 2160 },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _expand_collapse = function(expanded, fields) {
        const sizeElements = fields.length;
        let counter;
        
        for (counter=0; counter<sizeElements; counter++) {
            if (fields[counter].ctx.hasConnection()) {
                _expand_collapse(fields[counter].ctx.getExpand(), fields[counter].conn.fields);
            } else {
                if (expanded) {
                    //fields[counter].style.removeProperty('height');
                } else {
                    //fields[counter].style.height = '0';
                }
            }
        }
    },
    _set_border_line = function(elements, index, color) {
        const sizeElements = elements.length;
        let counter, child;

        for (counter=0; counter<sizeElements; counter++) {
            child = elements[counter].childNodes.item(index);
            child.style.borderLeftColor = color;
        }
    },
    _receive_events = function (evnt) {
        evnt.stopPropagation();

        const target = evnt.target,
              targetClass = target.classList,
              parent = target.parentElement,
              props = parent['_ADDLOG_'];

        if (targetClass.contains('main-app-treeview-item')) {
            if (targetClass.contains('expand')) {

                const status = props.ctx.getExpand()
                switch (evnt.type) {
                    case 'click':
                        //if (props.ctx.hasConnection()) { }
                        _expand_collapse(status, props.conn.fields);

                        const expand = target.firstChild;
                        if (status) {
                            expand.style.removeProperty('transform');
                        } else {
                            expand.style.transform = 'rotate(90deg)';
                        }

                        props.ctx.setExpand(!status);
                        break;

                    case 'mouseenter':
                        if (!status) return;

                        const parentClass = parent.classList[0];
                        if (!parentClass) return;
                        const ids = parentClass.slice(css_prefix.length).split('.');

                        props['elements'] = mainTreeViewItems.querySelectorAll('[class^="' +parentClass+ '."]');
                        props['index'] = ids.length;

                        _set_border_line(props['elements'], props['index'], props['color'][1]);
                        break;

                    case 'mouseleave':
                        if (props.hasOwnProperty('elements')) {
                            _set_border_line(props['elements'], props['index'], props['color'][0]);

                            delete props.elements;
                            delete props.index;
                        }
                        break;
                }
            } else if (targetClass.contains('field')) {

            }
        }
    },
    _deep = function(tab) {
        let counter, result = css_prefix;
        for (counter=0; counter<tab.length; counter++) {
            result += tab[counter];
            if (counter < tab.length-1 ) result += '.';
        }
        return result;
    },
    _update = function(fields, fragment, props = { tab: [], expand: true, color: null }) {
        let counterFields, counterOffset, 
            fieldRow, fieldOffset, fieldDiv, fieldPath, field, 
            hasChild, isRoot, isExpand, deepSize, deep, lightColor;

        const rootFieldsSize = fields.length;

        for (counterFields=0; counterFields<rootFieldsSize; counterFields++) {
            field = fields[counterFields];

            props.tab.push(counterFields+1);
            deep = _deep(props.tab);

            isRoot = field.ctx.isRoot();
            if (isRoot) props.color = field.ctx.getColor();
            lightColor = props.color + '30';

            hasChild = false;
            if (field.ctx.hasConnection()) hasChild = true;

            deepSize = props.tab.length;
            if (hasChild || isRoot) deepSize++;

            fieldRow = addElement(fragment, 'div', deep+ ' main-app-treeview-row');
            fieldRow.style.gridTemplateColumns = 'repeat(' +deepSize+ ', 12px) auto 15px 15px';
            if (!props.expand) fieldRow.style.height = '0';

            fieldRow['_ADDLOG_'] = { 
                ctx: field.ctx, 
                conn: field.conn, 
                color: [ lightColor, props.color ]
            };

            isExpand = true;
            if (hasChild && !field.ctx.getExpand() && props.expand) {
                props.expand = false;
                isExpand = false;
            }

            for (counterOffset=0; counterOffset<props.tab.length; counterOffset++) {
                fieldOffset = addElement(fieldRow, 'div', 'main-app-treeview-item');
                if (counterOffset > 0) fieldOffset.style.borderLeftColor = lightColor;
            }
            if (hasChild || isRoot) {
                fieldOffset.classList.add((hasChild ? 'expand' : 'none'));
                fieldOffset = addElement(fieldOffset, 'div');
                if (props.expand) fieldOffset.style.transform = 'rotate(90deg)';
            }

            fieldDiv = addElement(fieldRow, 'div', 'main-app-treeview-item field');
            fieldDiv.textContent = field.ctx.getText();
            if (isRoot) fieldDiv.style.color = props.color;
            if (hasChild || isRoot) fieldDiv.style.fontWeight = '600';
            if (!hasChild && !isRoot) fieldDiv.style.fontSize = '10px';

            fieldPath = addElement(fieldDiv, 'div', 'main-app-treeview-item-path');
            fieldPath.style.color = props.color;
            fieldPath.textContent = deep.slice(css_prefix.length);

            addElement(fieldRow, 'div', 'main-app-treeview-item');
            addElement(fieldRow, 'div', 'main-app-treeview-item');

            if (hasChild) _update(field['conn']['fields'], fragment, props);

            if (!isExpand) props.expand = true;
            props.tab.pop();
        }
    },
    _resize = function() {
        //const widthOptions = mainOptions.offsetWidth;

        mainTreeView.style.height = window.innerHeight + 'px';

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
            visibility: [ ],

            root: rootCard.serialize()
        };

        while (mainTreeViewItems.hasChildNodes()) {
            mainTreeViewItems.removeChild(mainTreeViewItems.firstChild);
        }

        const fragment = document.createDocumentFragment();
        if (response['root'].hasOwnProperty('fields')) {
            _update(response['root']['fields'], fragment);
        }
        mainTreeViewItems.appendChild(fragment);

        return response;
    };

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

                            console.log(context.serialize());
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
        
        mainAppWrapper = addElement(mainApp, 'div', 'main-app-wrapper');

        mainAppSVG = mainAppWrapper.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        mainAppSVG.setAttribute('class', 'main-app-svg');
        mainAppSVG.setAttribute('width',  size.width);
        mainAppSVG.setAttribute('height', size.height);

        mainTreeView = addElement(mainApp, 'div', 'main-app-treeview');
        mainTreeViewItems = addElement(mainTreeView, 'div', 'main-app-treeview-items');

        document.body.appendChild(fragment);
        _resize();
        
        // EVNTS
        mainTreeViewItems.addEventListener('click', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseenter', _receive_events, { capture: true });
        mainTreeViewItems.addEventListener('mouseleave', _receive_events, { capture: true });

        window.addEventListener('resize', _resize, { capture: true });

        mainAppWrapper.addEventListener('wheel', _zoom, { capture: false, passive: true });
        mainAppWrapper.addEventListener('mousedown', (evnt) => {
            if (currentDrag !== null) {
                if (currentDrag.getDragType() !== _DRAG_.HEADER) context.dragEnd(evnt);
                return;
            }

            if (evnt.target.classList.contains('main-app-wrapper')) {
                context.dragStart(evnt, context)
            }
        }, { capture: true });

    })();
}