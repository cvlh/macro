'use strict';

import { _I18N_ } from '../../../i18n/pt-br.js';
import { _ICON_CHAR_, _KEYBOARD_FLAGS_ } from '../../../utils/constants.js';
import { addElement } from '../../../utils/functions.js';

export default function InputPhoto(__append, __properties) {

    if (!new.target) 
        throw new Error('InputSignature() must be called with new');

    // VARIABLES ///////////////////////////////////////////////////////////////

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const 
        DOMElement = { 
            video: null,
            canvas: null,
            take_btn: null
        },

    _photo = (parent) => {
        const wait_icon = addElement(parent, 'div', 'loading-resources-icon icon', _ICON_CHAR_.CAMERA);
        wait_icon.style.color = __properties['color'];

        const wait_message = addElement(parent, 'div', 'loading-resources-text', _I18N_.resource_loading);
        wait_message.style.color = __properties['color'];

        DOMElement.video = addElement(parent, 'video', 'item-drawing');
        const video = DOMElement.video;

        video.width = parent.offsetWidth;
        video.height = parent.offsetHeight;
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');

        DOMElement.canvas = addElement(parent, 'canvas', 'item-drawing');

        const canvas = DOMElement.canvas;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        canvas.style.visibility = 'hidden';

        DOMElement.take_btn = addElement(parent, 'div', 'take-picture icon', _ICON_CHAR_.CAMERA);
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', aspectRatio: { min: 0.6, max: 1 } } }).then(function (mediaStream) {
                const video_track = mediaStream.getVideoTracks()[0];
                video.srcObject = mediaStream;

                video.onloadedmetadata = function() {
                    wait_icon.style.display = 'none';
                    wait_message.style.display = 'none';

                    const settings = video_track.getSettings();
                    if (settings.hasOwnProperty('width') && settings.hasOwnProperty('height')) {
                        const aspectratio = settings['width'] / this.getAttribute('width');

                        canvas.setAttribute('width', settings['width'] / aspectratio);
                        canvas.setAttribute('height', settings['height'] / aspectratio);
                    }

                    DOMElement.take_btn.style.visibility = 'visible';
                    DOMElement.take_btn.addEventListener('click', function() {
                        this.style.visibility = 'hidden';
                        __properties.keyboard(true, _KEYBOARD_FLAGS_.BTN_OK | _KEYBOARD_FLAGS_.BTN_CLEAR);

                        canvas.style.visibility = 'visible';
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const image_data_url = canvas.toDataURL('image/jpeg');
                        // console.log(image_data_url);

                        video.style.visibility = 'hidden';
                        video_track.stop();

                        mediaStream.removeTrack(video_track);

                        // _keyboard(_KEYBOARD_FLAGS_.CONTROL);
                    }, { once: true, capture: false });
                };
            }).catch(function (err) {
                wait_icon.textContent = _ICON_CHAR_.ALERT;
                wait_icon.style.color = 'var(--red)';

                wait_message.textContent = `${err.name}: ${err.message}`;
                wait_message.style.color = 'var(--red)';
            });
        } else {
            wait_icon.textContent = _ICON_CHAR_.ALERT;
            wait_icon.style.color = 'var(--red)';
        }
    };

    // PUBLIC //////////////////////////////////////////////////////////////////
    this.clear = () => {
        DOMElement.take_btn.style.visibility = 'visible';
        DOMElement.canvas.style.visibility = 'hidden';
        __properties.keyboard(false, _KEYBOARD_FLAGS_.BTN_OK | _KEYBOARD_FLAGS_.BTN_CLEAR);
    }

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        __properties.keyboard(false, _KEYBOARD_FLAGS_.BTN_OK | _KEYBOARD_FLAGS_.BTN_CLEAR);
        __append.addEventListener('animationend', function() {
            _photo(this);
        }, { once: true, capture: false });
    })();

    // this.keyboard(_KEYBOARD_FLAGS_.NONE);

    // list[last].addEventListener('animationend', function() {
        
    //     const wait_icon = addElement(this, 'div', 'loading-resources-icon icon', _ICON_CHAR_.CAMERA);
    //     wait_icon.style.color = list[last]['_props_'][1];

    //     const wait_message = addElement(this, 'div', 'loading-resources-text', _I18N_.resource_loading);
    //     wait_message.style.color = list[last]['_props_'][1];

    //     const video = addElement(this, 'video', 'item-drawing');
    //     video.width = this.offsetWidth;
    //     video.height = this.offsetHeight;
    //     video.setAttribute('muted', '');
    //     video.setAttribute('autoplay', '');
    //     video.setAttribute('playsinline', '');

    //     const canvas = addElement(this, 'canvas', 'item-drawing');
    //     canvas.width = this.offsetWidth;
    //     canvas.height = this.offsetHeight;
    //     canvas.style.visibility = 'hidden';

    //     const take_btn = addElement(this, 'div', 'take-picture icon', _ICON_CHAR_.CAMERA);

    //     if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    //         navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', aspectRatio: { min: 0.6, max: 1 } } }).then(function (mediaStream) {
    //             const video_track = mediaStream.getVideoTracks()[0];
    //             video.srcObject = mediaStream;

    //             video.onloadedmetadata = function() {
    //                 wait_icon.style.display = 'none';
    //                 wait_message.style.display = 'none';

    //                 const settings = video_track.getSettings();
    //                 if (settings.hasOwnProperty('width') && settings.hasOwnProperty('height')) {
    //                     const aspectratio = settings['width'] / this.getAttribute('width');

    //                     canvas.setAttribute('width', settings['width'] / aspectratio);
    //                     canvas.setAttribute('height', settings['height'] / aspectratio);
    //                 }

    //                 take_btn.style.visibility = 'visible';
    //                 take_btn.addEventListener('click', function() {
    //                     this.style.visibility = 'hidden';

    //                     canvas.style.visibility = 'visible';
    //                     const ctx = canvas.getContext('2d');
    //                     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    //                     const image_data_url = canvas.toDataURL('image/jpeg');
    //                     // console.log(image_data_url);

    //                     video.style.visibility = 'hidden';
    //                     video_track.stop();

    //                     mediaStream.removeTrack(video_track);

    //                     // _keyboard(_KEYBOARD_FLAGS_.CONTROL);
    //                 }, { once: true, capture: false });
    //             };
    //         }).catch(function (err) {
    //             wait_icon.textContent = _ICON_CHAR_.ALERT;
    //             wait_icon.style.color = 'var(--red)';

    //             wait_message.textContent = `${err.name}: ${err.message}`;
    //             wait_message.style.color = 'var(--red)';
    //         });
    //     } else {
    //         wait_icon.textContent = _ICON_CHAR_.ALERT;
    //         wait_icon.style.color = 'var(--red)';
    //     }

    // }, { once: true, capture: false });
}
    