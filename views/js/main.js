'use strict';

import Macro from './macro/macro.js';
import { _COLORS_ } from './utils/constants.js';

let vp = new Macro();

let root = vp.newCard(10, 845);

let startField = root.addField('INICIAR');
    startField.setColor(_COLORS_.RED);

    let startCard = vp.newCard(340, 19);
    startCard.addField('CONTROLE');

    let cdeField = startCard.addField('CDE M2 V43');
    let cdeCard = vp.newCard(741, 36);
    cdeCard.addField('INICIAR');
    cdeCard.addField('CANCELAR');
    vp.connect(cdeField, cdeCard);

    let centroField = startCard.addField('CD CENTRO RESUL');
    let centroCard = vp.newCard(740, 176);
    centroCard.addField('COLETA DOMICILIAR');
    centroCard.addField('COLETA DIVERSOS');
    centroCard.addField('COLETA SELECTIVA');
    vp.connect(centroField, centroCard);

    startCard.addField('CD UT');
    startCard.addField('CD SETOR');
    startCard.addField('KM INICIAL');

vp.connect(startField, startCard);

let driverField = root.addField('MOTORISTA');
    driverField.setColor(_COLORS_.BLACK);

let driverCard = vp.newCard(531, 437);
driverCard.addField('CÓDIGO MOTORISTA');
vp.connect(driverField, driverCard);

let inspectField = root.addField('VISTORIA DIÁRIA');
    inspectField.setColor(_COLORS_.PURPLE);

    let inspectCard = vp.newCard(1397, 86);

        let fuelField = inspectCard.addField('COMBUSTÍVEL');
        let fuelCard = vp.newCard(2380, 24);
            fuelCard.addField('COMPLETO');
            fuelCard.addField('MEIO TANQUE');
            fuelCard.addField('1/4 de TANQUE');
            fuelCard.addField('RESERVA');
            fuelCard.addField('VAZIO');
        vp.connect(fuelField, fuelCard); 

        let diferencialField = inspectCard.addField('DIFERENCIAL');
        let diferencialCard = vp.newCard(2380, 253);
            diferencialCard.addField('OK');
            diferencialCard.addField('FAZENDO BARULHO');
            diferencialCard.addField('VAZAMENTO DE ÓLEO');
        vp.connect(diferencialField, diferencialCard); 

        let gearboxField = inspectCard.addField('CAIXA DE CÂMBIO');
        let gearboxCard = vp.newCard(2380, 417);
            gearboxCard.addField('OK');
            gearboxCard.addField('FAZENDO BARULHO');
            gearboxCard.addField('ESCAPANDO MARCHA');
            gearboxCard.addField('NAO ENTRA MARCHA');
            gearboxCard.addField('VAZAMENTO');
        vp.connect(gearboxField, gearboxCard);

        let engineField = inspectCard.addField('ÓLEO DO MOTOR');
        let engineCard = vp.newCard(2380, 643);
            engineCard.addField('OK');
            engineCard.addField('NÍVEL BAIXO');
        vp.connect(engineField, engineCard);

        let hydraulicField = inspectCard.addField('ÓLEO HIDRÁULICO');
        let hydraulicCard = vp.newCard(2380, 779);
            hydraulicCard.addField('OK');
            hydraulicCard.addField('NÍVEL BAIXO');
        vp.connect(hydraulicField, hydraulicCard);

        let greaseField = inspectCard.addField('GRAXA SAPATAS');
        let greaseCard = vp.newCard(2380, 915);
            greaseCard.addField('ENGRAXADO');
            greaseCard.addField('RUIM');
        vp.connect(greaseField, greaseCard);

        let cameraField = inspectCard.addField('CAMERA DE RÉ');
        let cameraCard = vp.newCard(2380, 1051);
            cameraCard.addField('FUNCIONANDO');
            cameraCard.addField('COM PROBLEMAS');
        vp.connect(cameraField, cameraCard);

        let waterField = inspectCard.addField('ÁGUA DO RADIADOR');
        let waterCard = vp.newCard(2380, 1190);
            waterCard.addField('OK');
            waterCard.addField('NÍVEL BAIXO');
            waterCard.addField('VAZAMENTO');
        vp.connect(waterField, waterCard);

    vp.connect(inspectField, inspectCard);


let workField = root.addField('EM TRABALHO');
let rootCard = vp.newCard(1047, 619);

    rootCard.addField('INÍCIO COLETA');
    rootCard.addField('FIM COLETA');
    rootCard.addField('TRÂNSITO PARA DESCARGA');
    rootCard.addField('INÍCIO DESCARGA');

let endDischargeField = rootCard.addField('FIM DESCARGA');
let endDischargeCard = vp.newCard(1431, 880);
    endDischargeCard.addField('PESO');
    endDischargeCard.addField('TICKET');
    vp.connect(endDischargeField, endDischargeCard); 

    rootCard.addField('TRÂNSITO LOCAL');
    rootCard.addField('INÍCIO ABASTECIMENTO');

let endFuelField = rootCard.addField('FIM ABASTECIMENTO');
    let endFuelCard = vp.newCard(1450, 1040);
    endFuelCard.addField('LITROS');
    vp.connect(endFuelField, endFuelCard); 

    rootCard.addField('COND LOCAIS');
    rootCard.addField('INÍCIO REFEIÇÃO');
    rootCard.addField('FIM REFEIÇÃO');
    rootCard.addField('CAFÉ');
    rootCard.addField('A DISPOSIÇÃO');
    rootCard.addField('PEDIDO DE SOS');
    rootCard.addField('INÍCIO SOS');
    rootCard.addField('FIM SOS');
    rootCard.addField('FISCALIZAÇÃO');
    rootCard.addField('OBSERVAÇÕES');
    rootCard.addField('TROCA MOTORISTA');
    rootCard.addField('SAIR TRABALHO');
    rootCard.addField('VERIFICA COLETA');
vp.connect(workField, rootCard); 
workField.setColor(_COLORS_.INDIGO);


let changeField = root.addField('TROCA MOTORISTA');
    let changeCard = vp.newCard(1409, 1613);
    changeCard.addField('SENHA MOTORISTA');
    vp.connect(changeField, changeCard);
changeField.setColor(_COLORS_.TEAL);


let maintenanceField = root.addField('EM MANUTENÇÃO');
    let maintenanceCard = vp.newCard(1406, 1849);
    maintenanceCard.addField('MANUTENÇÃO DENTRO DO TURNO');
    maintenanceCard.addField('TROCA DE PNEUS');
    maintenanceCard.addField('LAVAGEM');
    maintenanceCard.addField('MANUTENÇÃO FORA DO TURNO');
    maintenanceCard.addField('TROCA DE ÓLEO');
    maintenanceCard.addField('SAIR MANUTENÇÃO');

    vp.connect(maintenanceField, maintenanceCard);
maintenanceField.setColor(_COLORS_.GREEN);


let startworkField = root.addField('PONTO ELETRÔNICO');
let startworkCard = vp.newCard(855, 1882);
startworkCard.addField('ENTRADA TRABALHO');
startworkCard.addField('SAÍDA INTERVALO');
startworkCard.addField('RETORNO INTERVALO');
startworkCard.addField('SAÍDA TRABALHO');
startworkCard.addField('SAIR PONTO');
vp.connect(startworkField, startworkCard);
startworkField.setColor(_COLORS_.ORANGE);

let endField = root.addField('FINALIZAR CDE');
    let endCard = vp.newCard(339, 1974);
        endCard.addField('SIM');
        endCard.addField('NÃO');

    vp.connect(endField, endCard);
    endField.setColor(_COLORS_.BROWN);
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

    //let serialize = vp.serialize();
    //console.log(serialize);
    //console.log(JSON.stringify(serialize));



