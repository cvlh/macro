'use strict';

import Macro from './macro/macro.js';
import { _COLORS_, _TYPES_ } from './utils/constants.js';

fetch('macro.json')
    .then(function(response) {
        if(response.ok) {
            response.json().then(data => { _build(data); });
        } else {
            console.log('Network response was not ok.');
        }
    }).catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
    }
);

function _build (data) {
    let macro, allFields;
    
    macro = new Macro({'transform': data['transform'], 'size': data['size'] });
    allFields = {};

    create_card(macro, data['root'], allFields);
    macro.initVisibility(allFields);  
    
}
function create_card (macro, props, allFields, output = null) {
    let card = macro.createCard(props['position'], output);
    create_field(card, props['fields'], allFields);
}
function create_field (card, fields, allFields) {
    let counter, field;

    for (counter=0; counter<fields.length; counter++) {
        field = card.addField(fields[counter]['properties']);
        allFields[field.getProps('id')] = field;

        if (fields[counter].hasOwnProperty('output')) {
            create_card(card.getMain(), fields[counter]['output'], allFields, field);
        }
    }
}