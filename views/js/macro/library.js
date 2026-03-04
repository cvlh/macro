'use strict';

import { _DRAG_, _MOV_, _TYPES_ } from '../utils/constants.js';
import { addElement } from '../utils/functions.js';
import { _I18N_ } from './../i18n/pt-br.js';

import textComponent from './library/text.js';
import numberComponent from './library/number.js';
import emailComponent from './library/email.js';
import dateComponent from './library/date.js';
import timeComponent from './library/time.js';
import photoComponent from './library/photo.js';
import signatureComponent from './library/signature.js';
import scanComponent from './library/scan.js';

const WRAPPER_SELECTOR = '.main-app-wrapper';
const WRAPPER_CLASS = 'main-app-wrapper';
const GHOST_Z_INDEX = '9999';
const GHOST_TRANSITION_MS = 120;

const LIBRARY_COMPONENTS = Object.freeze([
    textComponent,
    numberComponent,
    emailComponent,
    dateComponent,
    timeComponent,
    photoComponent,
    signatureComponent,
    scanComponent
]);

const LIBRARY_TYPE_MAP = Object.freeze({
    text: _TYPES_.TEXT,
    number: _TYPES_.NUMBER,
    email: _TYPES_.TEXT,
    date: _TYPES_.DATE,
    time: _TYPES_.TIME,
    photo: _TYPES_.PHOTO,
    signature: _TYPES_.SIGNATURE,
    scan: _TYPES_.SCAN
});

const COMPONENT_BY_ID = new Map(
    LIBRARY_COMPONENTS.map(component => [component.id, component])
);

const createBlockDragContext = (component, sourceElement) => {
    const position = { left: 0, top: 0, offsetLeft: 0, offsetTop: 0 };

    return {
        getDragType: () => _DRAG_.BLOCK,
        getComponent: () => component,
        getSourceElement: () => sourceElement,
        getPosition: () => ({ left: position.left, top: position.top }),
        setPosition: (left, top, _, action) => {
            if (action === _MOV_.START) {
                const rect = sourceElement.getBoundingClientRect();
                position.left = rect.left;
                position.top = rect.top;
                position.offsetLeft = left - rect.left;
                position.offsetTop = top - rect.top;
                return;
            }

            position.left = left - position.offsetLeft;
            position.top = top - position.offsetTop;
        }
    };
};

const toDropPosition = (evnt, transform) => {
    return {
        left: (evnt.clientX - transform.left) / transform.scale,
        top: (evnt.clientY - transform.top) / transform.scale
    };
};

const createLibrarySidebar = ({ mountTarget, startDrag, macroContext, getViewportState }) => {
    let libraryRoot = null,
        libraryItems = null,
        ghost = null,
        ghostRaf = 0,
        ghostTimeout = 0,
        sourceElement = null;

    const pointer = { x: 0, y: 0, validDrop: false };

    const clearGhostTimeout = () => {
        if (ghostTimeout !== 0) {
            window.clearTimeout(ghostTimeout);
            ghostTimeout = 0;
        }
    };

    const clearGhostRaf = () => {
        if (ghostRaf !== 0) {
            cancelAnimationFrame(ghostRaf);
            ghostRaf = 0;
        }
    };

    const removeGhost = () => {
        clearGhostRaf();
        clearGhostTimeout();

        if (ghost !== null) {
            ghost.remove();
            ghost = null;
        }

        if (sourceElement !== null) {
            sourceElement.classList.remove('dragging');
            sourceElement = null;
        }
    };

    const animateGhostOut = () => {
        if (ghost === null) {
            removeGhost();
            return;
        }

        clearGhostRaf();

        ghost.style.transition = `opacity ${GHOST_TRANSITION_MS}ms ease, transform ${GHOST_TRANSITION_MS}ms ease`;
        ghost.style.opacity = '0';
        ghost.style.transform = `translate(${pointer.x}px, ${pointer.y}px) scale(0.95)`;

        ghostTimeout = window.setTimeout(removeGhost, GHOST_TRANSITION_MS + 20);
    };

    const scheduleGhostRender = () => {
        if (ghostRaf !== 0)
            return;

        ghostRaf = requestAnimationFrame(() => {
            ghostRaf = 0;
            if (ghost !== null) {
                ghost.style.transform = `translate(${pointer.x}px, ${pointer.y}px) scale(1.005)`;
                ghost.classList.toggle('drop-valid', pointer.validDrop);
                ghost.classList.toggle('drop-invalid', !pointer.validDrop);
            }
        });
    };

    const createGhost = (dragContext, pointerEvent) => {
        removeGhost();

        sourceElement = dragContext.getSourceElement();
        sourceElement.classList.add('dragging');

        ghost = sourceElement.cloneNode(true);
        ghost.classList.add('library-item-ghost');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.style.position = 'fixed';
        ghost.style.left = '0px';
        ghost.style.top = '0px';
        ghost.style.zIndex = GHOST_Z_INDEX;
        ghost.style.pointerEvents = 'none';
        ghost.style.willChange = 'transform';
        ghost.style.opacity = '0.9';
        ghost.style.transform = `translate(${pointerEvent.clientX}px, ${pointerEvent.clientY}px) scale(1.005)`;

        document.body.appendChild(ghost);
    };

    const isDropTargetValid = target => {
        if (!target || !(target instanceof Element))
            return false;

        return target.classList.contains(WRAPPER_CLASS) || target.closest(WRAPPER_SELECTOR) !== null;
    };

    const getPointerTarget = evnt => {
        const pointerTarget = document.elementFromPoint(evnt.clientX, evnt.clientY);
        return pointerTarget instanceof Element ? pointerTarget : evnt.target;
    };

    const dropComponent = (dragContext, dropPosition) => {
        const component = dragContext.getComponent();
        const fieldType = LIBRARY_TYPE_MAP[component.id] ?? _TYPES_.LIST;
        const card = macroContext.createCard([dropPosition.left, dropPosition.top]);

        card.newField({
            text: component.label,
            type: { type: fieldType }
        });

        component.onDrop(macroContext, dropPosition);
        macroContext.redraw(card);
    };

    const onLibraryMouseDown = evnt => {
        if (evnt.button !== 0)
            return;

        const item = evnt.target.closest('.library-item');
        if (!item || !libraryItems.contains(item))
            return;

        const component = COMPONENT_BY_ID.get(item.dataset.componentId);
        if (!component)
            return;

        evnt.preventDefault();
        startDrag(evnt, createBlockDragContext(component, item));
    };

    return {
        mount: () => {
            libraryRoot = addElement(mountTarget, 'div', 'main-app-library');
            addElement(libraryRoot, 'div', 'main-app-library-title', _I18N_.input_blocks);
            libraryItems = addElement(libraryRoot, 'div', 'main-app-library-items');

            for (const component of LIBRARY_COMPONENTS)
                libraryItems.appendChild(component.createButton());

            libraryRoot.addEventListener('mousedown', onLibraryMouseDown, { capture: false });
        },
        onDragStart: (evnt, dragContext) => {
            createGhost(dragContext, evnt);
            pointer.x = evnt.clientX;
            pointer.y = evnt.clientY;
            pointer.validDrop = false;
            scheduleGhostRender();
        },
        onDragMove: (evnt, dragContext) => {
            pointer.x = evnt.clientX;
            pointer.y = evnt.clientY;
            pointer.validDrop = isDropTargetValid(getPointerTarget(evnt));

            scheduleGhostRender();
        },
        onDragEnd: (evnt, dragContext) => {
            const target = getPointerTarget(evnt);
            const validDrop = isDropTargetValid(target);

            pointer.x = evnt.clientX;
            pointer.y = evnt.clientY;
            pointer.validDrop = validDrop;
            scheduleGhostRender();

            if (validDrop) {
                try {
                    const transform = getViewportState();
                    dropComponent(dragContext, toDropPosition(evnt, transform));
                } catch (error) {
                    console.error('Library drop failed:', error);
                }
            }

            animateGhostOut();
        }
    };
};

export default createLibrarySidebar;
