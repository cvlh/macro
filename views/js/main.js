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
    var macro = new Macro({'transform': data.transform, 'size': data.size});
    var allFields = [];

    _card(macro, data.root, allFields);
    macro.redraw();

    for (var counter=0; counter<allFields.length; counter++) {
        console.log(allFields[counter].getProps('id'));
    }
}
function _card (macro, props, allFields, output = null) {
    var card = macro.newCard(props.position[0], props.position[1], output);
    if (props.fields.length) _field(card, props.fields, allFields);
}

function _field (card, fields, allFields) {
    var counter, field;

    for (counter=0; counter<fields.length; counter++) {
        field = card.addField(fields[counter].text, fields[counter].type.type);
        if (fields[counter].hasOwnProperty('color')) field.setColor(fields[counter].color);
        if (fields[counter].hasOwnProperty('output')) _card(card.getMain(), fields[counter].output, allFields, field);

        allFields.push(field);
    }
}


/*
let vp = new Macro({});
let root = vp.newCard(10, 845);
let rootCard, field, card;

let startField = root.addField('INICIAR', _TYPES_.LIST);
    startField.setColor(_COLORS_.RED);

    rootCard = vp.newCard(340, 19, startField);
    field = rootCard.addField('CONTROLE', _TYPES_.TEXT);
    field = rootCard.addField('CDE M2 V43', _TYPES_.LIST);
        card = vp.newCard(741, 36, field);
        card.addField('INICIAR', _TYPES_.LIST);
        card.addField('CANCELAR', _TYPES_.LIST);
        //vp.connect(field, card);
    field = rootCard.addField('CD CENTRO RESUL', _TYPES_.LIST);
        card = vp.newCard(740, 176, field);
        card.addField('COLETA DOMICILIAR', _TYPES_.LIST);
        card.addField('COLETA DIVERSOS', _TYPES_.LIST);
        card.addField('COLETA SELECTIVA', _TYPES_.LIST);
        //vp.connect(field, card);
    field = rootCard.addField('CÓDIGO UT', _TYPES_.NUMBER);
    field = rootCard.addField('CÓDIGO SETOR', _TYPES_.NUMBER);
    field = rootCard.addField('KM INICIAL', _TYPES_.NUMBER);
//vp.connect(startField, rootCard);

let driverField = root.addField('MOTORISTA', _TYPES_.LIST);
    driverField.setColor(_COLORS_.BLACK);
    rootCard = vp.newCard(531, 437, driverField);
    field = rootCard.addField('CÓDIGO MOTORISTA',  _TYPES_.NUMBER);
//vp.connect(driverField, rootCard);

let inspectField = root.addField('VISTORIA DIÁRIA', _TYPES_.LIST);
    inspectField.setColor(_COLORS_.PURPLE);
    rootCard = vp.newCard(1304, 43, inspectField);
        field = rootCard.addField('COMBUSTÍVEL', _TYPES_.LIST);
            card = vp.newCard(2197, 7, field);
            card.addField('COMPLETO', _TYPES_.LIST);
            card.addField('MEIO TANQUE', _TYPES_.LIST);
            card.addField('1/4 de TANQUE', _TYPES_.LIST);
            card.addField('RESERVA', _TYPES_.LIST);
            card.addField('VAZIO', _TYPES_.LIST);
            //vp.connect(field, card); 
        field = rootCard.addField('DIFERENCIAL', _TYPES_.LIST);
            card = vp.newCard(2197, 206, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('FAZENDO BARULHO', _TYPES_.LIST);
            card.addField('VAZAMENTO DE ÓLEO', _TYPES_.LIST);
            //vp.connect(field, card); 
        field = rootCard.addField('CAIXA DE CÂMBIO', _TYPES_.LIST);
            card = vp.newCard(2197, 344, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('FAZENDO BARULHO', _TYPES_.LIST);
            card.addField('ESCAPANDO MARCHA', _TYPES_.LIST);
            card.addField('NAO ENTRA MARCHA', _TYPES_.LIST);
            card.addField('VAZAMENTO', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('ÓLEO DO MOTOR', _TYPES_.LIST);
            card = vp.newCard(2197, 545, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('NÍVEL BAIXO', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('ÓLEO HIDRÁULICO', _TYPES_.LIST);
            card = vp.newCard(2197, 653, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('NÍVEL BAIXO', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('GRAXA SAPATAS', _TYPES_.LIST);
            card = vp.newCard(2197, 759, field);
            card.addField('ENGRAXADO', _TYPES_.LIST);
            card.addField('RUIM', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('CAMERA DE RÉ', _TYPES_.LIST);
            card = vp.newCard(2197, 866, field);
            card.addField('FUNCIONANDO', _TYPES_.LIST);
            card.addField('COM PROBLEMAS', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('ÁGUA DO RADIADOR', _TYPES_.LIST);
            card = vp.newCard(2197, 976, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('NÍVEL BAIXO', _TYPES_.LIST);
            card.addField('VAZAMENTO', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('FARÓIS E LANTERNAS', _TYPES_.LIST);
            card = vp.newCard(2197, 1114, field);
            card.addField('FUNCIONANDO', _TYPES_.LIST);
            card.addField('COM PROBLEMAS', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('PRESSÃO PNEU', _TYPES_.LIST);
            card = vp.newCard(2197, 1221, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('IRREGULAR', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('MOLAS', _TYPES_.LIST);
            card = vp.newCard(2197, 1332, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('COM PROBLEMAS', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('EXTINTOR', _TYPES_.LIST);
            card = vp.newCard(2197, 1441, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('VENCIDO', _TYPES_.LIST);
            card.addField('VAZIO', _TYPES_.LIST);
            card.addField('SEM LACRE', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('DOCUMENTOS DO VEÍCULO', _TYPES_.LIST);
            card = vp.newCard(2197, 1609, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('VENCIDO', _TYPES_.LIST);
            card.addField('NÃO ENCONTRADO', _TYPES_.LIST);
            //vp.connect(field, card);
        field = rootCard.addField('TEMPERATURA DO MOTOR', _TYPES_.LIST);
            card = vp.newCard(2197, 1750, field);
            card.addField('OK', _TYPES_.LIST);
            card.addField('ESQUENTANDO', _TYPES_.LIST);
            //vp.connect(field, card);
    //vp.connect(inspectField, rootCard);

let workField = root.addField('EM TRABALHO', _TYPES_.LIST);
    workField.setColor(_COLORS_.BLUE);
    
    rootCard = vp.newCard(876, 620, workField);
    field = rootCard.addField('INÍCIO COLETA', _TYPES_.LIST);
    field = rootCard.addField('FIM COLETA', _TYPES_.LIST);
    field = rootCard.addField('TRÂNSITO PARA DESCARGA', _TYPES_.LIST);
    field = rootCard.addField('INÍCIO DESCARGA', _TYPES_.LIST);
    field = rootCard.addField('FIM DESCARGA', _TYPES_.LIST);
        card = vp.newCard(1284, 618, field);
        card.addField('NR TICKET', _TYPES_.NUMBER);
        card.addField('PESO KG', _TYPES_.NUMBER);
        //vp.connect(field, card); 
    field = rootCard.addField('TRÂNSITO LOCAL', _TYPES_.LIST);
    field = rootCard.addField('INÍCIO ABASTECIMENTO', _TYPES_.LIST);
    field = rootCard.addField('FIM ABASTECIMENTO', _TYPES_.LIST);
        card = vp.newCard(1284, 740, field);
        card.addField('QTDE LITROS', _TYPES_.NUMBER);
        //vp.connect(field, card); 
    field = rootCard.addField('COND LOCAIS', _TYPES_.LIST);
    field = rootCard.addField('INÍCIO REFEIÇÃO', _TYPES_.LIST);
        card = vp.newCard(1284, 838, field);
        card.addField('CÓDIGO PONTO MOTORISTA', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 1', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 2', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 3', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 4', _TYPES_.NUMBER);
        //vp.connect(field, card); 
    field = rootCard.addField('FIM REFEIÇÃO', _TYPES_.LIST);
        card = vp.newCard(1284, 1046, field);
        card.addField('CÓDIGO PONTO MOTORISTA', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 1', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 2', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 3', _TYPES_.NUMBER);
        card.addField('CÓDIGO PONTO COLETOR 4', _TYPES_.NUMBER);
        //vp.connect(field, card); 
    field = rootCard.addField('CAFÉ', _TYPES_.LIST);
    field = rootCard.addField('A DISPOSIÇÃO', _TYPES_.LIST);
    field = rootCard.addField('PEDIDO DE SOS', _TYPES_.LIST);
    field = rootCard.addField('INÍCIO SOS', _TYPES_.LIST);
    field = rootCard.addField('FIM SOS', _TYPES_.LIST);
    field = rootCard.addField('FISCALIZAÇÃO', _TYPES_.LIST);
        card = vp.newCard(1284, 1250, field);
        card.addField('CÓDIGO FISCAL', _TYPES_.NUMBER);
        card.addField('OBSERVAÇÕES', _TYPES_.TEXT);
        //vp.connect(field, card); 
    field = rootCard.addField('OBSERVAÇÕES', _TYPES_.TEXT);
    field = rootCard.addField('TROCA MOTORISTA', _TYPES_.LIST);
    field = rootCard.addField('SAIR TRABALHO', _TYPES_.LIST);
    field = rootCard.addField('VERIFICA COLETA', _TYPES_.LIST);
//vp.connect(workField, rootCard); 


let changeField = root.addField('TROCA MOTORISTA', _TYPES_.LIST);
    changeField.setColor(_COLORS_.TEAL);
    rootCard = vp.newCard(530, 1122, changeField);
    field = rootCard.addField('SENHA MOTORISTA', _TYPES_.TEXT);
//vp.connect(changeField, changeCard);

let maintenanceField = root.addField('EM MANUTENÇÃO', _TYPES_.LIST);
    maintenanceField.setColor(_COLORS_.GREEN);
    rootCard = vp.newCard(523, 1274, maintenanceField);
    field = rootCard.addField('MANUTENÇÃO DENTRO DO TURNO');
    field = rootCard.addField('TROCA DE PNEUS');
    field = rootCard.addField('LAVAGEM');
    field = rootCard.addField('MANUTENÇÃO FORA DO TURNO');
    field = rootCard.addField('TROCA DE ÓLEO');
    field = rootCard.addField('SAIR MANUTENÇÃO');
//vp.connect(maintenanceField, maintenanceCard);

let startworkField = root.addField('PONTO ELETRÔNICO', _TYPES_.LIST);
    startworkField.setColor(_COLORS_.ORANGE);
    rootCard = vp.newCard(522, 1593, startworkField);
    field = rootCard.addField('ENTRADA TRABALHO', _TYPES_.LIST);
        card = vp.newCard(888, 1499, field);
        card.addField('CÓDIGO COLABORADOR', _TYPES_.NUMBER);
    field = rootCard.addField('SAÍDA INTERVALO', _TYPES_.LIST);
        card = vp.newCard(888, 1578, field);
        card.addField('CÓDIGO COLABORADOR', _TYPES_.NUMBER);
    field = rootCard.addField('RETORNO INTERVALO', _TYPES_.LIST);
        card = vp.newCard(888, 1654, field);
        card.addField('CÓDIGO COLABORADOR', _TYPES_.NUMBER);
    field = rootCard.addField('SAÍDA TRABALHO', _TYPES_.LIST);
        card = vp.newCard(888, 1730, field);
        card.addField('CÓDIGO COLABORADOR', _TYPES_.NUMBER);
    field = rootCard.addField('SAIR PONTO', _TYPES_.LIST);
        card = vp.newCard(888, 1806, field);
        card.addField('CÓDIGO COLABORADOR', _TYPES_.NUMBER);    
//vp.connect(startworkField, startworkCard);

let endField = root.addField('FINALIZAR CDE', _TYPES_.LIST);
    endField.setColor(_COLORS_.BROWN);
    rootCard = vp.newCard(357, 1918, endField);
    field = rootCard.addField('SIM', _TYPES_.LIST);
        card = vp.newCard(720, 2008, field);
        card.addField('ODÔMETRO FINAL', _TYPES_.NUMBER);
        card.addField('HORÍMETRO FINAL', _TYPES_.NUMBER);
    field = rootCard.addField('NÃO');
//vp.connect(endField, endCard);

//new Promise(vp.redraw)
vp.redraw();*/
