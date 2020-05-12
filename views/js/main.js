'use strict';

import Macro from './macro/macro.js';


let vp = new Macro();

let activity = vp.newCard(27, 27);
    activity.setHeader('ATIVIDADE');

let start = activity.addField('INICIAR');


let driver = activity.addField('MOTORISTA');

let inspectField = activity.addField('VISTORIA DIÁRIA');
    let inspectCard = vp.newCard(468, 390);

        let fuelField = inspectCard.addField('COMBUSTIVEL');
        let fuelCard = vp.newCard(980, 6);
            fuelCard.addField('COMPLETO');
            fuelCard.addField('MEIO TANQUE');
            fuelCard.addField('1/4 de TANQUE');
            fuelCard.addField('RESERVA');
            fuelCard.addField('VAZIO');
        vp.connect(fuelField, fuelCard); 

        let diferencialField = inspectCard.addField('DIFERENCIAL');
        let diferencialCard = vp.newCard(980, 232);
            diferencialCard.addField('OK');
            diferencialCard.addField('FAZENDO BARULHO');
            diferencialCard.addField('VAZAMENTO DE ÓLEO');
        vp.connect(diferencialField, diferencialCard); 

        let gearboxField = inspectCard.addField('CAIXA DE CAMBIO');
        let gearboxCard = vp.newCard(980, 398);
            gearboxCard.addField('OK');
            gearboxCard.addField('FAZENDO BARULHO');
            gearboxCard.addField('ESCAPANDO MARCHA');
            gearboxCard.addField('NAO ENTRA MARCHA');
            gearboxCard.addField('VAZAMENTO');
        vp.connect(gearboxField, gearboxCard);

        let engineField = inspectCard.addField('ÓLEO DO MOTOR');
        let engineCard = vp.newCard(980, 624);
            engineCard.addField('OK');
            engineCard.addField('NÍVEL BAIXO');
        vp.connect(engineField, engineCard);

        let hydraulicField = inspectCard.addField('ÓLEO HIDRAULICO');
        let hydraulicCard = vp.newCard(980, 760);
            hydraulicCard.addField('OK');
            hydraulicCard.addField('NÍVEL BAIXO');
        vp.connect(hydraulicField, hydraulicCard);

        let greaseField = inspectCard.addField('GRAXA SAPATAS');
        let greaseCard = vp.newCard(980, 896);
            greaseCard.addField('ENGRAXADO');
            greaseCard.addField('RUIM');
        vp.connect(greaseField, greaseCard);

        let cameraField = inspectCard.addField('CAMERA DE RÉ');
        let cameraCard = vp.newCard(980, 1032);
            cameraCard.addField('FUNCIONANDO');
            cameraCard.addField('COM PROBLEMAS');
        vp.connect(cameraField, cameraCard);

        let waterField = inspectCard.addField('ÁGUA DO RADIADOR');
        let waterCard = vp.newCard(980, 1168);
            waterCard.addField('OK');
            waterCard.addField('NÍVEL BAIXO');
            waterCard.addField('VAZAMENTO');
        vp.connect(waterField, waterCard);

    vp.connect(inspectField, inspectCard);


let work = activity.addField('EM TRABALHO');
let change = activity.addField('TROCA MOTORISTA');
let maintenance = activity.addField('EM MANUTENÇÃO');
let start_work = activity.addField('PONTO ELETRÔNICO');
let end = activity.addField('FINALIZAR CDE');

/*let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');

let checklist = main.newCard();
    checklist.setHeader('VISTORIA DIÁRIA');*/




