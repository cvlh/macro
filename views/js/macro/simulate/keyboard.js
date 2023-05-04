'use strict';

import { _KEY_CODE_, _KEYBOARD_FLAGS_ } from '../../utils/constants.js';
import { _I18N_ } from '../../i18n/pt-br.js';
import { addElement } from '../../utils/functions.js';

export default function Keyboard(__append) {

    if (!new.target) 
        throw new Error('Simulate() must be called with new');

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const DOMElement = {
        main:     null,
        keyboard: null,
            btn_back:    null,
            btn_clear:   null,
            btn_confirm: null
    },

    // VARIABLES ///////////////////////////////////////////////////////////////

    // PRIVATE /////////////////////////////////////////////////////////////////
    _back_keyboard = () => {

    },
    _clear_keyboard = () => {
        const last = structInputs['last'] - 1,
              list = structInputs['list'];

        switch (macro[list[last]['_props_'][0]].type.type) {
            case _TYPES_.NUMBER:
            case _TYPES_.SIGNATURE:
                list[last]['_props_'][2].clear();
                break;
        }
    },
    _confirm_keyboard = () => {
        const last = structInputs['last'],
              list = structInputs['list'];

        if (list.length) {
            if (last < list.length) {
                list[last].style.animationPlayState = 'running';

                if (last > 0)
                    list[last - 1].style.animationName = 'shrink_item_inputs';
                
                const shortcut = macro[list[last]['_props_'][0]];
                switch (shortcut['type']['type']) {
                    case _TYPES_.NUMBER:
                        this.keyboard(_KEYBOARD_FLAGS_.TYPE_NUMPAD | _KEYBOARD_FLAGS_.BTN_BACK | _KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                        break;
                    
                    case _TYPES_.SIGNATURE:
                        this.keyboard(_KEYBOARD_FLAGS_.BTN_CLEAR | _KEYBOARD_FLAGS_.BTN_OK);
                        break;

                    case _TYPES_.PHOTO:
                        this.keyboard();

                        list[last].addEventListener('animationend', function() {
                            
                            const wait_icon = addElement(this, 'div', 'loading-resources-icon icon', _ICON_CHAR_.CAMERA);
                            wait_icon.style.color = list[last]['_props_'][1];

                            const wait_message = addElement(this, 'div', 'loading-resources-text', _I18N_.resource_loading);
                            wait_message.style.color = list[last]['_props_'][1];

                            const video = addElement(this, 'video', 'item-drawing');
                            video.width = this.offsetWidth;
                            video.height = this.offsetHeight;
                            video.setAttribute('muted', '');
                            video.setAttribute('autoplay', '');
                            video.setAttribute('playsinline', '');

                            const canvas = addElement(this, 'canvas', 'item-drawing');
                            canvas.width = this.offsetWidth;
                            canvas.height = this.offsetHeight;
                            canvas.style.visibility = 'hidden';

                            const take_picture_btn = addElement(this, 'div', 'take-picture icon', _ICON_CHAR_.CAMERA);

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

                                        take_picture_btn.style.visibility = 'visible';
                                        take_picture_btn.addEventListener('click', function() {
                                            this.style.visibility = 'hidden';

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

                        }, { once: true, capture: false });
                        break;

                    default:
                        this.keyboard(_KEYBOARD_FLAGS_.NONE);
                }
                
                structInputs['last'] += 1;
            } else {
                const [id, color] = list[last - 1]['_props_'];
                _execute(id, color, queueViews[queueViews.length - 1]);
            }
        }
    };


    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.update = (keyboard_flags = _KEYBOARD_FLAGS_.NONE) => {
        const parent = DOMElement.keyboard.parentNode;
        const main = parent.querySelector('.main');

        if (keyboard_flags === _KEYBOARD_FLAGS_.NONE) {
            main.classList.remove('with-keyboard');
            DOMElement.keyboard.style.removeProperty('height'); 
            return;
        }

        let height = 0;
        main.classList.add('with-keyboard');

        DOMElement.btn_back.style.display = 'none';
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_BACK) {
            DOMElement.btn_back.style.display = 'block';
            
            DOMElement.btn_back.setAttribute('disabled', '');
            // if (structInputs['last'] === 0 && structInputs['list'].length > 1)
            //     DOMElement.btn_back.removeAttribute('disabled');                
        }

        DOMElement.btn_clear.style.display = 'none';
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_CLEAR)
            DOMElement.btn_clear.style.display = 'block';

        DOMElement.btn_confirm.style.display = 'none';
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_OK)
            DOMElement.btn_confirm.style.display = 'block';
        
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_BACK |
            keyboard_flags & _KEYBOARD_FLAGS_.BTN_CLEAR |
            keyboard_flags & _KEYBOARD_FLAGS_.BTN_OK)
            height += 30; 

        if (keyboard_flags & _KEYBOARD_FLAGS_.TYPE_NUMPAD | 
            keyboard_flags & _KEYBOARD_FLAGS_.TYPE_QWERTY)
            height += 108; 
        
        DOMElement.keyboard.style.height = height + 'px';
    };
    this.controls = (enable = true, keyboard_flags = _KEYBOARD_FLAGS_.NONE) => {
        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_OK) {
            if (enable)
                DOMElement.btn_confirm.removeAttribute('disabled');
            else
                DOMElement.btn_confirm.setAttribute('disabled', '');
        } 

        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_BACK) {
            if (enable)
                DOMElement.btn_back.removeAttribute('disabled');
            else
                DOMElement.btn_back.setAttribute('disabled', '');
        }

        if (keyboard_flags & _KEYBOARD_FLAGS_.BTN_CLEAR) {
            if (enable)
                DOMElement.btn_clear.removeAttribute('disabled');
            else
                DOMElement.btn_clear.setAttribute('disabled', '');
        }
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        DOMElement.keyboard = addElement(__append, 'div', 'controls');

        const controls_buttons = addElement(DOMElement.keyboard, 'div', 'controls-buttons');

        DOMElement.btn_back = addElement(controls_buttons, 'button', 'back', _I18N_.keyboard_back);
        DOMElement.btn_back.addEventListener('click', _back_keyboard, { capture: false });

        DOMElement.btn_clear = addElement(controls_buttons, 'button', 'clear', _I18N_.keyboard_clear);
        DOMElement.btn_clear.addEventListener('click', _clear_keyboard, { capture: false });

        DOMElement.btn_confirm = addElement(controls_buttons, 'button', 'confirm', _I18N_.keyboard_confirm);
        DOMElement.btn_confirm.addEventListener('click', _confirm_keyboard, { capture: false });

        const keyboard = addElement(DOMElement.keyboard, 'div', 'keyboard');
        [_KEY_CODE_.KEY1, _KEY_CODE_.KEY2, _KEY_CODE_.KEY3, _KEY_CODE_.KEY4, 
         _KEY_CODE_.KEY5, _KEY_CODE_.KEY6, _KEY_CODE_.KEY7, _KEY_CODE_.KEY8, 
         _KEY_CODE_.KEY9, _KEY_CODE_.COMMA, _KEY_CODE_.KEY0, _KEY_CODE_.BACKSPACE].forEach( ({code, key} = element) => {
            const button = addElement(keyboard, 'button', 'font-awesome', key);
            button.setAttribute('_key', code);
        });

        keyboard.addEventListener('click', evnt => {
            const last = structInputs['last'],
                  list = structInputs['list'],
                //   target = evnt.target,
                  code = evnt.target.getAttribute('_key'), // target['_code_'],
                  input = list[last - 1]['_props_'][2];
                  
            if (input.add(code)) {
                DOMElement.btn_confirm.removeAttribute('disabled');
            } else {
                DOMElement.btn_confirm.setAttribute('disabled', '');
            }
            
        }, { capture: false });
    })();
}