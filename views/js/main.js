'use strict';

import Macro from './macro/macro.js';

fetch('macro_simple.json')
    .then(function(response) {
        if(response.ok) {
            response.json().then(data => { create_macro(data); });
        } else {
            console.log('Network response was not ok.');
        }
    })
    .catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
    }
);

function create_macro (data) {
    let macro, allFields = {};
    
    macro = new Macro(data.properties);

    create_card(macro, data['root'], allFields);
    macro.initVisibility(allFields);
}
function create_card (macro, props, allFields, output = null) {
    let card = macro.createCard(props['position'], props['properties'], output);
    create_field(card, props['fields'], allFields);
}
function create_field (card, fields, allFields) {
    let counter, field;

    for (counter=0; counter<fields.length; counter++) {
        field = card.newField(fields[counter]['properties']);
        allFields[field.getProps('id')] = field;

        if (fields[counter].hasOwnProperty('output')) {
            create_card(card.getMain(), fields[counter]['output'], allFields, field);
        }
    }
}