'use strict';

import { _KEYBOARD_FLAGS_, _RUN_ENVIRONMENT_ } from '../../../utils/constants.js';
import { addElement } from '../../../utils/functions.js';

export default function InputSignature(__append, __properties) {

    if (!new.target) 
        throw new Error('InputSignature() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        DOMElement = { canvas: null },

    // PRIVATE /////////////////////////////////////////////////////////////////
    _signature = (parent) => {
        DOMElement.canvas = addElement(parent, 'canvas', 'item-drawing');

        const canvas = DOMElement.canvas;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;

        const ctx = canvas.getContext('2d');
        ctx.font = '11px VP-FONT';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillStyle = __properties['color'];
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        _draw_info(ctx);

        if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
            canvas.addEventListener('mousedown', _drawing_start, { once: true, capture: false });
        } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
            canvas.addEventListener('touchstart', _drawing_start, { once: true, capture: true });
        }
    },
    _draw_info = (context) => {
        const canvas = DOMElement.canvas;

        const label = __properties['text'];
        const size = context.measureText(label);

        let startOffset = 5;
        if (size.width < canvas.width)
            startOffset = (canvas.width / 2) - (size.width / 2);

        context.strokeStyle = __properties['color'];

        context.fillText(label, startOffset, canvas.height - 15, canvas.width - 10);
        context.beginPath();
        context.moveTo(15, canvas.height - 26);
        context.lineTo(canvas.width - 15, canvas.height - 26);
        context.stroke();

        context.strokeStyle = 'black';
    },
    _draw_position = (evnt, rect) => {
        let deltaX = 0, deltaY = 0;

        if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
            deltaX = evnt.clientX - rect.x;
            deltaY = evnt.clientY - rect.y;
        } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
            if ((evnt.type === 'touchstart' || evnt.type === 'touchmove') && evnt.touches.length > 0) {
                deltaX = evnt.touches[0].clientX - rect.x;
                deltaY = evnt.touches[0].clientY - rect.y;
            }
        }

        return [ deltaX, deltaY ];
    },

    _drawing_start = function (evnt) {
        evnt.preventDefault();

        __properties.keyboard(true, _KEYBOARD_FLAGS_.BTN_OK | _KEYBOARD_FLAGS_.BTN_CLEAR);

        const rect = this.getBoundingClientRect();
        this['_drawing_'] = _draw_position(evnt, rect);

        if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
            this.addEventListener('mousemove', _drawing, { capture: false });
            this.addEventListener('mouseup', _drawing_end, { once: true, capture: false });
        } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
            this.addEventListener('touchmove', _drawing, { capture: true });
            this.addEventListener('touchend', _drawing_end, { once: true, capture: true });
        }
    },
    _drawing = function (evnt) {
        evnt.preventDefault();

        const rect = this.getBoundingClientRect();
        const ctx = this.getContext('2d');

        ctx.beginPath();
        ctx.moveTo(this['_drawing_'][0], this['_drawing_'][1]);
        this['_drawing_'] = _draw_position(evnt, rect);
        ctx.lineTo(this['_drawing_'][0], this['_drawing_'][1]);
        ctx.stroke();
    },
    _drawing_end = function (evnt) {
        evnt.preventDefault();

        delete this['_drawing_'];

        if (__properties['env'] === _RUN_ENVIRONMENT_.WEB) {
            this.removeEventListener('mousemove', _drawing, { capture: false });
            this.addEventListener('mousedown', _drawing_start, { once: true, capture: false });
        } else if (__properties['env'] === _RUN_ENVIRONMENT_.MOBILE) {
            this.removeEventListener('touchmove', _drawing, { capture: true });
            this.addEventListener('touchstart', _drawing_start, { once: true, capture: true });
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.clear = () => {
        const ctx = DOMElement.canvas.getContext('2d');
        ctx.clearRect(0, 0, DOMElement.canvas.width, DOMElement.canvas.height);

        _draw_info(ctx);
        __properties.keyboard(false, _KEYBOARD_FLAGS_.BTN_OK | _KEYBOARD_FLAGS_.BTN_CLEAR);
    }

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        __properties.keyboard(false, _KEYBOARD_FLAGS_.BTN_OK | _KEYBOARD_FLAGS_.BTN_CLEAR);
        __append.addEventListener('animationend', function() {
            _signature(this);
        }, { once: true, capture: false });
    })();
}
