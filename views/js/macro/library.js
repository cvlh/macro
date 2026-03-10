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
        sourceElement = null,
        previewCard = null;

    const pointer = { 
        x: 0, 
        y: 0, 
        offsetX: 0, 
        offsetY: 0, 
        validDrop: false 
    };

    const getGhostTranslate = () => ({
        left: pointer.x - pointer.offsetX,
        top: pointer.y - pointer.offsetY
    });

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

    const clearCardInsertPreview = () => {
        if (previewCard !== null && typeof previewCard.clearLibraryInsertPreview === 'function')
            previewCard.clearLibraryInsertPreview();

        previewCard = null;
    };

    const animateGhostOut = () => {
        if (ghost === null) {
            removeGhost();
            return;
        }

        clearGhostRaf();

        ghost.style.transition = `opacity 120ms ease, transform 120ms ease`;
        ghost.style.opacity = '0';
        const translate = getGhostTranslate();
        ghost.style.transform = `translate(${translate.left}px, ${translate.top}px) scale(0.90)`;

        ghostTimeout = window.setTimeout(removeGhost, 120 + 20);
    };

    const scheduleGhostRender = () => {
        if (ghostRaf !== 0)
            return;

        ghostRaf = requestAnimationFrame(() => {
            ghostRaf = 0;
            if (ghost !== null) {
                const translate = getGhostTranslate();
                ghost.style.transform = `translate(${translate.left}px, ${translate.top}px) rotate(-2deg)`;
                ghost.classList.toggle('drop-valid', pointer.validDrop);
                ghost.classList.toggle('drop-invalid', !pointer.validDrop);
            }
        });
    };

    const createGhost = (dragContext, pointerEvent) => {
        removeGhost();

        sourceElement = dragContext.getSourceElement();
        ghost = sourceElement.cloneNode(true);
        
        const sourceRect = sourceElement.getBoundingClientRect();
        pointer.offsetX = pointerEvent.clientX - sourceRect.left;
        pointer.offsetY = pointerEvent.clientY - sourceRect.top;

        sourceElement.classList.add('dragging');

        ghost.classList.add('library-item-ghost');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.style.width = `${sourceRect.width}px`;
        ghost.style.height = `${sourceRect.height}px`;
        ghost.style.transform = `translate(${sourceRect.left}px, ${sourceRect.top}px) rotate(-2deg)`;

        document.body.appendChild(ghost);
    };

    const isDropTargetValid = target => {
        if (!target || !(target instanceof Element))
            return false;

        return target.classList.contains('main-app-wrapper') || target.closest('.main-app-wrapper') !== null;
    };

    const getPointerTarget = evnt => {
        const pointerTarget = document.elementFromPoint(evnt.clientX, evnt.clientY);
        return pointerTarget instanceof Element ? pointerTarget : evnt.target;
    };

    const resolveCardFromDropTarget = target => {
        if (!target || !(target instanceof Element))
            return null;

        const itemsContainer = target.closest('.app-cards-content-items');
        if (itemsContainer === null || !itemsContainer.hasOwnProperty('_UUID_'))
            return null;

        const card = macroContext.getFromCardsMap(itemsContainer['_UUID_']);
        return card ?? null;
    };

    const dropComponent = (dragContext, dropPosition, dropTarget) => {
        const component = dragContext.getComponent();
        const targetCard = resolveCardFromDropTarget(dropTarget);
        const card = targetCard ?? macroContext.createCard([dropPosition.left, dropPosition.top]);

        if (typeof card.newFieldFromComponent === 'function')
            card.newFieldFromComponent(component);
        else
            card.newField({ text: component.label, type: { type: _TYPES_.LIST } });

        component.onDrop(macroContext, dropPosition);
        macroContext.redraw(card);
    };

    const updateInsertPreview = (evnt, target) => {
        const targetCard = resolveCardFromDropTarget(target);

        if (previewCard !== null && previewCard !== targetCard && typeof previewCard.clearLibraryInsertPreview === 'function')
            previewCard.clearLibraryInsertPreview();

        if (targetCard !== null && typeof targetCard.previewLibraryInsert === 'function')
            targetCard.previewLibraryInsert(evnt.clientY);

        previewCard = targetCard;
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
            clearCardInsertPreview();
            pointer.x = evnt.clientX;
            pointer.y = evnt.clientY;
            pointer.validDrop = false;
            scheduleGhostRender();
        },
        onDragMove: (evnt, dragContext) => {
            const target = getPointerTarget(evnt);
            pointer.x = evnt.clientX;
            pointer.y = evnt.clientY;
            pointer.validDrop = isDropTargetValid(target);
            updateInsertPreview(evnt, target);

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
                    dropComponent(dragContext, toDropPosition(evnt, transform), target);
                } catch (error) {
                    console.error('Library drop failed:', error);
                }
            }

            clearCardInsertPreview();
            animateGhostOut();
        }
    };
};

export default createLibrarySidebar;
