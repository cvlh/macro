'use strict';

//import { addElement } from '../utils/functions.js';
import { _I18N_ } from '../i18n/pt-br.js';
import { _TYPES_, _VISIBILITY_, _ICON_CHAR_ } from '../utils/constants.js';

import Color from './properties/color.js';
import Type from './properties/type.js';
import Visibility from './properties/visibility.js';
import Order from './properties/order.js';
import Size from './properties/size.js';

export default function Properties(ctx) {

    // CONSTANTS ///////////////////////////////////////////////////////////////
    const parent = ctx, context = this;

    // VARIABLES ///////////////////////////////////////////////////////////////
    let fragment,
        propertiesArray = [],

    // PRIVATE /////////////////////////////////////////////////////////////////
    _change = function(evnt) {
        if (currentObject !== null) {
            console.dir(evnt);
        }
    };

    // PUBLIC  /////////////////////////////////////////////////////////////////
    this.getFragment = function() { return fragment; };
    this.getMain = function() { return parent; };

    this.refresh = function() {
        const size = propertiesArray.length;

        for (var counter = 0; counter < size; counter++) {
            propertiesArray[counter].visible();
        }
    };

    // CONSTRUCTOR /////////////////////////////////////////////////////////////
    (function() {
        fragment = document.createDocumentFragment();

        propertiesArray.push(
            new Color(context),
            new Type(context),
            new Order(context),
            new Visibility(context),
            new Size(context)
        );

    })();
}