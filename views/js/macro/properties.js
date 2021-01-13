'use strict';

//import { addElement } from '../utils/functions.js';
import { _I18N_ } from '../i18n/pt-br.js';
import { _TYPES_, _VISIBILITY_, _ICON_CHAR_ } from '../utils/constants.js';

import Color from './properties/color.js';
import Type from './properties/type.js';
import Visibility from './properties/visibility.js';

export default function Properties(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment,
        propertiesArray = [],
        //color, type,

        //prefix = { content: null, id: null, text: null }, 
        //color = { content: null, color: null },
        //type = { content: null, type_icon: null, type: null, require: null, mask: null, size: null, default: null }, 
        //position = { content: null, up: null, down: null },
        //info = { content: null, info: null, help: null }, 
        //visibility = { content: null, fresh: null, extra: null, save: null, restore: null, instant: null, after: null },
        //kanban = { content: null, step: null },
        //foreign = { content: null, key: null },

    // PRIVATE /////////////////////////////////////////////////////////////////
    /*_change_type = function(evnt) {
        const value = evnt.target.value;

        type['type_icon'].textContent = value;
        if (currentObject !== null) {
            currentObject.setType(value)
        }
    },*/
    _change = function(evnt) {
        if (currentObject !== null) {
            console.dir(evnt);
        }
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.getMain = function() { return parent; };

    this.refresh = function() {
        let object = parent.getSelectedObject();

        if (object.getProps() == null) return;

        const size = propertiesArray.length;
        for (var counter=0; counter<size; counter++) {
            propertiesArray[counter].visible(object);
        }
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        //let row, label, count;

        fragment = document.createDocumentFragment();

        propertiesArray.push(
            new Color(context),
            new Type(context),
            new Visibility(context)
        );

        /*prefix['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(prefix['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_.field_id);
            prefix['id'] = addElement(row, 'div', 'main-app-properties-text');
            prefix['id'].style.gridColumn = '13 / span 15';

            row = addElement(prefix['content'] , 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_.field_value);

            row = addElement(prefix['content'] , 'div', 'main-app-properties-row');
            prefix['text'] = addElement(row, 'div', 'main-app-properties-text');
            prefix['text'].style.gridColumn = '3 / span 24';*/

        //color = new Color(fragment);
        //type = new Type(fragment);

        /*
        info['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_.field_info);

            row = addElement(info['content'], 'div', 'main-app-properties-row');
                info['info'] = addElement(row, 'input');
                info['info'].setAttribute('type', 'text');
                info['info'].style.gridColumn = '2 / span 26';

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            addElement(row, 'div', 'main-app-properties-label', _I18N_.field_help);

            row = addElement(info['content'], 'div', 'main-app-properties-row');
            row.style.gridTemplateRows = '28px 28px';
                info['help'] = addElement(row, 'textarea');
                info['help'].setAttribute('rows', '3');
                info['help'].setAttribute('maxlength', '128');

        position['content'] = addElement(fragment, 'div', 'main-app-properties-content');

            row = addElement(position['content'], 'div', 'main-app-properties-row');
            label = addElement(row, 'div', 'main-app-properties-label', _I18N_.field_position);
            label.style.gridColumn = '2 / span 13';

            position['up'] = addElement(row, 'input', 'icon');
            position['up'].setAttribute('type', 'button');
            position['up'].setAttribute('value', _ICON_CHAR_.UP);
            position['up'].setAttribute('title', _I18N_.field_position_up);
            position['up'].style.gridColumn = '18 / span 3';

            label = addElement(row, 'div', 'main-app-properties-label', '2');
            label.style.textAlign = 'center';
            label.style.gridColumn = '22 / span 2';

            position['down'] = addElement(row, 'input', 'icon');
            position['down'].setAttribute('type', 'button');
            position['down'].setAttribute('value', _ICON_CHAR_.DOWN);
            position['down'].setAttribute('title', _I18N_.field_position_down);
            position['down'].style.gridColumn = '25 / span 3';

        foreign['content'] = addElement(fragment, 'div', 'main-app-properties-content');
        
            row = addElement(foreign['content'], 'div', 'main-app-properties-row');
            label = addElement(row, 'div', 'main-app-properties-label', _I18N_.field_foreign_key);
            label.style.gridColumn = '2 / span 13';

            info['key'] = addElement(row, 'input');
            info['key'].setAttribute('type', 'text');
            info['key'].style.gridColumn = '16 / span 12';*/

    })();
}