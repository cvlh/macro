'use strict';

import { _I18N_ } from '../../../i18n/pt-br.js';
import { _ICON_CHAR_, _KEYBOARD_FLAGS_ } from '../../../utils/constants.js';
import { addElement } from '../../../utils/functions.js';

export default function InputPhoto(__append, __properties) {

    if (!new.target) 
        throw new Error('InputSignature() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////
    let media_stream;

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        DOMElement = { 
            video: null,
            canvas: null,

            take_btn: null,

            wait_icon: null,
            wait_message: null
        },

    _create = (parent) => {
        DOMElement.wait_icon = addElement(parent, 'div', 'loading-resources-icon icon', _ICON_CHAR_.CAMERA);
        DOMElement.wait_icon.style.color = __properties['color'];

        DOMElement.wait_message = addElement(parent, 'div', 'loading-resources-text', _I18N_.resource_loading);
        DOMElement.wait_message.style.color = __properties['color'];

        DOMElement.video = addElement(parent, 'video', 'item-drawing');
        DOMElement.video.setAttribute('width', parent.offsetWidth);
        DOMElement.video.setAttribute('height', parent.offsetHeight);
        DOMElement.video.setAttribute('muted', '');
        DOMElement.video.setAttribute('autoplay', '');
        DOMElement.video.setAttribute('playsinline', '');
        
        DOMElement.canvas = addElement(parent, 'canvas', 'item-drawing');
        DOMElement.canvas.width = parent.offsetWidth;
        DOMElement.canvas.height = parent.offsetHeight;
        
        DOMElement.take_btn = addElement(parent, 'div', 'take-picture icon', _ICON_CHAR_.CAMERA);

        _photo();
    },
    _stop = () => {
        if (media_stream !== null) {
            const video_track = media_stream.getVideoTracks()[0];
            video_track.stop();

            media_stream.removeTrack(video_track);
            media_stream = null;
        }
    },
    _take = () => {
        DOMElement.take_btn.style.visibility = 'hidden';
        DOMElement.video.style.visibility = 'hidden';
        DOMElement.canvas.style.removeProperty('visibility');

        __properties.keyboard(true, _KEYBOARD_FLAGS_.BTN_OK | _KEYBOARD_FLAGS_.BTN_CLEAR);

        const ctx = DOMElement.canvas.getContext('2d');
        ctx.drawImage(DOMElement.video, 0, 0, DOMElement.canvas.width, DOMElement.canvas.height);

        const image_data_url = DOMElement.canvas.toDataURL('image/jpeg');
        // console.log(image_data_url);

        _stop();
    },
    _photo = () => {
        DOMElement.video.style.visibility = 'hidden';
        DOMElement.canvas.style.visibility = 'hidden';
        DOMElement.take_btn.style.visibility = 'hidden';

        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {

            navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', aspectRatio: { min: 0.6, max: 1 } } }).then(function (mediaStream) {
                media_stream = mediaStream;

                const video_track = mediaStream.getVideoTracks()[0];
                DOMElement.video.srcObject = mediaStream;

                DOMElement.video.onloadedmetadata = function() {
                    DOMElement.wait_icon.style.visibility = 'hidden';
                    DOMElement.wait_message.style.visibility = 'hidden';

                    DOMElement.take_btn.addEventListener('click', _take, { once: true, capture: false });

                    __properties.keyboard(true, _KEYBOARD_FLAGS_.BTN_BACK);

                    const settings = video_track.getSettings();
                    if (settings.hasOwnProperty('width') && settings.hasOwnProperty('height')) {
                        const aspectratio = settings['width'] / this.getAttribute('width');

                        DOMElement.canvas.setAttribute('width', settings['width'] / aspectratio);
                        DOMElement.canvas.setAttribute('height', settings['height'] / aspectratio);
                    }

                    DOMElement.video.style.removeProperty('visibility');
                    DOMElement.take_btn.style.removeProperty('visibility');
                }

            }).catch(function (err) {
                DOMElement.wait_icon.textContent = _ICON_CHAR_.ALERT;
                DOMElement.wait_icon.style.color = 'var(--red)';

                DOMElement.wait_message.textContent = `${err.name}: ${err.message}`;
                DOMElement.wait_message.style.color = 'var(--red)';

                __properties.keyboard(true, _KEYBOARD_FLAGS_.BTN_BACK);
            });

        } else {
            DOMElement.wait_icon.textContent = _ICON_CHAR_.ALERT;
            DOMElement.wait_icon.style.color = 'var(--red)';

            __properties.keyboard(true, _KEYBOARD_FLAGS_.BTN_BACK);
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.clear = () => {
        _photo();
        __properties.keyboard(false, _KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK );
    };
    this.rewind = () => {
        _stop();

        for (const element in DOMElement)
            __append.removeChild(DOMElement[element]);
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        media_stream = null;

        __properties.keyboard(false, _KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK );
        __append.addEventListener('animationend', function() {
            _create(this);
        }, { once: true, capture: false });
    })();
}
    