'use strict';

import Macro from './macro/macro.js';

fetch('memory.json')
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

function create_macro(data) {    
    const macro = new Macro(data['properties']),
          fields_map = {};

    create_card(macro, data['root'], fields_map);
    macro.initVisibility(fields_map);
}
function create_card(macro, props, fields_map, output = null) {
    let card = macro.createCard(props['position'], props['properties'], output);
    create_field(card, props['fields'], fields_map);
}
function create_field(card, fields, fields_map) {
    for (const field of fields) {
        const new_field = card.newField(field['properties']);
        fields_map[new_field.getProps('id')] = new_field;

        if (field.hasOwnProperty('output'))
            create_card(card.getMacro(), field['output'], fields_map, new_field);
    }
}