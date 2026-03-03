'use strict';

import { _MOV_, _ZOOM_ } from "../utils/constants.js";

export default function createViewport({ builderElement, wrapperElement }) {
    const state = { scale: 1, left: 0, top: 0 };
    const offset = { left: 0, top: 0 };

    const clampScale = (scale) => Math.max(_ZOOM_.MIN, Math.min(_ZOOM_.MAX, scale));

    const getBuilderRect = () => builderElement.getBoundingClientRect();
    const getWrapperRect = () => wrapperElement.getBoundingClientRect();

    const apply = () => wrapperElement.style.transform = `translate(${state.left}px, ${state.top}px) scale(${state.scale})`;

    const zoom = delta => {
        const builderRect = getBuilderRect();
        const wrapperRect = getWrapperRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2);
        const builderTopCenter = builderRect.top + (builderRect.height / 2);

        const scale = clampScale(state.scale * (1 + delta));
        if (scale === state.scale) return false;

        state.scale = scale;
        state.left += (wrapperRect.left - builderLeftCenter) * delta;
        state.top += (wrapperRect.top - builderTopCenter) * delta;

        apply();
        return true;
    };
    const wheel = (clientX, clientY, delta) => {
        const { left, top } = getWrapperRect();

        const scale = clampScale(state.scale * (1 + delta));
        if (scale === state.scale) return false;

        state.scale = scale;
        state.left += (left - clientX) * delta;
        state.top += (top - clientY) * delta;

        apply();
        return true;
    };
    const pan = () => {
        const builderRect = getBuilderRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2);
        const builderTopCenter = builderRect.top + (builderRect.height / 2);
        const delta = 1 - state.scale;

        state.left = (state.left - (builderLeftCenter * delta)) / state.scale;
        state.top = (state.top - (builderTopCenter * delta)) / state.scale;
        state.scale = 1;

        apply();
    };
    const fit = () => {
        const builderRect = getBuilderRect();
        const wrapperRect = getWrapperRect();

        const builderLeftCenter = builderRect.width / 2;
        const builderTopCenter = builderRect.height / 2;
        const wrapperLeftCenter = (wrapperRect.width / state.scale) / 2;
        const wrapperTopCenter = (wrapperRect.height / state.scale) / 2;
        const widthFactor = wrapperRect.width / builderRect.width;
        const heightFactor = wrapperRect.height / builderRect.height;

        state.scale = clampScale(state.scale / Math.max(widthFactor, heightFactor));
        state.left = builderRect.left + builderLeftCenter - (wrapperLeftCenter * state.scale);
        state.top = builderRect.top + builderTopCenter - (wrapperTopCenter * state.scale);

        apply();
    };
    const center = (targetRect) => {
        const builderRect = getBuilderRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2);
        const builderTopCenter = builderRect.top + (builderRect.height / 2);
        const rectLeftCenter = targetRect.left + (targetRect.width / 2);
        const rectTopCenter = targetRect.top + (targetRect.height / 2);

        state.left = (state.left - rectLeftCenter) + builderLeftCenter;
        state.top = (state.top - rectTopCenter) + builderTopCenter;

        apply();
    };
    const drag = (clientX, clientY, type) => {
        if (type === _MOV_.START) {
            const rect = getWrapperRect();
            offset.left = clientX - rect.left;
            offset.top = clientY - rect.top;

            return;
        }
    
        state.left = clientX - offset.left;
        state.top = clientY - offset.top;
        apply();
    };

    return {
        state,
        zoom,
        wheel,
        pan,
        fit,
        center,
        drag
    };
}
