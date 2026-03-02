'use strict';

export default function createViewport({ transform, limits, builderEl, wrapperEl }) {
    const state = transform;
    const { min: minScale, max: maxScale } = limits;

    const dragOffset = { left: 0, top: 0 };
    let cachedBuilderRect = null;

    const clampScale = (scale) => Math.max(minScale, Math.min(maxScale, scale));

    const getBuilderRect = () => builderEl.getBoundingClientRect();
    const getWrapperRect = () => wrapperEl.getBoundingClientRect();

    const apply = () => wrapperEl.style.transform = `translate(${state.left}px, ${state.top}px) scale(${state.scale})`;

    const zoomBy = (delta) => {
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

    const wheelZoomAt = (clientX, clientY, delta) => {
        const { left, top } = getWrapperRect();

        const scale = clampScale(state.scale * (1 + delta));
        if (scale === state.scale) return false;

        state.scale = scale;
        state.left += (left - clientX) * delta;
        state.top += (top - clientY) * delta;

        apply();
        return true;
    };

    const panReset = () => {
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

    const centerRect = (targetRect) => {
        const builderRect = getBuilderRect();

        const builderLeftCenter = builderRect.left + (builderRect.width / 2);
        const builderTopCenter = builderRect.top + (builderRect.height / 2);
        const rectLeftCenter = targetRect.left + (targetRect.width / 2);
        const rectTopCenter = targetRect.top + (targetRect.height / 2);

        state.left = (state.left - rectLeftCenter) + builderLeftCenter;
        state.top = (state.top - rectTopCenter) + builderTopCenter;

        apply();
    };

    const dragStart = (clientX, clientY) => {
        const rect = getWrapperRect();
        dragOffset.left = clientX - rect.left;
        dragOffset.top = clientY - rect.top;
    };

    const dragMove = (clientX, clientY) => {
        state.left = clientX - dragOffset.left;
        state.top = clientY - dragOffset.top;
        apply();
    };


    return {
        zoomBy,
        wheelZoomAt,
        panReset,
        fit,
        centerRect,
        dragStart,
        dragMove
    };
}
